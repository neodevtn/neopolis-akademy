import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { CAREER_FAMILY_DEFINITIONS, inferCareerFamilyIds, parseCareerFamilyIds } from "../shared/careerPathways";
import { HARDENED_COMPETENCY_POINTS, scoreCompetencyEvidence } from "../shared/competencyEvidence";
import { buildOrientationRecommendations, getDiagnosticPoints, type OrientationGoal } from "../shared/orientationFramework";
import profiles from "../shared/trainingCompetencyProfiles.json";
import trainingIndex from "../client/src/data/trainingIndex.json";

const apply = process.argv.includes("--apply");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");
const connection = await mysql.createConnection(databaseUrl);
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = path.resolve(process.cwd(), `.work/recommendation-competency-migration-${timestamp}`);
const availableCertificationIds = trainingIndex.certifications.map((certification) => certification.id);
const courseProfiles = profiles.courses as Record<string, Array<{ competencyId: string; weight: number }>>;
const certificationProfiles = profiles.certifications as Record<string, Array<{ competencyId: string; weight: number }>>;

const [columns] = await connection.query<any[]>("SHOW COLUMNS FROM learner_orientation_profiles");
const columnNames = new Set(columns.map((column) => column.Field));
const [rules] = await connection.query<any[]>("SELECT * FROM competency_contribution_rules ORDER BY id");
const [ranks] = await connection.query<any[]>("SELECT * FROM gamification_ranks ORDER BY sortOrder");
const [settings] = await connection.query<any[]>("SELECT * FROM gamification_settings");
const [contributions] = await connection.query<any[]>("SELECT * FROM learner_competency_contributions ORDER BY id");
const [orientationProfiles] = await connection.query<any[]>("SELECT * FROM learner_orientation_profiles ORDER BY id");
const [users] = await connection.query<any[]>("SELECT id, email FROM users");
const [applications] = await connection.query<any[]>("SELECT email, currentRole, sector, motivation, aiAgentSector, aiAgentScenario, aiAgentImpact, technicalTools, certifications, createdAt FROM applications ORDER BY createdAt DESC");

const rulesById = new Map(rules.map((rule) => [Number(rule.id), rule]));
const userEmail = new Map(users.map((user) => [Number(user.id), String(user.email || "").trim().toLowerCase()]));
const applicationByEmail = new Map<string, any>();
for (const application of applications) {
  const email = String(application.email || "").trim().toLowerCase();
  if (email && !applicationByEmail.has(email)) applicationByEmail.set(email, application);
}

function contentProfile(sourceKey: string) {
  return courseProfiles[sourceKey] || certificationProfiles[sourceKey] || [];
}

const contributionUpdates = contributions.map((contribution) => {
  const rule = rulesById.get(Number(contribution.ruleId));
  const basePoints = HARDENED_COMPETENCY_POINTS[contribution.sourceType as keyof typeof HARDENED_COMPETENCY_POINTS]
    ?? Number(rule?.points || contribution.points || 0);
  const profile = contentProfile(String(contribution.sourceKey || ""));
  const weight = profile.find((item) => item.competencyId === contribution.competencyId)?.weight
    ?? (profile.length ? 0 : 1);
  const points = Math.round(basePoints * weight * 100) / 100;
  return { id: Number(contribution.id), points, previousPoints: Number(contribution.points) };
});

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value === "string") {
    try { return JSON.parse(value) as T; } catch { return fallback; }
  }
  return (value ?? fallback) as T;
}

function candidateContext(application: any) {
  return [application?.currentRole, application?.sector, application?.motivation, application?.aiAgentSector, application?.aiAgentScenario, application?.aiAgentImpact, application?.technicalTools, application?.certifications]
    .filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
    .join(" \n");
}

const recalibratedContributions = contributions.map((contribution) => ({
  ...contribution,
  points: contributionUpdates.find((update) => update.id === Number(contribution.id))?.points ?? Number(contribution.points),
}));
const contributionByUserCompetency = new Map<string, any[]>();
for (const contribution of recalibratedContributions) {
  const key = `${contribution.userId}:${contribution.competencyId}`;
  const entries = contributionByUserCompetency.get(key) || [];
  entries.push(contribution);
  contributionByUserCompetency.set(key, entries);
}

const orientationUpdates = orientationProfiles.map((profile) => {
  const goals = parseJson<OrientationGoal[]>(profile.goals, []);
  const assessment = parseJson<any>(profile.assessment, null);
  const answers = Array.isArray(assessment?.answers) ? assessment.answers : [];
  const diagnosticPoints = assessment?.diagnosticPoints || getDiagnosticPoints(goals, answers);
  const competencyPoints = Object.fromEntries(goals.map((goal) => {
    const entries = contributionByUserCompetency.get(`${profile.userId}:${goal.competencyId}`) || [];
    return [goal.competencyId, scoreCompetencyEvidence(entries).level];
  }));
  const selectedCareerFamilyIds = parseCareerFamilyIds(profile.careerFamilyIds);
  const aspiration = typeof profile.aspiration === "string" ? profile.aspiration.trim().slice(0, 2000) : "";
  const application = applicationByEmail.get(userEmail.get(Number(profile.userId)) || "");
  const context = candidateContext(application);
  const inferredCareerFamilyIds = Array.from(new Set([...selectedCareerFamilyIds, ...inferCareerFamilyIds(aspiration), ...inferCareerFamilyIds(context)])).slice(0, 4);
  const recommendations = goals.length ? buildOrientationRecommendations({
    goals,
    competencyPoints,
    diagnosticPoints,
    wantsOfficialCertification: Number(profile.wantsOfficialCertification) === 1,
    officialCertificationIds: parseJson<string[]>(profile.officialCertificationIds, []),
    careerFamilyIds: selectedCareerFamilyIds,
    aspiration,
    candidateContext: context,
    availableCertificationIds,
  }) : [];
  return { id: Number(profile.id), selectedCareerFamilyIds, inferredCareerFamilyIds, aspiration, recommendations };
});

