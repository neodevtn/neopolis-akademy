import { describe, expect, it } from "vitest";
import { normalizeCourseFeedbackComment, normalizeCourseRating } from "./courseFeedback";

describe("course feedback contract", () => {
  it("conserve exclusivement une note de 1 à 3 étoiles", () => {
    expect(normalizeCourseRating(0)).toBe(1);
    expect(normalizeCourseRating(1.4)).toBe(1);
    expect(normalizeCourseRating(2.2)).toBe(2);
    expect(normalizeCourseRating(9)).toBe(3);
  });

  it("nettoie les commentaires facultatifs", () => {
    expect(normalizeCourseFeedbackComment("  retour utile  ")).toBe("retour utile");
    expect(normalizeCourseFeedbackComment("   ")).toBeNull();
  });
});
