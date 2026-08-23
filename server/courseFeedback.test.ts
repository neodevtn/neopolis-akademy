import { describe, expect, it } from "vitest";
import { normalizeCourseFeedbackComment, normalizeCourseRating } from "../shared/courseFeedback";

describe("course feedback normalization", () => {
  it("preserves the five-star scale while clamping invalid ratings", () => {
    expect(normalizeCourseRating(5)).toBe(5);
    expect(normalizeCourseRating(4.4)).toBe(4);
    expect(normalizeCourseRating(0)).toBe(1);
    expect(normalizeCourseRating(9)).toBe(5);
  });

  it("normalizes optional comments and suggestions", () => {
    expect(normalizeCourseFeedbackComment("  Proposition utile  ")).toBe("Proposition utile");
    expect(normalizeCourseFeedbackComment("   ")).toBeNull();
    expect(normalizeCourseFeedbackComment()).toBeNull();
  });
});
