import { describe, expect, it } from "vitest";
import { buildRecommendedLearningPath } from "./recommendedLearningPath";

const certifications = [
  { id: "ia_pour_les_nuls", title: { en: "AI for beginners", fr: "IA pour les nuls" } },
  { id: "developer", title: { en: "Developer", fr: "Developer" } },
  { id: "architect", title: { en: "Architect", fr: "Architect" } },
];

describe("buildRecommendedLearningPath", () => {
  it("conserve le parcours catalogue par défaut tant que le diagnostic n’est pas terminé", () => {
    const path = buildRecommendedLearningPath({
      certifications,
      orientationStatus: "goals_set",
      orientationRecommendations: [{ order: 1, certificationId: "architect", competencyId: "ai_solution_design", currentPoints: 0, diagnosticPoints: 0, targetPoints: 35, reason: "ignored", type: "target" }],
    });
    expect(path.personalized).toBe(false);
    expect(path.items.map((item) => item.certification.id)).toEqual(["ia_pour_les_nuls", "developer", "architect"]);
  });

  it("reprend l’ordre et les raisons du diagnostic terminé", () => {
    const path = buildRecommendedLearningPath({
      certifications,
      orientationStatus: "completed",
      orientationRecommendations: [
        { order: 2, certificationId: "architect", competencyId: "ai_solution_design", currentPoints: 10, diagnosticPoints: 35, targetPoints: 70, reason: "Approfondir", type: "advanced" },
        { order: 1, certificationId: "developer", competencyId: "ai_development", currentPoints: 0, diagnosticPoints: 10, targetPoints: 35, reason: "Réduire l’écart", type: "target" },
      ],
    });
    expect(path.personalized).toBe(true);
    expect(path.items.map((item) => item.certification.id)).toEqual(["developer", "architect"]);
    expect(path.items[0].recommendation?.reason).toBe("Réduire l’écart");
  });
});
