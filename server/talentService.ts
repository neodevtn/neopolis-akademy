import { and, asc, count, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { getDb, getLearnerProgress } from "./db";
import trainingIndex from "../client/src/data/trainingIndex.json";
import {
  applications,
  talentAssignments,
  talentEvaluations,
  talentEvents,
  talentProfiles,
  talentStageHistory,
  talentStages,
  talentTasks,
  users,
} from "../drizzle/schema";

export const DEFAULT_TALENT_STAGES = [
  { key: "candidate", label: { fr: "Candidature", en: "Candidate", ar: "مرشح" }, description: { fr: "Candidature reçue ou en cours d’évaluation.", en: "Application received or under review.", ar: "تم استلام الطلب أو هو قيد التقييم." }, color: "#64748b", icon: "file-user", sortOrder: 10 },
  { key: "onboarding", label: { fr: "Intégration", en: "Onboarding", ar: "الإدماج" }, description: { fr: "Compte activé et intégration au réseau en cours.", en: "Account activated and onboarding in progress.", ar: "تم تفعيل الحساب والإدماج جارٍ." }, color: "#0ea5e9", icon: "user-check", sortOrder: 20 },
  { key: "learning", label: { fr: "Formation", en: "Learning", ar: "التكوين" }, description: { fr: "Développement des compétences et préparation aux évaluations.", en: "Skills development and assessment preparation.", ar: "تطوير المهارات والاستعداد للتقييم." }, color: "#2563eb", icon: "graduation-cap", sortOrder: 30 },
  { key: "assessment", label: { fr: "Évaluation", en: "Assessment", ar: "التقييم" }, description: { fr: "Entretien, test ou certification en cours.", en: "Interview, test or certification in progress.", ar: "مقابلة أو اختبار أو شهادة قيد الإنجاز." }, color: "#7c3aed", icon: "clipboard-check", sortOrder: 40 },
  { key: "talent_pool", label: { fr: "Vivier", en: "Talent pool", ar: "مجموعة المواهب" }, description: { fr: "Profil qualifié et disponible pour une opportunité.", en: "Qualified profile available for an opportunity.", ar: "ملف مؤهل ومتاح لفرصة." }, color: "#0891b2", icon: "users-round", sortOrder: 50 },
  { key: "engaged", label: { fr: "Engagé", en: "Engaged", ar: "منخرط" }, description: { fr: "Mission, groupe de travail, recrutement ou rôle d’ambassadeur actif.", en: "Active assignment, workgroup, recruitment or ambassador role.", ar: "مهمة أو مجموعة عمل أو توظيف أو دور سفير نشط." }, color: "#059669", icon: "briefcase-business", sortOrder: 60 },
  { key: "alumni", label: { fr: "Alumni", en: "Alumni", ar: "الخريجون" }, description: { fr: "Membre historique du réseau à maintenir dans le suivi.", en: "Former network member retained for follow-up.", ar: "عضو سابق في الشبكة تتم متابعة مساره." }, color: "#b45309", icon: "badge-check", sortOrder: 70 },
  { key: "inactive", label: { fr: "Inactif", en: "Inactive", ar: "غير نشط" }, description: { fr: "Suivi suspendu sans suppression de l’historique.", en: "Follow-up paused without deleting history.", ar: "تم تعليق المتابعة دون حذف السجل." }, color: "#475569", icon: "circle-pause", sortOrder: 80 },
] as const;

const certificationTitles = new Map(
  trainingIndex.certifications.map((certification) => [
    certification.id,
    certification.title.fr || certification.title.en || certification.id,
  ]),
);

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

async function database(): Promise<Db> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export async function ensureTalentStages(dbArg?: Db) {
  const db = dbArg || await database();
  const existing = await db.select({ key: talentStages.key }).from(talentStages);
  const keys = new Set(existing.map((stage) => stage.key));
  const missing = DEFAULT_TALENT_STAGES.filter((stage) => !keys.has(stage.key));
  if (missing.length) {
    await db.insert(talentStages).values(missing.map((stage) => ({ ...stage, label: stage.label, description: stage.description, isSystem: 1, active: 1 })));
  }
  return db.select().from(talentStages).orderBy(asc(talentStages.sortOrder), asc(talentStages.id));
}

export async function saveTalentStage(input: {
  id?: number;
  key: string;
  label: { fr: string; en?: string; ar?: string };
  description?: { fr?: string; en?: string; ar?: string };
  color: string;
  icon?: string;
  sortOrder: number;
  active: boolean;
}, actorId: number) {
  const db = await database();
  const normalizedKey = input.key.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
  const values = {
    key: normalizedKey,
    label: {
      fr: input.label.fr.trim(),
      en: input.label.en?.trim() || input.label.fr.trim(),
      ar: input.label.ar?.trim() || input.label.fr.trim(),
    },
    description: input.description || null,
    color: input.color,
    icon: input.icon?.trim() || "user-round-search",
    sortOrder: input.sortOrder,
    active: input.active ? 1 : 0,
    createdBy: actorId,
  };
  if (input.id) {
    const [existing] = await db.select().from(talentStages).where(eq(talentStages.id, input.id)).limit(1);
    if (!existing) throw new Error("Talent stage not found");
    await db.update(talentStages).set({ ...values, key: existing.isSystem ? existing.key : normalizedKey }).where(eq(talentStages.id, input.id));
    return (await db.select().from(talentStages).where(eq(talentStages.id, input.id)).limit(1))[0];
  }
  const [result] = await db.insert(talentStages).values({ ...values, isSystem: 0 }).$returningId();
  return (await db.select().from(talentStages).where(eq(talentStages.id, result.id)).limit(1))[0];
}

async function findApplicationId(db: Db, email: string | null) {
  if (!email) return null;
  const [application] = await db.select({ id: applications.id }).from(applications).where(eq(applications.email, email)).orderBy(desc(applications.updatedAt)).limit(1);
  return application?.id ?? null;
}

export async function ensureTalentProfile(userId: number, actorId?: number) {
  const db = await database();
  const stages = await ensureTalentStages(db);
  const [existing] = await db.select().from(talentProfiles).where(eq(talentProfiles.userId, userId)).limit(1);
  if (existing) return existing;
  const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("Talent user not found");
  const learningStage = stages.find((stage) => stage.key === "learning") || stages[0];
  const sourceApplicationId = await findApplicationId(db, user.email);
  await db.insert(talentProfiles).values({ userId, stageId: learningStage?.id ?? null, sourceApplicationId, ownerId: actorId ?? null }).onDuplicateKeyUpdate({ set: { userId } });
  const [profile] = await db.select().from(talentProfiles).where(eq(talentProfiles.userId, userId)).limit(1);
  if (!profile) throw new Error("Talent profile could not be created");
  const [history] = await db.select({ id: talentStageHistory.id }).from(talentStageHistory).where(eq(talentStageHistory.profileId, profile.id)).limit(1);
  if (!history && profile.stageId && actorId) {
    await db.insert(talentStageHistory).values({ profileId: profile.id, userId, toStageId: profile.stageId, reason: "Initialisation du dossier membre", changedBy: actorId });
  }
  return profile;
}

async function backfillTalentProfiles(db: Db, actorId: number) {
  const stages = await ensureTalentStages(db);
  const defaultStage = stages.find((stage) => stage.key === "learning") || stages[0];
  const missing = await db.select({ id: users.id, email: users.email }).from(users)
    .leftJoin(talentProfiles, eq(talentProfiles.userId, users.id))
    .where(and(inArray(users.role, ["user", "admin_learner"]), sql`${talentProfiles.id} is null`));
  if (!missing.length) return;
  const emails = missing.map((user) => user.email).filter((email): email is string => Boolean(email));
  const applicationRows = emails.length
    ? await db.select({ id: applications.id, email: applications.email }).from(applications).where(inArray(applications.email, emails))
    : [];
  const applicationByEmail = new Map(applicationRows.map((application) => [application.email, application.id]));
  await db.insert(talentProfiles).values(missing.map((user) => ({
    userId: user.id,
    stageId: defaultStage?.id ?? null,
    sourceApplicationId: user.email ? applicationByEmail.get(user.email) ?? null : null,
    ownerId: actorId,
  })));
}

export async function listTalentPortfolio(input: { page: number; pageSize: number; search?: string; stageId?: number; priority?: "low" | "normal" | "high" | "urgent" }, actorId: number) {
  const db = await database();
  await backfillTalentProfiles(db, actorId);
  const conditions = [eq(talentProfiles.active, 1)];
  if (input.stageId) conditions.push(eq(talentProfiles.stageId, input.stageId));
  if (input.priority) conditions.push(eq(talentProfiles.priority, input.priority));
  if (input.search?.trim()) {
    const pattern = `%${input.search.trim()}%`;
    conditions.push(or(like(users.name, pattern), like(users.email, pattern), like(talentProfiles.headline, pattern))!);
  }
  const where = and(...conditions);
  const [{ total = 0 } = { total: 0 }] = await db.select({ total: count() }).from(talentProfiles).innerJoin(users, eq(users.id, talentProfiles.userId)).where(where);
  const rows = await db.select({
    profile: talentProfiles,
    user: { id: users.id, name: users.name, email: users.email, role: users.role, blocked: users.blocked, lastSignedIn: users.lastSignedIn, createdAt: users.createdAt },
    stage: talentStages,
  }).from(talentProfiles)
    .innerJoin(users, eq(users.id, talentProfiles.userId))
    .leftJoin(talentStages, eq(talentStages.id, talentProfiles.stageId))
    .where(where)
    .orderBy(desc(talentProfiles.updatedAt), asc(users.name))
    .limit(input.pageSize)
    .offset((input.page - 1) * input.pageSize);
  const userIds = rows.map((row) => row.user.id);
  const [events, assignments, tasks] = userIds.length ? await Promise.all([
    db.select({ userId: talentEvents.userId, status: talentEvents.status, responseStatus: talentEvents.responseStatus, startsAt: talentEvents.startsAt }).from(talentEvents).where(inArray(talentEvents.userId, userIds)),
    db.select({ userId: talentAssignments.userId, status: talentAssignments.status, kind: talentAssignments.kind }).from(talentAssignments).where(inArray(talentAssignments.userId, userIds)),
    db.select({ userId: talentTasks.userId, status: talentTasks.status, dueAt: talentTasks.dueAt }).from(talentTasks).where(inArray(talentTasks.userId, userIds)),
  ]) : [[], [], []];
  const now = Date.now();
  return {
    total: Number(total),
    page: input.page,
    pageSize: input.pageSize,
    members: rows.map((row) => ({
      ...row,
      indicators: {
        pendingEvents: events.filter((event) => event.userId === row.user.id && ["requested", "scheduled"].includes(event.status)).length,
        awaitingResponse: events.filter((event) => event.userId === row.user.id && event.responseStatus === "pending").length,
        activeAssignments: assignments.filter((assignment) => assignment.userId === row.user.id && assignment.status === "active").length,
        openTasks: tasks.filter((task) => task.userId === row.user.id && ["open", "in_progress"].includes(task.status)).length,
        overdueTasks: tasks.filter((task) => task.userId === row.user.id && ["open", "in_progress"].includes(task.status) && task.dueAt && task.dueAt.getTime() < now).length,
      },
    })),
  };
}

export async function getTalentOverview(actorId: number) {
  const db = await database();
  await backfillTalentProfiles(db, actorId);
  const [profiles, events, assignments, tasks] = await Promise.all([
    db.select({ stageId: talentProfiles.stageId, priority: talentProfiles.priority }).from(talentProfiles).where(eq(talentProfiles.active, 1)),
    db.select({ status: talentEvents.status, responseStatus: talentEvents.responseStatus, startsAt: talentEvents.startsAt }).from(talentEvents),
    db.select({ status: talentAssignments.status, kind: talentAssignments.kind }).from(talentAssignments),
    db.select({ status: talentTasks.status, dueAt: talentTasks.dueAt }).from(talentTasks),
  ]);
  const now = Date.now();
  const nextSevenDays = now + 7 * 24 * 60 * 60 * 1000;
  return {
    members: profiles.length,
    highPriority: profiles.filter((profile) => ["high", "urgent"].includes(profile.priority)).length,
    upcomingEvents: events.filter((event) => event.startsAt && event.startsAt.getTime() >= now && event.startsAt.getTime() <= nextSevenDays && !["cancelled", "completed"].includes(event.status)).length,
    awaitingResponse: events.filter((event) => event.responseStatus === "pending" && !["cancelled", "completed"].includes(event.status)).length,
    activeAssignments: assignments.filter((assignment) => assignment.status === "active").length,
    ambassadors: assignments.filter((assignment) => assignment.kind === "ambassador" && assignment.status === "active").length,
    overdueTasks: tasks.filter((task) => task.dueAt && task.dueAt.getTime() < now && ["open", "in_progress"].includes(task.status)).length,
  };
}

export async function getTalentProfileDetail(userId: number, actorId: number) {
  const db = await database();
  const profile = await ensureTalentProfile(userId, actorId);
  const [user] = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, blocked: users.blocked, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("Talent user not found");
  const [stage] = profile.stageId ? await db.select().from(talentStages).where(eq(talentStages.id, profile.stageId)).limit(1) : [];
  const [application] = profile.sourceApplicationId ? await db.select({ id: applications.id, currentRole: applications.currentRole, sector: applications.sector, country: applications.country, city: applications.city, scoreTotal: applications.scoreTotal, status: applications.status, createdAt: applications.createdAt }).from(applications).where(eq(applications.id, profile.sourceApplicationId)).limit(1) : [];
  const [history, events, evaluations, assignments, tasks, learning] = await Promise.all([
    db.select({ history: talentStageHistory, fromStage: { id: talentStages.id, label: talentStages.label } }).from(talentStageHistory).leftJoin(talentStages, eq(talentStages.id, talentStageHistory.fromStageId)).where(eq(talentStageHistory.userId, userId)).orderBy(desc(talentStageHistory.createdAt)),
    db.select().from(talentEvents).where(eq(talentEvents.userId, userId)).orderBy(desc(talentEvents.startsAt), desc(talentEvents.createdAt)),
    db.select().from(talentEvaluations).where(eq(talentEvaluations.userId, userId)).orderBy(desc(talentEvaluations.createdAt)),
    db.select().from(talentAssignments).where(eq(talentAssignments.userId, userId)).orderBy(desc(talentAssignments.createdAt)),
    db.select().from(talentTasks).where(eq(talentTasks.userId, userId)).orderBy(asc(talentTasks.status), asc(talentTasks.dueAt), desc(talentTasks.createdAt)),
    getLearnerProgress(userId),
  ]);
  const stages = await ensureTalentStages(db);
  return {
    profile,
    user,
    stage: stage || null,
    application: application || null,
    stages,
    history,
    events,
    evaluations,
    assignments,
    tasks,
    learning: {
      metrics: learning.metrics,
      certificationProgress: learning.certificationProgress.map((item) => ({
        ...item,
        title: certificationTitles.get(item.certificationId) || item.certificationId,
      })),
      groups: learning.groups,
      milestones: learning.milestones,
      competencies: learning.competencies,
    },
  };
}

export async function updateTalentProfile(input: { userId: number; priority: "low" | "normal" | "high" | "urgent"; availability: "unknown" | "available" | "busy" | "unavailable"; headline?: string; summary?: string; ownerId?: number | null; nextReviewAt?: Date | null }, actorId: number) {
  const db = await database();
  await ensureTalentProfile(input.userId, actorId);
  await db.update(talentProfiles).set({ priority: input.priority, availability: input.availability, headline: input.headline?.trim() || null, summary: input.summary?.trim() || null, ownerId: input.ownerId ?? actorId, nextReviewAt: input.nextReviewAt ?? null }).where(eq(talentProfiles.userId, input.userId));
  return getTalentProfileDetail(input.userId, actorId);
}

export async function changeTalentStage(input: { userId: number; stageId: number; reason?: string }, actorId: number) {
  const db = await database();
  return db.transaction(async (tx) => {
    const profile = await ensureTalentProfile(input.userId, actorId);
    const [stage] = await tx.select().from(talentStages).where(and(eq(talentStages.id, input.stageId), eq(talentStages.active, 1))).limit(1);
    if (!stage) throw new Error("Talent stage not found");
    if (profile.stageId === input.stageId) return profile;
    await tx.update(talentProfiles).set({ stageId: input.stageId }).where(eq(talentProfiles.id, profile.id));
    await tx.insert(talentStageHistory).values({ profileId: profile.id, userId: input.userId, fromStageId: profile.stageId, toStageId: input.stageId, reason: input.reason?.trim() || null, changedBy: actorId });
    return { ...profile, stageId: input.stageId };
  });
}

export type CreateTalentEventInput = {
  userId: number;
  type: "interview" | "evaluation" | "certification_test" | "certification_review" | "onboarding" | "follow_up" | "other";
  title: string;
  description?: string;
  modality: "video" | "in_person" | "phone" | "platform" | "external" | "other";
  startsAt?: Date | null;
  endsAt?: Date | null;
  timezone?: string;
  location?: string;
  meetingUrl?: string;
  certificationId?: string;
  learnerInstructions?: string;
  privateNotes?: string;
  visibleToLearner: boolean;
};

export async function createTalentEvent(input: CreateTalentEventInput, actorId: number) {
  const db = await database();
  const profile = await ensureTalentProfile(input.userId, actorId);
  const [result] = await db.insert(talentEvents).values({ ...input, profileId: profile.id, createdBy: actorId, updatedBy: actorId, visibleToLearner: input.visibleToLearner ? 1 : 0, timezone: input.timezone || "UTC", startsAt: input.startsAt ?? null, endsAt: input.endsAt ?? null, description: input.description?.trim() || null, location: input.location?.trim() || null, meetingUrl: input.meetingUrl?.trim() || null, certificationId: input.certificationId?.trim() || null, learnerInstructions: input.learnerInstructions?.trim() || null, privateNotes: input.privateNotes?.trim() || null }).$returningId();
  const [event] = await db.select().from(talentEvents).where(eq(talentEvents.id, result.id)).limit(1);
  return event;
}

export async function updateTalentEventStatus(input: { eventId: number; status: "requested" | "scheduled" | "completed" | "cancelled" | "missed" }, actorId: number) {
  const db = await database();
  await db.update(talentEvents).set({ status: input.status, updatedBy: actorId }).where(eq(talentEvents.id, input.eventId));
  const [event] = await db.select().from(talentEvents).where(eq(talentEvents.id, input.eventId)).limit(1);
  return event || null;
}

export async function markTalentEventNotification(eventId: number, status: "sent" | "failed", error?: string) {
  const db = await database();
  await db.update(talentEvents).set({ notificationStatus: status, notifiedAt: status === "sent" ? new Date() : null, lastNotificationError: error?.slice(0, 500) || null }).where(eq(talentEvents.id, eventId));
}

export async function createTalentAssignment(input: { userId: number; kind: "workgroup" | "mission" | "opportunity" | "recruitment" | "ambassador" | "partnership"; title: string; description?: string; status: "proposed" | "active" | "paused" | "completed" | "declined" | "withdrawn"; startsAt?: Date | null; endsAt?: Date | null; visibleToLearner: boolean; metadata?: Record<string, unknown> }, actorId: number) {
  const db = await database();
  const profile = await ensureTalentProfile(input.userId, actorId);
  const [result] = await db.insert(talentAssignments).values({ ...input, profileId: profile.id, description: input.description?.trim() || null, visibleToLearner: input.visibleToLearner ? 1 : 0, startsAt: input.startsAt ?? null, endsAt: input.endsAt ?? null, assignedBy: actorId, metadata: input.metadata || null }).$returningId();
  return (await db.select().from(talentAssignments).where(eq(talentAssignments.id, result.id)).limit(1))[0];
}

export async function updateTalentAssignmentStatus(input: { assignmentId: number; status: "proposed" | "active" | "paused" | "completed" | "declined" | "withdrawn" }) {
  const db = await database();
  await db.update(talentAssignments).set({ status: input.status }).where(eq(talentAssignments.id, input.assignmentId));
  return (await db.select().from(talentAssignments).where(eq(talentAssignments.id, input.assignmentId)).limit(1))[0] || null;
}

export async function createTalentTask(input: { userId: number; title: string; description?: string; priority: "low" | "normal" | "high" | "urgent"; dueAt?: Date | null; ownerId?: number | null }, actorId: number) {
  const db = await database();
  const profile = await ensureTalentProfile(input.userId, actorId);
  const [result] = await db.insert(talentTasks).values({ ...input, profileId: profile.id, description: input.description?.trim() || null, dueAt: input.dueAt ?? null, ownerId: input.ownerId ?? actorId, createdBy: actorId }).$returningId();
  return (await db.select().from(talentTasks).where(eq(talentTasks.id, result.id)).limit(1))[0];
}

export async function updateTalentTaskStatus(input: { taskId: number; status: "open" | "in_progress" | "completed" | "cancelled" }) {
  const db = await database();
  await db.update(talentTasks).set({ status: input.status, completedAt: input.status === "completed" ? new Date() : null }).where(eq(talentTasks.id, input.taskId));
  return (await db.select().from(talentTasks).where(eq(talentTasks.id, input.taskId)).limit(1))[0] || null;
}

export async function createTalentEvaluation(input: { userId: number; eventId?: number | null; evaluationType: string; score?: number | null; maxScore?: number | null; recommendation: "continue" | "develop" | "certify" | "assign" | "recruit" | "ambassador" | "hold" | "decline"; rubric?: unknown; strengths?: string; improvements?: string; learnerFeedback?: string; privateNotes?: string; visibleToLearner: boolean }, actorId: number) {
  const db = await database();
  const profile = await ensureTalentProfile(input.userId, actorId);
  const [result] = await db.insert(talentEvaluations).values({ ...input, profileId: profile.id, eventId: input.eventId ?? null, score: input.score === null || input.score === undefined ? null : input.score.toFixed(2), maxScore: input.maxScore === null || input.maxScore === undefined ? null : input.maxScore.toFixed(2), rubric: input.rubric || null, strengths: input.strengths?.trim() || null, improvements: input.improvements?.trim() || null, learnerFeedback: input.learnerFeedback?.trim() || null, privateNotes: input.privateNotes?.trim() || null, visibleToLearner: input.visibleToLearner ? 1 : 0, createdBy: actorId }).$returningId();
  return (await db.select().from(talentEvaluations).where(eq(talentEvaluations.id, result.id)).limit(1))[0];
}

export async function getMyTalentJourney(userId: number) {
  const db = await database();
  const [profile] = await db.select().from(talentProfiles).where(and(eq(talentProfiles.userId, userId), eq(talentProfiles.active, 1))).limit(1);
  if (!profile) return { profile: null, stage: null, events: [], assignments: [], evaluations: [] };
  const [stage] = profile.stageId ? await db.select().from(talentStages).where(eq(talentStages.id, profile.stageId)).limit(1) : [];
  const [events, assignments, evaluations] = await Promise.all([
    db.select({ id: talentEvents.id, type: talentEvents.type, title: talentEvents.title, description: talentEvents.description, modality: talentEvents.modality, status: talentEvents.status, responseStatus: talentEvents.responseStatus, startsAt: talentEvents.startsAt, endsAt: talentEvents.endsAt, timezone: talentEvents.timezone, location: talentEvents.location, meetingUrl: talentEvents.meetingUrl, certificationId: talentEvents.certificationId, learnerInstructions: talentEvents.learnerInstructions, learnerResponseNote: talentEvents.learnerResponseNote, respondedAt: talentEvents.respondedAt }).from(talentEvents).where(and(eq(talentEvents.userId, userId), eq(talentEvents.visibleToLearner, 1))).orderBy(desc(talentEvents.startsAt), desc(talentEvents.createdAt)),
    db.select({ id: talentAssignments.id, kind: talentAssignments.kind, title: talentAssignments.title, description: talentAssignments.description, status: talentAssignments.status, startsAt: talentAssignments.startsAt, endsAt: talentAssignments.endsAt }).from(talentAssignments).where(and(eq(talentAssignments.userId, userId), eq(talentAssignments.visibleToLearner, 1))).orderBy(desc(talentAssignments.createdAt)),
    db.select({ id: talentEvaluations.id, evaluationType: talentEvaluations.evaluationType, score: talentEvaluations.score, maxScore: talentEvaluations.maxScore, recommendation: talentEvaluations.recommendation, strengths: talentEvaluations.strengths, improvements: talentEvaluations.improvements, learnerFeedback: talentEvaluations.learnerFeedback, createdAt: talentEvaluations.createdAt }).from(talentEvaluations).where(and(eq(talentEvaluations.userId, userId), eq(talentEvaluations.visibleToLearner, 1))).orderBy(desc(talentEvaluations.createdAt)),
  ]);
  return { profile: { priority: profile.priority, availability: profile.availability, headline: profile.headline }, stage: stage ? { id: stage.id, key: stage.key, label: stage.label, description: stage.description, color: stage.color } : null, events, assignments, evaluations };
}

export async function respondToTalentEvent(input: { eventId: number; responseStatus: "accepted" | "declined" | "reschedule_requested"; note?: string }, userId: number) {
  const db = await database();
  const [event] = await db.select().from(talentEvents).where(and(eq(talentEvents.id, input.eventId), eq(talentEvents.userId, userId), eq(talentEvents.visibleToLearner, 1))).limit(1);
  if (!event) throw new Error("Talent event not found");
  if (["completed", "cancelled", "missed"].includes(event.status)) throw new Error("Talent event is no longer actionable");
  await db.update(talentEvents).set({ responseStatus: input.responseStatus, learnerResponseNote: input.note?.trim() || null, respondedAt: new Date(), status: input.responseStatus === "accepted" ? "scheduled" : event.status }).where(eq(talentEvents.id, event.id));
  return (await db.select().from(talentEvents).where(eq(talentEvents.id, event.id)).limit(1))[0];
}
