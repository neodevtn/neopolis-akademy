import { and, desc, eq, inArray, isNotNull, isNull, ne, or } from "drizzle-orm";
import { learnerCompetencyContributions, learnerOrientationProfiles, learnerOrientationProposals, users } from "../drizzle/schema";
import {
  buildOrientationRecommendations,
  getDiagnosticPoints,
  getOrientationQuestions,
  ORIENTATION_TARGETS,
  type OrientationAssessmentAnswer,
  type OrientationGoal,
} from "../shared/orientationFramework";
import { buildOrientationTrajectory } from "../shared/orientationTrajectory";
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

function parseCertificationTargetDates(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const dates: Record<string, string> = {};
  for (const [certificationId, date] of Object.entries(value as Record<string, unknown>)) {
    if (typeof certificationId === "string" && typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) dates[certificationId] = date;
  }
  return dates;
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

async function getOrientationTrajectory(userId: number, profile: typeof learnerOrientationProfiles.$inferSelect | null | undefined, goals: OrientationGoal[], certificationTargetDates: Record<string, string>) {
  const targetDate = Object.values(certificationTargetDates).sort()[0] || null;
  const targetPoints = goals.reduce((sum, goal) => sum + ORIENTATION_TARGETS[goal.targetLevel].points, 0);
  if (!profile?.startedAt || !targetDate || !goals.length) return buildOrientationTrajectory({ startedAt: profile?.startedAt || null, targetDate, targetPoints, contributions: [] });
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const contributionRows = await db.select({ awardedAt: learnerCompetencyContributions.awardedAt, points: learnerCompetencyContributions.points })
    .from(learnerCompetencyContributions)
    .where(and(eq(learnerCompetencyContributions.userId, userId), inArray(learnerCompetencyContributions.competencyId, goals.map((goal) => goal.competencyId))));
  return buildOrientationTrajectory({ startedAt: profile.startedAt, targetDate, targetPoints, contributions: contributionRows.map((contribution) => ({ ...contribution, points: Number(contribution.points) || 0 })) });
}

async function getPendingOrientationProposal(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [proposal] = await db.select().from(learnerOrientationProposals)
    .where(and(eq(learnerOrientationProposals.userId, userId), eq(learnerOrientationProposals.status, "pending")))
    .orderBy(desc(learnerOrientationProposals.createdAt)).limit(1);
  if (!proposal) return null;
  return {
    id: proposal.id,
    goals: parseGoals(proposal.goals),
    wantsOfficialCertification: proposal.wantsOfficialCertification === 1,
    officialCertificationIds: parseStringList(proposal.officialCertificationIds),
    certificationTargetDates: parseCertificationTargetDates(proposal.certificationTargetDates),
    justification: proposal.justification,
    createdAt: proposal.createdAt,
  };
}

async function buildOrientationView(userId: number, profile?: typeof learnerOrientationProfiles.$inferSelect | null) {
  const goals = parseGoals(profile?.goals);
  const assessment = parseAssessment(profile?.assessment);
  const competencies = await getUserCompetencies(userId);
  const competencyPoints = Object.fromEntries(competencies.map((competency) => [competency.id, competency.level]));
  const wantsOfficialCertification = profile?.wantsOfficialCertification === 1;
  const officialCertificationIds = parseStringList(profile?.officialCertificationIds);
  const certificationTargetDates = parseCertificationTargetDates(profile?.certificationTargetDates);
  const diagnosticPoints = assessment?.diagnosticPoints || {};
  const recommendations = goals.length
    ? buildOrientationRecommendations({ goals, competencyPoints, diagnosticPoints, wantsOfficialCertification, officialCertificationIds })
    : [];
  const [trajectory, pendingProposal] = await Promise.all([
    getOrientationTrajectory(userId, profile, goals, certificationTargetDates),
    getPendingOrientationProposal(userId),
  ]);

  return {
    profile: profile ? {
      id: profile.id,
      status: profile.status,
      goals,
      wantsOfficialCertification,
      officialCertificationIds,
      certificationTargetDates,
      assessment,
      startedAt: profile.startedAt,
      completedAt: profile.completedAt,
      updatedAt: profile.updatedAt,
    } : {
      status: "not_started" as const,
      goals: [],
      wantsOfficialCertification: false,
      officialCertificationIds: [],
      certificationTargetDates: {},
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
    trajectory,
    pendingProposal,
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
  certificationTargetDates?: unknown;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = new Date();
  const certificationTargetDates = parseCertificationTargetDates(input.certificationTargetDates);
  await db.insert(learnerOrientationProfiles).values({
    userId: input.userId,
    status: "goals_set",
    goals: input.goals,
    wantsOfficialCertification: input.wantsOfficialCertification ? 1 : 0,
    officialCertificationIds: input.officialCertificationIds,
    certificationTargetDates,
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
      certificationTargetDates,
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

export async function createOrientationProposal(input: {
  userId: number;
  proposedBy: number;
  goals: OrientationGoal[];
  wantsOfficialCertification: boolean;
  officialCertificationIds: string[];
  certificationTargetDates?: unknown;
  justification: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const justification = input.justification.trim();
  if (justification.length < 8) throw new Error("Une justification d’au moins 8 caractères est requise");
  await db.insert(learnerOrientationProposals).values({
    userId: input.userId,
    proposedBy: input.proposedBy,
    goals: input.goals,
    wantsOfficialCertification: input.wantsOfficialCertification ? 1 : 0,
    officialCertificationIds: input.officialCertificationIds,
    certificationTargetDates: parseCertificationTargetDates(input.certificationTargetDates),
    justification,
  });
  return getLearnerOrientation(input.userId);
}

export async function respondToOrientationProposal(input: { userId: number; proposalId: number; accept: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [proposal] = await db.select().from(learnerOrientationProposals)
    .where(and(eq(learnerOrientationProposals.id, input.proposalId), eq(learnerOrientationProposals.userId, input.userId), eq(learnerOrientationProposals.status, "pending"))).limit(1);
  if (!proposal) throw new Error("Proposition introuvable ou déjà traitée");
  if (input.accept) {
    await saveLearnerOrientationGoals({
      userId: input.userId,
      goals: parseGoals(proposal.goals),
      wantsOfficialCertification: proposal.wantsOfficialCertification === 1,
      officialCertificationIds: parseStringList(proposal.officialCertificationIds),
      certificationTargetDates: proposal.certificationTargetDates,
    });
  }
  await db.update(learnerOrientationProposals).set({ status: input.accept ? "accepted" : "declined", respondedAt: new Date() }).where(eq(learnerOrientationProposals.id, proposal.id));
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
