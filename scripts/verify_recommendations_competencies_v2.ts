import mysql from "mysql2/promise";
import trainingIndex from "../client/src/data/trainingIndex.json";
import { scoreCompetencyEvidence } from "../shared/competencyEvidence";
import profiles from "../shared/trainingCompetencyProfiles.json";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const db = await mysql.createConnection(process.env.DATABASE_URL);
const [columns] = await db.query<any[]>("SHOW COLUMNS FROM learner_orientation_profiles");
const [rules] = await db.query<any[]>("SELECT sourceType, points, minScore FROM competency_contribution_rules WHERE sourceKey='tagged' GROUP BY sourceType, points, minScore ORDER BY sourceType");
const [ruleCaps] = await db.query<any[]>("SELECT sourceType, COUNT(*) AS ruleCount, MAX(points) AS maxPoints, MIN(minScore) AS minRequiredScore FROM competency_contribution_rules GROUP BY sourceType ORDER BY sourceType");
const [ranks] = await db.query<any[]>("SELECT id,minPoints FROM gamification_ranks ORDER BY sortOrder");
const [points] = await db.query<any[]>("SELECT COUNT(*) AS contributionCount, ROUND(SUM(points),1) AS totalPoints FROM learner_competency_contributions");
const [orientationRows] = await db.query<any[]>("SELECT id,careerFamilyIds,aspiration,recommendations FROM learner_orientation_profiles ORDER BY id");
const [contributions] = await db.query<any[]>("SELECT userId,competencyId,sourceType,sourceKey,points,awardedAt FROM learner_competency_contributions");
const [migrationTables] = await db.query<any[]>("SHOW TABLES LIKE '__drizzle_migrations'");
const [recentMigrations] = migrationTables.length ? await db.query<any[]>("SELECT * FROM __drizzle_migrations ORDER BY id DESC LIMIT 5") : [[]];
const known = new Set(trainingIndex.certifications.map((certification) => certification.id));
const missingRecommendationIds: Array<{ profileId: number; certificationId: string }> = [];
let recommendationCount = 0;
for (const row of orientationRows) {
  const recommendations = typeof row.recommendations === "string" ? JSON.parse(row.recommendations) : row.recommendations || [];
  recommendationCount += recommendations.length;
  for (const recommendation of recommendations) if (!known.has(recommendation.certificationId)) missingRecommendationIds.push({ profileId: row.id, certificationId: recommendation.certificationId });
}
const grouped = new Map<string, any[]>();
const profileSources = new Set([...Object.keys(profiles.courses), ...Object.keys(profiles.certifications)]);
const unmappedSourceCounts = new Map<string, number>();
for (const contribution of contributions) {
  if (!profileSources.has(contribution.sourceKey)) unmappedSourceCounts.set(contribution.sourceKey, (unmappedSourceCounts.get(contribution.sourceKey) || 0) + 1);
  const key = `${contribution.userId}:${contribution.competencyId}`;
  const entries = grouped.get(key) || [];
  entries.push(contribution);
  grouped.set(key, entries);
}
const verifiedRankDistribution: Record<string, number> = { starting: 0, emerging: 0, bronze: 0, silver: 0, gold: 0 };
for (const entries of grouped.values()) verifiedRankDistribution[scoreCompetencyEvidence(entries).highestVerifiedRank] += 1;
console.log(JSON.stringify({
  schemaColumns: columns.filter((column) => ["careerFamilyIds", "aspiration"].includes(column.Field)).map((column) => ({ field: column.Field, type: column.Type, nullable: column.Null })),
  rules,
  ruleCaps,
  ranks,
  points: points[0],
  orientationProfiles: orientationRows.length,
  recommendationCount,
  missingRecommendationIds,
  verifiedRankDistribution,
  profiledContributionRows: contributions.filter((contribution) => profileSources.has(contribution.sourceKey)).length,
  topUnmappedSources: Array.from(unmappedSourceCounts.entries()).sort((left, right) => right[1] - left[1]).slice(0, 12),
  drizzleMigrationTablePresent: migrationTables.length > 0,
  recentMigrations,
}, null, 2));
await db.end();
