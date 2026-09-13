import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PRIVATE_CONVERSATION_SOURCES, PRIVATE_INTEGRITY_REVIEW_TEMPLATE, PRIVATE_MESSAGE_ATTACHMENT_LIMITS, PRIVATE_MESSAGE_ATTACHMENT_MIME_TYPES, PRIVATE_MESSAGE_LIMITS, normalizePrivateMessageText } from "../shared/privateMessaging";
import { isAdministrativeRole } from "../shared/roles";
import { createAdminNotification } from "./notificationsDb";
import {
  changePrivateConversationStatus,
  completePrivateNotificationState,
  createPrivateConversation,
  createPrivateNotificationState,
  getPrivateConversationDetail,
  getIntegrityReviewConversationForLearner,
  getPrivateMessageDeliveryPreferences,
  getPrivateMessageDeliveryPreferencesForUsers,
  getPrivateMessagingNotificationCenter,
  getPrivateNotificationRecipients,
  listAdminPrivateConversations,
  listLearnerPrivateConversations,
  markPrivateMessageDelivered,
  markPrivateConversationRead,
  recordPrivateNotificationEvent,
  sendPrivateMessage,
  updatePrivateMessageDeliveryPreferences,
} from "./privateMessagingDb";
import { publishPrivateMessagingEvent } from "./privateMessagingRealtime";
import { protectedProcedure, router } from "./_core/trpc";
import { sendPrivateMessageNotificationEmail } from "./email";
import { getIntegrityReviewQueue } from "./integrityService";

const textSchema = z.string().transform(normalizePrivateMessageText).refine((value) => value.length >= PRIVATE_MESSAGE_LIMITS.bodyMin && value.length <= PRIVATE_MESSAGE_LIMITS.bodyMax, `Le message doit comporter entre ${PRIVATE_MESSAGE_LIMITS.bodyMin} et ${PRIVATE_MESSAGE_LIMITS.bodyMax} caractères.`);
const subjectSchema = z.string().transform(normalizePrivateMessageText).refine((value) => value.length >= PRIVATE_MESSAGE_LIMITS.subjectMin && value.length <= PRIVATE_MESSAGE_LIMITS.subjectMax, `Le sujet doit comporter entre ${PRIVATE_MESSAGE_LIMITS.subjectMin} et ${PRIVATE_MESSAGE_LIMITS.subjectMax} caractères.`);
const attachmentSchema = z.object({
  filename: z.string().trim().min(1).max(PRIVATE_MESSAGE_ATTACHMENT_LIMITS.filenameMax),
  mimeType: z.enum(PRIVATE_MESSAGE_ATTACHMENT_MIME_TYPES),
  base64: z.string().min(1).max(PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxBase64Chars),
});
const messagePayloadSchema = z.object({
  body: z.string().default("").transform(normalizePrivateMessageText).refine((value) => value.length <= PRIVATE_MESSAGE_LIMITS.bodyMax, `Le message ne peut pas dépasser ${PRIVATE_MESSAGE_LIMITS.bodyMax} caractères.`),
  attachments: z.array(attachmentSchema).max(PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxFilesPerMessage).default([]),
}).refine((value) => value.body.length >= PRIVATE_MESSAGE_LIMITS.bodyMin || value.attachments.length > 0, "Ajoutez un message ou une pièce jointe.");

function actorFromUser(user: { id: number; role: string }) {
  return { userId: user.id, role: user.role };
}

