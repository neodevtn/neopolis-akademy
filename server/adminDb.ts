import { eq, desc, sql, and, count, inArray } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";
import { getDb } from "./db";
import {
  adminNotes, InsertAdminNote,
  adminTags, InsertAdminTag,
  userTags, InsertUserTag,
  communications, InsertCommunication, communicationSegments, InsertCommunicationSegment, communicationReceipts,
  adminActivityLog, InsertAdminActivityLog,
  users, applications, trainingProgress, examAttempts, chapterProgress, userInvitations,
  learnerAchievements, learnerCompetencyContributions, learningEvents,
} from "../drizzle/schema";
import type { CommunicationAudience, CommunicationRecipientFilterInput } from "../shared/communicationRecipients";

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

export type CommunicationStatus = "draft" | "scheduled" | "sending" | "sent" | "failed" | "cancelled";

export function isCommunicationDraftEditable(status: string | null | undefined) {
  return status === "draft";
}

export async function getCommunicationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return (await db.select().from(communications).where(eq(communications.id, id)).limit(1))[0] || null;
}

export async function updateCommunicationDraft(input: {
  id: number;
  subject: string;
  body: string;
  type: InsertCommunication["type"];
  isImportant: number;
  recipientFilter: InsertCommunication["recipientFilter"];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(communications).set({
    subject: input.subject,
    body: input.body,
    type: input.type,
    isImportant: input.isImportant,
    recipientFilter: input.recipientFilter,
  }).where(and(eq(communications.id, input.id), eq(communications.status, "draft")));
  if (!result[0]?.affectedRows) return null;
  return getCommunicationById(input.id);
}

export async function updateCommunicationStatus(id: number, status: CommunicationStatus, recipientCount?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (status === "sent") updateData.sentAt = new Date();
  if (recipientCount !== undefined) updateData.recipientCount = recipientCount;
  await db.update(communications).set(updateData as any).where(eq(communications.id, id));
}

export async function markCommunicationScheduled(id: number, scheduledAt: Date, taskUid: string, recipientCount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(communications).set({
    status: "scheduled",
    scheduledAt,
    scheduleCronTaskUid: taskUid,
    recipientCount,
  }).where(and(eq(communications.id, id), eq(communications.status, "draft")));
  return Boolean(result[0]?.affectedRows);
}

export async function cancelScheduledCommunication(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const communication = await getCommunicationById(id);
  if (!communication || communication.status !== "scheduled") return null;
  await db.update(communications).set({ status: "cancelled", scheduleCronTaskUid: null }).where(eq(communications.id, id));
  return communication;
}

export async function getCommunicationByScheduleTaskUid(taskUid: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return (await db.select().from(communications).where(eq(communications.scheduleCronTaskUid, taskUid)).limit(1))[0] || null;
}

export async function clearCommunicationSchedule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(communications).set({ scheduleCronTaskUid: null }).where(eq(communications.id, id));
}

export async function claimCommunicationForDelivery(id: number, allowedStatuses: CommunicationStatus[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const communication = await getCommunicationById(id);
  if (!communication || !allowedStatuses.includes(communication.status as CommunicationStatus)) return null;
  const result = await db.update(communications).set({ status: "sending" })
    .where(and(eq(communications.id, id), inArray(communications.status, allowedStatuses)));
  if (!result[0]?.affectedRows) return null;
  return communication;
}

export async function createCommunicationSegment(data: Omit<InsertCommunicationSegment, "id">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(communicationSegments).values(data);
  return { id: result[0].insertId, ...data, createdAt: new Date(), updatedAt: new Date() };
}

export async function getCommunicationSegments() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(communicationSegments).orderBy(desc(communicationSegments.updatedAt));
}

export async function deleteCommunicationSegment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(communicationSegments).where(eq(communicationSegments.id, id));
}

type LearnerCommunication = {
  id: number;
  subject: string;
  body: string;
  type: string;
  isImportant: number;
  sentAt: Date | null;
  createdAt: Date;
  isRead: boolean;
  isAcknowledged: boolean;
};

