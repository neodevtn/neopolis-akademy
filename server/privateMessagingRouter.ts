import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PRIVATE_CONVERSATION_SOURCES, PRIVATE_MESSAGE_LIMITS, normalizePrivateMessageText } from "../shared/privateMessaging";
import { isAdministrativeRole } from "../shared/roles";
import { createAdminNotification } from "./notificationsDb";
import {
  changePrivateConversationStatus,
  completePrivateNotificationState,
  createPrivateConversation,
  createPrivateNotificationState,
  getPrivateConversationDetail,
  getPrivateNotificationRecipients,
  listAdminPrivateConversations,
  listLearnerPrivateConversations,
  markPrivateConversationRead,
  recordPrivateNotificationEvent,
  sendPrivateMessage,
} from "./privateMessagingDb";
import { publishPrivateMessagingEvent } from "./privateMessagingRealtime";
import { protectedProcedure, router } from "./_core/trpc";
import { sendPrivateMessageNotificationEmail } from "./email";

const textSchema = z.string().transform(normalizePrivateMessageText).refine((value) => value.length >= PRIVATE_MESSAGE_LIMITS.bodyMin && value.length <= PRIVATE_MESSAGE_LIMITS.bodyMax, `Le message doit comporter entre ${PRIVATE_MESSAGE_LIMITS.bodyMin} et ${PRIVATE_MESSAGE_LIMITS.bodyMax} caractères.`);
const subjectSchema = z.string().transform(normalizePrivateMessageText).refine((value) => value.length >= PRIVATE_MESSAGE_LIMITS.subjectMin && value.length <= PRIVATE_MESSAGE_LIMITS.subjectMax, `Le sujet doit comporter entre ${PRIVATE_MESSAGE_LIMITS.subjectMin} et ${PRIVATE_MESSAGE_LIMITS.subjectMax} caractères.`);

function actorFromUser(user: { id: number; role: string }) {
  return { userId: user.id, role: user.role };
}

