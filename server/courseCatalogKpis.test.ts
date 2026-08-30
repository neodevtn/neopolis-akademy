import { describe, expect, it } from "vitest";
import { buildCourseCatalogKpis } from "./courseCatalogKpis";

describe("buildCourseCatalogKpis", () => {
  it("calculates popularity, current engagement and inactivity-based abandonment from persisted course events", () => {
    const now = new Date("2026-08-30T12:00:00.000Z");
    const result = buildCourseCatalogKpis({
      courses: [{ courseId: "course-a", lessonsCount: 2 }, { courseId: "course-empty", lessonsCount: 1 }],
      events: [
        { userId: 1, courseId: "course-a", eventType: "learning_time", durationSeconds: 1800, createdAt: new Date("2026-08-29T12:00:00.000Z") },
        { userId: 2, courseId: "course-a", eventType: "lesson_started", createdAt: new Date("2026-08-01T12:00:00.000Z") },
        { userId: 3, courseId: "course-a", eventType: "learning_time", durationSeconds: 600, createdAt: new Date("2026-08-25T12:00:00.000Z") },
      ],
      chapterProgress: [{ userId: 3, courseId: "course-a", updatedAt: new Date("2026-08-28T12:00:00.000Z") }],
      completions: [
        { userId: 1, courseId: "course-a", lessonIndex: 0, completedAt: new Date("2026-08-29T12:00:00.000Z") },
        { userId: 1, courseId: "course-a", lessonIndex: 1, completedAt: new Date("2026-08-29T12:00:00.000Z") },
      ],
      videoProgress: [],
      now,
    });

    expect(result["course-a"]).toEqual({
      hasData: true,
      uniqueStarters: 3,
      activeLearners30d: 3,
      activeMinutes30d: 40,
      completedLearners: 1,
      abandonedLearners: 1,
      abandonmentRate: 33.3,
    });
    expect(result["course-empty"]).toEqual({ hasData: false, uniqueStarters: 0, activeLearners30d: 0, activeMinutes30d: 0, completedLearners: 0, abandonedLearners: 0, abandonmentRate: null });
  });
});
