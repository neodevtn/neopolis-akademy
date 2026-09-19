import type { CompetencySourceType } from "./competencyFramework";

export type CompetencyEvidence = {
  sourceType: string;
  sourceKey: string;
  points: string | number;
  awardedAt?: Date | string;
};

export const HARDENED_COMPETENCY_POINTS: Record<CompetencySourceType, number> = {
  exercise_passed: 2,
  quiz_passed: 2,
  checkpoint_passed: 0.75,
  skill_badge: 3,
  certification: 10,
};

export const HARDENED_COMPETENCY_MIN_SCORE: Partial<Record<CompetencySourceType, number>> = {
  exercise_passed: 70,
  quiz_passed: 75,
  checkpoint_passed: 70,
};

export const COMPETENCY_MILESTONES = [
  { id: "emerging", minPoints: 5, minEvidence: 3, minSources: 1, minTypes: 1, requiresAchievement: false, requiresCertification: false },
  { id: "bronze", minPoints: 20, minEvidence: 8, minSources: 2, minTypes: 2, requiresAchievement: false, requiresCertification: false },
  { id: "silver", minPoints: 50, minEvidence: 18, minSources: 4, minTypes: 2, requiresAchievement: true, requiresCertification: false },
  { id: "gold", minPoints: 80, minEvidence: 35, minSources: 7, minTypes: 3, requiresAchievement: true, requiresCertification: true },
] as const;

export type CompetencyEvidenceSummary = {
  rawPoints: number;
  evidencePoints: number;
  level: number;
  evidenceCount: number;
  distinctSources: number;
  distinctTypes: number;
  hasAchievement: boolean;
  hasCertification: boolean;
  highestVerifiedRank: "starting" | "emerging" | "bronze" | "silver" | "gold";
  nextMilestone: typeof COMPETENCY_MILESTONES[number] | null;
};

function round(value: number) {
  return Math.round(value * 10) / 10;
}

export function scoreCompetencyEvidence(entries: CompetencyEvidence[], maxPoints = 100): CompetencyEvidenceSummary {
  const rawPoints = round(entries.reduce((total, entry) => total + (Number(entry.points) || 0), 0));
  const verifiedEntries = entries.filter((entry) => Number(entry.points) > 0);
  const evidencePoints = Math.max(0, Math.min(maxPoints, rawPoints));
  const distinctSources = new Set(verifiedEntries.map((entry) => entry.sourceKey).filter(Boolean)).size;
  const distinctTypes = new Set(verifiedEntries.map((entry) => entry.sourceType).filter(Boolean)).size;
  const hasAchievement = verifiedEntries.some((entry) => entry.sourceType === "skill_badge" || entry.sourceType === "certification");
  const hasCertification = verifiedEntries.some((entry) => entry.sourceType === "certification");

  let highestVerifiedRank: CompetencyEvidenceSummary["highestVerifiedRank"] = "starting";
  let verifiedThreshold = 0;
  for (const milestone of COMPETENCY_MILESTONES) {
    const eligible = evidencePoints >= milestone.minPoints
      && verifiedEntries.length >= milestone.minEvidence
      && distinctSources >= milestone.minSources
      && distinctTypes >= milestone.minTypes
      && (!milestone.requiresAchievement || hasAchievement)
      && (!milestone.requiresCertification || hasCertification);
    if (!eligible) break;
    highestVerifiedRank = milestone.id;
    verifiedThreshold = milestone.minPoints;
  }

  const nextMilestone = COMPETENCY_MILESTONES.find((milestone) => milestone.minPoints > verifiedThreshold) || null;
  const levelCap = nextMilestone ? nextMilestone.minPoints - 0.1 : maxPoints;
  return {
    rawPoints,
    evidencePoints: round(evidencePoints),
    level: round(Math.min(evidencePoints, levelCap, maxPoints)),
    evidenceCount: verifiedEntries.length,
    distinctSources,
    distinctTypes,
    hasAchievement,
    hasCertification,
    highestVerifiedRank,
    nextMilestone,
  };
}

export function competencyPointsForSource(sourceType: CompetencySourceType) {
  return HARDENED_COMPETENCY_POINTS[sourceType];
}

export function describeMissingCompetencyEvidence(summary: CompetencyEvidenceSummary): string[] {
  const next = summary.nextMilestone;
  if (!next) return [];
  const requirements: string[] = [];
  if (summary.evidencePoints < next.minPoints) requirements.push(`${round(next.minPoints - summary.evidencePoints)} point(s) vérifié(s)`);
  if (summary.evidenceCount < next.minEvidence) requirements.push(`${next.minEvidence - summary.evidenceCount} preuve(s) supplémentaire(s)`);
  if (summary.distinctSources < next.minSources) requirements.push(`${next.minSources - summary.distinctSources} formation(s) ou source(s) distincte(s)`);
  if (summary.distinctTypes < next.minTypes) requirements.push(`${next.minTypes - summary.distinctTypes} type(s) de preuve distinct(s)`);
  if (next.requiresAchievement && !summary.hasAchievement) requirements.push("un badge ou une certification");
  if (next.requiresCertification && !summary.hasCertification) requirements.push("une certification réussie");
  return requirements;
}
