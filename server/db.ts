import { eq, desc, asc, sql, and, or, like, count, gt, isNull, isNotNull, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { customAlphabet } from "nanoid";
import { InsertUser, users, applications, InsertApplication, Application, trainingProgress, examAttempts, examSessions, InsertTrainingProgress, InsertExamAttempt, InsertExamSession, videoProgress, InsertVideoProgress, chapterProgress, userInvitations, videoFeedback, InsertVideoFeedback, passwordResetTokens, emailEvents, exerciseResults, learningEvents, learnerAchievements, learnerCompetencyContributions, InsertLearnerAchievement, courseFeedback, learnerActivityLog, learnerGroups, learnerGroupMemberships, learnerGroupCourses, courseLifecycleStates, invitationGroups, referralCampaigns, referralCodes, referralConversions } from "../drizzle/schema";
import { ENV } from './_core/env';
import { engagementBucket, firstAttemptRate, isPedagogicalReportingEvent } from "./reportingMetrics";
import { learnerReportingLabel } from "@shared/learnerReportingLabel";
import { normalizeCourseFeedbackComment, normalizeCourseRating } from "../shared/courseFeedback";
import { normalizeReferralCode } from "../shared/referral";
import { canLearnerOpenLifecycle, type CourseLifecycleStatus } from "../shared/courseLifecycle";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/** Active administrator inboxes used for internal notifications sent from Neopolis. */
export async function getAdminEmailRecipients(): Promise<string[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const admins = await db.select({ email: users.email, blocked: users.blocked }).from(users).where(eq(users.role, "admin"));
  return Array.from(new Set(admins
    .filter((admin) => admin.blocked === 0 && typeof admin.email === "string" && admin.email.trim())
    .map((admin) => admin.email!.trim().toLowerCase())));
}

// ============ Referral programme ============

const referralCodeSuffix = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);
const DEFAULT_REFERRAL_CAMPAIGN = {
  name: "Parrainage Neopolis",
  tokenRewardLabel: "Tokens gratuits",
  giftRewardLabel: "Cadeaux Neopolis",
  eligibilityText: "La récompense est soumise à la validation de la candidature par Neopolis Akademy et aux règles du programme en vigueur.",
  shareMessage: "Je développe mes compétences IA avec Neopolis Akademy. Rejoignez-moi avec ce lien de parrainage !",
};

export async function getReferralCampaign() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [campaign] = await db.select().from(referralCampaigns).orderBy(desc(referralCampaigns.id)).limit(1);
  if (campaign) return campaign;

  try {
    const result = await db.insert(referralCampaigns).values(DEFAULT_REFERRAL_CAMPAIGN);
    const [created] = await db.select().from(referralCampaigns).where(eq(referralCampaigns.id, Number(result[0].insertId))).limit(1);
    return created;
  } catch {
    const [concurrentCampaign] = await db.select().from(referralCampaigns).orderBy(desc(referralCampaigns.id)).limit(1);
    if (concurrentCampaign) return concurrentCampaign;
    throw new Error("Unable to create referral campaign");
  }
}

async function getOrCreateReferralCode(userId: number, campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [existing] = await db.select().from(referralCodes)
    .where(and(eq(referralCodes.userId, userId), eq(referralCodes.campaignId, campaignId))).limit(1);
  if (existing) return existing;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const code = `NEO-${referralCodeSuffix()}`;
      const result = await db.insert(referralCodes).values({ userId, campaignId, code });
      const [created] = await db.select().from(referralCodes).where(eq(referralCodes.id, Number(result[0].insertId))).limit(1);
      return created;
    } catch {
      const [concurrent] = await db.select().from(referralCodes)
        .where(and(eq(referralCodes.userId, userId), eq(referralCodes.campaignId, campaignId))).limit(1);
      if (concurrent) return concurrent;
    }
  }
  throw new Error("Unable to create referral code");
}

export async function getReferralProgramForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const campaign = await getReferralCampaign();
  const conversions = await db.select({ id: referralConversions.id, status: referralConversions.status, createdAt: referralConversions.createdAt })
    .from(referralConversions).where(eq(referralConversions.referrerUserId, userId)).orderBy(desc(referralConversions.createdAt));
  const counts = conversions.reduce<Record<string, number>>((acc, conversion) => {
    acc[conversion.status] = (acc[conversion.status] || 0) + 1;
    return acc;
  }, { pending: 0, eligible: 0, rewarded: 0, rejected: 0 });
  if (campaign.active !== 1) return { campaign, code: null, counts, conversions };
  const code = await getOrCreateReferralCode(userId, campaign.id);
  return { campaign, code, counts, conversions };
}

export async function resolveReferralCode(rawCode?: string | null) {
  const code = normalizeReferralCode(rawCode);
  if (!code) return null;
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [referralCode] = await db.select().from(referralCodes)
    .where(and(eq(referralCodes.code, code), eq(referralCodes.active, 1))).limit(1);
  if (!referralCode) return null;
  const [campaign] = await db.select().from(referralCampaigns)
    .where(and(eq(referralCampaigns.id, referralCode.campaignId), eq(referralCampaigns.active, 1))).limit(1);
  if (!campaign) return null;
  return { referralCode, campaign };
}

export async function recordReferralConversion(input: { applicationId: number; referredEmail: string; referralCode?: string | null; sourceChannel?: string | null; shareTarget?: string | null }) {
  const resolved = await resolveReferralCode(input.referralCode);
  if (!resolved) return null;
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [referrer] = await db.select({ email: users.email }).from(users).where(eq(users.id, resolved.referralCode.userId)).limit(1);
  if (referrer?.email?.trim().toLowerCase() === input.referredEmail.trim().toLowerCase()) return null;

  await db.update(applications).set({
    referralCode: resolved.referralCode.code,
    referrerUserId: resolved.referralCode.userId,
    referralSource: input.sourceChannel || null,
  }).where(eq(applications.id, input.applicationId));
  try {
    await db.insert(referralConversions).values({
      campaignId: resolved.campaign.id,
      referralCodeId: resolved.referralCode.id,
      referrerUserId: resolved.referralCode.userId,
      applicationId: input.applicationId,
      referredEmail: input.referredEmail.trim().toLowerCase(),
      sourceChannel: input.sourceChannel || null,
      shareTarget: input.shareTarget || null,
    });
  } catch {
    // The unique application constraint makes repeat public submissions idempotent.
  }
  return resolved;
}

