import { describe, expect, it } from "vitest";
import { displayCourseFeedbackRating } from "./AdminTraining";

describe("displayCourseFeedbackRating", () => {
  it("borne les anciennes notes à l’échelle publique de trois étoiles", () => {
    expect(displayCourseFeedbackRating(5)).toBe(3);
    expect(displayCourseFeedbackRating(-2)).toBe(0);
    expect(displayCourseFeedbackRating("2")).toBe(2);
  });

  it("gère les valeurs invalides sans produire une longueur négative", () => {
    expect(displayCourseFeedbackRating(undefined)).toBe(0);
    expect(displayCourseFeedbackRating(Number.NaN)).toBe(0);
  });

  it("ne transmet jamais de profondeur négative ou incohérente à String.repeat", () => {
    for (const value of [-12, -0.8, 9, Number.POSITIVE_INFINITY, "niveau-inconnu"]) {
      const rating = displayCourseFeedbackRating(value);
      expect(rating).toBeGreaterThanOrEqual(0);
      expect(rating).toBeLessThanOrEqual(3);
      expect(() => `${"★".repeat(rating)}${"☆".repeat(3 - rating)}`).not.toThrow();
    }
  });
});
