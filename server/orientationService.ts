import { and, desc, eq, isNotNull, isNull, ne, or } from "drizzle-orm";
import { learnerOrientationProfiles, users } from "../drizzle/schema";
import {
  buildOrientationRecommendations,
  getDiagnosticPoints,
  getOrientationQuestions,
  ORIENTATION_TARGETS,
  type OrientationAssessmentAnswer,
  type OrientationGoal,
} from "../shared/orientationFramework";
import { getDb } from "./db";
import { getUserCompetencies } from "./competencyService";
import { createCommunication } from "./adminDb";

type StoredAssessment = {
  answers: OrientationAssessmentAnswer[];
  diagnosticPoints: Record<string, number>;
  completedAt: string;
};

function parseGoals(value: unknown): OrientationGoal[] {
  if (!Array.isArray(value)) return [];
  return value.filter((goal: any) => goal && typeof goal.competencyId === "string" && ["bronze", "silver", "gold"].includes(goal.targetLevel));
}

function parseStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function parseAssessment(value: unknown): StoredAssessment | null {
  if (!value || typeof value !== "object") return null;
  const assessment = value as Partial<StoredAssessment>;
  if (!Array.isArray(assessment.answers) || !assessment.diagnosticPoints || typeof assessment.diagnosticPoints !== "object") return null;
  return {
    answers: assessment.answers.filter((item: any) => item && typeof item.questionId === "string" && typeof item.choiceId === "string"),
    diagnosticPoints: assessment.diagnosticPoints as Record<string, number>,
    completedAt: typeof assessment.completedAt === "string" ? assessment.completedAt : new Date().toISOString(),
  };
}

async function buildOrientationView(userId: number, profile?: typeof learnerOrientationProfiles.$inferSelect | null) {
  const goals = parseGoals(profile?.goals);
  const assessment = parseAssessment(profile?.assessment);
  const competencies = await getUserCompetencies(userId);
  const competencyPoints = Object.fromEntries(competencies.map((competency) => [competency.id, competency.level]));
  const wantsOfficialCertification = profile?.wantsOfficialCertification === 1;
  const officialCertificationIds = parseStringList(profile?.officialCertificationIds);
  const diagnosticPoints = assessment?.diagnosticPoints || {};
  const recommendations = goals.length
    ? buildOrientationRecommendations({ goals, competencyPoints, diagnosticPoints, wantsOfficialCertification, officialCertificationIds })
    : [];

  return {
    profile: profile ? {
      id: profile.id,
      status: profile.status,
      goals,
      wantsOfficialCertification,
      officialCertificationIds,
      assessment,
      startedAt: profile.startedAt,
      completedAt: profile.completedAt,
      updatedAt: profile.updatedAt,
    } : {
      status: "not_started" as const,
      goals: [],
      wantsOfficialCertification: false,
      officialCertificationIds: [],
      assessment: null,
      startedAt: null,
      completedAt: null,
      updatedAt: null,
    },
    competencies: competencies.map((competency) => ({
      id: competency.id,
      title: competency.title,
      description: competency.description,
      icon: competency.icon,
      color: competency.color,
      level: competency.level,
      rawPoints: competency.rawPoints,
      targetPoints: goals.find((goal) => goal.competencyId === competency.id)
        ? ORIENTATION_TARGETS[goals.find((goal) => goal.competencyId === competency.id)!.targetLevel].points
        : null,
    })),
    questions: getOrientationQuestions(goals).map(({ correctChoiceId, rationale, ...question }) => question),
    recommendations,
    needsOrientation: !profile || profile.status !== "completed",
  };
}

export async function getLearnerOrientation(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [profile] = await db.select().from(learnerOrientationProfiles).where(eq(learnerOrientationProfiles.userId, userId)).limit(1);
  return buildOrientationView(userId, profile);
}

