import { describe, expect, it } from "vitest";
import { isEvaluationGateLocked, requiredCorrectAnswers } from "./evaluationRules";

describe("evaluation passage rules", () => {
  it("clamps a passing threshold between one and the number of questions", () => {
    expect(requiredCorrectAnswers(3, 0)).toBe(3);
    expect(requiredCorrectAnswers(3, 2)).toBe(2);
    expect(requiredCorrectAnswers(3, 9)).toBe(3);
  });
  it("does not lock optional or review-mode evaluations", () => {
    expect(isEvaluationGateLocked({ totalQuestions: 3, completedCorrectAnswers: 0, required: false })).toBe(false);
    expect(isEvaluationGateLocked({ totalQuestions: 3, completedCorrectAnswers: 0, reviewMode: true })).toBe(false);
  });
  it("locks until the configured score is achieved", () => {
    expect(isEvaluationGateLocked({ totalQuestions: 3, completedCorrectAnswers: 1, configuredThreshold: 2 })).toBe(true);
    expect(isEvaluationGateLocked({ totalQuestions: 3, completedCorrectAnswers: 2, configuredThreshold: 2 })).toBe(false);
  });
});
