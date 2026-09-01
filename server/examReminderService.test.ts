import { describe, expect, it, vi } from "vitest";
import catalog from "../client/src/data/trainingIndex.json";
import { buildExamReminderHtml, buildExamReminderText } from "./email";
import { runExamReminderJob, selectEligibleExamReminderCandidates } from "./examReminderService";

type Snapshot = Parameters<typeof selectEligibleExamReminderCandidates>[0];
type Course = { id: string; certId?: string; lessonCount?: number };

const examConfig = (catalog as { examConfig: Record<string, { totalQuestions?: number; timeLimit?: number; passingScore?: number }> }).examConfig;
const certificationId = Object.keys(examConfig)[0]!;
const courses = (catalog as { courses: Course[] }).courses.filter((course) => course.certId === certificationId);
const now = new Date("2026-09-01T09:00:00.000Z");
const completedAt = new Date(now.getTime() - 25 * 60 * 60 * 1000);

function completeLessons(courseList = courses, at = completedAt) {
  return courseList.flatMap((course) => Array.from({ length: Math.max(1, course.lessonCount || 1) }, (_, lessonIndex) => ({
    userId: 701,
    certificationId,
    courseId: course.id,
    lessonIndex,
    completedAt: at,
  })));
}

function eligibleSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    learners: [{ id: 701, name: "Ari Test", email: "ari@example.invalid", blocked: 0 }],
    lessonCompletions: completeLessons(),
    chapterCompletions: [],
    attempts: [],
    reminders: [],
    ...overrides,
  };
}

describe("relance automatique des examens blancs", () => {
  it("ignore une formation sans configuration d’examen réellement déclarée", () => {
    const snapshot = eligibleSnapshot({
      lessonCompletions: [{ userId: 701, certificationId: "formation_sans_examen", courseId: "cours_sans_examen", lessonIndex: 0, completedAt }],
    });
    expect(selectEligibleExamReminderCandidates(snapshot, now)).toEqual([]);
  });

  it("sélectionne seulement une formation achevée depuis au moins 24 heures et expose les métadonnées canoniques", () => {
    const [candidate] = selectEligibleExamReminderCandidates(eligibleSnapshot(), now);
    expect(candidate).toMatchObject({
      userId: 701,
      certificationId,
      totalQuestions: examConfig[certificationId]?.totalQuestions,
      timeLimit: examConfig[certificationId]?.timeLimit,
      passingScore: examConfig[certificationId]?.passingScore,
    });
  });

  it("écarte une complétion plus récente que le délai de sécurité de 24 heures", () => {
    const recentAt = new Date(now.getTime() - 23 * 60 * 60 * 1000);
    expect(selectEligibleExamReminderCandidates(eligibleSnapshot({ lessonCompletions: completeLessons(courses, recentAt) }), now)).toEqual([]);
  });

  it("écarte une formation quand il manque une seule leçon requise", () => {
    const incomplete = completeLessons();
    incomplete.pop();
    expect(selectEligibleExamReminderCandidates(eligibleSnapshot({ lessonCompletions: incomplete }), now)).toEqual([]);
  });

  it("reconnaît une complétion mono-leçon multi-écrans uniquement après le sentinel du dernier écran", () => {
    const singleLesson = courses.find((course) => (course.lessonCount || 1) === 1);
    expect(singleLesson).toBeDefined();
    const otherCourses = courses.filter((course) => course.id !== singleLesson!.id);
    const base = eligibleSnapshot({ lessonCompletions: completeLessons(otherCourses) });
    const incomplete = selectEligibleExamReminderCandidates({
      ...base,
      chapterCompletions: [{ userId: 701, courseId: singleLesson!.id, lessonIndex: 0, chapterIndex: 4, totalChapters: 5, updatedAt: completedAt }],
    }, now);
    const complete = selectEligibleExamReminderCandidates({
      ...base,
      chapterCompletions: [{ userId: 701, courseId: singleLesson!.id, lessonIndex: 0, chapterIndex: 5, totalChapters: 5, updatedAt: completedAt }],
    }, now);
    expect(incomplete).toEqual([]);
    expect(complete).toHaveLength(1);
  });

  it("bloque la relance dès la première tentative, réussie ou non, et pour toute relance déjà créée", () => {
    const withAttempt = eligibleSnapshot({ attempts: [{ userId: 701, certificationId }] });
    const withReminder = eligibleSnapshot({ reminders: [{ userId: 701, certificationId, status: "failed" }] });
    expect(selectEligibleExamReminderCandidates(withAttempt, now)).toEqual([]);
    expect(selectEligibleExamReminderCandidates(withReminder, now)).toEqual([]);
  });

  it("écarte les comptes bloqués ou sans adresse utilisable", () => {
    expect(selectEligibleExamReminderCandidates(eligibleSnapshot({ learners: [{ id: 701, name: "Ari", email: "ari@example.invalid", blocked: 1 }] }), now)).toEqual([]);
    expect(selectEligibleExamReminderCandidates(eligibleSnapshot({ learners: [{ id: 701, name: "Ari", email: "   ", blocked: 0 }] }), now)).toEqual([]);
  });

  it("ne réenvoie jamais lors d’une réexécution si le claim atomique est déjà occupé", async () => {
    const send = vi.fn().mockResolvedValue({ delivered: true, messageId: "provider-message-id" });
    const dependencies = {
      loadSnapshot: vi.fn().mockResolvedValue(eligibleSnapshot()),
      claim: vi.fn().mockResolvedValueOnce({ id: 41 }).mockResolvedValueOnce(null),
      send,
      markSent: vi.fn().mockResolvedValue(undefined),
      markFailed: vi.fn().mockResolvedValue(undefined),
      createEmailEvent: vi.fn().mockResolvedValue(undefined),
      recordLearningEvent: vi.fn().mockResolvedValue(undefined),
    } as any;
    const first = await runExamReminderJob(dependencies, now);
    const second = await runExamReminderJob(dependencies, now);
    expect(first).toMatchObject({ eligible: 1, claimed: 1, sent: 1 });
    expect(second).toMatchObject({ eligible: 1, skippedAlreadyClaimed: 1, sent: 0 });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("génère le lien direct officiel et les métadonnées sans interpolation HTML non échappée", () => {
    const config = examConfig[certificationId]!;
    const html = buildExamReminderHtml({
      to: "not-used@example.invalid",
      firstName: "<Ari>",
      certificationTitle: "<Formation>",
      certificationId,
      totalQuestions: config.totalQuestions,
      timeLimit: config.timeLimit,
      passingScore: config.passingScore,
    });
    const text = buildExamReminderText({ to: "not-used@example.invalid", firstName: "Ari", certificationTitle: "Formation", certificationId });
    expect(html).toContain(`https://akademy.neodev.click/mock-exam/${encodeURIComponent(certificationId)}`);
    expect(html).toContain("&lt;Formation&gt;");
    expect(html).not.toContain("<Formation>");
    expect(text).toContain(`https://akademy.neodev.click/mock-exam/${encodeURIComponent(certificationId)}`);
  });
});