export async function getReferralAdminOverview() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const campaign = await getReferralCampaign();
  const conversions = await db.select({
    id: referralConversions.id, status: referralConversions.status, referredEmail: referralConversions.referredEmail,
    sourceChannel: referralConversions.sourceChannel, shareTarget: referralConversions.shareTarget,
    rewardNote: referralConversions.rewardNote, createdAt: referralConversions.createdAt,
    applicationId: referralConversions.applicationId, referrerName: users.name, referrerEmail: users.email,
  }).from(referralConversions).leftJoin(users, eq(referralConversions.referrerUserId, users.id))
    .where(eq(referralConversions.campaignId, campaign.id)).orderBy(desc(referralConversions.createdAt));
  const counts = conversions.reduce<Record<string, number>>((acc, conversion) => {
    acc[conversion.status] = (acc[conversion.status] || 0) + 1;
    return acc;
  }, { pending: 0, eligible: 0, rewarded: 0, rejected: 0 });
  return { campaign, conversions, counts };
}

export async function updateReferralCampaign(input: { id: number; active: number; tokenRewardLabel: string; giftRewardLabel: string; eligibilityText?: string | null; shareMessage?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(referralCampaigns).set({
    active: input.active, tokenRewardLabel: input.tokenRewardLabel, giftRewardLabel: input.giftRewardLabel,
    eligibilityText: input.eligibilityText || null, shareMessage: input.shareMessage || null,
  }).where(eq(referralCampaigns.id, input.id));
}

export async function updateReferralConversionStatus(input: { id: number; status: "pending" | "eligible" | "rewarded" | "rejected"; rewardNote?: string | null; reviewedBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(referralConversions).set({
    status: input.status, rewardNote: input.rewardNote || null, reviewedBy: input.reviewedBy, reviewedAt: new Date(),
  }).where(eq(referralConversions.id, input.id));
}

// ============ Applications ============

export async function createApplication(data: InsertApplication): Promise<Application> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(applications).values(data);
  const insertId = result[0].insertId;
  
  const [app] = await db.select().from(applications).where(eq(applications.id, insertId)).limit(1);
  return app;
}

export async function getApplications(filters?: { status?: string; country?: string; sector?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(applications.status, filters.status as any));
  }
  if (filters?.country) {
    conditions.push(eq(applications.country, filters.country));
  }
  if (filters?.sector) {
    conditions.push(eq(applications.sector, filters.sector));
  }
  
  if (conditions.length > 0) {
    return await db.select().from(applications).where(sql`${sql.join(conditions, sql` AND `)}` as any).orderBy(desc(applications.createdAt));
  }
  
  return await db.select().from(applications).orderBy(desc(applications.createdAt));
}

export async function getApplicationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [app] = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  return app;
}

export async function updateApplicationStatus(id: number, status: "en_attente" | "selectionne" | "refuse") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(applications).set({ status }).where(eq(applications.id, id));
  return await getApplicationById(id);
}

export async function getApplicationStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Optimized: single SQL aggregate query instead of loading all rows into JS
  const result = await db.select({
    status: applications.status,
    count: count(),
    avgScore: sql<string>`AVG(${applications.scoreTotal})`,
  }).from(applications).groupBy(applications.status);
  
  let total = 0;
  let enAttente = 0;
  let selectionne = 0;
  let refuse = 0;
  let totalScoreSum = 0;
  let totalCount = 0;
  
  for (const row of result) {
    const c = Number(row.count);
    total += c;
    totalCount += c;
    const avg = parseFloat(row.avgScore || "0");
    totalScoreSum += avg * c;
    
    if (row.status === "en_attente") enAttente = c;
    else if (row.status === "selectionne") selectionne = c;
    else if (row.status === "refuse") refuse = c;
  }
  
  const avgScore = totalCount > 0 ? totalScoreSum / totalCount : 0;
  
  return { total, enAttente, selectionne, refuse, avgScore };
}

// ============ Training Progress ============

export async function getUserProgress(userId: number, certificationId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (certificationId) {
    return await db.select().from(trainingProgress)
      .where(and(eq(trainingProgress.userId, userId), eq(trainingProgress.certificationId, certificationId)));
  }
  return await db.select().from(trainingProgress).where(eq(trainingProgress.userId, userId));
}

export async function markLessonComplete(userId: number, certificationId: string, courseId: string, lessonIndex: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already completed (idempotent)
  const existing = await db.select().from(trainingProgress)
    .where(and(
      eq(trainingProgress.userId, userId),
      eq(trainingProgress.certificationId, certificationId),
      eq(trainingProgress.courseId, courseId),
      eq(trainingProgress.lessonIndex, lessonIndex)
    )).limit(1);
  
  if (existing.length > 0) return existing[0];
  
  const result = await db.insert(trainingProgress).values({
    userId,
    certificationId,
    courseId,
    lessonIndex,
  });
  
  return { id: result[0].insertId, userId, certificationId, courseId, lessonIndex, completedAt: new Date() };
}

export async function isCertificationComplete(userId: number, certificationId: string, totalLessonsPerCourse: Record<string, number>): Promise<boolean> {
  const progress = await getUserProgress(userId, certificationId);
  
  // Check each course has all its lessons completed
  for (const [courseId, totalLessons] of Object.entries(totalLessonsPerCourse)) {
    const completedLessons = progress.filter(p => p.courseId === courseId);
    if (completedLessons.length < totalLessons) return false;
  }
  return true;
}

// ============ Exam Attempts ============

export async function createExamAttempt(data: InsertExamAttempt) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(examAttempts).values(data);
  return { id: result[0].insertId, ...data };
}

export async function getExamAttempts(userId: number, certificationId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (certificationId) {
    return await db.select().from(examAttempts)
      .where(and(eq(examAttempts.userId, userId), eq(examAttempts.certificationId, certificationId)))
      .orderBy(desc(examAttempts.finishedAt));
  }
  return await db.select().from(examAttempts)
    .where(eq(examAttempts.userId, userId))
    .orderBy(desc(examAttempts.finishedAt));
}

export async function getExamSession(userId: number, certificationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const sessions = await db.select().from(examSessions)
    .where(and(eq(examSessions.userId, userId), eq(examSessions.certificationId, certificationId)))
    .limit(1);
  return sessions[0] ?? null;
}

export async function saveExamSession(data: InsertExamSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(examSessions)
    .where(and(eq(examSessions.userId, data.userId), eq(examSessions.certificationId, data.certificationId)));
  await db.insert(examSessions).values(data);
  return getExamSession(data.userId, data.certificationId);
}

export async function clearExamSession(userId: number, certificationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(examSessions)
    .where(and(eq(examSessions.userId, userId), eq(examSessions.certificationId, certificationId)));
}

// ============ Learner achievements ============

