import { eq, desc, sql, and, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, applications, InsertApplication, Application, trainingProgress, examAttempts, InsertTrainingProgress, InsertExamAttempt, videoProgress, InsertVideoProgress, chapterProgress, userInvitations, videoFeedback, InsertVideoFeedback } from "../drizzle/schema";
import { ENV } from './_core/env';

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

  return { users: allUsers, total, page, pageSize };
}

export async function getLearnerProgress(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const progress = await db.select().from(trainingProgress).where(eq(trainingProgress.userId, userId));
  const attempts = await db.select().from(examAttempts).where(eq(examAttempts.userId, userId)).orderBy(desc(examAttempts.finishedAt));

  return { progress, attempts };
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
