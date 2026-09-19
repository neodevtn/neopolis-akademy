import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";
import {
  competencyContributionRules,
  competencyDefinitions,
  gamificationRanks,
  gamificationSettings,
  learnerCompetencyContributions,
  users,
} from "../drizzle/schema";
import { DEFAULT_COMPETENCIES, DEFAULT_COMPETENCY_RULES, type CompetencySourceType } from "../shared/competencyFramework";
import { describeMissingCompetencyEvidence, HARDENED_COMPETENCY_MIN_SCORE, HARDENED_COMPETENCY_POINTS, scoreCompetencyEvidence } from "../shared/competencyEvidence";
import { DEFAULT_GAMIFICATION_RANKS, DEFAULT_GAMIFICATION_SETTINGS } from "../shared/gamificationFramework";
import trainingCompetencyProfiles from "../shared/trainingCompetencyProfiles.json";
import { getDb } from "./db";

export type CompetencyEvent = {
  userId: number;
  sourceType: CompetencySourceType;
  sourceKey: string;
  eventKey: string;
  score?: number | null;
  competencyTags?: string[];
  evidence?: Record<string, unknown>;
};

const courseDataDir = path.resolve(import.meta.dirname, "../client/public/data/courses");
const trainingIndexPath = path.resolve(import.meta.dirname, "../client/src/data/trainingIndex.json");

type CompetencyProfileItem = { competencyId: string; weight: number };
const competencyProfiles = trainingCompetencyProfiles as {
  courses: Record<string, CompetencyProfileItem[]>;
  certifications: Record<string, CompetencyProfileItem[]>;
};

export function getContentCompetencyProfile(input: { courseId?: string; certificationId?: string }): CompetencyProfileItem[] {
  if (input.courseId && competencyProfiles.courses[input.courseId]?.length) return competencyProfiles.courses[input.courseId];
  if (input.certificationId && competencyProfiles.certifications[input.certificationId]?.length) return competencyProfiles.certifications[input.certificationId];
  return [];
}

