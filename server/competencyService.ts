import { and, asc, desc, eq, inArray } from "drizzle-orm";
import {
  competencyContributionRules,
  competencyDefinitions,
  learnerCompetencyContributions,
} from "../drizzle/schema";
import { clampCompetencyLevel, DEFAULT_COMPETENCIES, DEFAULT_COMPETENCY_RULES, type CompetencySourceType } from "../shared/competencyFramework";
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
