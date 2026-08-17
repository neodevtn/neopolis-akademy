import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import {
  competencyContributionRules,
  competencyDefinitions,
  gamificationRanks,
  gamificationSettings,
  learnerCompetencyContributions,
  users,
} from "../drizzle/schema";
import { clampCompetencyLevel, DEFAULT_COMPETENCIES, DEFAULT_COMPETENCY_RULES, type CompetencySourceType } from "../shared/competencyFramework";
import { DEFAULT_GAMIFICATION_RANKS, DEFAULT_GAMIFICATION_SETTINGS } from "../shared/gamificationFramework";
import { getDb } from "./db";

export type CompetencyEvent = {
  userId: number;
  sourceType: CompetencySourceType;
  sourceKey: string;
  eventKey: string;
  score?: number | null;
  evidence?: Record<string, unknown>;
};

export async function ensureCompetencyFramework() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ id: competencyDefinitions.id }).from(competencyDefinitions).limit(1);
  if (existing.length) return;
  await db.insert(competencyDefinitions).values(DEFAULT_COMPETENCIES.map((item) => ({ ...item, maxPoints: "100.00", active: 1 })));
  await db.insert(competencyContributionRules).values(DEFAULT_COMPETENCY_RULES.map((item) => ({
    ...item,
    points: item.points.toFixed(2),
    minScore: item.minScore === null ? null : item.minScore.toFixed(2),
    active: 1,
  })));
}

export async function ensureGamificationFramework() {
  const db = await getDb();
  if (!db) return;
  const [rank, settings] = await Promise.all([
    db.select({ id: gamificationRanks.id }).from(gamificationRanks).limit(1),
    db.select({ id: gamificationSettings.id }).from(gamificationSettings).limit(1),
  ]);
  if (!rank.length) {
    await db.insert(gamificationRanks).values(DEFAULT_GAMIFICATION_RANKS.map((item) => ({ ...item, minPoints: item.minPoints.toFixed(2), active: 1 })));
  }
  if (!settings.length) {
    await db.insert(gamificationSettings).values({
      id: "default",
      weeklyGoalPoints: DEFAULT_GAMIFICATION_SETTINGS.weeklyGoalPoints.toFixed(2),
      pointsLabel: DEFAULT_GAMIFICATION_SETTINGS.pointsLabel,
      rewardNotice: DEFAULT_GAMIFICATION_SETTINGS.rewardNotice,
    });
  }
}

function getCurrentWeekStart() {
  const start = new Date();
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);
  return start;
}

export async function getGamificationConfig() {
  await ensureGamificationFramework();
  const db = await getDb();
  if (!db) return { ranks: [], settings: null };
  const [ranks, settings] = await Promise.all([
    db.select().from(gamificationRanks).orderBy(asc(gamificationRanks.sortOrder)),
    db.select().from(gamificationSettings).where(eq(gamificationSettings.id, "default")).limit(1),
  ]);
  return {
    ranks: ranks.map((rank) => ({ ...rank, minPoints: Number(rank.minPoints) })),
    settings: settings[0] ? { ...settings[0], weeklyGoalPoints: Number(settings[0].weeklyGoalPoints) } : null,
  };
}

export async function saveGamificationConfig(input: { ranks: Array<{ id: string; label: string; minPoints: number; color: string; icon: string; sortOrder: number; active: number }>; settings: { weeklyGoalPoints: number; pointsLabel: string; rewardNotice: string } }) {
  const db = await getDb();
  if (!db) throw new Error("Base de données indisponible");
  await db.transaction(async (tx) => {
    await tx.delete(gamificationRanks);
    await tx.insert(gamificationRanks).values(input.ranks.map((rank) => ({ ...rank, minPoints: rank.minPoints.toFixed(2) })));
    await tx.insert(gamificationSettings).values({
      id: "default",
      weeklyGoalPoints: input.settings.weeklyGoalPoints.toFixed(2),
      pointsLabel: input.settings.pointsLabel,
      rewardNotice: input.settings.rewardNotice,
    }).onDuplicateKeyUpdate({ set: {
      weeklyGoalPoints: input.settings.weeklyGoalPoints.toFixed(2),
      pointsLabel: input.settings.pointsLabel,
      rewardNotice: input.settings.rewardNotice,
    } });
  });
  return getGamificationConfig();
}

export async function getUserGamification(userId: number) {
  const [config, db] = await Promise.all([getGamificationConfig(), getDb()]);
  if (!db) return { ...config, weekly: { points: 0, target: 0, remaining: 0, reached: false, weekStart: getCurrentWeekStart() } };
  const contributions = await db.select().from(learnerCompetencyContributions).where(eq(learnerCompetencyContributions.userId, userId));
  const weekStart = getCurrentWeekStart();
  const points = contributions.filter((item) => new Date(item.awardedAt) >= weekStart).reduce((sum, item) => sum + Number(item.points), 0);
  const target = config.settings?.weeklyGoalPoints || DEFAULT_GAMIFICATION_SETTINGS.weeklyGoalPoints;
  return { ...config, weekly: { points, target, remaining: Math.max(0, target - points), reached: points >= target, weekStart } };
}