export function getContentCompetencyTags(input: { courseId?: string; lessonIndex?: number; moduleId?: string; certificationId?: string }) {
  const curated = getContentCompetencyProfile(input);
  if (curated.length) return curated.map((item) => item.competencyId);
  const courseId = input.courseId || "";
  if (/^[a-zA-Z0-9_-]+$/.test(courseId)) {
    try {
      const course = JSON.parse(fs.readFileSync(path.join(courseDataDir, `${courseId}.json`), "utf8"));
      const lessons = Array.isArray(course.lessons) ? course.lessons : [];
      const indexedLesson = typeof input.lessonIndex === "number" ? lessons[input.lessonIndex] : null;
      const matchingLesson = indexedLesson || (input.moduleId ? lessons.find((lesson: any) => JSON.stringify(lesson).includes(input.moduleId!)) : null);
      if (Array.isArray(matchingLesson?.competencyTags)) return matchingLesson.competencyTags;
      return Array.from(new Set<string>(lessons.flatMap((lesson: any) => Array.isArray(lesson.competencyTags) ? lesson.competencyTags : [])));
    } catch { /* resolve the certification below when applicable */ }
  }
  if (!input.certificationId) return [];
  try {
    const index = JSON.parse(fs.readFileSync(trainingIndexPath, "utf8"));
    const courseIds = (index.courses || []).filter((course: any) => course.certId === input.certificationId).map((course: any) => course.id);
    const tags: string[] = [];
    for (const linkedCourseId of courseIds) tags.push(...getContentCompetencyTags({ courseId: linkedCourseId }));
    return Array.from(new Set<string>(tags));
  } catch { return []; }
}

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
  const defaultRankMinimums = new Map(DEFAULT_GAMIFICATION_RANKS.map((rank) => [rank.id, rank.minPoints]));
  await db.transaction(async (tx) => {
    await tx.delete(gamificationRanks);
    await tx.insert(gamificationRanks).values(input.ranks.map((rank) => ({
      ...rank,
      minPoints: Math.max(rank.minPoints, defaultRankMinimums.get(rank.id) || 0).toFixed(2),
    })));
    await tx.insert(gamificationSettings).values({
      id: "default",
      weeklyGoalPoints: Math.max(input.settings.weeklyGoalPoints, DEFAULT_GAMIFICATION_SETTINGS.weeklyGoalPoints).toFixed(2),
      pointsLabel: input.settings.pointsLabel,
      rewardNotice: input.settings.rewardNotice,
    }).onDuplicateKeyUpdate({ set: {
      weeklyGoalPoints: Math.max(input.settings.weeklyGoalPoints, DEFAULT_GAMIFICATION_SETTINGS.weeklyGoalPoints).toFixed(2),
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
  const tags = new Set(event.competencyTags || []);
  const sourceMinScore = HARDENED_COMPETENCY_MIN_SCORE[event.sourceType] || 0;
  const eligible = rules.filter((rule) => tags.has(rule.competencyId)
    && ["tagged", "*", event.sourceKey].includes(rule.sourceKey)
    && (event.score ?? 0) >= Math.max(sourceMinScore, Number(rule.minScore || 0)));
  if (!eligible.length) return [];
  const existing = await db.select({ ruleId: learnerCompetencyContributions.ruleId }).from(learnerCompetencyContributions).where(and(
      eq(learnerCompetencyContributions.userId, event.userId),
      eq(learnerCompetencyContributions.eventKey, event.eventKey),
      inArray(learnerCompetencyContributions.ruleId, eligible.map((rule) => rule.id)),
    ));
  const existingRuleIds = new Set(existing.map((row) => row.ruleId));
  const pending = eligible.filter((rule) => !existingRuleIds.has(rule.id));
  if (!pending.length) return [];
  const profile = getContentCompetencyProfile({ courseId: event.sourceKey, certificationId: event.sourceKey });
  const profileWeights = new Map(profile.map((item) => [item.competencyId, item.weight]));
  const fallbackWeight = 1 / Math.max(1, tags.size);
  const sourceCap = HARDENED_COMPETENCY_POINTS[event.sourceType] || 0;
  const awarded = pending.map((rule) => ({
    rule,
    points: Math.round(Math.min(Number(rule.points) || sourceCap, sourceCap) * (profileWeights.get(rule.competencyId) || fallbackWeight) * 100) / 100,
  }));
  await db.insert(learnerCompetencyContributions).values(awarded.map(({ rule, points }) => ({
      userId: event.userId,
      competencyId: rule.competencyId,
      ruleId: rule.id,
      sourceType: event.sourceType,
      sourceKey: event.sourceKey,
      eventKey: event.eventKey,
      points: points.toFixed(2),
      score: event.score === undefined || event.score === null ? null : event.score.toFixed(2),
      evidence: event.evidence || null,
    }))).onDuplicateKeyUpdate({ set: { id: sql`${learnerCompetencyContributions.id}` } });
  return awarded.map(({ rule, points }) => ({ competencyId: rule.competencyId, points }));
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
    const summary = scoreCompetencyEvidence(entries, Number(definition.maxPoints));
    return {
      ...definition,
      rawPoints: summary.rawPoints,
      evidencePoints: summary.evidencePoints,
      level: summary.level,
      contributionCount: summary.evidenceCount,
      distinctSources: summary.distinctSources,
      distinctTypes: summary.distinctTypes,
      highestVerifiedRank: summary.highestVerifiedRank,
      nextMilestone: summary.nextMilestone,
      missingEvidence: describeMissingCompetencyEvidence(summary),
      contributions: entries,
    };
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
  const rows = await db.select({
    userId: users.id,
    name: users.name,
    email: users.email,
    competencyId: competencyDefinitions.id,
    title: competencyDefinitions.title,
    color: competencyDefinitions.color,
    maxPoints: competencyDefinitions.maxPoints,
    sourceType: learnerCompetencyContributions.sourceType,
    sourceKey: learnerCompetencyContributions.sourceKey,
    points: learnerCompetencyContributions.points,
    awardedAt: learnerCompetencyContributions.awardedAt,
  }).from(learnerCompetencyContributions)
    .innerJoin(competencyDefinitions, eq(learnerCompetencyContributions.competencyId, competencyDefinitions.id))
    .innerJoin(users, eq(learnerCompetencyContributions.userId, users.id))
    .where(and(...conditions));
  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = `${row.userId}:${row.competencyId}`;
    const entries = grouped.get(key) || [];
    entries.push(row);
    grouped.set(key, entries);
  }
  return Array.from(grouped.values())
    .map((entries) => {
      const first = entries[0]!;
      const summary = scoreCompetencyEvidence(entries, Number(first.maxPoints));
      return {
        userId: first.userId,
        name: first.name,
        email: first.email,
        competencyId: first.competencyId,
        title: first.title,
        color: first.color,
        maxPoints: first.maxPoints,
        rawPoints: summary.rawPoints,
        level: summary.level,
        contributionCount: summary.evidenceCount,
        distinctSources: summary.distinctSources,
        highestVerifiedRank: summary.highestVerifiedRank,
      };
    })
    .sort((left, right) => right.level - left.level || right.rawPoints - left.rawPoints || String(left.name || left.email || "").localeCompare(String(right.name || right.email || ""), "fr"))
    .slice(0, Math.max(1, Math.min(input.limit || 50, 200)))
    .map((row, index) => ({ ...row, rank: index + 1 }));
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
    if (input.rules.length) await tx.insert(competencyContributionRules).values(input.rules.map((rule) => {
      const sourceType = rule.sourceType as CompetencySourceType;
      const pointCap = HARDENED_COMPETENCY_POINTS[sourceType] || 0;
      const minimumScore = HARDENED_COMPETENCY_MIN_SCORE[sourceType] || 0;
      return {
        ...rule,
        points: Math.min(Number(rule.points) || pointCap, pointCap).toFixed(2),
        minScore: minimumScore ? Math.max(Number(rule.minScore) || 0, minimumScore).toFixed(2) : rule.minScore,
      };
    }));
  });
  return getCompetencyFramework();
}
