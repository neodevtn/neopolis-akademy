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

  it("uses the canonical activity total for the DataCamp n8n Marketing course", () => {
    expect(usesActivityTotals({
      group: "datacamp_partner",
      totalActivities: 23,
      totalExercises: 15,
    })).toBe(true);
  });

  it("uses the canonical activity total for the DataCamp intermediate n8n course", () => {
    expect(usesActivityTotals({
      group: "datacamp_partner",
      totalActivities: 40,
      totalExercises: 27,
    })).toBe(true);
  });

  it("uses the canonical activity total for the DataCamp Gemini Meet course", () => {
    expect(usesActivityTotals({
      group: "datacamp_partner",
      totalActivities: 10,
      totalExercises: 5,
    })).toBe(true);
  });

  it("uses the canonical activity total for the DataCamp Gemini Sheets course", () => {
    expect(usesActivityTotals({
      group: "datacamp_partner",
      totalActivities: 7,
      totalExercises: 3,
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
