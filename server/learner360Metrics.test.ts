import { describe, expect, it } from "vitest";
import { buildLearner360Metrics, buildLearnerCertificationProgress } from "./learner360Metrics";

describe("buildLearner360Metrics", () => {
  it("dédoublonne les progrès et compte les écrans réels plutôt que les simples lignes de suivi", () => {
    const metrics = buildLearner360Metrics({
      courses: [{ id: "multi", lessonCount: 3 }, { id: "single", lessonCount: 1 }],
      lessons: [
        { certificationId: "cert", courseId: "multi", lessonIndex: 0 },
        { certificationId: "cert", courseId: "multi", lessonIndex: 0 },
        { certificationId: "cert", courseId: "single", lessonIndex: 0 },
      ],
      chapters: [
        { courseId: "multi", lessonIndex: 0, chapterIndex: 3, totalChapters: 3 },
        { courseId: "single", lessonIndex: 0, chapterIndex: 5, totalChapters: 5 },
      ],
      videos: [{ courseId: "multi", youtubeId: "video" }, { courseId: "multi", youtubeId: "video" }],
      attempts: [],
      learningEvents: [],
    });

    expect(metrics.completedLessons).toBe(4);
    expect(metrics.completedChapters).toBe(8);
    expect(metrics.watchedVideos).toBe(1);
  });

  it("calcule la réussite sur le premier examen de chaque certification et borne le temps actif", () => {
    const metrics = buildLearner360Metrics({
      courses: [],
      lessons: [],
      chapters: [],
      videos: [],
      attempts: [
        { certificationId: "a", startedAt: "2026-01-01T10:00:00Z", finishedAt: "2026-01-01T10:05:00Z", passed: 0 },
        { certificationId: "a", startedAt: "2026-01-02T10:00:00Z", finishedAt: "2026-01-02T10:05:00Z", passed: 1 },
        { certificationId: "b", startedAt: "2026-01-01T10:00:00Z", finishedAt: "2026-01-01T10:05:00Z", passed: 1, timedOut: 1 },
      ],
      learningEvents: [
        { eventType: "learning_time", durationSeconds: 60 },
        { eventType: "learning_time", durationSeconds: 1200 },
        { eventType: "chapter_progress", durationSeconds: 600 },
      ],
    });

    expect(metrics.examAttempts).toBe(3);
    expect(metrics.firstExamPassRate).toBe(50);
    expect(metrics.timedOutExams).toBe(1);
    expect(metrics.activeSeconds).toBe(360);
  });

  it("calcule la progression de formation sans confondre un tracker de chapitre et les écrans validés", () => {
    const progress = buildLearnerCertificationProgress({
      courses: [{ id: "single", certificationId: "cert", lessonCount: 1 }, { id: "multi", certificationId: "cert", lessonCount: 3 }],
      lessons: [{ certificationId: "cert", courseId: "multi", lessonIndex: 0 }],
      chapters: [{ courseId: "single", lessonIndex: 0, chapterIndex: 4, totalChapters: 4 }, { courseId: "multi", lessonIndex: 0, chapterIndex: 3, totalChapters: 3 }],
    });

    expect(progress).toEqual([{ certificationId: "cert", completedLessons: 4, totalLessons: 4, completedCourses: 2, totalCourses: 2, completionPercent: 100 }]);
  });
});