function requireAdmin(user: { role: string }) {
  if (!isAdministrativeRole(user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs" });
}

async function notifyRecipients(input: { conversationId: number; messageId: number; authorRole: "learner" | "admin" | "system"; subject: string; learnerId: number; learnerName?: string | null }) {
  const recipients = await getPrivateNotificationRecipients({ conversationId: input.conversationId, authorRole: input.authorRole });
  const preferencesByUser = await getPrivateMessageDeliveryPreferencesForUsers(recipients.map((recipient) => recipient.id));
  const webRecipientIds: number[] = [];
  const webStateIds = new Map<number, number>();
  await Promise.all(recipients.map(async (recipient) => {
    const preferences = preferencesByUser.get(recipient.id);
    if (preferences?.webEnabled) {
      webRecipientIds.push(recipient.id);
      const webStateId = await createPrivateNotificationState({ conversationId: input.conversationId, messageId: input.messageId, recipientUserId: recipient.id, channel: "web" });
      if (webStateId) {
        webStateIds.set(recipient.id, webStateId);
        await recordPrivateNotificationEvent({ conversationId: input.conversationId, messageId: input.messageId, recipientUserId: recipient.id });
      }
    }
    if (!recipient.email || !preferences?.emailEnabled) return;
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
  return { webRecipientIds, webStateIds };
}

async function publishMessageDelivery(input: {
  conversationId: number;
  learnerId: number;
  messageId: number;
  authorRole: "learner" | "admin" | "system";
  notification: Awaited<ReturnType<typeof notifyRecipients>>;
  type: "conversation.created" | "message.created";
}) {
  const deliveredRecipientIds = publishPrivateMessagingEvent({
    type: input.type,
    conversationId: input.conversationId,
    learnerId: input.learnerId,
    audience: input.authorRole === "admin" ? "learner" : "admins",
    recipientUserIds: input.notification.webRecipientIds,
  }) || [];
  await Promise.all(deliveredRecipientIds.map(async (recipientUserId) => {
    const stateId = input.notification.webStateIds.get(recipientUserId);
    if (!stateId) return;
    await completePrivateNotificationState({ stateId, delivered: true });
    await recordPrivateNotificationEvent({ conversationId: input.conversationId, messageId: input.messageId, recipientUserId, delivered: true });
  }));
  await markPrivateMessageDelivered({
    conversationId: input.conversationId,
    messageId: input.messageId,
    authorRole: input.authorRole,
    deliveredRecipientIds,
  });
}

export const privateMessagingRouter = router({
  getMine: protectedProcedure.query(async ({ ctx }) => listLearnerPrivateConversations(ctx.user.id)),
  getAdminInbox: protectedProcedure.input(z.object({
    status: z.enum(["all", "open", "closed"]).optional(),
    search: z.string().trim().max(160).optional(),
    learnerId: z.number().int().positive().optional(),
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(10).max(100).optional(),
  }).optional()).query(async ({ ctx, input }) => {
    requireAdmin(ctx.user);
    return listAdminPrivateConversations(actorFromUser(ctx.user), input);
  }),
  getNotificationPreferences: protectedProcedure.query(async ({ ctx }) => getPrivateMessageDeliveryPreferences(ctx.user.id)),
  updateNotificationPreferences: protectedProcedure.input(z.object({
    webEnabled: z.boolean(),
    emailEnabled: z.boolean(),
    soundEnabled: z.boolean(),
  })).mutation(async ({ ctx, input }) => updatePrivateMessageDeliveryPreferences(ctx.user.id, input)),
  getNotificationCenter: protectedProcedure.input(z.object({ limit: z.number().int().min(1).max(50).optional() }).optional()).query(async ({ ctx, input }) =>
    getPrivateMessagingNotificationCenter(actorFromUser(ctx.user), input?.limit),
  ),
  getIntegrityClarificationQueue: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx.user);
    const rows = await getIntegrityReviewQueue();
    const candidates = rows.filter((row) => row.review?.status !== "dismissed");
    const existingByLearner = await Promise.all(candidates.map(async (row) => ({
      learnerId: row.id,
      existing: await getIntegrityReviewConversationForLearner(row.id),
    })));
    const contactedLearnerIds = new Set(existingByLearner.filter((entry) => entry.existing).map((entry) => entry.learnerId));
    return candidates
      .filter((row) => !contactedLearnerIds.has(row.id))
      .map((row) => ({
        learnerId: row.id,
        learnerName: row.name,
        learnerEmail: row.email,
        reviewStatus: row.review?.status || "review_required",
        riskScore: row.assessment.riskScore,
        signalCount: row.assessment.signals.length,
        lastReviewedAt: row.review?.reviewedAt || null,
      }));
  }),
  createIntegrityClarificationConversations: protectedProcedure.mutation(async ({ ctx }) => {
    requireAdmin(ctx.user);
    const rows = await getIntegrityReviewQueue();
    const candidates = rows.filter((row) => row.review?.status !== "dismissed");
    let created = 0;
    let skipped = 0;
    for (const learner of candidates) {
      const existing = await getIntegrityReviewConversationForLearner(learner.id);
      if (existing) {
        skipped += 1;
        continue;
      }
      const result = await createPrivateConversation({
        learnerId: learner.id,
        subject: PRIVATE_INTEGRITY_REVIEW_TEMPLATE.subject,
        body: PRIVATE_INTEGRITY_REVIEW_TEMPLATE.body,
        source: "integrity_review",
        actor: actorFromUser(ctx.user),
      });
      const notification = await notifyRecipients({
        ...result,
        subject: PRIVATE_INTEGRITY_REVIEW_TEMPLATE.subject,
        learnerId: learner.id,
        learnerName: learner.name,
      });
      await publishMessageDelivery({
        type: "conversation.created",
        conversationId: result.conversationId,
        learnerId: learner.id,
        messageId: result.messageId,
        authorRole: result.authorRole,
        notification,
      });
      created += 1;
    }
    return { total: candidates.length, created, skipped };
  }),
  getConversation: protectedProcedure.input(z.object({ conversationId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const detail = await getPrivateConversationDetail({ actor: actorFromUser(ctx.user), conversationId: input.conversationId });
    if (!detail) throw new TRPCError({ code: "NOT_FOUND", message: "Conversation introuvable" });
    return detail;
  }),
  createMine: protectedProcedure.input(z.object({ subject: subjectSchema, source: z.enum(["learner", "problem_report"]).default("learner") }).and(messagePayloadSchema)).mutation(async ({ ctx, input }) => {
    const created = await createPrivateConversation({ learnerId: ctx.user.id, subject: input.subject, body: input.body, source: input.source, actor: actorFromUser(ctx.user), attachments: input.attachments });
    const notification = await notifyRecipients({ ...created, subject: input.subject, learnerId: ctx.user.id, learnerName: ctx.user.name });
    await publishMessageDelivery({ type: "conversation.created", conversationId: created.conversationId, learnerId: ctx.user.id, messageId: created.messageId, authorRole: created.authorRole, notification });
    return created;
  }),
  createForLearner: protectedProcedure.input(z.object({ learnerId: z.number().int().positive(), subject: subjectSchema, source: z.enum(PRIVATE_CONVERSATION_SOURCES).default("admin") }).and(messagePayloadSchema)).mutation(async ({ ctx, input }) => {
    requireAdmin(ctx.user);
    const created = await createPrivateConversation({ learnerId: input.learnerId, subject: input.subject, body: input.body, source: input.source, actor: actorFromUser(ctx.user), attachments: input.attachments });
    const notification = await notifyRecipients({ ...created, subject: input.subject, learnerId: input.learnerId });
    await publishMessageDelivery({ type: "conversation.created", conversationId: created.conversationId, learnerId: input.learnerId, messageId: created.messageId, authorRole: created.authorRole, notification });
    return created;
  }),
  send: protectedProcedure.input(z.object({ conversationId: z.number().int().positive() }).and(messagePayloadSchema)).mutation(async ({ ctx, input }) => {
    const sent = await sendPrivateMessage({ actor: actorFromUser(ctx.user), conversationId: input.conversationId, body: input.body, attachments: input.attachments });
    const notification = await notifyRecipients({ conversationId: sent.conversation.id, messageId: sent.messageId, authorRole: sent.authorRole, subject: sent.conversation.subject, learnerId: sent.conversation.learnerId });
    await publishMessageDelivery({ type: "message.created", conversationId: sent.conversation.id, learnerId: sent.conversation.learnerId, messageId: sent.messageId, authorRole: sent.authorRole, notification });
    return { success: true, messageId: sent.messageId, attachments: sent.attachments };
  }),
  setStatus: protectedProcedure.input(z.object({ conversationId: z.number().int().positive(), status: z.enum(["open", "closed"]) })).mutation(async ({ ctx, input }) => {
    const result = await changePrivateConversationStatus({ actor: actorFromUser(ctx.user), ...input });
    publishPrivateMessagingEvent({ type: "conversation.status.changed", conversationId: result.conversation.id, learnerId: result.conversation.learnerId, audience: "both" });
    return result;
  }),
  markRead: protectedProcedure.input(z.object({ conversationId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const result = await markPrivateConversationRead(actorFromUser(ctx.user), input.conversationId);
    if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Conversation introuvable" });
    publishPrivateMessagingEvent({ type: "conversation.read", conversationId: result.conversation.id, learnerId: result.conversation.learnerId, audience: "both" });
    return result;
  }),
});
