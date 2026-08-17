import { describe, expect, it } from "vitest";
import { clampCompetencyLevel, DEFAULT_COMPETENCIES, DEFAULT_COMPETENCY_RULES } from "./competencyFramework";

describe("competency framework", () => {
  it("provides a graduated framework with a level cap of 100", () => {
    expect(DEFAULT_COMPETENCIES.length).toBeGreaterThanOrEqual(8);
    expect(clampCompetencyLevel(1.5)).toBe(1.5);
    expect(clampCompetencyLevel(120)).toBe(100);
    expect(clampCompetencyLevel(-5)).toBe(0);
  });

  it("uses positive fractional contribution points tied to a known competency", () => {
    const ids = new Set(DEFAULT_COMPETENCIES.map((competency) => competency.id));
    expect(DEFAULT_COMPETENCY_RULES.every((rule) => ids.has(rule.competencyId) && rule.points > 0)).toBe(true);
  });
});