export async function issueAchievement(data: InsertLearnerAchievement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(learnerAchievements).where(and(
    eq(learnerAchievements.userId, data.userId),
    eq(learnerAchievements.kind, data.kind),
    eq(learnerAchievements.achievementKey, data.achievementKey),
  )).limit(1);
  if (existing[0]) return { achievement: existing[0], created: false };

  const result = await db.insert(learnerAchievements).values(data);
  const created = await db.select().from(learnerAchievements).where(eq(learnerAchievements.id, Number(result[0].insertId))).limit(1);
  return { achievement: created[0], created: true };
}

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(learnerAchievements).where(eq(learnerAchievements.userId, userId)).orderBy(desc(learnerAchievements.issuedAt));
}

export async function getAchievementById(userId: number, achievementId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(learnerAchievements).where(and(eq(learnerAchievements.userId, userId), eq(learnerAchievements.id, achievementId))).limit(1);
  return rows[0] || null;
}

export async function markAchievementEmailed(achievementId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(learnerAchievements).set({ emailedAt: new Date() }).where(eq(learnerAchievements.id, achievementId));
}

export async function getHistoricalAchievementCandidates() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [progress, passedAttempts, learners] = await Promise.all([
    db.select().from(trainingProgress),
    db.select().from(examAttempts).where(eq(examAttempts.passed, 1)),
    db.select().from(users).where(and(eq(users.role, "user"), eq(users.blocked, 0))),
  ]);
  return { progress, passedAttempts, learners };
}

// ============ Admin: All Learners ============

export async function getAllLearners(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  sortBy: "lastSignedIn" | "name" | "email" | "createdAt" | "globalScore" | "role" | "blocked" = "lastSignedIn",
  sortDirection: "asc" | "desc" = "desc",
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const offset = (page - 1) * pageSize;

  const globalScore = sql<number>`COALESCE(SUM(${learnerCompetencyContributions.points}), 0)`;

  // Le score global reflète uniquement les contributions pédagogiques vérifiées.
  let baseQuery = db.select({
    id: users.id,
    openId: users.openId,
    name: users.name,
    email: users.email,
    role: users.role,
    blocked: users.blocked,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
    globalScore,
  }).from(users)
    .leftJoin(
      learnerCompetencyContributions,
      eq(learnerCompetencyContributions.userId, users.id),
    )
    .groupBy(
      users.id,
      users.openId,
      users.name,
      users.email,
      users.role,
      users.blocked,
      users.createdAt,
      users.lastSignedIn,
    );

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    baseQuery = baseQuery.where(
      sql`(${users.name} LIKE ${searchTerm} OR ${users.email} LIKE ${searchTerm})`
    ) as any;
  }

  const sortableColumns = {
    lastSignedIn: users.lastSignedIn,
    name: users.name,
    email: users.email,
    createdAt: users.createdAt,
    globalScore,
    role: users.role,
    blocked: users.blocked,
  } as const;
  const orderBy = sortDirection === "asc" ? asc(sortableColumns[sortBy]) : desc(sortableColumns[sortBy]);
  const allUsers = await (baseQuery as any).orderBy(orderBy).limit(pageSize).offset(offset);

  // Get total count
  let countQuery = db.select({ total: count() }).from(users);
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    countQuery = countQuery.where(
      sql`(${users.name} LIKE ${searchTerm} OR ${users.email} LIKE ${searchTerm})`
    ) as any;
  }
  const [{ total }] = await countQuery;

  // Enrich with viaCandidature: check if user email matches a candidature application
  const emails = allUsers.map((u: any) => u.email).filter(Boolean);
  let candidatureEmails = new Set<string>();
  if (emails.length > 0) {
    const selectedApps = await db.select({ email: applications.email })
      .from(applications)
      .where(sql`${applications.email} IN (${sql.join(emails.map((e: string) => sql`${e}`), sql`, `)})`);
    candidatureEmails = new Set(selectedApps.map((a: any) => a.email));
  }

  const enriched = allUsers.map((u: any) => ({
    ...u,
    globalScore: Number(u.globalScore || 0),
    viaCandidature: candidatureEmails.has(u.email),
  }));

  return { users: enriched, total, page, pageSize, search: search?.trim() || "", sortBy, sortDirection };
}

export async function getLearnerProgress(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const progress = await db.select().from(trainingProgress).where(eq(trainingProgress.userId, userId));
  const attempts = await db.select().from(examAttempts).where(eq(examAttempts.userId, userId)).orderBy(desc(examAttempts.finishedAt));
  const chapterProg = await db.select().from(chapterProgress).where(eq(chapterProgress.userId, userId));
  const videoProg = await db.select().from(videoProgress).where(eq(videoProgress.userId, userId));
  const exercises = await db.select().from(exerciseResults).where(eq(exerciseResults.userId, String(userId))).orderBy(exerciseResults.createdAt);
  const events = await db.select().from(learningEvents).where(eq(learningEvents.userId, userId)).orderBy(desc(learningEvents.createdAt));
  const feedback = await db.select().from(courseFeedback).where(eq(courseFeedback.userId, userId)).orderBy(desc(courseFeedback.updatedAt));
  const activityLog = await db.select().from(learnerActivityLog).where(eq(learnerActivityLog.userId, userId)).orderBy(desc(learnerActivityLog.createdAt)).limit(100);
  const achievements = await db.select().from(learnerAchievements).where(eq(learnerAchievements.userId, userId)).orderBy(desc(learnerAchievements.issuedAt));
  const { getUserCompetencies } = await import("./competencyService");
  const competencies = await getUserCompetencies(userId);

  // Get user info for viaCandidature
  const [userRow] = await db.select({ email: users.email, name: users.name, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn, role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  let viaCandidature = false;
  if (userRow?.email) {
    const [app] = await db.select({ id: applications.id }).from(applications).where(eq(applications.email, userRow.email)).limit(1);
    viaCandidature = !!app;
  }

  return { progress, attempts, chapterProgress: chapterProg, videoProgress: videoProg, exerciseResults: exercises, learningEvents: events, courseFeedback: feedback, activityLog, achievements, competencies, viaCandidature, userInfo: userRow || null };
}

export async function getAllLearnersStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const totalUsers = await db.select({ total: count() }).from(users);
  const totalProgress = await db.select({ total: count() }).from(trainingProgress);
  const totalAttempts = await db.select({ total: count() }).from(examAttempts);
  const passedAttempts = await db.select({ total: count() }).from(examAttempts).where(eq(examAttempts.passed, 1));

  return {
    totalUsers: totalUsers[0].total,
    totalLessonsCompleted: totalProgress[0].total,
    totalExamAttempts: totalAttempts[0].total,
    totalExamsPassed: passedAttempts[0].total,
  };
}

// ============ Video Progress ============

export async function getVideoProgress(userId: number, courseId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (courseId) {
    return await db.select().from(videoProgress)
      .where(and(eq(videoProgress.userId, userId), eq(videoProgress.courseId, courseId)));
  }
  return await db.select().from(videoProgress)
    .where(eq(videoProgress.userId, userId));
}

export async function toggleVideoProgress(userId: number, courseId: string, youtubeId: string): Promise<{ watched: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already watched
  const existing = await db.select().from(videoProgress)
    .where(and(
      eq(videoProgress.userId, userId),
      eq(videoProgress.courseId, courseId),
      eq(videoProgress.youtubeId, youtubeId)
    ));

  if (existing.length > 0) {
    // Remove (unmark)
    await db.delete(videoProgress).where(
      and(
        eq(videoProgress.userId, userId),
        eq(videoProgress.courseId, courseId),
        eq(videoProgress.youtubeId, youtubeId)
      )
    );
    return { watched: false };
  } else {
    // Add (mark as watched)
    await db.insert(videoProgress).values({ userId, courseId, youtubeId });
    return { watched: true };
  }
}

// ============ Chapter Progress ============

export async function getChapterProgress(userId: number, courseId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (courseId) {
    return await db.select().from(chapterProgress)
      .where(and(eq(chapterProgress.userId, userId), eq(chapterProgress.courseId, courseId)));
  }
  return await db.select().from(chapterProgress).where(eq(chapterProgress.userId, userId));
}

export async function upsertChapterProgress(userId: number, courseId: string, lessonIndex: number, chapterIndex: number, totalChapters: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if entry exists
  const existing = await db.select().from(chapterProgress)
    .where(and(
      eq(chapterProgress.userId, userId),
      eq(chapterProgress.courseId, courseId),
      eq(chapterProgress.lessonIndex, lessonIndex)
    )).limit(1);

  if (existing.length > 0) {
    // Update only if advancing forward
    if (chapterIndex >= existing[0].chapterIndex) {
      await db.update(chapterProgress)
        .set({ chapterIndex, totalChapters })
        .where(eq(chapterProgress.id, existing[0].id));
    }
    return { ...existing[0], chapterIndex: Math.max(chapterIndex, existing[0].chapterIndex), totalChapters };
  } else {
    const result = await db.insert(chapterProgress).values({ userId, courseId, lessonIndex, chapterIndex, totalChapters });
    return { id: result[0].insertId, userId, courseId, lessonIndex, chapterIndex, totalChapters };
  }
}

// ============ Admin: User Management ============

export async function blockUser(userId: number, blocked: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ blocked: blocked ? 1 : 0 }).where(eq(users.id, userId));
  return { userId, blocked };
}

