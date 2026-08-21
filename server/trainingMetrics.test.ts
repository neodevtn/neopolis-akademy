import { describe, expect, it } from "vitest";
import { usesActivityTotals } from "../shared/trainingMetrics";

describe("usesActivityTotals", () => {
  it("uses total activities for an n8n-style course that explicitly labels activities", () => {
    expect(usesActivityTotals({
      group: "bi_data_analytics",
      exerciseLabel: { en: "activities", fr: "activités" },
      totalActivities: 32,
      totalExercises: 22,
    })).toBe(true);
  });

  it("keeps exercise totals for a certification that does not declare screen-level activities", () => {
    expect(usesActivityTotals({
      group: "anthropic_certifications",
      exerciseLabel: { en: "exercises", fr: "exercices" },
      totalActivities: 0,
      totalExercises: 12,
    })).toBe(false);
  });
});
