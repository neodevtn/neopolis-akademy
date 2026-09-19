import { describe, expect, it } from "vitest";
import catalog from "../client/src/data/trainingIndex.json";
import profiles from "../shared/trainingCompetencyProfiles.json";

const validCompetencies = new Set([
  "prompt_engineering",
  "ai_solution_design",
  "ai_development",
  "rag_knowledge",
  "ai_orchestration",
  "ai_devops",
  "bi_ai",
  "ai_governance",
  "ai_business",
]);

describe("training competency profiles", () => {
  it("couvre chaque cours du catalogue avec au plus trois compétences pondérées", () => {
    expect(Object.keys(profiles.courses).sort()).toEqual(catalog.courses.map((course) => course.id).sort());
    for (const [courseId, profile] of Object.entries(profiles.courses)) {
      expect(profile.length, courseId).toBeGreaterThanOrEqual(1);
      expect(profile.length, courseId).toBeLessThanOrEqual(3);
      expect(profile.every((item) => validCompetencies.has(item.competencyId)), courseId).toBe(true);
      expect(profile.reduce((sum, item) => sum + item.weight, 0), courseId).toBeCloseTo(1, 1);
    }
  });

  it("attribue des profils métier cohérents aux parcours spécialisés", () => {
    expect(profiles.certifications.claude_science_recherche_sante_v3.map((item) => item.competencyId)).toEqual(expect.arrayContaining(["bi_ai", "ai_governance"]));
    expect(profiles.certifications.claude_certified_developer_foundations.map((item) => item.competencyId)).toEqual(expect.arrayContaining(["ai_development", "ai_devops"]));
    expect(profiles.certifications.novasavo_automatisation_comptable_ia.map((item) => item.competencyId)).toContain("bi_ai");
  });
});