function readCommunicationFilter(value: unknown): Record<string, unknown> {
  if (typeof value === "string") {
    try { return JSON.parse(value) as Record<string, unknown>; } catch { return {}; }
  }
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

/** Only an unqualified “tout le monde” broadcast is durable for accounts created after its send. */
export function isUniversalCommunication(filterValue: unknown) {
  const filter = readCommunicationFilter(filterValue);
  return filter.audience === "all" && !filter.competencyId && !filter.courseId && !(Array.isArray(filter.tags) && filter.tags.length) && !(Array.isArray(filter.status) && filter.status.length) && !(Array.isArray(filter.manualEmails) && filter.manualEmails.length) && !(Array.isArray(filter.role) && filter.role.length);
}

export async function createCommunicationReceiptsForRecipients(communicationId: number, recipients: Recipient[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const emails = new Set(recipients.map((recipient) => recipient.email.trim().toLowerCase()).filter(Boolean));
  if (!emails.size) return 0;
  const learnerRows = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.role, "user"));
  const matchingUsers = learnerRows.filter((user) => user.email && emails.has(user.email.trim().toLowerCase()));
  for (const learner of matchingUsers) {
    const existing = await db.select({ id: communicationReceipts.id }).from(communicationReceipts)
      .where(and(eq(communicationReceipts.communicationId, communicationId), eq(communicationReceipts.userId, learner.id))).limit(1);
    if (!existing.length) await db.insert(communicationReceipts).values({ communicationId, userId: learner.id });
  }
  return matchingUsers.length;
}

export async function getLearnerCommunications(userId: number, limit = 100): Promise<LearnerCommunication[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [sentCommunications, receipts] = await Promise.all([
    db.select().from(communications).where(eq(communications.status, "sent")).orderBy(desc(communications.sentAt)).limit(limit),
    db.select().from(communicationReceipts).where(eq(communicationReceipts.userId, userId)),
  ]);
  const receiptByCommunication = new Map(receipts.map((receipt) => [receipt.communicationId, receipt]));
  return sentCommunications
    .filter((communication) => receiptByCommunication.has(communication.id) || isUniversalCommunication(communication.recipientFilter))
    .map((communication) => {
      const receipt = receiptByCommunication.get(communication.id);
      return {
        id: communication.id,
        subject: communication.subject,
        body: communication.body,
        type: communication.type,
        isImportant: communication.isImportant,
        sentAt: communication.sentAt,
        createdAt: communication.createdAt,
        isRead: Boolean(receipt?.readAt),
        isAcknowledged: Boolean(receipt?.acknowledgedAt),
      };
    });
}

async function getVisibleLearnerCommunication(userId: number, communicationId: number) {
  const messages = await getLearnerCommunications(userId);
  return messages.find((message) => message.id === communicationId) || null;
}

async function upsertLearnerReceipt(userId: number, communicationId: number, acknowledged = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = new Date();
  const existing = await db.select({ id: communicationReceipts.id, acknowledgedAt: communicationReceipts.acknowledgedAt }).from(communicationReceipts)
    .where(and(eq(communicationReceipts.userId, userId), eq(communicationReceipts.communicationId, communicationId))).limit(1);
  if (existing.length) {
    await db.update(communicationReceipts).set({ readAt: now, ...(acknowledged ? { acknowledgedAt: existing[0].acknowledgedAt || now } : {}) }).where(eq(communicationReceipts.id, existing[0].id));
    return;
  }
  await db.insert(communicationReceipts).values({ communicationId, userId, readAt: now, ...(acknowledged ? { acknowledgedAt: now } : {}) });
}

export async function markLearnerCommunicationRead(userId: number, communicationId: number) {
  const message = await getVisibleLearnerCommunication(userId, communicationId);
  if (!message) return null;
  await upsertLearnerReceipt(userId, communicationId);
  return { success: true };
}