export async function updateUserRole(userId: number, role: "user" | "manager" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
  return { userId, role };
}

export async function listLearnerGroups() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const groups = await db.select().from(learnerGroups).orderBy(desc(learnerGroups.isSystem), asc(learnerGroups.name));
  const members = await db.select({ groupId: learnerGroupMemberships.groupId, total: count() }).from(learnerGroupMemberships).groupBy(learnerGroupMemberships.groupId);
  const courses = await db.select({ groupId: learnerGroupCourses.groupId, total: count() }).from(learnerGroupCourses).groupBy(learnerGroupCourses.groupId);
  return groups.map((group) => ({ ...group, memberCount: members.find((item) => item.groupId === group.id)?.total ?? 0, courseCount: courses.find((item) => item.groupId === group.id)?.total ?? 0 }));
}

export async function getLearnerGroupDetail(groupId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [group] = await db.select().from(learnerGroups).where(eq(learnerGroups.id, groupId)).limit(1);
  if (!group) return null;
  const members = await db.select({ userId: learnerGroupMemberships.userId }).from(learnerGroupMemberships).where(eq(learnerGroupMemberships.groupId, groupId));
  const courses = await db.select({ courseId: learnerGroupCourses.courseId, certificationId: learnerGroupCourses.certificationId }).from(learnerGroupCourses).where(eq(learnerGroupCourses.groupId, groupId));
  return { ...group, memberIds: members.map((member) => member.userId), courses };
}

export async function createLearnerGroup(input: { name: string; description?: string; color?: string; createdBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(learnerGroups).values({ name: input.name.trim(), description: input.description?.trim() || null, color: input.color || "#1d4ed8", createdBy: input.createdBy });
  return { id: result[0].insertId };
}

export async function replaceLearnerGroupMembers(groupId: number, userIds: number[], assignedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(learnerGroupMemberships).where(eq(learnerGroupMemberships.groupId, groupId));
  if (userIds.length) await db.insert(learnerGroupMemberships).values(userIds.map((userId) => ({ groupId, userId, assignedBy })));
}

export async function replaceLearnerGroupCourses(groupId: number, courses: { courseId: string; certificationId?: string }[], assignedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(learnerGroupCourses).where(eq(learnerGroupCourses.groupId, groupId));
  if (courses.length) await db.insert(learnerGroupCourses).values(courses.map((course) => ({ groupId, courseId: course.courseId, certificationId: course.certificationId || null, assignedBy })));
}

export async function userCanAccessCourse(userId: number, courseId: string) {
  const db = await getDb();
  if (!db) return false;
  const lifecycle = await getCourseLifecycleState(courseId);
  if (!canLearnerOpenLifecycle(lifecycle.status)) return false;
  const memberships = await db.select({ groupId: learnerGroupMemberships.groupId, isSystem: learnerGroups.isSystem }).from(learnerGroupMemberships).innerJoin(learnerGroups, eq(learnerGroupMemberships.groupId, learnerGroups.id)).where(and(eq(learnerGroupMemberships.userId, userId), eq(learnerGroups.active, 1)));
  if (memberships.some((membership) => membership.isSystem === 1)) return true;
  const groupIds = memberships.map((membership) => membership.groupId);
  if (!groupIds.length) return false;
  return (await db.select({ id: learnerGroupCourses.id }).from(learnerGroupCourses).where(and(eq(learnerGroupCourses.courseId, courseId), inArray(learnerGroupCourses.groupId, groupIds))).limit(1)).length > 0;
}

export async function getCourseLifecycleState(courseId: string): Promise<{ status: CourseLifecycleStatus; reason: string | null }> {
  const db = await getDb();
  if (!db) return { status: "active", reason: null };
  const [state] = await db.select({ status: courseLifecycleStates.status, reason: courseLifecycleStates.reason }).from(courseLifecycleStates).where(eq(courseLifecycleStates.courseId, courseId)).limit(1);
  return state ? { status: state.status as CourseLifecycleStatus, reason: state.reason } : { status: "active", reason: null };
}

export async function createInvitation(email: string, name: string | null, invitedBy: number, expiresInDays: number = 7, groupIds: number[] = []) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const result = await db.insert(userInvitations).values({
    email,
    name,
    invitedBy,
    token,
    expiresAt,
  });
  const invitationId = result[0].insertId;
  if (groupIds.length) await db.insert(invitationGroups).values(Array.from(new Set(groupIds)).map((groupId) => ({ invitationId, groupId })));
  return { id: invitationId, email, name, token, expiresAt, status: 'pending' as const };
}

