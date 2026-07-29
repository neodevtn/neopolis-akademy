import { eq, desc, sql, and, count, inArray } from "drizzle-orm";
import { getDb } from "./db";
import {
  adminNotes, InsertAdminNote,
  adminTags, InsertAdminTag,
  userTags, InsertUserTag,
  communications, InsertCommunication,
  adminActivityLog, InsertAdminActivityLog,
  users, applications, trainingProgress, examAttempts, chapterProgress,
} from "../drizzle/schema";

// ============ Admin Notes ============

export async function createAdminNote(data: Omit<InsertAdminNote, "id">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(adminNotes).values(data);
  return { id: result[0].insertId, ...data, createdAt: new Date(), updatedAt: new Date() };
}

export async function getAdminNotes(targetType: "user" | "application", targetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(adminNotes)
    .where(and(eq(adminNotes.targetType, targetType), eq(adminNotes.targetId, targetId)))
    .orderBy(desc(adminNotes.createdAt));
}

export async function updateAdminNote(noteId: number, content: string, category?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { content };
  if (category) updateData.category = category;
  await db.update(adminNotes).set(updateData as any).where(eq(adminNotes.id, noteId));
  const [note] = await db.select().from(adminNotes).where(eq(adminNotes.id, noteId)).limit(1);
  return note;
}

export async function deleteAdminNote(noteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adminNotes).where(eq(adminNotes.id, noteId));
  return { success: true };
}

// ============ Admin Tags ============

export async function createAdminTag(data: Omit<InsertAdminTag, "id">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(adminTags).values(data);
  return { id: result[0].insertId, ...data, createdAt: new Date() };
}

export async function getAdminTags() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(adminTags).orderBy(adminTags.name);
}

export async function deleteAdminTag(tagId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Remove all user_tags associations first
  await db.delete(userTags).where(eq(userTags.tagId, tagId));
  await db.delete(adminTags).where(eq(adminTags.id, tagId));
  return { success: true };
}

// ============ User Tags ============

export async function assignTagToUser(userId: number, tagId: number, assignedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if already assigned
  const existing = await db.select().from(userTags)
    .where(and(eq(userTags.userId, userId), eq(userTags.tagId, tagId))).limit(1);
  if (existing.length > 0) return existing[0];
  const result = await db.insert(userTags).values({ userId, tagId, assignedBy });
  return { id: result[0].insertId, userId, tagId, assignedBy, assignedAt: new Date() };
}

export async function removeTagFromUser(userId: number, tagId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(userTags).where(and(eq(userTags.userId, userId), eq(userTags.tagId, tagId)));
  return { success: true };
}

export async function getUserTags(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const tags = await db.select({
    id: adminTags.id,
    name: adminTags.name,
    color: adminTags.color,
    assignedAt: userTags.assignedAt,
  }).from(userTags)
    .innerJoin(adminTags, eq(userTags.tagId, adminTags.id))
    .where(eq(userTags.userId, userId));
  return tags;
}

// ============ Communications ============

export async function createCommunication(data: Omit<InsertCommunication, "id">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(communications).values(data);
  return { id: result[0].insertId, ...data, createdAt: new Date() };
}

export async function getCommunications(page: number = 1, pageSize: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const offset = (page - 1) * pageSize;
  const items = await db.select().from(communications)
    .orderBy(desc(communications.createdAt)).limit(pageSize).offset(offset);
  const [{ total }] = await db.select({ total: count() }).from(communications);
  return { items, total, page, pageSize };
}

export async function updateCommunicationStatus(id: number, status: "draft" | "sending" | "sent" | "failed", recipientCount?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (status === "sent") updateData.sentAt = new Date();
  if (recipientCount !== undefined) updateData.recipientCount = recipientCount;
  await db.update(communications).set(updateData as any).where(eq(communications.id, id));
}

// ============ Activity Log ============

export async function logAdminActivity(data: Omit<InsertAdminActivityLog, "id">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.insert(adminActivityLog).values(data);
  } catch (e) {
    console.error("[AdminLog] Failed to log activity:", e);
  }
}

export async function getAdminActivityLog(page: number = 1, pageSize: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const offset = (page - 1) * pageSize;
  const items = await db.select().from(adminActivityLog)
    .orderBy(desc(adminActivityLog.createdAt)).limit(pageSize).offset(offset);
  const [{ total }] = await db.select({ total: count() }).from(adminActivityLog);
  return { items, total, page, pageSize };
}

// ============ Bulk Actions ============

export async function bulkUpdateApplicationStatus(ids: number[], status: "selectionne" | "refuse") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(applications).set({ status }).where(inArray(applications.id, ids));
  return { updated: ids.length };
}

