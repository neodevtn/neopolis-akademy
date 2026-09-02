import { describe, expect, it } from "vitest";
import { buildRecentDailyActivity, summarizeLearningActivity } from "./learningActivityAudit";

describe("learningActivityAudit", () => {
  const events = [
    { courseId: "course_a", eventType: "learning_time", durationSeconds: 120, createdAt: "2026-08-20T10:00:00.000Z" },
    { courseId: "course_a", eventType: "chapter_progress", durationSeconds: 0, createdAt: "2026-08-21T10:00:00.000Z" },
    { courseId: "course_b", eventType: "learning_time", durationSeconds: 60, createdAt: "2026-08-22T10:00:00.000Z" },
  ];

  it("agrège le temps actif et les événements par cours, sans confondre la progression avec du temps", () => {
    const summary = summarizeLearningActivity(events);

    expect(summary.activeDays).toBe(3);
    expect(summary.courseActivity).toHaveLength(2);
    expect(summary.courseActivity[0]).toMatchObject({ courseId: "course_b", activeSeconds: 60, eventCount: 1 });
    expect(summary.courseActivity[1]).toMatchObject({ courseId: "course_a", activeSeconds: 120, eventCount: 2 });
  });

  it("prépare une série de jours continus incluant les jours sans activité", () => {
    const days = buildRecentDailyActivity(events, 3, new Date("2026-08-22T12:00:00.000Z"));

    expect(days).toHaveLength(3);
    expect(days.map((day) => day.durationSeconds)).toEqual([120, 0, 60]);
    expect(days.map((day) => day.eventCount)).toEqual([1, 1, 1]);
  });

  it("borne un heartbeat anormal avant qu’il atteigne un graphique", () => {
    const summary = summarizeLearningActivity([
      { courseId: "course_a", eventType: "learning_time", durationSeconds: 900, createdAt: "2026-08-22T10:00:00.000Z" },
    ]);

    expect(summary.courseActivity[0]).toMatchObject({ activeSeconds: 300 });
  });
});