export async function saveLearnerOrientationGoals(input: {
  userId: number;
  goals: OrientationGoal[];
  wantsOfficialCertification: boolean;
  officialCertificationIds: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = new Date();
  await db.insert(learnerOrientationProfiles).values({
    userId: input.userId,
    status: "goals_set",
    goals: input.goals,
    wantsOfficialCertification: input.wantsOfficialCertification ? 1 : 0,
    officialCertificationIds: input.officialCertificationIds,
    assessment: null,
    recommendations: null,
    startedAt: now,
    completedAt: null,
  }).onDuplicateKeyUpdate({
    set: {
      status: "goals_set",
      goals: input.goals,
      wantsOfficialCertification: input.wantsOfficialCertification ? 1 : 0,
      officialCertificationIds: input.officialCertificationIds,
      assessment: null,
      recommendations: null,
      startedAt: now,
      completedAt: null,
    },
  });
  return getLearnerOrientation(input.userId);
}

export async function completeLearnerOrientation(input: {
  userId: number;
  answers: OrientationAssessmentAnswer[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [profile] = await db.select().from(learnerOrientationProfiles).where(eq(learnerOrientationProfiles.userId, input.userId)).limit(1);
  if (!profile) throw new Error("Orientation goals are required before the diagnostic");
  const goals = parseGoals(profile.goals);
  const questions = getOrientationQuestions(goals);
  const allowedIds = new Set(questions.map((question) => question.id));
  const answers = input.answers.filter((answer) => allowedIds.has(answer.questionId));
  if (answers.length !== questions.length) throw new Error("All orientation questions must be answered");

  const diagnosticPoints = getDiagnosticPoints(goals, answers);
  const competencies = await getUserCompetencies(input.userId);
  const competencyPoints = Object.fromEntries(competencies.map((competency) => [competency.id, competency.level]));
  const recommendations = buildOrientationRecommendations({
    goals,
    competencyPoints,
    diagnosticPoints,
    wantsOfficialCertification: profile.wantsOfficialCertification === 1,
    officialCertificationIds: parseStringList(profile.officialCertificationIds),
  });
  const completedAt = new Date();
  const assessment: StoredAssessment = { answers, diagnosticPoints, completedAt: completedAt.toISOString() };
  await db.update(learnerOrientationProfiles)
    .set({ status: "completed", assessment, recommendations, completedAt })
    .where(eq(learnerOrientationProfiles.id, profile.id));
  return getLearnerOrientation(input.userId);
}

export async function getAdminOrientationOverview(input: { userId?: number; limit?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const conditions = input.userId ? [eq(learnerOrientationProfiles.userId, input.userId)] : [];
  const rows = await db.select({
    profile: learnerOrientationProfiles,
    user: { id: users.id, name: users.name, email: users.email, role: users.role },
  }).from(learnerOrientationProfiles)
    .innerJoin(users, eq(learnerOrientationProfiles.userId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(learnerOrientationProfiles.updatedAt))
    .limit(Math.max(1, Math.min(input.limit || 100, 200)));

  return Promise.all(rows.map(async ({ profile, user }) => ({
    user,
    orientation: await buildOrientationView(user.id, profile),
  })));
}

/** Crée un brouillon révisable : aucune communication n’est expédiée par cette fonction. */
export async function createLegacyOrientationReminderDraft(adminId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select({ email: users.email })
    .from(users)
    .leftJoin(learnerOrientationProfiles, eq(learnerOrientationProfiles.userId, users.id))
    .where(and(
      isNotNull(users.email),
      or(isNull(learnerOrientationProfiles.id), ne(learnerOrientationProfiles.status, "completed")),
    ));
  const emails = Array.from(new Set(rows.map((row) => row.email?.trim().toLowerCase()).filter((email): email is string => Boolean(email))));
  if (!emails.length) return { draft: null, recipientCount: 0 };
  const draft = await createCommunication({
    subject: "Définissez votre parcours de formation personnalisé",
    body: `<h2>Votre orientation Neopolis Akademy est disponible</h2><p>Définissez vos compétences cibles, répondez à un diagnostic rapide et recevez un ordre de formation adapté à votre niveau.</p><p><strong>Connectez-vous à votre espace Formation puis ouvrez « Mon orientation » pour démarrer.</strong></p>`,
    type: "reminder",
    isImportant: 1,
    recipientFilter: { audience: "manual", manualEmails: emails, criteriaLogic: "and" },
    sentBy: adminId,
    status: "draft",
    recipientCount: 0,
  });
  return { draft, recipientCount: emails.length };
}