export async function getApplicationsByIds(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(applications).where(inArray(applications.id, ids));
}

// ============ Learner Analytics (Enhanced) ============

export async function getLearnerAnalytics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  // All users (non-admin)
  const allLearners = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    lastSignedIn: users.lastSignedIn,
    createdAt: users.createdAt,
    blocked: users.blocked,
  }).from(users).where(eq(users.role, "user"));

  // Inactive users (not signed in for 7+ days, not blocked)
  const inactiveUsers = allLearners.filter(u =>
    u.lastSignedIn && new Date(u.lastSignedIn) < sevenDaysAgo && !u.blocked
  );

  // Get all progress data
  const allProgress = await db.select().from(trainingProgress);
  const allExams = await db.select().from(examAttempts);
  const allChapterProg = await db.select().from(chapterProgress);

  // Users with failed exams (score < 720, no subsequent pass)
  const failedExamUsers = new Set<number>();
  const passedExamUsers = new Set<number>();
  for (const exam of allExams) {
    if (exam.passed === 1) passedExamUsers.add(exam.userId);
    else failedExamUsers.add(exam.userId);
  }
  // Users who failed but never passed
  const strugglingUsers = Array.from(failedExamUsers).filter(id => !passedExamUsers.has(id));

  // Users with no progress in last 14 days (stalled)
  const recentProgressUsers = new Set(
    allProgress.filter(p => p.completedAt && new Date(p.completedAt) > fourteenDaysAgo).map(p => p.userId)
  );
  const stalledUsers = allLearners.filter(u =>
    !recentProgressUsers.has(u.id) && allProgress.some(p => p.userId === u.id) && !u.blocked
  );

  // Progress per user summary
  const progressByUser = new Map<number, number>();
  for (const p of allProgress) {
    progressByUser.set(p.userId, (progressByUser.get(p.userId) || 0) + 1);
  }

  // Exam stats
  const examsByUser = new Map<number, { attempts: number; passed: number; bestScore: number }>();
  for (const e of allExams) {
    const current = examsByUser.get(e.userId) || { attempts: 0, passed: 0, bestScore: 0 };
    current.attempts++;
    if (e.passed === 1) current.passed++;
    if (e.score > current.bestScore) current.bestScore = e.score;
    examsByUser.set(e.userId, current);
  }

  return {
    totalLearners: allLearners.length,
    activeLast7Days: allLearners.filter(u => u.lastSignedIn && new Date(u.lastSignedIn) >= sevenDaysAgo).length,
    inactiveUsers: inactiveUsers.map(u => ({ id: u.id, name: u.name, email: u.email, lastSignedIn: u.lastSignedIn })),
    strugglingUsers: strugglingUsers.map(id => {
      const user = allLearners.find(u => u.id === id);
      const exams = examsByUser.get(id);
      return { id, name: user?.name, email: user?.email, attempts: exams?.attempts || 0, bestScore: exams?.bestScore || 0 };
    }),
    stalledUsers: stalledUsers.map(u => ({
      id: u.id, name: u.name, email: u.email,
      lessonsCompleted: progressByUser.get(u.id) || 0,
      lastSignedIn: u.lastSignedIn,
    })),
    leaderboard: allLearners.map(u => ({
      id: u.id, name: u.name, email: u.email,
      lessonsCompleted: progressByUser.get(u.id) || 0,
      examStats: examsByUser.get(u.id) || { attempts: 0, passed: 0, bestScore: 0 },
      lastSignedIn: u.lastSignedIn,
    })).sort((a, b) => b.lessonsCompleted - a.lessonsCompleted).slice(0, 20),
  };
}

// ============ Get recipients for communication ============

export async function getRecipientsByFilter(filter: { tags?: number[]; status?: string[]; role?: string[] }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let userIds: Set<number> | null = null;

  // Filter by tags
  if (filter.tags && filter.tags.length > 0) {
    const taggedUsers = await db.select({ userId: userTags.userId }).from(userTags)
      .where(inArray(userTags.tagId, filter.tags));
    userIds = new Set(taggedUsers.map(t => t.userId));
  }

  // Get all matching users
  let allUsers = await db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
  }).from(users);

  // Apply role filter
  if (filter.role && filter.role.length > 0) {
    allUsers = allUsers.filter(u => filter.role!.includes(u.role));
  }

  // Apply tag filter
  if (userIds !== null) {
    allUsers = allUsers.filter(u => userIds!.has(u.id));
  }

  // Filter out users without email
  return allUsers.filter(u => u.email && u.email.trim() !== "");
}