export async function applyCompetencyEvent(event: CompetencyEvent) {
  await ensureCompetencyFramework();
  const db = await getDb();
  if (!db) return [];
  const rules = await db.select().from(competencyContributionRules).where(and(
    eq(competencyContributionRules.sourceType, event.sourceType),
    eq(competencyContributionRules.active, 1),
  ));
  const eligible = rules.filter((rule) => (rule.sourceKey === "*" || rule.sourceKey === event.sourceKey) && (rule.minScore === null || (event.score ?? 0) >= Number(rule.minScore)));
  const created: Array<{ competencyId: string; points: number }> = [];
  for (const rule of eligible) {
    const duplicate = await db.select({ id: learnerCompetencyContributions.id }).from(learnerCompetencyContributions).where(and(
      eq(learnerCompetencyContributions.userId, event.userId),
      eq(learnerCompetencyContributions.ruleId, rule.id),
      eq(learnerCompetencyContributions.eventKey, event.eventKey),
    )).limit(1);
    if (duplicate.length) continue;
    await db.insert(learnerCompetencyContributions).values({
      userId: event.userId,
      competencyId: rule.competencyId,
      ruleId: rule.id,
      sourceType: event.sourceType,
      sourceKey: event.sourceKey,
      eventKey: event.eventKey,
      points: rule.points,
      score: event.score === undefined || event.score === null ? null : event.score.toFixed(2),
      evidence: event.evidence || null,
    });
    created.push({ competencyId: rule.competencyId, points: Number(rule.points) });
  }
  return created;
}

export async function getUserCompetencies(userId: number) {
  await ensureCompetencyFramework();
  const db = await getDb();
  if (!db) return [];
  const [definitions, contributions] = await Promise.all([
    db.select().from(competencyDefinitions).where(eq(competencyDefinitions.active, 1)).orderBy(asc(competencyDefinitions.sortOrder)),
    db.select().from(learnerCompetencyContributions).where(eq(learnerCompetencyContributions.userId, userId)).orderBy(desc(learnerCompetencyContributions.awardedAt)),
  ]);
  return definitions.map((definition) => {
    const entries = contributions.filter((entry) => entry.competencyId === definition.id);
    const rawPoints = entries.reduce((total, entry) => total + Number(entry.points), 0);
    const level = clampCompetencyLevel(rawPoints, Number(definition.maxPoints));
    return { ...definition, rawPoints, level, contributionCount: entries.length, contributions: entries };
  });
}

export async function getCompetencyFramework() {
  await ensureCompetencyFramework();
  const db = await getDb();
  if (!db) return { definitions: [], rules: [] };
  const [definitions, rules] = await Promise.all([
    db.select().from(competencyDefinitions).orderBy(asc(competencyDefinitions.sortOrder)),
    db.select().from(competencyContributionRules).orderBy(asc(competencyContributionRules.sortOrder)),
  ]);
  return { definitions, rules };
}

export async function getCompetencyLeaderboard(input: { competencyId?: string; limit?: number } = {}) {
  await ensureCompetencyFramework();
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(competencyDefinitions.active, 1)];
  if (input.competencyId) conditions.push(eq(competencyDefinitions.id, input.competencyId));
  const total = sql<number>`COALESCE(SUM(${learnerCompetencyContributions.points}), 0)`;
  const rows = await db.select({
    userId: users.id,
    name: users.name,
    email: users.email,
    competencyId: competencyDefinitions.id,
    title: competencyDefinitions.title,
    color: competencyDefinitions.color,
    maxPoints: competencyDefinitions.maxPoints,
    rawPoints: total,
    contributionCount: sql<number>`COUNT(${learnerCompetencyContributions.id})`,
  }).from(learnerCompetencyContributions)
    .innerJoin(competencyDefinitions, eq(learnerCompetencyContributions.competencyId, competencyDefinitions.id))
    .innerJoin(users, eq(learnerCompetencyContributions.userId, users.id))
    .where(and(...conditions))
    .groupBy(users.id, users.name, users.email, competencyDefinitions.id, competencyDefinitions.title, competencyDefinitions.color, competencyDefinitions.maxPoints)
    .orderBy(desc(total), asc(users.name))
    .limit(Math.max(1, Math.min(input.limit || 50, 200)));
  return rows.map((row, index) => ({
    ...row,
    rank: index + 1,
    rawPoints: Number(row.rawPoints),
    level: clampCompetencyLevel(Number(row.rawPoints), Number(row.maxPoints)),
    contributionCount: Number(row.contributionCount),
  }));
}

export async function replaceCompetencyFramework(input: { definitions: any[]; rules: any[] }) {
  const db = await getDb();
  if (!db) throw new Error("Base de données indisponible");
  const competencyIds = new Set(input.definitions.map((definition) => definition.id));
  if (input.rules.some((rule) => !competencyIds.has(rule.competencyId))) {
    throw new Error("Chaque règle doit être associée à une compétence existante.");
  }
  await db.transaction(async (tx) => {
    await tx.delete(competencyContributionRules);
    await tx.delete(competencyDefinitions);
    if (input.definitions.length) await tx.insert(competencyDefinitions).values(input.definitions);
    if (input.rules.length) await tx.insert(competencyContributionRules).values(input.rules);
  });
  return getCompetencyFramework();
}
