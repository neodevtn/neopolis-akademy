import { describe, expect, it } from "vitest";
import { buildExamMonitoringSummary, examAttemptStatus, examDurationSeconds, examScorePercent } from "./examMonitoring";

const attempts = [
  { id: 1, userId: 10, certificationId: "a", score: 800, totalQuestions: 10, correctAnswers: 8, passed: 1, timedOut: 0, startedAt: new Date("2026-01-01T10:00:00Z"), finishedAt: new Date("2026-01-01T10:20:00Z"), timeLimitMinutes: 30 },
  { id: 2, userId: 10, certificationId: "a", score: 600, totalQuestions: 10, correctAnswers: 6, passed: 0, timedOut: 1, startedAt: new Date("2026-01-02T10:00:00Z"), finishedAt: new Date("2026-01-02T10:31:00Z"), timeLimitMinutes: 30 },
  { id: 3, userId: 11, certificationId: "b", score: 500, totalQuestions: 10, correctAnswers: 5, passed: 0, timedOut: 0, startedAt: new Date("2026-01-03T10:00:00Z"), finishedAt: new Date("2026-01-03T10:10:00Z"), timeLimitMinutes: null },
] as const;

describe("exam monitoring calculations", () => {
  it("identifies passed, failed and expired attempts without inferring expiration", () => {
    expect(attempts.map(examAttemptStatus)).toEqual(["passed", "timed_out", "failed"]);
  });

  it("calculates elapsed duration and bounded score percentage", () => {
    expect(examDurationSeconds(attempts[0])).toBe(1200);
    expect(examScorePercent(800)).toBe(80);
    expect(examScorePercent(1500)).toBe(100);
  });

  it("aggregates attempts, unique learners, score and pass rate", () => {
    expect(buildExamMonitoringSummary([...attempts])).toMatchObject({
      attemptCount: 3,
      uniqueLearners: 2,
      passedCount: 1,
      failedCount: 2,
      timedOutCount: 1,
      passRate: 33.3,
      averageScore: 633,
      averagePercent: 63,
      averageDurationSeconds: 1220,
    });
  });
});
