import { describe, expect, it } from "vitest";
import { buildOrientationRecommendations, getDiagnosticPoints, getOrientationQuestions } from "./orientationFramework";

describe("orientation framework", () => {
  const goals = [{ competencyId: "ai_development", targetLevel: "silver" as const }];

  it("propose un QCM lié uniquement aux compétences sélectionnées", () => {
    const questions = getOrientationQuestions(goals);
    expect(questions).toHaveLength(1);
    expect(questions[0]?.competencyId).toBe("ai_development");
  });

  it("convertit les réponses exactes en niveau de diagnostic explicable", () => {
    const question = getOrientationQuestions(goals)[0]!;
    expect(getDiagnosticPoints(goals, [{ questionId: question.id, choiceId: question.correctChoiceId }])).toEqual({ ai_development: 35 });
  });

  it("ajoute les fondations avant une spécialisation lorsque le niveau est faible", () => {
    const recommendations = buildOrientationRecommendations({
      goals,
      competencyPoints: { ai_development: 0 },
      diagnosticPoints: { ai_development: 0 },
      wantsOfficialCertification: false,
    });
    expect(recommendations.map((item) => item.certificationId)).toEqual([
      "ia_pour_les_nuls",
      "claude_certified_developer_foundations",
    ]);
  });

  it("évite les fondations pour un apprenant avancé", () => {
    const recommendations = buildOrientationRecommendations({
      goals,
      competencyPoints: { ai_development: 40 },
      diagnosticPoints: { ai_development: 35 },
      wantsOfficialCertification: false,
    });
    expect(recommendations.map((item) => item.certificationId)).toEqual([]);
  });

  it("conserve un parcours cible lorsqu’une certification officielle est demandée", () => {
    const recommendations = buildOrientationRecommendations({
      goals,
      competencyPoints: { ai_development: 40 },
      diagnosticPoints: { ai_development: 35 },
      wantsOfficialCertification: true,
      officialCertificationIds: ["claude_certified_developer_foundations"],
    });
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]?.certificationId).toBe("claude_certified_developer_foundations");
  });
});
