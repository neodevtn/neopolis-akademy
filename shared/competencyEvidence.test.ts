import { describe, expect, it } from "vitest";
import { describeMissingCompetencyEvidence, scoreCompetencyEvidence } from "./competencyEvidence";

function entries(count: number, points: number, options: { sources?: number; type?: string; certification?: boolean; badge?: boolean } = {}) {
  const sources = options.sources || 1;
  const rows = Array.from({ length: count }, (_, index) => ({
    sourceType: options.type || "checkpoint_passed",
    sourceKey: `course-${index % sources}`,
    points,
  }));
  if (options.badge) rows.push({ sourceType: "skill_badge", sourceKey: "badge-course", points: 1 });
  if (options.certification) rows.push({ sourceType: "certification", sourceKey: "certification-course", points: 6 });
  return rows;
}

describe("competency evidence policy", () => {
  it("refuse un rang élevé fondé sur une seule source répétée", () => {
    const summary = scoreCompetencyEvidence(entries(50, 1, { sources: 1 }));
    expect(summary.rawPoints).toBe(50);
    expect(summary.highestVerifiedRank).toBe("emerging");
    expect(summary.level).toBe(19.9);
    expect(describeMissingCompetencyEvidence(summary)).toContain("1 formation(s) ou source(s) distincte(s)");
  });

  it("exige une certification et plusieurs formes de preuve pour le rang Or", () => {
    const withoutCertification = scoreCompetencyEvidence([
      ...entries(36, 2, { sources: 8 }),
      ...entries(8, 1, { sources: 4, type: "quiz_passed", badge: true }),
    ]);
    expect(withoutCertification.highestVerifiedRank).toBe("silver");
    expect(withoutCertification.level).toBe(79.9);

    const certified = scoreCompetencyEvidence([
      ...entries(36, 2, { sources: 8 }),
      ...entries(8, 1, { sources: 4, type: "quiz_passed", badge: true, certification: true }),
    ]);
    expect(certified.highestVerifiedRank).toBe("gold");
    expect(certified.level).toBeGreaterThanOrEqual(80);
  });
});
