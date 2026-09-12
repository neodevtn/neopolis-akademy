import { and, asc, count, desc, eq, inArray, isNull, like, ne, or } from "drizzle-orm";
import {
  privateConversations,
  privateMessageEvents,
  privateMessageNotificationPreferences,
  privateMessageNotificationState,
  privateMessages,
  users,
} from "../drizzle/schema";
import type { PrivateConversationSource, PrivateMessageAuthorRole } from "../shared/privateMessaging";
import { privateMessagePreview } from "../shared/privateMessaging";
import { isAdministrativeRole } from "../shared/roles";
import { getDb } from "./db";

export type PrivateConversationSummary = {
  id: number;
  learnerId: number;
  subject: string;
  status: "open" | "closed";
  source: PrivateConversationSource;
  lastMessageAt: Date;
  lastMessagePreview: string | null;
  createdAt: Date;
  updatedAt: Date;
  learner?: { id: number; name: string | null; email: string | null };
  unreadCount: number;
};

export type PrivateConversationPage = {
  items: PrivateConversationSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PrivateMessageDeliveryPreferences = {
  webEnabled: boolean;
  emailEnabled: boolean;
  soundEnabled: boolean;
};

const DEFAULT_PRIVATE_MESSAGE_DELIVERY_PREFERENCES: PrivateMessageDeliveryPreferences = {
  webEnabled: true,
  emailEnabled: true,
  soundEnabled: true,
};

type ConversationActor = {
  userId: number;
  role: string;
};

function requireAdministrativeActor(actor: ConversationActor) {
  if (!isAdministrativeRole(actor.role)) {
    throw new Error("Accès réservé aux administrateurs");
  }
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

async function recordEvent(input: {
  conversationId: number;
  messageId?: number | null;
  actorUserId?: number | null;
  eventType: "conversation_created" | "message_sent" | "conversation_closed" | "conversation_reopened" | "learner_read" | "admin_read" | "notification_requested" | "notification_delivered" | "notification_failed";
  metadata?: Record<string, unknown>;
}) {
  const db = await requireDb();
  await db.insert(privateMessageEvents).values({
    conversationId: input.conversationId,
    messageId: input.messageId ?? null,
    actorUserId: input.actorUserId ?? null,
    eventType: input.eventType,
    metadata: input.metadata ?? null,
  });
}

async function unreadCountsByConversation(input: { learnerId?: number; admin?: boolean }) {
  const db = await requireDb();
  const rows = input.admin
    ? await db.select({ conversationId: privateMessages.conversationId, unreadCount: count() })
      .from(privateMessages)
      .where(and(isNull(privateMessages.adminReadAt), ne(privateMessages.authorRole, "admin")))
      .groupBy(privateMessages.conversationId)
    : await db.select({ conversationId: privateMessages.conversationId, unreadCount: count() })
      .from(privateMessages)
      .innerJoin(privateConversations, eq(privateConversations.id, privateMessages.conversationId))
      .where(and(
        eq(privateConversations.learnerId, input.learnerId!),
        isNull(privateMessages.learnerReadAt),
        ne(privateMessages.authorRole, "learner"),
      ))
      .groupBy(privateMessages.conversationId);
  return new Map(rows.map((row) => [row.conversationId, Number(row.unreadCount)]));
}

export async function getPrivateConversationForLearner(learnerId: number, conversationId: number) {
  const db = await requireDb();
  const [conversation] = await db.select().from(privateConversations)
    .where(and(eq(privateConversations.id, conversationId), eq(privateConversations.learnerId, learnerId))).limit(1);
  return conversation ?? null;
}

export async function getPrivateConversationForAdmin(actor: ConversationActor, conversationId: number) {
  requireAdministrativeActor(actor);
  const db = await requireDb();
  const [conversation] = await db.select().from(privateConversations).where(eq(privateConversations.id, conversationId)).limit(1);
  return conversation ?? null;
}

export async function getIntegrityReviewConversationForLearner(learnerId: number) {
  const db = await requireDb();
  const [conversation] = await db.select({ id: privateConversations.id }).from(privateConversations)
    .where(and(
      eq(privateConversations.learnerId, learnerId),
      eq(privateConversations.source, "integrity_review"),
    ))
    .orderBy(desc(privateConversations.createdAt), desc(privateConversations.id))
    .limit(1);
  return conversation ?? null;
}

export async function listLearnerPrivateConversations(learnerId: number): Promise<PrivateConversationSummary[]> {
  const db = await requireDb();
  const [conversations, unreadByConversation] = await Promise.all([
    db.select().from(privateConversations).where(eq(privateConversations.learnerId, learnerId))
      .orderBy(desc(privateConversations.lastMessageAt), desc(privateConversations.id)).limit(200),
    unreadCountsByConversation({ learnerId }),
  ]);
  return conversations.map((conversation) => ({ ...conversation, unreadCount: unreadByConversation.get(conversation.id) ?? 0 }));
}

export async function listAdminPrivateConversations(actor: ConversationActor, options: { status?: "all" | "open" | "closed"; search?: string; learnerId?: number; page?: number; pageSize?: number } = {}): Promise<PrivateConversationPage> {
  requireAdministrativeActor(actor);
  const db = await requireDb();
  const pageSize = Math.min(100, Math.max(10, options.pageSize ?? 25));
  const requestedPage = Math.max(1, options.page ?? 1);
  const search = options.search?.trim();
  const whereClause = and(
    options.status && options.status !== "all" ? eq(privateConversations.status, options.status) : undefined,
    options.learnerId ? eq(privateConversations.learnerId, options.learnerId) : undefined,
    search ? or(
      like(privateConversations.subject, `%${search}%`),
      like(users.name, `%${search}%`),
      like(users.email, `%${search}%`),
    ) : undefined,
  );
  const [{ total: rawTotal }] = await db.select({ total: count() }).from(privateConversations)
    .innerJoin(users, eq(users.id, privateConversations.learnerId))
    .where(whereClause);
  const total = Number(rawTotal ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const rows = await db.select({
    conversation: privateConversations,
    learner: { id: users.id, name: users.name, email: users.email },
  }).from(privateConversations)
    .innerJoin(users, eq(users.id, privateConversations.learnerId))
    .where(whereClause)
    .orderBy(desc(privateConversations.lastMessageAt), desc(privateConversations.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const unreadByConversation = await unreadCountsByConversation({ admin: true });
  return {
    items: rows.map(({ conversation, learner }) => ({ ...conversation, learner, unreadCount: unreadByConversation.get(conversation.id) ?? 0 })),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getPrivateConversationDetail(input: { actor: ConversationActor; conversationId: number }) {
  const conversation = isAdministrativeRole(input.actor.role)
    ? await getPrivateConversationForAdmin(input.actor, input.conversationId)
    : await getPrivateConversationForLearner(input.actor.userId, input.conversationId);
  if (!conversation) return null;
  const db = await requireDb();
  const [messages, learnerRows] = await Promise.all([
    db.select().from(privateMessages).where(eq(privateMessages.conversationId, conversation.id)).orderBy(asc(privateMessages.createdAt), asc(privateMessages.id)).limit(1_000),
    db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, conversation.learnerId)).limit(1),
  ]);
  return { conversation, learner: learnerRows[0] ?? null, messages };
}

export async function createPrivateConversation(input: {
  learnerId: number;
  subject: string;
  body: string;
  source: PrivateConversationSource;
  actor: ConversationActor;
}) {
  const db = await requireDb();
  const authorRole: PrivateMessageAuthorRole = isAdministrativeRole(input.actor.role) ? "admin" : "learner";
  if (authorRole === "learner" && input.actor.userId !== input.learnerId) throw new Error("Accès refusé à cette conversation");
  const now = new Date();
  const [conversationResult] = await db.insert(privateConversations).values({
    learnerId: input.learnerId,
    subject: input.subject,
    source: input.source,
    initiatedByUserId: input.actor.userId,
    lastMessageAt: now,
    lastMessagePreview: privateMessagePreview(input.body),
  }).$returningId();
  const conversationId = conversationResult?.id;
  if (!conversationId) throw new Error("Impossible de créer la conversation");
  const [messageResult] = await db.insert(privateMessages).values({
    conversationId,
    authorUserId: input.actor.userId,
    authorRole,
    body: input.body,
    learnerReadAt: authorRole === "learner" ? now : null,
    adminReadAt: authorRole === "admin" ? now : null,
  }).$returningId();
  const messageId = messageResult?.id;
  if (!messageId) throw new Error("Impossible d’enregistrer le premier message");
  await recordEvent({ conversationId, actorUserId: input.actor.userId, eventType: "conversation_created", metadata: { source: input.source } });
  await recordEvent({ conversationId, messageId, actorUserId: input.actor.userId, eventType: "message_sent", metadata: { authorRole } });
  return { conversationId, messageId, authorRole };
}

export async function sendPrivateMessage(input: { actor: ConversationActor; conversationId: number; body: string }) {
  const conversation = isAdministrativeRole(input.actor.role)
    ? await getPrivateConversationForAdmin(input.actor, input.conversationId)
    : await getPrivateConversationForLearner(input.actor.userId, input.conversationId);
  if (!conversation) throw new Error("Conversation introuvable");
  if (conversation.status !== "open") throw new Error("Cette conversation est fermée. Rouvrez-la avant d’envoyer un message.");
  const db = await requireDb();
  const authorRole: PrivateMessageAuthorRole = isAdministrativeRole(input.actor.role) ? "admin" : "learner";
  const now = new Date();
  const [messageResult] = await db.insert(privateMessages).values({
    conversationId: conversation.id,
    authorUserId: input.actor.userId,
    authorRole,
    body: input.body,
    learnerReadAt: authorRole === "learner" ? now : null,
    adminReadAt: authorRole === "admin" ? now : null,
  }).$returningId();
  const messageId = messageResult?.id;
  if (!messageId) throw new Error("Impossible d’enregistrer le message");
  await db.update(privateConversations).set({ lastMessageAt: now, lastMessagePreview: privateMessagePreview(input.body) })
    .where(eq(privateConversations.id, conversation.id));
  await recordEvent({ conversationId: conversation.id, messageId, actorUserId: input.actor.userId, eventType: "message_sent", metadata: { authorRole } });
  return { conversation, messageId, authorRole };
}

export async function changePrivateConversationStatus(input: { actor: ConversationActor; conversationId: number; status: "open" | "closed" }) {
  const conversation = isAdministrativeRole(input.actor.role)
    ? await getPrivateConversationForAdmin(input.actor, input.conversationId)
    : await getPrivateConversationForLearner(input.actor.userId, input.conversationId);
  if (!conversation) throw new Error("Conversation introuvable");
  if (conversation.status === input.status) return { conversation, changed: false };
  const now = new Date();
  const db = await requireDb();
  await db.update(privateConversations).set({
    status: input.status,
    closedAt: input.status === "closed" ? now : null,
    closedByUserId: input.status === "closed" ? input.actor.userId : null,
  }).where(eq(privateConversations.id, conversation.id));
  await recordEvent({
    conversationId: conversation.id,
    actorUserId: input.actor.userId,
    eventType: input.status === "closed" ? "conversation_closed" : "conversation_reopened",
  });
  return { conversation: { ...conversation, status: input.status }, changed: true };
}

export async function markPrivateConversationRead(actor: ConversationActor, conversationId: number) {
  const conversation = isAdministrativeRole(actor.role)
    ? await getPrivateConversationForAdmin(actor, conversationId)
    : await getPrivateConversationForLearner(actor.userId, conversationId);
  if (!conversation) return null;
  const db = await requireDb();
  const now = new Date();
  const admin = isAdministrativeRole(actor.role);
  await db.update(privateMessages).set(admin ? { adminReadAt: now } : { learnerReadAt: now })
    .where(and(
      eq(privateMessages.conversationId, conversation.id),
      admin ? isNull(privateMessages.adminReadAt) : isNull(privateMessages.learnerReadAt),
      ne(privateMessages.authorRole, admin ? "admin" : "learner"),
    ));
  await recordEvent({ conversationId, actorUserId: actor.userId, eventType: admin ? "admin_read" : "learner_read" });
  return { success: true };
}

export async function getPrivateNotificationRecipients(input: { conversationId: number; authorRole: PrivateMessageAuthorRole }) {
  const db = await requireDb();
  const [conversation] = await db.select().from(privateConversations).where(eq(privateConversations.id, input.conversationId)).limit(1);
  if (!conversation) return [];
  if (input.authorRole === "admin" || input.authorRole === "system") {
    const rows = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, conversation.learnerId)).limit(1);
    return rows;
  }
  return db.select({ id: users.id, name: users.name, email: users.email }).from(users)
    .where(inArray(users.role, ["admin", "admin_learner"]));
}

export async function createPrivateNotificationState(input: { conversationId: number; messageId: number; recipientUserId: number; channel: "web" | "email" }) {
  const db = await requireDb();
  const existing = await db.select({ id: privateMessageNotificationState.id }).from(privateMessageNotificationState)
    .where(and(
      eq(privateMessageNotificationState.messageId, input.messageId),
      eq(privateMessageNotificationState.recipientUserId, input.recipientUserId),
      eq(privateMessageNotificationState.channel, input.channel),
    )).limit(1);
  if (existing[0]) return existing[0].id;
  const [result] = await db.insert(privateMessageNotificationState).values({ ...input, status: "pending" }).$returningId();
  return result?.id ?? null;
}

export async function completePrivateNotificationState(input: { stateId: number; delivered: boolean; errorCode?: string }) {
  const db = await requireDb();
  const now = new Date();
  await db.update(privateMessageNotificationState).set({
    status: input.delivered ? "sent" : "failed",
    attemptedAt: now,
    deliveredAt: input.delivered ? now : null,
    errorCode: input.errorCode?.slice(0, 160) ?? null,
  }).where(eq(privateMessageNotificationState.id, input.stateId));
}

function toDeliveryPreferences(row: typeof privateMessageNotificationPreferences.$inferSelect | undefined): PrivateMessageDeliveryPreferences {
  if (!row) return { ...DEFAULT_PRIVATE_MESSAGE_DELIVERY_PREFERENCES };
  return { webEnabled: Boolean(row.webEnabled), emailEnabled: Boolean(row.emailEnabled), soundEnabled: Boolean(row.soundEnabled) };
}

export async function getPrivateMessageDeliveryPreferences(userId: number): Promise<PrivateMessageDeliveryPreferences> {
  const db = await requireDb();
  const [row] = await db.select().from(privateMessageNotificationPreferences)
    .where(eq(privateMessageNotificationPreferences.userId, userId)).limit(1);
  return toDeliveryPreferences(row);
}

export async function getPrivateMessageDeliveryPreferencesForUsers(userIds: number[]) {
  const uniqueIds = Array.from(new Set(userIds.filter((userId) => Number.isInteger(userId) && userId > 0)));
  if (!uniqueIds.length) return new Map<number, PrivateMessageDeliveryPreferences>();
  const db = await requireDb();
  const rows = await db.select().from(privateMessageNotificationPreferences)
    .where(inArray(privateMessageNotificationPreferences.userId, uniqueIds));
  const byUser = new Map(rows.map((row) => [row.userId, toDeliveryPreferences(row)]));
  return new Map(uniqueIds.map((userId) => [userId, byUser.get(userId) || { ...DEFAULT_PRIVATE_MESSAGE_DELIVERY_PREFERENCES }]));
}

export async function updatePrivateMessageDeliveryPreferences(userId: number, input: PrivateMessageDeliveryPreferences) {
  const db = await requireDb();
  await db.insert(privateMessageNotificationPreferences).values({
    userId,
    webEnabled: input.webEnabled ? 1 : 0,
    emailEnabled: input.emailEnabled ? 1 : 0,
    soundEnabled: input.soundEnabled ? 1 : 0,
  }).onDuplicateKeyUpdate({
    set: {
      webEnabled: input.webEnabled ? 1 : 0,
      emailEnabled: input.emailEnabled ? 1 : 0,
      soundEnabled: input.soundEnabled ? 1 : 0,
    },
  });
  return getPrivateMessageDeliveryPreferences(userId);
}

export async function getPrivateMessagingNotificationCenter(actor: ConversationActor, limit = 20) {
  const safeLimit = Math.min(50, Math.max(1, limit));
  const items = isAdministrativeRole(actor.role)
    ? (await listAdminPrivateConversations(actor, { page: 1, pageSize: 100 })).items
    : await listLearnerPrivateConversations(actor.userId);
  return items.filter((conversation) => conversation.unreadCount > 0).slice(0, safeLimit);
}

export async function recordPrivateNotificationEvent(input: { conversationId: number; messageId: number; recipientUserId: number; delivered?: boolean; errorCode?: string }) {
  await recordEvent({
    conversationId: input.conversationId,
    messageId: input.messageId,
    eventType: input.delivered === undefined ? "notification_requested" : input.delivered ? "notification_delivered" : "notification_failed",
    metadata: { recipientUserId: input.recipientUserId, ...(input.errorCode ? { errorCode: input.errorCode.slice(0, 160) } : {}) },
  });
}
