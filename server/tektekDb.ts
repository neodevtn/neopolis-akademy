import { and, count, desc, eq, gte } from "drizzle-orm";
import { tektekConversations, tektekMessages } from "../drizzle/schema";
import type { TekTekCitation, TekTekLanguage, TekTekVisibleMessage } from "../shared/tektek";
import { getDb } from "./db";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export async function getOrCreateTekTekConversation(input: { userId: number; certificationId: string; activeCourseId: string; language: TekTekLanguage }) {
  const db = await requireDb();
  const [existing] = await db.select().from(tektekConversations)
    .where(and(eq(tektekConversations.userId, input.userId), eq(tektekConversations.certificationId, input.certificationId))).limit(1);
  if (existing) {
    await db.update(tektekConversations).set({ activeCourseId: input.activeCourseId, language: input.language }).where(eq(tektekConversations.id, existing.id));
    return { ...existing, activeCourseId: input.activeCourseId, language: input.language };
  }
  const result = await db.insert(tektekConversations).values(input);
  const id = Number(result[0].insertId);
  const [created] = await db.select().from(tektekConversations).where(eq(tektekConversations.id, id)).limit(1);
  if (!created) throw new Error("Unable to create TekTek conversation");
  return created;
}

export async function listTekTekMessages(input: { userId: number; certificationId: string; limit?: number }): Promise<TekTekVisibleMessage[]> {
  const db = await requireDb();
  const [conversation] = await db.select({ id: tektekConversations.id }).from(tektekConversations)
    .where(and(eq(tektekConversations.userId, input.userId), eq(tektekConversations.certificationId, input.certificationId))).limit(1);
  if (!conversation) return [];
  const rows = await db.select().from(tektekMessages).where(eq(tektekMessages.conversationId, conversation.id))
    .orderBy(desc(tektekMessages.createdAt)).limit(Math.min(Math.max(input.limit ?? 40, 1), 80));
  return rows.reverse().map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    citations: Array.isArray(row.sourceReferences) ? row.sourceReferences as TekTekCitation[] : [],
    createdAt: row.createdAt,
  }));
}

export async function appendTekTekMessage(input: { conversationId: number; role: "user" | "assistant" | "system"; content: string; citations?: TekTekCitation[]; model?: string | null; promptTokens?: number | null; completionTokens?: number | null }) {
  const db = await requireDb();
  const result = await db.insert(tektekMessages).values({
    conversationId: input.conversationId,
    role: input.role,
    content: input.content,
    sourceReferences: input.citations ?? null,
    model: input.model ?? null,
    promptTokens: input.promptTokens ?? null,
    completionTokens: input.completionTokens ?? null,
  });
  await db.update(tektekConversations).set({ updatedAt: new Date() }).where(eq(tektekConversations.id, input.conversationId));
  return Number(result[0].insertId);
}

export async function getTekTekRequestsInLastHour(userId: number) {
  const db = await requireDb();
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [row] = await db.select({ total: count() }).from(tektekMessages)
    .innerJoin(tektekConversations, eq(tektekConversations.id, tektekMessages.conversationId))
    .where(and(eq(tektekConversations.userId, userId), eq(tektekMessages.role, "user"), gte(tektekMessages.createdAt, since)));
  return Number(row?.total ?? 0);
}
