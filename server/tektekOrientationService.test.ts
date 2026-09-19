import { beforeEach, describe, expect, it, vi } from "vitest";
import trainingIndex from "../client/src/data/trainingIndex.json";
import { CAREER_FAMILY_DEFINITIONS } from "../shared/careerPathways";
import { DEFAULT_COMPETENCIES } from "../shared/competencyFramework";

const mocks = vi.hoisted(() => ({
  invokeLLM: vi.fn(),
  getLearnerOrientation: vi.fn(),
  getOrCreateTekTekConversation: vi.fn(),
  appendTekTekMessage: vi.fn(),
}));

vi.mock("./_core/llm", () => ({ invokeLLM: mocks.invokeLLM }));
vi.mock("./orientationService", () => ({ getLearnerOrientation: mocks.getLearnerOrientation }));
vi.mock("./tektekDb", () => ({ getOrCreateTekTekConversation: mocks.getOrCreateTekTekConversation, appendTekTekMessage: mocks.appendTekTekMessage }));

import { normalizeTekTekOrientationDraft, planOrientationWithTekTek } from "./tektekOrientationService";

const familyIds = new Set(CAREER_FAMILY_DEFINITIONS.map((family) => family.id));
const competencyIds = new Set(DEFAULT_COMPETENCIES.map((competency) => competency.id));
const certificationIds = new Set((trainingIndex.certifications || []).map((certification) => certification.id));

describe("TekTek orientation service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getLearnerOrientation.mockResolvedValue({ profile: { careerFamilyIds: [], inferredCareerFamilyIds: [], goals: [] }, competencies: [] });
    mocks.getOrCreateTekTekConversation.mockResolvedValue({ id: 41 });
    mocks.appendTekTekMessage.mockResolvedValue(1);
  });

  it("filtre chaque identifiant inventé par le modèle et déduplique les objectifs", () => {
    const draft = normalizeTekTekOrientationDraft({
      summary: "Une proposition prudente fondée sur la santé et la recherche.",
      careerFamilyIds: ["health_research", "famille_inventee", "health_research"],
      goals: [
        { competencyId: "rag_knowledge", targetLevel: "silver", why: "Structurer les sources et conserver leur traçabilité." },
        { competencyId: "competence_inventee", targetLevel: "gold", why: "Ne doit jamais sortir." },
        { competencyId: "rag_knowledge", targetLevel: "gold", why: "Doublon à supprimer." },
      ],
      wantsOfficialCertification: true,
      officialCertificationIds: ["certification_inventee"],
    }, { objective: "Je veux analyser la littérature médicale et organiser mes données de recherche." });

    expect(draft.careerFamilyIds).toEqual(["health_research"]);
    expect(draft.goals).toEqual([{ competencyId: "rag_knowledge", targetLevel: "silver", why: "Structurer les sources et conserver leur traçabilité." }]);
    expect(draft.wantsOfficialCertification).toBe(false);
    expect(draft.officialCertificationIds).toEqual([]);
    expect(draft.suggestedCertifications.every((certification) => certificationIds.has(certification.id))).toBe(true);
  });

  it("produit un brouillon déterministe et entièrement contrôlé si le modèle est indisponible", () => {
    const draft = normalizeTekTekOrientationDraft(null, { objective: "Je suis médecin et je veux améliorer ma recherche clinique." });

    expect(draft.model).toBeNull();
    expect(draft.careerFamilyIds.length).toBeGreaterThan(0);
    expect(draft.careerFamilyIds.every((id) => familyIds.has(id))).toBe(true);
    expect(draft.goals.length).toBeGreaterThan(0);
    expect(draft.goals.every((goal) => competencyIds.has(goal.competencyId))).toBe(true);
    expect(draft.goals.every((goal) => goal.targetLevel === "bronze")).toBe(true);
    expect(draft.suggestedCertifications.every((certification) => certificationIds.has(certification.id))).toBe(true);
  });

  it("localise le brouillon de secours en arabe", () => {
    const draft = normalizeTekTekOrientationDraft(null, { objective: "أريد تعلم الذكاء الاصطناعي في عملي", language: "ar" });

    expect(draft.summary).toContain("حوّل TekTek هدفك");
    expect(draft.goals.every((goal) => /مهارة/.test(goal.why))).toBe(true);
  });

  it("ne persiste ni l’objectif libre ni la sortie du modèle avant validation", async () => {
    const objective = "Je veux cadrer des cas d’usage IA et accompagner leur adoption.";
    const summary = "Parcours prudent pour cadrer des cas d’usage et accompagner une adoption responsable.";
    mocks.invokeLLM.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({
        summary,
        careerFamilyIds: ["strategy"],
        goals: [{ competencyId: "ai_business", targetLevel: "bronze", why: "Structurer la valeur et l’adoption." }],
        wantsOfficialCertification: false,
        officialCertificationIds: [],
      }) } }],
      usage: { prompt_tokens: 120, completion_tokens: 80 },
    });

    await planOrientationWithTekTek({ userId: 9, objective, language: "fr" });

    const persistedContents = mocks.appendTekTekMessage.mock.calls.map(([input]) => input.content);
    expect(persistedContents).toEqual(["[orientation_draft_request]", "[orientation_draft_generated]"]);
    expect(JSON.stringify(mocks.appendTekTekMessage.mock.calls)).not.toContain(objective);
    expect(JSON.stringify(mocks.appendTekTekMessage.mock.calls)).not.toContain(summary);
  });
});