export async function applyInvitationGroupsToUser(token: string, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [invitation] = await db.select({ id: userInvitations.id }).from(userInvitations).where(eq(userInvitations.token, token)).limit(1);
  if (!invitation) return;
  const groups = await db.select({ groupId: invitationGroups.groupId }).from(invitationGroups).where(eq(invitationGroups.invitationId, invitation.id));
  for (const group of groups) {
    await db.insert(learnerGroupMemberships).values({ userId, groupId: group.groupId, assignedBy: null }).onDuplicateKeyUpdate({ set: { assignedAt: sql`CURRENT_TIMESTAMP` } });
  }
}

export async function getInvitations(page: number = 1, pageSize: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const offset = (page - 1) * pageSize;
  const invitations = await db.select().from(userInvitations).orderBy(desc(userInvitations.createdAt)).limit(pageSize).offset(offset);
  const [{ total }] = await db.select({ total: count() }).from(userInvitations);

  return { invitations, total, page, pageSize };
}
export async function getDirectInvitations(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  sortBy: "createdAt" | "email" | "name" | "status" | "expiresAt" = "createdAt",
  sortDirection: "asc" | "desc" = "desc",
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const offset = (page - 1) * pageSize;
  const filters = [isNull(userInvitations.applicationId)];
  const normalizedSearch = search?.trim();
  if (normalizedSearch) {
    const searchTerm = `%${normalizedSearch}%`;
    filters.push(or(like(userInvitations.email, searchTerm), like(userInvitations.name, searchTerm))!);
  }
  const where = and(...filters);
  const sortableColumns = {
    createdAt: userInvitations.createdAt,
    email: userInvitations.email,
    name: userInvitations.name,
    status: userInvitations.status,
    expiresAt: userInvitations.expiresAt,
  } as const;
  const orderBy = sortDirection === "asc" ? asc(sortableColumns[sortBy]) : desc(sortableColumns[sortBy]);

  const invitations = await db.select().from(userInvitations)
    .where(where)
    .orderBy(orderBy)
    .limit(pageSize).offset(offset);
  const [{ total }] = await db.select({ total: count() }).from(userInvitations)
    .where(where);

  return { invitations, total, page, pageSize, search: normalizedSearch || "", sortBy, sortDirection };
}

export async function cancelInvitation(invitationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userInvitations)
    .set({ status: "expired" })
    .where(and(eq(userInvitations.id, invitationId), isNull(userInvitations.applicationId)));
  return { success: true };
}

export async function getInvitationByToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [invitation] = await db.select().from(userInvitations).where(eq(userInvitations.token, token)).limit(1);
  return invitation || null;
}

export async function markInvitationAccepted(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userInvitations).set({ status: "accepted", acceptedAt: new Date() }).where(eq(userInvitations.token, token));
}