export async function acknowledgeLearnerCommunication(userId: number, communicationId: number) {
  const message = await getVisibleLearnerCommunication(userId, communicationId);
  if (!message || !message.isImportant) return null;
  await upsertLearnerReceipt(userId, communicationId, true);
  return { success: true };
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

export type CommunicationRecipientFilter = CommunicationRecipientFilterInput;
export type CommunicationCourseOption = { id: string; title: string; certificationId?: string; lessonCount: number };

let courseOptionsPromise: Promise<CommunicationCourseOption[]> | null = null;

async function getCommunicationCourseOptionsInternal(): Promise<CommunicationCourseOption[]> {
  const coursesDir = path.resolve(import.meta.dirname, "../client/public/data/courses");
  const files = (await fs.readdir(coursesDir)).filter((file) => file.endsWith(".json"));
  const courses = await Promise.all(files.map(async (file) => {
    const course = JSON.parse(await fs.readFile(path.join(coursesDir, file), "utf8"));
    const id = String(course.courseId || file.replace(/\.json$/, ""));
    return {
      id,
      title: String(course.sourceCourseTitle || course.title?.fr || course.title?.en || id),
      certificationId: course.certificationId ? String(course.certificationId) : undefined,
      lessonCount: Array.isArray(course.lessons) ? course.lessons.length : 0,
    };
  }));
  return courses.filter((course) => course.lessonCount > 0).sort((a, b) => a.title.localeCompare(b.title, "fr"));
}

async function getCommunicationCourseOptions() {
  courseOptionsPromise ||= getCommunicationCourseOptionsInternal().catch((error) => {
    courseOptionsPromise = null;
    throw error;
  });
  return courseOptionsPromise;
}

export async function getCommunicationSegmentOptions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [courses, allUsers, invitations] = await Promise.all([
    getCommunicationCourseOptions(),
    db.select({ email: users.email, name: users.name, blocked: users.blocked }).from(users).where(eq(users.role, "user")),
    db.select({ email: userInvitations.email, name: userInvitations.name, status: userInvitations.status }).from(userInvitations),
  ]);
  const recipients = new Map<string, { email: string; name: string | null; source: "learner" | "invitation" }>();
  for (const user of allUsers) {
    if (user.email?.trim() && !user.blocked) recipients.set(user.email.trim().toLowerCase(), { email: user.email.trim().toLowerCase(), name: user.name, source: "learner" });
  }
  for (const invitation of invitations) {
    if (invitation.status === "pending" && invitation.email.trim()) {
      const email = invitation.email.trim().toLowerCase();
      if (!recipients.has(email)) recipients.set(email, { email, name: invitation.name, source: "invitation" });
    }
  }
  return { courses, recipients: Array.from(recipients.values()).sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email, "fr")) };
}

type Recipient = { id?: number; email: string; name: string | null };

