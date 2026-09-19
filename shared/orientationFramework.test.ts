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

  it("ajoute les fondations avant plusieurs preuves spécialisées lorsque le niveau est faible", () => {
    const recommendations = buildOrientationRecommendations({
      goals,
      competencyPoints: { ai_development: 0 },
      diagnosticPoints: { ai_development: 0 },
      wantsOfficialCertification: false,
    });
    expect(recommendations.map((item) => item.certificationId)).toEqual([
      "ia_pour_les_nuls",
      "claude_certified_developer_foundations",
      "full_stack_ai_application_developer",
    ]);
  });

  it("évite les fondations pour un apprenant qui atteint déjà sa cible", () => {
    const recommendations = buildOrientationRecommendations({
      goals,
      competencyPoints: { ai_development: 60 },
      diagnosticPoints: { ai_development: 50 },
      wantsOfficialCertification: false,
    });
    expect(recommendations.map((item) => item.certificationId)).toEqual([]);
  });

  it("conserve un parcours officiel tout en proposant une preuve complémentaire", () => {
    const recommendations = buildOrientationRecommendations({
      goals,
      competencyPoints: { ai_development: 40 },
      diagnosticPoints: { ai_development: 35 },
      wantsOfficialCertification: true,
      officialCertificationIds: ["claude_certified_developer_foundations"],
    });
    expect(recommendations).toHaveLength(2);
    expect(recommendations[0]?.certificationId).toBe("claude_certified_developer_foundations");
    expect(recommendations[1]?.certificationId).toBe("full_stack_ai_application_developer");
  });

  it("recommande la santé à partir d’un objectif libre de médecin", () => {
    const recommendations = buildOrientationRecommendations({
      goals: [{ competencyId: "bi_ai", targetLevel: "silver" }],
      competencyPoints: { bi_ai: 8 },
      diagnosticPoints: { bi_ai: 5 },
      wantsOfficialCertification: false,
      aspiration: "Je suis médecin et je veux structurer une recherche clinique traçable.",
      availableCertificationIds: ["ia_pour_les_nuls", "datacamp_ai_for_data_analysts", "analyse_donnees_reporting_bi_codex", "ia_appliquee_metiers_tp__formation_32", "claude_science_recherche_sante_v3", "ai_governance_compliance_responsible_ai_leader", "advanced_rag_evaluation_specialist", "ai_data_engineering_rag_practitioner"],
    });
    expect(recommendations.map((item) => item.certificationId)).toContain("claude_science_recherche_sante_v3");
    expect(recommendations.some((item) => item.careerFamilyId === "health_research")).toBe(true);
  });
});