export async function getAdminAnalytics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Users over time (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const recentUsers = await db.select({
    id: users.id,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).where(sql`${users.createdAt} >= ${thirtyDaysAgo}`);

  const recentProgress = await db.select({
    id: trainingProgress.id,
    completedAt: trainingProgress.completedAt,
    certificationId: trainingProgress.certificationId,
    courseId: trainingProgress.courseId,
  }).from(trainingProgress).where(sql`${trainingProgress.completedAt} >= ${thirtyDaysAgo}`);

  const recentExams = await db.select({
    id: examAttempts.id,
    finishedAt: examAttempts.finishedAt,
    passed: examAttempts.passed,
    score: examAttempts.score,
    certificationId: examAttempts.certificationId,
  }).from(examAttempts).where(sql`${examAttempts.finishedAt} >= ${thirtyDaysAgo}`);

  // Active users (signed in last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [{ activeCount }] = await db.select({ activeCount: count() }).from(users).where(sql`${users.lastSignedIn} >= ${sevenDaysAgo}`);

  // Blocked users count
  const [{ blockedCount }] = await db.select({ blockedCount: count() }).from(users).where(eq(users.blocked, 1));

  return {
    recentUsers,
    recentProgress,
    recentExams,
    activeUsersLast7Days: activeCount,
    blockedUsers: blockedCount,
  };
}

export async function getLearningReporting(input: { days: 7 | 30 | 90; certificationId?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
  const eventConditions = [sql`${learningEvents.createdAt} >= ${since}`];
  const progressConditions = [sql`${trainingProgress.completedAt} >= ${since}`];
  if (input.certificationId) {
    eventConditions.push(eq(learningEvents.certificationId, input.certificationId));
    progressConditions.push(eq(trainingProgress.certificationId, input.certificationId));
  }

  const [events, progressRows, learnerRows, identityRows] = await Promise.all([
    db.select({
      id: learningEvents.id,
      userId: learningEvents.userId,
      eventType: learningEvents.eventType,
      certificationId: learningEvents.certificationId,
      courseId: learningEvents.courseId,
      durationSeconds: learningEvents.durationSeconds,
      success: learningEvents.success,
      attemptNumber: learningEvents.attemptNumber,
      createdAt: learningEvents.createdAt,
    }).from(learningEvents).where(and(...eventConditions)),
    db.select({
      userId: trainingProgress.userId,
      certificationId: trainingProgress.certificationId,
      courseId: trainingProgress.courseId,
      completedAt: trainingProgress.completedAt,
    }).from(trainingProgress).where(and(...progressConditions)),
    db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.role, "user")),
    db.select({ id: users.id, name: users.name, email: users.email }).from(users),
  ]);

  const dayKeys = Array.from({ length: input.days }, (_, index) => {
    const date = new Date(Date.now() - (input.days - index - 1) * 24 * 60 * 60 * 1000);
    return date.toISOString().slice(0, 10);
  });
  const daily = new Map(dayKeys.map((date) => [date, { date, activeLearners: new Set<number>(), minutes: 0, firstAttempts: 0, firstAttemptSuccesses: 0, completedLessons: 0 }]));
  const learnerStats = new Map<number, { seconds: number; days: Set<string>; firstAttempts: number; firstAttemptSuccesses: number; lessons: number }>();
  const courseStats = new Map<string, { minutes: number; firstAttempts: number; firstAttemptSuccesses: number; lessons: number; learners: Set<number> }>();

  const ensureLearner = (userId: number) => {
    if (!learnerStats.has(userId)) learnerStats.set(userId, { seconds: 0, days: new Set(), firstAttempts: 0, firstAttemptSuccesses: 0, lessons: 0 });
    return learnerStats.get(userId)!;
  };
  const ensureCourse = (courseId: string) => {
    if (!courseStats.has(courseId)) courseStats.set(courseId, { minutes: 0, firstAttempts: 0, firstAttemptSuccesses: 0, lessons: 0, learners: new Set() });
    return courseStats.get(courseId)!;
  };

  const pedagogicalEvents = events.filter((event) => isPedagogicalReportingEvent(event.eventType));

  for (const event of pedagogicalEvents) {
    const userId = Number(event.userId);
    if (!Number.isFinite(userId)) continue;
    const day = new Date(event.createdAt).toISOString().slice(0, 10);
    const dailyItem = daily.get(day);
    const learner = ensureLearner(userId);
    learner.days.add(day);
    dailyItem?.activeLearners.add(userId);
    if (event.eventType === "learning_time") {
      const seconds = event.durationSeconds || 0;
      learner.seconds += seconds;
      if (dailyItem) dailyItem.minutes += seconds / 60;
      if (event.courseId) ensureCourse(event.courseId).minutes += seconds / 60;
    }
    if (event.eventType === "exercise_submitted" && event.attemptNumber === 1) {
      learner.firstAttempts += 1;
      if (event.success === 1) learner.firstAttemptSuccesses += 1;
      if (dailyItem) {
        dailyItem.firstAttempts += 1;
        if (event.success === 1) dailyItem.firstAttemptSuccesses += 1;
      }
      if (event.courseId) {
        const course = ensureCourse(event.courseId);
        course.firstAttempts += 1;
        if (event.success === 1) course.firstAttemptSuccesses += 1;
      }
    }
    if (event.courseId) ensureCourse(event.courseId).learners.add(userId);
  }

  for (const row of progressRows) {
    const userId = Number(row.userId);
    if (!Number.isFinite(userId)) continue;
    const day = new Date(row.completedAt).toISOString().slice(0, 10);
    const learner = ensureLearner(userId);
    learner.lessons += 1;
    if (daily.get(day)) daily.get(day)!.completedLessons += 1;
    if (row.courseId) {
      const course = ensureCourse(row.courseId);
      course.lessons += 1;
      course.learners.add(userId);
    }
  }

  const totalSeconds = Array.from(learnerStats.values()).reduce((sum, item) => sum + item.seconds, 0);
  const firstAttempts = Array.from(learnerStats.values()).reduce((sum, item) => sum + item.firstAttempts, 0);
  const firstAttemptSuccesses = Array.from(learnerStats.values()).reduce((sum, item) => sum + item.firstAttemptSuccesses, 0);
  const engagedLearners = Array.from(learnerStats.values()).filter((item) => item.seconds > 0 || item.lessons > 0).length;
  // Learning events can belong to an administrator completing the training as well.
  // Keep role filtering for learner KPIs, but resolve display labels against every account.
  const userById = new Map(identityRows.map((learner) => [learner.id, learner]));

  return {
    periodDays: input.days,
    hasLearningData: pedagogicalEvents.length > 0 || progressRows.length > 0,
    overview: {
      enrolledLearners: learnerRows.length,
      engagedLearners,
      activeMinutes: Math.round(totalSeconds / 60),
      avgActiveMinutes: engagedLearners ? Math.round(totalSeconds / 60 / engagedLearners) : 0,
      firstAttemptRate: firstAttemptRate(firstAttemptSuccesses, firstAttempts),
      completedLessons: progressRows.length,
    },
    daily: Array.from(daily.values()).map((item) => ({
      date: item.date,
      activeLearners: item.activeLearners.size,
      activeMinutes: Math.round(item.minutes),
      firstAttemptRate: firstAttemptRate(item.firstAttemptSuccesses, item.firstAttempts),
      completedLessons: item.completedLessons,
    })),
    engagementBuckets: [
      { label: "0–30 min", count: learnerRows.filter((learner) => {
        const item = learnerStats.get(learner.id);
        return item && engagementBucket(item.seconds, item.lessons > 0) === "short";
      }).length },
      { label: "31–120 min", count: learnerRows.filter((learner) => {
        const item = learnerStats.get(learner.id);
        return item && engagementBucket(item.seconds, item.lessons > 0) === "regular";
      }).length },
      { label: "> 2 h", count: learnerRows.filter((learner) => {
        const item = learnerStats.get(learner.id);
        return item && engagementBucket(item.seconds, item.lessons > 0) === "deep";
      }).length },
      { label: "Aucune activité", count: learnerRows.filter((learner) => {
        const item = learnerStats.get(learner.id);
        return !item || engagementBucket(item.seconds, item.lessons > 0) === "none";
      }).length },
    ],
    coursePerformance: Array.from(courseStats.entries()).map(([courseId, item]) => ({
      courseId,
      activeMinutes: Math.round(item.minutes),
      learners: item.learners.size,
      completedLessons: item.lessons,
      firstAttemptRate: firstAttemptRate(item.firstAttemptSuccesses, item.firstAttempts),
    })).sort((a, b) => b.activeMinutes - a.activeMinutes || b.completedLessons - a.completedLessons),
    topLearners: Array.from(learnerStats.entries()).map(([userId, item]) => ({
      userId,
      name: learnerReportingLabel(userById.get(userId)),
      activeMinutes: Math.round(item.seconds / 60),
      activeDays: item.days.size,
      completedLessons: item.lessons,
      firstAttemptRate: firstAttemptRate(item.firstAttemptSuccesses, item.firstAttempts),
    })).sort((a, b) => b.activeMinutes - a.activeMinutes || b.completedLessons - a.completedLessons).slice(0, 8),
  };
}

export async function exportLearnersCSV() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all users with their progress summary
  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    blocked: users.blocked,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).orderBy(desc(users.createdAt));

  // Get progress counts per user
  const progressCounts = await db.select({
    userId: trainingProgress.userId,
    lessonsCompleted: count(),
  }).from(trainingProgress).groupBy(trainingProgress.userId);

  // Get exam stats per user
  const examStats = await db.select({
    userId: examAttempts.userId,
    totalAttempts: count(),
  }).from(examAttempts).groupBy(examAttempts.userId);

  const progressMap = new Map(progressCounts.map(p => [p.userId, p.lessonsCompleted]));
  const examMap = new Map(examStats.map(e => [e.userId, e.totalAttempts]));

  return allUsers.map(u => ({
    id: u.id,
    name: u.name || '',
    email: u.email || '',
    role: u.role,
    blocked: u.blocked ? 'Oui' : 'Non',
    lessonsCompleted: progressMap.get(u.id) || 0,
    examAttempts: examMap.get(u.id) || 0,
    createdAt: u.createdAt?.toISOString() || '',
    lastSignedIn: u.lastSignedIn?.toISOString() || '',
  }));
}

