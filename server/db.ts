import { eq, desc, sql, and, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, applications, InsertApplication, Application, trainingProgress, examAttempts, InsertTrainingProgress, InsertExamAttempt, videoProgress, InsertVideoProgress } from "../drizzle/schema";
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
  
  const all = await db.select().from(applications);
  const total = all.length;
  const enAttente = all.filter(a => a.status === "en_attente").length;
  const selectionne = all.filter(a => a.status === "selectionne").length;
  const refuse = all.filter(a => a.status === "refuse").length;
  const avgScore = total > 0 ? all.reduce((sum, a) => sum + Number(a.scoreTotal), 0) / total : 0;
  
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
