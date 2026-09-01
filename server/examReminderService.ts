import trainingIndex from "../client/src/data/trainingIndex.json";
import {
  claimExamReminder,
  createEmailEvent,
  getExamReminderSnapshot,
  markExamReminderFailed,
  markExamReminderSent,
  recordLearningEvent,
} from "./db";
import { sendExamReminderEmail } from "./email";

const REMINDER_DELAY_MS = 24 * 60 * 60 * 1000;

type CatalogTitle = string | { fr?: string; en?: string } | null | undefined;
type Completion = { userId: number; certificationId: string; courseId: string; lessonIndex: number; completedAt: Date };
type ChapterCompletion = { userId: number; courseId: string; lessonIndex: number; chapterIndex: number; totalChapters: number; updatedAt: Date };

export type ExamReminderCandidate = {
  userId: number;
  email: string;
  firstName: string;
  certificationId: string;
  certificationTitle: string;
  totalQuestions?: number;
  timeLimit?: number;
  passingScore?: number;
  completionQualifiedAt: Date;
};

type ReminderSnapshot = Awaited<ReturnType<typeof getExamReminderSnapshot>>;

function titleForLocale(title: CatalogTitle, locale: "fr" | "en" = "fr") {
  if (typeof title === "string") return title;
  return title?.[locale] || title?.fr || title?.en || "Formation certifiante";
}

function firstNameFromName(name: string | null) {
  return name?.trim().split(/\s+/)[0] || "";
}

function maxDate(dates: Date[]) {
  return new Date(Math.max(...dates.map((date) => date.getTime())));
}

/**
 * Mirrors the learner UI safely. A single LMS lesson that has multiple screens
 * must reach its chapter sentinel. Chapter data is mapped to multiple lessons
 * only when the persisted total equals the current course lesson count.
 */
function completedCourseAt({
  userId,
  courseId,
  lessonCount,
  lessonCompletions,
  chapterCompletions,
}: {
  userId: number;
  courseId: string;
  lessonCount: number;
  lessonCompletions: Completion[];
  chapterCompletions: ChapterCompletion[];
}): Date | null {
  const uniqueLessons = new Map<number, Date>();
  for (const completion of lessonCompletions) {
    if (completion.userId === userId && completion.courseId === courseId) {
      const prior = uniqueLessons.get(completion.lessonIndex);
      if (!prior || prior.getTime() < completion.completedAt.getTime()) uniqueLessons.set(completion.lessonIndex, completion.completedAt);
    }
  }
  const chapter = chapterCompletions.find((entry) => entry.userId === userId && entry.courseId === courseId && entry.lessonIndex === 0);
  if (lessonCount === 1 && chapter && chapter.totalChapters > 1) {
    return chapter.chapterIndex >= chapter.totalChapters ? chapter.updatedAt : null;
  }
  if (uniqueLessons.size >= lessonCount) return maxDate(Array.from(uniqueLessons.values()));
  if (lessonCount > 1 && chapter && chapter.totalChapters === lessonCount && chapter.chapterIndex >= lessonCount) {
    return chapter.updatedAt;
  }
  return null;
}