// ============ Auth: Email/Password ============

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by email: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setUserPasswordHash(openId: string, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ passwordHash }).where(eq(users.openId, openId));
}


// ============ Video Feedback (Recommendations) ============

export async function submitVideoFeedback(userId: number, videoId: string, lessonId: string, certId: string, reason: "not_relevant" | "obsolete" | "broken_link" | "other", comment?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if user already submitted feedback for this video in this lesson
  const existing = await db.select().from(videoFeedback)
    .where(and(
      eq(videoFeedback.userId, userId),
      eq(videoFeedback.videoId, videoId),
      eq(videoFeedback.lessonId, lessonId)
    )).limit(1);
  
  if (existing.length > 0) {
    return { alreadyReported: true };
  }
  
  await db.insert(videoFeedback).values({ userId, videoId, lessonId, certId, reason, comment });
  return { alreadyReported: false };
}

export async function getUserVideoFeedback(userId: number, certId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (certId) {
    return await db.select({ videoId: videoFeedback.videoId, lessonId: videoFeedback.lessonId })
      .from(videoFeedback)
      .where(and(eq(videoFeedback.userId, userId), eq(videoFeedback.certId, certId)));
  }
  return await db.select({ videoId: videoFeedback.videoId, lessonId: videoFeedback.lessonId })
    .from(videoFeedback)
    .where(eq(videoFeedback.userId, userId));
}

// ============ Private Course Feedback ============
export async function submitCourseFeedback(data: { userId: number; certificationId: string; courseId: string; rating: number; contentRating?: number; experienceRating?: number; difficultyRating?: number; recommendScore?: number; category?: "content" | "exercise" | "media" | "technical" | "suggestion" | "other"; comment?: string; suggestion?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rating = normalizeCourseRating(data.rating);
  const comment = normalizeCourseFeedbackComment(data.comment);
  const suggestion = normalizeCourseFeedbackComment(data.suggestion);
  const ratingField = (value?: number) => value === undefined ? null : normalizeCourseRating(value);
  const details = {
    rating,
    contentRating: ratingField(data.contentRating),
    experienceRating: ratingField(data.experienceRating),
    difficultyRating: ratingField(data.difficultyRating),
    recommendScore: data.recommendScore === undefined ? null : Math.max(0, Math.min(10, Math.round(data.recommendScore))),
    category: data.category || null,
    comment,
    suggestion,
    status: "new" as const,
    adminResponse: null,
    adminResponderId: null,
    respondedAt: null,
    resolvedAt: null,
  };
  const [existing] = await db.select({ id: courseFeedback.id }).from(courseFeedback)
    .where(and(eq(courseFeedback.userId, data.userId), eq(courseFeedback.courseId, data.courseId))).limit(1);
  if (existing) {
    await db.update(courseFeedback).set(details).where(eq(courseFeedback.id, existing.id));
  } else {
    await db.insert(courseFeedback).values({ ...data, ...details });
  }
  await db.insert(learnerActivityLog).values({
    userId: data.userId,
    actionType: "course_feedback_submitted",
    certificationId: data.certificationId,
    courseId: data.courseId,
    metadata: { rating, hasComment: Boolean(comment), hasSuggestion: Boolean(suggestion), category: data.category || null },
  });
  const [saved] = await db.select().from(courseFeedback)
    .where(and(eq(courseFeedback.userId, data.userId), eq(courseFeedback.courseId, data.courseId))).limit(1);
  return saved || null;
}

export async function getMyCourseFeedback(userId: number, courseId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [feedback] = await db.select().from(courseFeedback)
    .where(and(eq(courseFeedback.userId, userId), eq(courseFeedback.courseId, courseId))).limit(1);
  return feedback || null;
}

export async function getCourseFeedbackDashboard() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const items = await db.select({
    id: courseFeedback.id, userId: courseFeedback.userId, userName: users.name, userEmail: users.email,
    certificationId: courseFeedback.certificationId, courseId: courseFeedback.courseId, rating: courseFeedback.rating,
    contentRating: courseFeedback.contentRating, experienceRating: courseFeedback.experienceRating, difficultyRating: courseFeedback.difficultyRating,
    recommendScore: courseFeedback.recommendScore, category: courseFeedback.category, comment: courseFeedback.comment, suggestion: courseFeedback.suggestion,
    status: courseFeedback.status, adminResponse: courseFeedback.adminResponse, createdAt: courseFeedback.createdAt, updatedAt: courseFeedback.updatedAt,
  }).from(courseFeedback).leftJoin(users, eq(courseFeedback.userId, users.id)).orderBy(desc(courseFeedback.updatedAt)).limit(250);
  const countValue = items.length;
  return {
    items,
    summary: {
      count: countValue,
      averageRating: countValue ? Math.round((items.reduce((sum, item) => sum + item.rating, 0) / countValue) * 10) / 10 : 0,
      pendingCount: items.filter((item) => item.status === "new" || item.status === "in_review").length,
      suggestionsCount: items.filter((item) => Boolean(item.suggestion)).length,
    },
  };
}

export async function moderateCourseFeedback(data: { feedbackId: number; adminId: number; status: "new" | "in_review" | "responded" | "resolved" | "dismissed"; adminResponse?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const response = normalizeCourseFeedbackComment(data.adminResponse);
  const now = new Date();
  await db.update(courseFeedback).set({ status: data.status, adminResponse: response, adminResponderId: response ? data.adminId : null, respondedAt: response ? now : null, resolvedAt: data.status === "resolved" ? now : null }).where(eq(courseFeedback.id, data.feedbackId));
  const [updated] = await db.select().from(courseFeedback).where(eq(courseFeedback.id, data.feedbackId)).limit(1);
  return updated || null;
}

// ============ Password Reset Tokens ============

export async function createPasswordResetToken(userId: number, token: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Invalidate any existing unused tokens for this user
  await db.update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(and(
      eq(passwordResetTokens.userId, userId),
      sql`${passwordResetTokens.usedAt} IS NULL`
    ));

  const result = await db.insert(passwordResetTokens).values({
    userId,
    token,
    expiresAt,
  });

  return { id: result[0].insertId, userId, token, expiresAt };
}

export async function getValidPasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(passwordResetTokens)
    .where(and(
      eq(passwordResetTokens.token, token),
      sql`${passwordResetTokens.usedAt} IS NULL`,
      gt(passwordResetTokens.expiresAt, new Date())
    ))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function markPasswordResetTokenUsed(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.token, token));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}


// ============ Selected Candidates Tracking ============

