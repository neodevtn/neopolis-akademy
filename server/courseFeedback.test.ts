import { describe, expect, it } from "vitest";
import { isCriticalCourseFeedback, normalizeCourseFeedbackComment, normalizeCourseRating } from "../shared/courseFeedback";

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

  it("flags low ratings and recommendation scores as critical", () => {
    expect(isCriticalCourseFeedback({ rating: 2, contentRating: 4, recommendScore: 8 })).toBe(true);
    expect(isCriticalCourseFeedback({ rating: 4, experienceRating: 2, recommendScore: 8 })).toBe(true);
    expect(isCriticalCourseFeedback({ rating: 4, contentRating: 4, recommendScore: 3 })).toBe(true);
    expect(isCriticalCourseFeedback({ rating: 4, contentRating: 3, experienceRating: 3, recommendScore: 5 })).toBe(false);
  });
});