/** Résout un segment sur des destinataires uniques sans déclencher d’envoi. */
export async function getRecipientsByFilter(filter: CommunicationRecipientFilter = {}): Promise<Recipient[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const audience = filter.audience || "all";
  let taggedUserIds: Set<number> | null = null;

  // Filter by tags
  if (filter.tags && filter.tags.length > 0) {
    const taggedUsers = await db.select({ userId: userTags.userId }).from(userTags)
      .where(inArray(userTags.tagId, filter.tags));
    taggedUserIds = new Set(taggedUsers.map(t => t.userId));
  }

  const [allUsers, invitations, progressRows, learningEventRows, certificationRows, contributionRows, courseOptions] = await Promise.all([
    db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
    blocked: users.blocked,
    }).from(users),
    db.select({ email: userInvitations.email, name: userInvitations.name, status: userInvitations.status }).from(userInvitations),
    db.select({ userId: trainingProgress.userId, courseId: trainingProgress.courseId, lessonIndex: trainingProgress.lessonIndex, completedAt: trainingProgress.completedAt }).from(trainingProgress),
    db.select({ userId: learningEvents.userId, courseId: learningEvents.courseId, createdAt: learningEvents.createdAt }).from(learningEvents),
    db.select({ userId: learnerAchievements.userId }).from(learnerAchievements).where(eq(learnerAchievements.kind, "certification")),
    db.select({ userId: learnerCompetencyContributions.userId, competencyId: learnerCompetencyContributions.competencyId, points: learnerCompetencyContributions.points }).from(learnerCompetencyContributions),
    filter.courseId ? getCommunicationCourseOptions() : Promise.resolve([] as CommunicationCourseOption[]),
  ]);

  let matchingUsers = allUsers.filter((user) => user.email && user.email.trim() !== "" && !user.blocked);
  if (filter.role && filter.role.length > 0) {
    matchingUsers = matchingUsers.filter((user) => filter.role!.includes(user.role));
  }
  if (taggedUserIds !== null) {
    matchingUsers = matchingUsers.filter((user) => taggedUserIds!.has(user.id));
  }

  const invitationEmails = new Set(invitations.map((invitation) => invitation.email.toLowerCase()));
  const progressedUserIds = new Set(progressRows.map((row) => row.userId));
  const diplomaUserIds = new Set(certificationRows.map((row) => row.userId));
  const competencyLevels = new Map<number, number>();
  if (filter.competencyId) {
    for (const contribution of contributionRows) {
      if (contribution.competencyId === filter.competencyId) {
        competencyLevels.set(contribution.userId, (competencyLevels.get(contribution.userId) || 0) + Number(contribution.points));
      }
    }
  }

  const competencyUserIds = filter.competencyId
    ? new Set(Array.from(competencyLevels.entries())
      .filter(([, level]) => level >= Math.max(0, Math.min(100, filter.minCompetencyLevel ?? 0)))
      .map(([userId]) => userId))
    : null;
  let courseUserIds: Set<number> | null = null;
  if (filter.courseId) {
    const course = courseOptions.find((item) => item.id === filter.courseId);
    const activityByUser = new Map<number, { first: Date; last: Date; lessons: Set<number> }>();
    const recordActivity = (userId: number, timestamp: Date | null, lessonIndex?: number | null) => {
      if (!timestamp) return;
      const current = activityByUser.get(userId) || { first: timestamp, last: timestamp, lessons: new Set<number>() };
      if (timestamp < current.first) current.first = timestamp;
      if (timestamp > current.last) current.last = timestamp;
      if (typeof lessonIndex === "number") current.lessons.add(lessonIndex);
      activityByUser.set(userId, current);
    };
    for (const progress of progressRows) if (progress.courseId === filter.courseId) recordActivity(progress.userId, progress.completedAt, progress.lessonIndex);
    for (const event of learningEventRows) if (event.courseId === filter.courseId) recordActivity(event.userId, event.createdAt);
    const since = filter.activityWithinDays ? new Date(Date.now() - Math.min(365, Math.max(1, filter.activityWithinDays)) * 86_400_000) : null;
    courseUserIds = new Set(Array.from(activityByUser.entries()).filter(([,
      activity,
    ]) => {
      if (!course) return false;
      const completed = activity.lessons.size >= course.lessonCount;
      if (filter.courseProgressStatus === "completed" && !completed) return false;
      if (filter.courseProgressStatus === "started" && completed) return false;
      const relevantDate = filter.courseProgressStatus === "started" ? activity.first : activity.last;
      return !since || relevantDate >= since;
    }).map(([userId]) => userId));
  }
  const manualEmails = filter.manualEmails?.length
    ? new Set(filter.manualEmails.map((email) => email.trim().toLowerCase()).filter(Boolean))
    : null;

  let recipients: Recipient[];
  if (audience === "manual") {
    recipients = Array.from(manualEmails || []).map((email) => ({ email, name: null }));
  } else if (audience === "invited") {
    recipients = invitations
      .filter((invitation) => !filter.status?.length || filter.status.includes(invitation.status))
      .map((invitation) => ({ email: invitation.email, name: invitation.name }));
    // A pending invitation has no learning record. A course criterion therefore
    // yields no result rather than silently ignoring the requested condition.
    if (filter.courseId && filter.criteriaLogic !== "any") recipients = [];
  } else {
    if (audience === "registered_invitees") matchingUsers = matchingUsers.filter((user) => invitationEmails.has(user.email!.toLowerCase()));
    if (audience === "learners_inactive") matchingUsers = matchingUsers.filter((user) => !progressedUserIds.has(user.id));
    if (audience === "learners_started") matchingUsers = matchingUsers.filter((user) => progressedUserIds.has(user.id));
    if (audience === "diploma_holders") matchingUsers = matchingUsers.filter((user) => diplomaUserIds.has(user.id));
    if (audience === "competency_level") {
      matchingUsers = matchingUsers.filter((user) => Boolean(filter.competencyId) && competencyUserIds?.has(user.id));
    }
    recipients = matchingUsers.map((user) => ({ id: user.id, email: user.email!, name: user.name }));
    if (audience === "all") recipients.push(...invitations.filter((invitation) => invitation.status === "pending").map((invitation) => ({ email: invitation.email, name: invitation.name })));
  }

  const criterionPredicates: Array<(recipient: Recipient) => boolean> = [];
  if (courseUserIds !== null) criterionPredicates.push((recipient) => Boolean(recipient.id && courseUserIds!.has(recipient.id)));
  if (competencyUserIds !== null && audience !== "competency_level") criterionPredicates.push((recipient) => Boolean(recipient.id && competencyUserIds!.has(recipient.id)));
  if (manualEmails !== null) criterionPredicates.push((recipient) => manualEmails!.has(recipient.email.trim().toLowerCase()));
  if (criterionPredicates.length > 0) {
    const useAny = filter.criteriaLogic === "any";
    recipients = recipients.filter((recipient) => useAny
      ? criterionPredicates.some((predicate) => predicate(recipient))
      : criterionPredicates.every((predicate) => predicate(recipient)));
  }

  const unique = new Map<string, Recipient>();
  for (const recipient of recipients) {
    const email = recipient.email.trim().toLowerCase();
    if (email) unique.set(email, { ...recipient, email });
  }
  return Array.from(unique.values());
}

export async function getRecipientPreview(filter: CommunicationRecipientFilter = {}) {
  const recipients = await getRecipientsByFilter(filter);
  return { count: recipients.length, sample: recipients.slice(0, 5) };
}