export async function getSelectedCandidates(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  sortBy: "updatedAt" | "email" | "firstName" | "scoreTotal" = "updatedAt",
  sortDirection: "asc" | "desc" = "desc",
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const filters = [eq(applications.status, "selectionne")];
  const normalizedSearch = search?.trim();
  if (normalizedSearch) {
    const searchTerm = `%${normalizedSearch}%`;
    filters.push(or(like(applications.firstName, searchTerm), like(applications.lastName, searchTerm), like(applications.email, searchTerm))!);
  }
  const where = and(...filters);
  const sortableColumns = {
    updatedAt: applications.updatedAt,
    email: applications.email,
    firstName: applications.firstName,
    scoreTotal: applications.scoreTotal,
  } as const;
  const orderBy = sortDirection === "asc" ? asc(sortableColumns[sortBy]) : desc(sortableColumns[sortBy]);
  const offset = (page - 1) * pageSize;

  const selectedApps = await db.select({
    id: applications.id,
    firstName: applications.firstName,
    lastName: applications.lastName,
    email: applications.email,
    phone: applications.phone,
    country: applications.country,
    scoreTotal: applications.scoreTotal,
    createdAt: applications.createdAt,
    updatedAt: applications.updatedAt,
  }).from(applications).where(where).orderBy(orderBy).limit(pageSize).offset(offset);
  const [{ total }] = await db.select({ total: count() }).from(applications).where(where);

  // For each selected candidate, check if they have a user account and invitation status
  const results = [];
  for (const app of selectedApps) {
    // Check if user account exists
    const [userAccount] = await db.select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    }).from(users).where(eq(users.email, app.email)).limit(1);

    // Get latest invitation for this email
    const [latestInvitation] = await db.select().from(userInvitations)
      .where(eq(userInvitations.email, app.email))
      .orderBy(desc(userInvitations.createdAt))
      .limit(1);

    results.push({
      ...app,
      accountStatus: userAccount ? "active" as const : "no_account" as const,
      userAccount: userAccount || null,
      latestInvitation: latestInvitation || null,
    });
  }

  return { candidates: results, total, page, pageSize, search: normalizedSearch || "", sortBy, sortDirection };
}

export async function updateApplicationEmail(applicationId: number, newEmail: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(applications).set({ email: newEmail }).where(eq(applications.id, applicationId));
  return { applicationId, newEmail };
}

export async function updateInvitationDeliveryStatus(resendMessageId: string, status: "sent" | "delivered" | "bounced" | "complained" | "suppressed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(userInvitations)
    .set({ emailDeliveryStatus: status })
    .where(eq(userInvitations.resendMessageId, resendMessageId));
}

export async function createEmailEvent(resendMessageId: string, type: "sent" | "delivered" | "bounced" | "complained" | "opened" | "clicked", email: string, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(emailEvents).values({ resendMessageId, type, email, reason });
}

export async function getEmailDeliveryStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [stats] = await db.select({
    total: count(),
    delivered: sql<number>`SUM(CASE WHEN ${userInvitations.emailDeliveryStatus} = 'delivered' THEN 1 ELSE 0 END)`,
    bounced: sql<number>`SUM(CASE WHEN ${userInvitations.emailDeliveryStatus} = 'bounced' THEN 1 ELSE 0 END)`,
    suppressed: sql<number>`SUM(CASE WHEN ${userInvitations.emailDeliveryStatus} = 'suppressed' THEN 1 ELSE 0 END)`,
    pending: sql<number>`SUM(CASE WHEN ${userInvitations.emailDeliveryStatus} = 'sent' OR ${userInvitations.emailDeliveryStatus} IS NULL THEN 1 ELSE 0 END)`,
  }).from(userInvitations);

  return {
    total: stats.total || 0,
    delivered: Number(stats.delivered) || 0,
    bounced: Number(stats.bounced) || 0,
    suppressed: Number(stats.suppressed) || 0,
    pending: Number(stats.pending) || 0,
  };
}

export async function createInvitationWithTracking(email: string, name: string | null, invitedBy: number, applicationId?: number, expiresInDays: number = 7, groupIds: number[] = []) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const result = await db.insert(userInvitations).values({
    email,
    name,
    invitedBy,
    token,
    expiresAt,
    applicationId: applicationId || null,
  });

  const invitationId = result[0].insertId;
  const uniqueGroupIds = Array.from(new Set(groupIds));
  if (uniqueGroupIds.length) {
    await db.insert(invitationGroups).values(uniqueGroupIds.map((groupId) => ({ invitationId, groupId })));
  }

  return { id: invitationId, email, name, token, expiresAt, status: 'pending' as const };
}


// ============ Exercise Results ============
export async function saveExerciseResult(userId: string, courseId: string, moduleId: string, score: number, totalQuestions: number, answersJson: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(exerciseResults).values({
    userId,
    courseId,
    moduleId,
    score,
    totalQuestions,
    answers: answersJson,
  });
  return { id: result[0].insertId, success: true };
}

export async function getExerciseResults(userId: string, courseId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (courseId) {
    return await db.select().from(exerciseResults).where(and(eq(exerciseResults.userId, userId), eq(exerciseResults.courseId, courseId))).orderBy(desc(exerciseResults.createdAt));
  }
  return await db.select().from(exerciseResults).where(eq(exerciseResults.userId, userId)).orderBy(desc(exerciseResults.createdAt));
}

// ============ Learning event timeline ============
export async function recordLearningEvent(data: {
  userId: number; eventType: string; certificationId?: string; courseId?: string;
  lessonIndex?: number; chapterIndex?: number; exerciseId?: string;
  durationSeconds?: number; success?: number; score?: number; attemptNumber?: number; metadata?: unknown;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(learningEvents).values({
    ...data,
    certificationId: data.certificationId || null,
    courseId: data.courseId || null,
    lessonIndex: data.lessonIndex ?? null,
    chapterIndex: data.chapterIndex ?? null,
    exerciseId: data.exerciseId || null,
    durationSeconds: Math.max(0, Math.round(data.durationSeconds || 0)),
    success: data.success ?? null,
    score: data.score ?? null,
    attemptNumber: data.attemptNumber ?? null,
    metadata: data.metadata ?? null,
  });
  if (data.eventType !== "learning_time") {
    await db.insert(learnerActivityLog).values({
      userId: data.userId,
      actionType: data.eventType,
      certificationId: data.certificationId || null,
      courseId: data.courseId || null,
      lessonIndex: data.lessonIndex ?? null,
      chapterIndex: data.chapterIndex ?? null,
      exerciseId: data.exerciseId || null,
      metadata: data.metadata ?? null,
    });
  }
  return { id: result[0].insertId };
}

export async function getLearnerLearningEvents(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(learningEvents).where(eq(learningEvents.userId, userId)).orderBy(desc(learningEvents.createdAt));
}