export function selectEligibleExamReminderCandidates(snapshot: ReminderSnapshot, now = new Date()): ExamReminderCandidate[] {
  const catalog = trainingIndex as {
    certifications: Array<{ id: string; title?: CatalogTitle }>;
    courses: Array<{ id: string; certId?: string; lessonCount?: number }>;
    examConfig?: Record<string, { title?: CatalogTitle; totalQuestions?: number; timeLimit?: number; passingScore?: number }>;
  };
  const threshold = new Date(now.getTime() - REMINDER_DELAY_MS);
  const examConfigs = catalog.examConfig || {};
  const attemptedPairs = new Set(snapshot.attempts.map((attempt: { userId: number; certificationId: string }) => `${attempt.userId}:${attempt.certificationId}`));
  const remindedPairs = new Set(snapshot.reminders.map((reminder: { userId: number; certificationId: string }) => `${reminder.userId}:${reminder.certificationId}`));
  const candidates: ExamReminderCandidate[] = [];

  for (const learner of snapshot.learners) {
    const email = learner.email?.trim();
    if (learner.blocked || !email) continue;
    for (const [certificationId, exam] of Object.entries(examConfigs)) {
      const pairKey = `${learner.id}:${certificationId}`;
      if (attemptedPairs.has(pairKey) || remindedPairs.has(pairKey)) continue;
      const courses = catalog.courses.filter((course) => course.certId === certificationId);
      if (!courses.length) continue;
      const completedAt = courses.map((course) => completedCourseAt({
        userId: learner.id,
        courseId: course.id,
        lessonCount: Math.max(1, course.lessonCount || 1),
        lessonCompletions: snapshot.lessonCompletions,
        chapterCompletions: snapshot.chapterCompletions,
      }));
      if (completedAt.some((date) => !date)) continue;
      const completionQualifiedAt = maxDate(completedAt as Date[]);
      if (completionQualifiedAt.getTime() > threshold.getTime()) continue;
      const certification = catalog.certifications.find((item) => item.id === certificationId);
      candidates.push({
        userId: learner.id,
        email,
        firstName: firstNameFromName(learner.name),
        certificationId,
        certificationTitle: titleForLocale(exam.title || certification?.title),
        totalQuestions: exam.totalQuestions,
        timeLimit: exam.timeLimit,
        passingScore: exam.passingScore,
        completionQualifiedAt,
      });
    }
  }
  return candidates;
}

type ReminderDependencies = {
  loadSnapshot: () => Promise<ReminderSnapshot>;
  claim: typeof claimExamReminder;
  send: typeof sendExamReminderEmail;
  markSent: typeof markExamReminderSent;
  markFailed: typeof markExamReminderFailed;
  createEmailEvent: typeof createEmailEvent;
  recordLearningEvent: typeof recordLearningEvent;
};

const defaultDependencies: ReminderDependencies = {
  loadSnapshot: getExamReminderSnapshot,
  claim: claimExamReminder,
  send: sendExamReminderEmail,
  markSent: markExamReminderSent,
  markFailed: markExamReminderFailed,
  createEmailEvent,
  recordLearningEvent,
};

export async function runExamReminderJob(
  dependencies: ReminderDependencies = defaultDependencies,
  now = new Date(),
) {
  const candidates = selectEligibleExamReminderCandidates(await dependencies.loadSnapshot(), now);
  let claimed = 0;
  let sent = 0;
  let skippedAlreadyClaimed = 0;
  let failed = 0;

  for (const candidate of candidates) {
    const claim = await dependencies.claim({
      userId: candidate.userId,
      certificationId: candidate.certificationId,
      completionQualifiedAt: candidate.completionQualifiedAt,
    });
    if (!claim) {
      skippedAlreadyClaimed += 1;
      continue;
    }
    claimed += 1;
    try {
      const delivery = await dependencies.send({
        to: candidate.email,
        firstName: candidate.firstName,
        certificationTitle: candidate.certificationTitle,
        certificationId: candidate.certificationId,
        totalQuestions: candidate.totalQuestions,
        timeLimit: candidate.timeLimit,
        passingScore: candidate.passingScore,
        language: "fr",
      });
      if (!delivery.delivered) {
        await dependencies.markFailed(claim.id);
        failed += 1;
        continue;
      }
      await dependencies.markSent(claim.id, delivery.messageId);
      if (delivery.messageId) await dependencies.createEmailEvent(delivery.messageId, "sent", candidate.email, "exam_reminder");
      await dependencies.recordLearningEvent({
        userId: candidate.userId,
        eventType: "exam_reminder_sent",
        certificationId: candidate.certificationId,
        metadata: { reminderId: claim.id },
      });
      sent += 1;
    } catch {
      // Do not retry automatically after an ambiguous provider outcome.
      await dependencies.markFailed(claim.id);
      failed += 1;
    }
  }
  return { eligible: candidates.length, claimed, sent, failed, skippedAlreadyClaimed };
}

export const examReminderConstants = { reminderDelayMs: REMINDER_DELAY_MS, examReminderUrl: "https://akademy.neodev.click/mock-exam/" };