function rankDistribution(source: any[]) {
  const groups = new Map<string, any[]>();
  for (const contribution of source) {
    const key = `${contribution.userId}:${contribution.competencyId}`;
    const entries = groups.get(key) || [];
    entries.push(contribution);
    groups.set(key, entries);
  }
  const distribution: Record<string, number> = { starting: 0, emerging: 0, bronze: 0, silver: 0, gold: 0 };
  for (const entries of groups.values()) distribution[scoreCompetencyEvidence(entries).highestVerifiedRank] += 1;
  return distribution;
}

const report = {
  mode: apply ? "apply" : "dry-run",
  schemaColumnsToAdd: ["careerFamilyIds", "aspiration"].filter((column) => !columnNames.has(column)),
  contributionRows: contributions.length,
  contributionRowsChanged: contributionUpdates.filter((update) => update.points !== update.previousPoints).length,
  pointsBefore: Math.round(contributions.reduce((sum, row) => sum + Number(row.points), 0) * 10) / 10,
  pointsAfter: Math.round(recalibratedContributions.reduce((sum, row) => sum + Number(row.points), 0) * 10) / 10,
  verifiedRankDistributionAfter: rankDistribution(recalibratedContributions),
  orientationProfiles: orientationProfiles.length,
  refreshedRecommendations: orientationUpdates.reduce((sum, update) => sum + update.recommendations.length, 0),
  inferredCareerProfiles: orientationUpdates.filter((update) => update.inferredCareerFamilyIds.length > 0).length,
  careerFamilies: CAREER_FAMILY_DEFINITIONS.length,
};

if (!apply) {
  console.log(JSON.stringify(report, null, 2));
  await connection.end();
  process.exit(0);
}

fs.mkdirSync(backupDir, { recursive: true });
fs.writeFileSync(path.join(backupDir, "backup.json"), JSON.stringify({ generatedAt: new Date().toISOString(), rules, ranks, settings, contributions, orientationProfiles }, null, 2));

for (const column of report.schemaColumnsToAdd) {
  if (column === "careerFamilyIds") await connection.query("ALTER TABLE learner_orientation_profiles ADD careerFamilyIds JSON NULL");
  if (column === "aspiration") await connection.query("ALTER TABLE learner_orientation_profiles ADD aspiration TEXT NULL");
}

await connection.beginTransaction();
try {
  for (const [sourceType, points] of Object.entries(HARDENED_COMPETENCY_POINTS)) {
    const minScore = sourceType === "quiz_passed" ? 75 : sourceType === "checkpoint_passed" || sourceType === "exercise_passed" ? 70 : null;
    await connection.execute("UPDATE competency_contribution_rules SET points = LEAST(points, ?), minScore = CASE WHEN ? IS NULL THEN minScore ELSE GREATEST(COALESCE(minScore, 0), ?) END WHERE sourceType = ?", [points.toFixed(2), minScore, minScore, sourceType]);
    await connection.execute("UPDATE competency_contribution_rules SET points = ?, minScore = ? WHERE sourceType = ? AND sourceKey IN ('tagged','*')", [points.toFixed(2), minScore, sourceType]);
  }
  const rankThresholds: Record<string, number> = { starting: 0, emerging: 5, bronze: 20, silver: 50, gold: 80 };
  for (const [id, minPoints] of Object.entries(rankThresholds)) await connection.execute("UPDATE gamification_ranks SET minPoints = ? WHERE id = ?", [minPoints.toFixed(2), id]);
  await connection.execute("UPDATE gamification_settings SET weeklyGoalPoints = ? WHERE id = 'default'", ["5.00"]);

  for (let offset = 0; offset < contributionUpdates.length; offset += 250) {
    const batch = contributionUpdates.slice(offset, offset + 250);
    const cases = batch.map(() => "WHEN ? THEN ?").join(" ");
    const ids = batch.map(() => "?").join(",");
    const parameters = batch.flatMap((item) => [item.id, item.points.toFixed(2)]).concat(batch.map((item) => item.id));
    await connection.execute(`UPDATE learner_competency_contributions SET points = CASE id ${cases} ELSE points END WHERE id IN (${ids})`, parameters);
  }
  for (const update of orientationUpdates) {
    await connection.execute("UPDATE learner_orientation_profiles SET careerFamilyIds = ?, aspiration = ?, recommendations = ?, updatedAt = updatedAt WHERE id = ?", [JSON.stringify(update.selectedCareerFamilyIds), update.aspiration || null, JSON.stringify(update.recommendations), update.id]);
  }
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
}

fs.writeFileSync(path.join(backupDir, "migration-report.json"), JSON.stringify({ ...report, backupDir }, null, 2));
console.log(JSON.stringify({ ...report, backupDir }, null, 2));
await connection.end();
