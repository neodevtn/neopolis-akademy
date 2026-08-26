import { afterEach, describe, expect, it, vi } from "vitest";
import { evaluateFreeResponseWithOpenRouter, normalizeEvaluation } from "./openrouterEvaluation";

describe("normalizeEvaluation", () => {
  const criteria = [{ id: "accuracy", label: "Exactitude", description: "Répond aux éléments attendus", weight: 1 }];
  it("borne le score, filtre les critères inconnus et fournit un résultat exploitable", () => {
    const result = normalizeEvaluation({ score: 15, feedback: "Bon raisonnement.", strengths: ["Précis"], improvements: ["Citer la source"], criterionScores: [{ criterionId: "unknown", score: 100 }, { criterionId: "accuracy", score: 120, rationale: "Exact" }] }, 10, criteria);
    expect(result.score).toBe(10);
    expect(result.criterionScores).toEqual([{ criterionId: "accuracy", score: 100, rationale: "Exact" }]);
    expect(result.strengths).toEqual(["Précis"]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OPENROUTER_API_KEY;
  });

  it("refuse une clé absente sans lancer de requête", async () => {
    await expect(evaluateFreeResponseWithOpenRouter({ prompt: "Expliquez votre démarche de contrôle.", answer: "Je décris les contrôles, les exceptions et une validation humaine.", criteria, maxScore: 10, language: "fr" })).rejects.toThrow("OPENROUTER_API_KEY");
  });

  it("signale une réponse fournisseur non valide sans produire un résultat fictif", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: "not-json" } }] }) }));
    await expect(evaluateFreeResponseWithOpenRouter({ prompt: "Expliquez votre démarche de contrôle.", answer: "Je décris les contrôles, les exceptions et une validation humaine.", criteria, maxScore: 10, language: "fr" })).rejects.toThrow("invalid evaluation JSON");
  });

  it("signale une indisponibilité fournisseur de façon contrôlée", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(evaluateFreeResponseWithOpenRouter({ prompt: "Expliquez votre démarche de contrôle.", answer: "Je décris les contrôles, les exceptions et une validation humaine.", criteria, maxScore: 10, language: "fr" })).rejects.toThrow("OpenRouter evaluation failed (503)");
  });
});
