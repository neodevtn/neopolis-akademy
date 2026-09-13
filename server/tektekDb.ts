import { and, count, desc, eq, gte, like, or, sql } from "drizzle-orm";
import { tektekBudgetSettings, tektekConversations, tektekMessages, users } from "../drizzle/schema";
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

export async function appendTekTekMessage(input: { conversationId: number; courseId?: string | null; role: "user" | "assistant" | "system"; content: string; citations?: TekTekCitation[]; model?: string | null; promptTokens?: number | null; completionTokens?: number | null }) {
  const db = await requireDb();
  const result = await db.insert(tektekMessages).values({
    conversationId: input.conversationId,
    courseId: input.courseId ?? null,
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

export type TekTekUsageDimension = "training" | "course" | "user";
export type TekTekUsagePeriod = "7d" | "30d" | "month" | "all";

export type TekTekUsageOverviewInput = {
  dimension: TekTekUsageDimension;
  period: TekTekUsagePeriod;
  page: number;
  pageSize: number;
  search?: string;
};

const asNumber = (value: unknown) => Number(value ?? 0);

function usageSince(period: TekTekUsagePeriod) {
  if (period === "all") return undefined;
  const now = new Date();
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(Date.now() - (period === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000);
}

const tokenTotalExpression = sql<number>`COALESCE(SUM(COALESCE(${tektekMessages.promptTokens}, 0) + COALESCE(${tektekMessages.completionTokens}, 0)), 0)`;
const requestTotalExpression = sql<number>`COALESCE(SUM(CASE WHEN ${tektekMessages.role} = 'user' THEN 1 ELSE 0 END), 0)`;
const responseTotalExpression = sql<number>`COALESCE(SUM(CASE WHEN ${tektekMessages.role} = 'assistant' THEN 1 ELSE 0 END), 0)`;
const meteredResponseExpression = sql<number>`COALESCE(SUM(CASE WHEN ${tektekMessages.role} = 'assistant' AND (${tektekMessages.promptTokens} IS NOT NULL OR ${tektekMessages.completionTokens} IS NOT NULL) THEN 1 ELSE 0 END), 0)`;

/** Agrégats de jetons effectivement retournés par le modèle. Ils ne représentent pas une facture fournisseur. */
export async function getTekTekUsageOverview(input: TekTekUsageOverviewInput) {
  const db = await requireDb();
  const page = Math.max(1, input.page);
  const pageSize = Math.min(Math.max(input.pageSize, 1), 100);
  const since = usageSince(input.period);
  const baseWhere = since ? gte(tektekMessages.createdAt, since) : undefined;
  const search = input.search?.trim().slice(0, 160);

  const [summaryRow] = await db.select({
      requests: requestTotalExpression,
      responses: responseTotalExpression,
      meteredResponses: meteredResponseExpression,
      promptTokens: sql<number>`COALESCE(SUM(COALESCE(${tektekMessages.promptTokens}, 0)), 0)`,
      completionTokens: sql<number>`COALESCE(SUM(COALESCE(${tektekMessages.completionTokens}, 0)), 0)`,
      totalTokens: tokenTotalExpression,
    })
    .from(tektekMessages)
    .innerJoin(tektekConversations, eq(tektekConversations.id, tektekMessages.conversationId))
    .innerJoin(users, eq(users.id, tektekConversations.userId))
    .where(baseWhere);

  const totals = {
    requests: asNumber(summaryRow?.requests),
    responses: asNumber(summaryRow?.responses),
    meteredResponses: asNumber(summaryRow?.meteredResponses),
    promptTokens: asNumber(summaryRow?.promptTokens),
    completionTokens: asNumber(summaryRow?.completionTokens),
    totalTokens: asNumber(summaryRow?.totalTokens),
  };

  const commonSelection = {
    requests: requestTotalExpression,
    responses: responseTotalExpression,
    meteredResponses: meteredResponseExpression,
    promptTokens: sql<number>`COALESCE(SUM(COALESCE(${tektekMessages.promptTokens}, 0)), 0)`,
    completionTokens: sql<number>`COALESCE(SUM(COALESCE(${tektekMessages.completionTokens}, 0)), 0)`,
    totalTokens: tokenTotalExpression,
    lastUsedAt: sql<Date | null>`MAX(${tektekMessages.createdAt})`,
  };
  const offset = (page - 1) * pageSize;

  if (input.dimension === "user") {
    const where = and(baseWhere, search ? or(like(users.name, `%${search}%`), like(users.email, `%${search}%`)) : undefined);
    const [totalRow] = await db.select({ total: sql<number>`COUNT(DISTINCT ${tektekConversations.userId})` })
      .from(tektekMessages)
      .innerJoin(tektekConversations, eq(tektekConversations.id, tektekMessages.conversationId))
      .innerJoin(users, eq(users.id, tektekConversations.userId))
      .where(where);
    const rows = await db.select({
      scopeKey: tektekConversations.userId,
      label: users.name,
      email: users.email,
      ...commonSelection,
    }).from(tektekMessages)
      .innerJoin(tektekConversations, eq(tektekConversations.id, tektekMessages.conversationId))
      .innerJoin(users, eq(users.id, tektekConversations.userId))
      .where(where).groupBy(tektekConversations.userId, users.name, users.email)
      .orderBy(desc(tokenTotalExpression), desc(tektekConversations.userId)).limit(pageSize).offset(offset);
    return { period: input.period, dimension: input.dimension, page, pageSize, total: asNumber(totalRow?.total), totals, rows: rows.map((row) => ({ ...row, scopeKey: String(row.scopeKey), label: row.label || "Utilisateur sans nom", email: row.email || null, requests: asNumber(row.requests), responses: asNumber(row.responses), meteredResponses: asNumber(row.meteredResponses), promptTokens: asNumber(row.promptTokens), completionTokens: asNumber(row.completionTokens), totalTokens: asNumber(row.totalTokens) })) };
  }

  if (input.dimension === "training") {
    const where = and(baseWhere, search ? like(tektekConversations.certificationId, `%${search}%`) : undefined);
    const [totalRow] = await db.select({ total: sql<number>`COUNT(DISTINCT ${tektekConversations.certificationId})` })
      .from(tektekMessages)
      .innerJoin(tektekConversations, eq(tektekConversations.id, tektekMessages.conversationId))
      .innerJoin(users, eq(users.id, tektekConversations.userId))
      .where(where);
    const rows = await db.select({
      scopeKey: tektekConversations.certificationId,
      label: tektekConversations.certificationId,
      email: sql<string | null>`NULL`,
      ...commonSelection,
    }).from(tektekMessages)
      .innerJoin(tektekConversations, eq(tektekConversations.id, tektekMessages.conversationId))
      .innerJoin(users, eq(users.id, tektekConversations.userId))
      .where(where).groupBy(tektekConversations.certificationId)
      .orderBy(desc(tokenTotalExpression), desc(tektekConversations.certificationId)).limit(pageSize).offset(offset);
    return { period: input.period, dimension: input.dimension, page, pageSize, total: asNumber(totalRow?.total), totals, rows: rows.map((row) => ({ ...row, scopeKey: String(row.scopeKey), label: row.label, email: null, requests: asNumber(row.requests), responses: asNumber(row.responses), meteredResponses: asNumber(row.meteredResponses), promptTokens: asNumber(row.promptTokens), completionTokens: asNumber(row.completionTokens), totalTokens: asNumber(row.totalTokens) })) };
  }

  const where = and(baseWhere, search ? like(tektekMessages.courseId, `%${search}%`) : undefined);
  const [totalRow] = await db.select({ total: sql<number>`COUNT(DISTINCT COALESCE(${tektekMessages.courseId}, 'historique-sans-cours'))` })
    .from(tektekMessages)
    .innerJoin(tektekConversations, eq(tektekConversations.id, tektekMessages.conversationId))
    .innerJoin(users, eq(users.id, tektekConversations.userId))
    .where(where);
  const rows = await db.select({
    scopeKey: sql<string>`COALESCE(${tektekMessages.courseId}, 'historique-sans-cours')`,
    label: sql<string>`COALESCE(${tektekMessages.courseId}, 'Historique sans cours')`,
    email: sql<string | null>`NULL`,
    ...commonSelection,
  }).from(tektekMessages)
    .innerJoin(tektekConversations, eq(tektekConversations.id, tektekMessages.conversationId))
    .innerJoin(users, eq(users.id, tektekConversations.userId))
    .where(where).groupBy(tektekMessages.courseId)
    .orderBy(desc(tokenTotalExpression), desc(tektekMessages.courseId)).limit(pageSize).offset(offset);
  return { period: input.period, dimension: input.dimension, page, pageSize, total: asNumber(totalRow?.total), totals, rows: rows.map((row) => ({ ...row, scopeKey: String(row.scopeKey), label: row.label, email: null, requests: asNumber(row.requests), responses: asNumber(row.responses), meteredResponses: asNumber(row.meteredResponses), promptTokens: asNumber(row.promptTokens), completionTokens: asNumber(row.completionTokens), totalTokens: asNumber(row.totalTokens) })) };
}

export async function listTekTekBudgetSettings() {
  const db = await requireDb();
  return db.select().from(tektekBudgetSettings).orderBy(desc(tektekBudgetSettings.updatedAt));
}

export async function upsertTekTekBudgetSetting(input: { scope: "global" | "training" | "course" | "user"; scopeKey: string; monthlyTokenBudget: number; alertThresholdPercent: number; updatedBy: number }) {
  const db = await requireDb();
  await db.insert(tektekBudgetSettings).values(input).onDuplicateKeyUpdate({
    set: {
      monthlyTokenBudget: input.monthlyTokenBudget,
      alertThresholdPercent: input.alertThresholdPercent,
      updatedBy: input.updatedBy,
      updatedAt: new Date(),
    },
  });
  const [setting] = await db.select().from(tektekBudgetSettings)
    .where(and(eq(tektekBudgetSettings.scope, input.scope), eq(tektekBudgetSettings.scopeKey, input.scopeKey))).limit(1);
  if (!setting) throw new Error("Unable to save TekTek budget setting");
  return setting;
}
