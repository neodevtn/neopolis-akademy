import { eq, desc, sql, and, count, gt, isNull, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, applications, InsertApplication, Application, trainingProgress, examAttempts, InsertTrainingProgress, InsertExamAttempt, videoProgress, InsertVideoProgress, chapterProgress, userInvitations, videoFeedback, InsertVideoFeedback, passwordResetTokens, emailEvents, exerciseResults, learningEvents, learnerAchievements, InsertLearnerAchievement } from "../drizzle/schema";
import { ENV } from './_core/env';
import { engagementBucket, firstAttemptRate } from "./reportingMetrics";

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

export async function getAllLearners(page: number = 1, pageSize: number = 20, search?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const offset = (page - 1) * pageSize;

  // Get users who have at least one training progress entry OR exam attempt
  let baseQuery = db.select({
    id: users.id,
    openId: users.openId,
    name: users.name,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users);

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    baseQuery = baseQuery.where(
      sql`(${users.name} LIKE ${searchTerm} OR ${users.email} LIKE ${searchTerm})`
    ) as any;
  }

  const allUsers = await (baseQuery as any).orderBy(desc(users.lastSignedIn)).limit(pageSize).offset(offset);

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
    viaCandidature: candidatureEmails.has(u.email),
  }));

  return { users: enriched, total, page, pageSize };
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
  const achievements = await db.select().from(learnerAchievements).where(eq(learnerAchievements.userId, userId)).orderBy(desc(learnerAchievements.issuedAt));

  // Get user info for viaCandidature
  const [userRow] = await db.select({ email: users.email, name: users.name, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn, role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  let viaCandidature = false;
  if (userRow?.email) {
    const [app] = await db.select({ id: applications.id }).from(applications).where(eq(applications.email, userRow.email)).limit(1);
    viaCandidature = !!app;
  }

  return { progress, attempts, chapterProgress: chapterProg, videoProgress: videoProg, exerciseResults: exercises, learningEvents: events, achievements, viaCandidature, userInfo: userRow || null };
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

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
  return { userId, role };
}

export async function createInvitation(email: string, name: string | null, invitedBy: number, expiresInDays: number = 7) {
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

  return { id: result[0].insertId, email, name, token, expiresAt, status: 'pending' as const };
}

export async function getInvitations(page: number = 1, pageSize: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const offset = (page - 1) * pageSize;
  const invitations = await db.select().from(userInvitations).orderBy(desc(userInvitations.createdAt)).limit(pageSize).offset(offset);
  const [{ total }] = await db.select({ total: count() }).from(userInvitations);

  return { invitations, total, page, pageSize };
}
export async function getDirectInvitations(page: number = 1, pageSize: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const offset = (page - 1) * pageSize;
  // Only invitations NOT linked to a candidature (applicationId IS NULL)
  const invitations = await db.select().from(userInvitations)
    .where(isNull(userInvitations.applicationId))
    .orderBy(desc(userInvitations.createdAt))
    .limit(pageSize).offset(offset);
  const [{ total }] = await db.select({ total: count() }).from(userInvitations)
    .where(isNull(userInvitations.applicationId));

  return { invitations, total, page, pageSize };
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

  const [events, progressRows, learnerRows] = await Promise.all([
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

  for (const event of events) {
    const day = new Date(event.createdAt).toISOString().slice(0, 10);
    const dailyItem = daily.get(day);
    const learner = ensureLearner(event.userId);
    learner.days.add(day);
    dailyItem?.activeLearners.add(event.userId);
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
    if (event.courseId) ensureCourse(event.courseId).learners.add(event.userId);
  }

  for (const row of progressRows) {
    const day = new Date(row.completedAt).toISOString().slice(0, 10);
    const learner = ensureLearner(row.userId);
    learner.lessons += 1;
    if (daily.get(day)) daily.get(day)!.completedLessons += 1;
    if (row.courseId) {
      const course = ensureCourse(row.courseId);
      course.lessons += 1;
      course.learners.add(row.userId);
    }
  }

  const totalSeconds = Array.from(learnerStats.values()).reduce((sum, item) => sum + item.seconds, 0);
  const firstAttempts = Array.from(learnerStats.values()).reduce((sum, item) => sum + item.firstAttempts, 0);
  const firstAttemptSuccesses = Array.from(learnerStats.values()).reduce((sum, item) => sum + item.firstAttemptSuccesses, 0);
  const engagedLearners = Array.from(learnerStats.values()).filter((item) => item.seconds > 0 || item.lessons > 0).length;
  const userById = new Map(learnerRows.map((learner) => [learner.id, learner]));

  return {
    periodDays: input.days,
    hasLearningData: events.length > 0 || progressRows.length > 0,
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
      name: userById.get(userId)?.name || userById.get(userId)?.email || `Apprenant #${userId}`,
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

export async function getSelectedCandidates() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all applications with status "selectionne"
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
  }).from(applications).where(eq(applications.status, "selectionne")).orderBy(desc(applications.updatedAt));

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

  return results;
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

export async function createInvitationWithTracking(email: string, name: string | null, invitedBy: number, applicationId?: number, expiresInDays: number = 7) {
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

  return { id: result[0].insertId, email, name, token, expiresAt, status: 'pending' as const };
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
  return { id: result[0].insertId };
}

export async function getLearnerLearningEvents(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(learningEvents).where(eq(learningEvents.userId, userId)).orderBy(desc(learningEvents.createdAt));
}