function requireAdmin(user: { role: string }) {
  if (!isAdministrativeRole(user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs" });
}

async function notifyRecipients(input: { conversationId: number; messageId: number; authorRole: "learner" | "admin" | "system"; subject: string; learnerId: number; learnerName?: string | null }) {
  const recipients = await getPrivateNotificationRecipients({ conversationId: input.conversationId, authorRole: input.authorRole });
  await Promise.all(recipients.map(async (recipient) => {
    const webStateId = await createPrivateNotificationState({ conversationId: input.conversationId, messageId: input.messageId, recipientUserId: recipient.id, channel: "web" });
    if (webStateId) {
      await completePrivateNotificationState({ stateId: webStateId, delivered: true });
      await recordPrivateNotificationEvent({ conversationId: input.conversationId, messageId: input.messageId, recipientUserId: recipient.id, delivered: true });
    }
    if (!recipient.email) return;
    const emailStateId = await createPrivateNotificationState({ conversationId: input.conversationId, messageId: input.messageId, recipientUserId: recipient.id, channel: "email" });
    if (!emailStateId) return;
    await recordPrivateNotificationEvent({ conversationId: input.conversationId, messageId: input.messageId, recipientUserId: recipient.id });
    try {
      const sent = await sendPrivateMessageNotificationEmail({
        to: recipient.email,
        recipientName: recipient.name,
        subject: input.subject,
        fromLearner: input.authorRole === "learner",
      });
      await completePrivateNotificationState({ stateId: emailStateId, delivered: sent, errorCode: sent ? undefined : "provider_unavailable" });
      await recordPrivateNotificationEvent({ conversationId: input.conversationId, messageId: input.messageId, recipientUserId: recipient.id, delivered: sent, errorCode: sent ? undefined : "provider_unavailable" });
    } catch (error) {
      const errorCode = error instanceof Error ? error.name : "email_failed";
      await completePrivateNotificationState({ stateId: emailStateId, delivered: false, errorCode });
      await recordPrivateNotificationEvent({ conversationId: input.conversationId, messageId: input.messageId, recipientUserId: recipient.id, delivered: false, errorCode });
    }
  }));
  if (input.authorRole === "learner") {
    await createAdminNotification({
      type: "private_message",
      title: "Nouveau message privé",
      message: "Un apprenant a écrit à l’équipe Neopolis.",
      targetType: "private_conversation",
      targetId: input.conversationId,
    });
  }
}

export const privateMessagingRouter = router({
  getMine: protectedProcedure.query(async ({ ctx }) => listLearnerPrivateConversations(ctx.user.id)),
  getAdminInbox: protectedProcedure.input(z.object({
    status: z.enum(["all", "open", "closed"]).optional(),
    search: z.string().trim().max(160).optional(),
    learnerId: z.number().int().positive().optional(),
    limit: z.number().int().min(1).max(200).optional(),
  }).optional()).query(async ({ ctx, input }) => {
    requireAdmin(ctx.user);
    return listAdminPrivateConversations(actorFromUser(ctx.user), input);
  }),
  getConversation: protectedProcedure.input(z.object({ conversationId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const detail = await getPrivateConversationDetail({ actor: actorFromUser(ctx.user), conversationId: input.conversationId });
    if (!detail) throw new TRPCError({ code: "NOT_FOUND", message: "Conversation introuvable" });
    return detail;
  }),
  createMine: protectedProcedure.input(z.object({ subject: subjectSchema, body: textSchema, source: z.enum(["learner", "problem_report"]).default("learner") })).mutation(async ({ ctx, input }) => {
    const created = await createPrivateConversation({ learnerId: ctx.user.id, subject: input.subject, body: input.body, source: input.source, actor: actorFromUser(ctx.user) });
    await notifyRecipients({ ...created, subject: input.subject, learnerId: ctx.user.id, learnerName: ctx.user.name });
    publishPrivateMessagingEvent({ type: "conversation.created", conversationId: created.conversationId, learnerId: ctx.user.id, audience: "admins" });
    return created;
  }),
  createForLearner: protectedProcedure.input(z.object({ learnerId: z.number().int().positive(), subject: subjectSchema, body: textSchema, source: z.enum(PRIVATE_CONVERSATION_SOURCES).default("admin") })).mutation(async ({ ctx, input }) => {
    requireAdmin(ctx.user);
    const created = await createPrivateConversation({ learnerId: input.learnerId, subject: input.subject, body: input.body, source: input.source, actor: actorFromUser(ctx.user) });
    await notifyRecipients({ ...created, subject: input.subject, learnerId: input.learnerId });
    publishPrivateMessagingEvent({ type: "conversation.created", conversationId: created.conversationId, learnerId: input.learnerId, audience: "learner" });
    return created;
  }),
  send: protectedProcedure.input(z.object({ conversationId: z.number().int().positive(), body: textSchema })).mutation(async ({ ctx, input }) => {
    const sent = await sendPrivateMessage({ actor: actorFromUser(ctx.user), conversationId: input.conversationId, body: input.body });
    await notifyRecipients({ conversationId: sent.conversation.id, messageId: sent.messageId, authorRole: sent.authorRole, subject: sent.conversation.subject, learnerId: sent.conversation.learnerId });
    publishPrivateMessagingEvent({ type: "message.created", conversationId: sent.conversation.id, learnerId: sent.conversation.learnerId, audience: sent.authorRole === "admin" ? "learner" : "admins" });
    return { success: true, messageId: sent.messageId };
  }),
  setStatus: protectedProcedure.input(z.object({ conversationId: z.number().int().positive(), status: z.enum(["open", "closed"]) })).mutation(async ({ ctx, input }) => {
    const result = await changePrivateConversationStatus({ actor: actorFromUser(ctx.user), ...input });
    publishPrivateMessagingEvent({ type: "conversation.status.changed", conversationId: result.conversation.id, learnerId: result.conversation.learnerId, audience: "both" });
    return result;
  }),
  markRead: protectedProcedure.input(z.object({ conversationId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const result = await markPrivateConversationRead(actorFromUser(ctx.user), input.conversationId);
    if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Conversation introuvable" });
    return result;
  }),
});
