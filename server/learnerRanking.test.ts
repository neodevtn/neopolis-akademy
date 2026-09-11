import { describe, expect, it } from "vitest";
import { compareLearnerRanking } from "./learnerRanking";

describe("compareLearnerRanking", () => {
  it("orders by completed lessons before any other criterion", () => {
    const rows = [
      { id: 1, lessonsCompleted: 8, examStats: { passed: 1, bestScore: 1000 }, lastActivityAt: new Date("2026-09-11") },
      { id: 2, lessonsCompleted: 9, examStats: { passed: 0, bestScore: 0 }, lastActivityAt: new Date("2026-09-01") },
    ];
    expect(rows.sort(compareLearnerRanking).map((row) => row.id)).toEqual([2, 1]);
  });

  it("uses exams, score, activity, then a stable identifier to break ties", () => {
    const rows = [
      { id: 4, lessonsCompleted: 10, examStats: { passed: 1, bestScore: 900 }, lastActivityAt: new Date("2026-09-01") },
      { id: 3, lessonsCompleted: 10, examStats: { passed: 1, bestScore: 900 }, lastActivityAt: new Date("2026-09-02") },
      { id: 2, lessonsCompleted: 10, examStats: { passed: 1, bestScore: 950 }, lastActivityAt: new Date("2026-08-01") },
      { id: 1, lessonsCompleted: 10, examStats: { passed: 2, bestScore: 700 }, lastActivityAt: null },
    ];
    expect(rows.sort(compareLearnerRanking).map((row) => row.id)).toEqual([1, 2, 3, 4]);
  });
});
