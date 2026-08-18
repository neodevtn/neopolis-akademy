import { describe, expect, it } from "vitest";
import { assessLearningIntegrity } from "./integritySignals";

describe("signaux d’intégrité pédagogique", () => {
  it("demande une revue quand plusieurs validations réussies se suivent anormalement vite", () => {
    const start = new Date("2026-08-18T10:00:00Z").getTime();
    const result = assessLearningIntegrity({
      events: Array.from({ length: 6 }, (_, index) => ({ eventType: "lesson_completed", success: 1, score: null, attemptNumber: null, durationSeconds: 0, createdAt: new Date(start + index * 60_000) })),
      watchedVideoCount: 0,
      exerciseResults: [],
    });
    expect(result.riskScore).toBe(35);
    expect(result.level).toBe("review");
    expect(result.signals[0]?.id).toBe("rapid_success_chain");
  });

  it("ne qualifie jamais un signal comme preuve d’utilisation d’IA ou blocage automatique", () => {
    const result = assessLearningIntegrity({ events: [], watchedVideoCount: 0, exerciseResults: [] });
    expect(result.level).toBe("none");
    expect(result.message).toContain("ne prouvent pas");
  });
});
