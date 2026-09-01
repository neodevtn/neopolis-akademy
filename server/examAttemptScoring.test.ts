import { describe, expect, it } from "vitest";
import { normalizeExamConfiguration } from "../shared/examConfiguration";
import { scoreStoredExamSession } from "./examAttemptScoring";

const configuration = normalizeExamConfiguration({
  examCode: "NEO-AI-001",
  totalQuestions: 2,
  timeLimit: 45,
  passingScore: 720,
  shuffleQuestions: false,
  shuffleChoices: false,
  isPublished: true,
  domains: [{ name: { fr: "Fondamentaux" }, weight: 100 }],
}, 2);

const questions = [
  { id: "q1", certificationId: "formation-a", domain: "Fondamentaux", question: "Q1", choices: [{ id: "a", text: "A" }, { id: "b", text: "B" }], correctChoiceIds: ["a"] },
  { id: "q2", certificationId: "formation-a", domain: "Fondamentaux", question: "Q2", choices: [{ id: "a", text: "A" }, { id: "b", text: "B" }], correctChoiceIds: ["b"] },
];

describe("notation d’examen certifiant contrôlée par le serveur", () => {
  it("conserve la durée et le seuil sur l’échelle officielle 100–1000", () => {
    expect(configuration.timeLimit).toBe(45);
    expect(configuration.passingScore).toBe(720);
    expect(configuration.totalQuestions).toBe(2);
    expect(configuration.isPublished).toBe(true);
  });

  it("valide une réussite seulement avant l’expiration de la session", () => {
    const result = scoreStoredExamSession(questions, [
      { questionId: "q1", selectedIds: ["a"] },
      { questionId: "q2", selectedIds: ["b"] },
    ], configuration, false);
    expect(result.scaled).toBe(1000);
    expect(result.passed).toBe(true);
    expect(result.timedOut).toBe(false);
  });

  it("enregistre une tentative échouée et interdit le certificat lorsque la durée est dépassée, même avec toutes les réponses correctes", () => {
    const result = scoreStoredExamSession(questions, [
      { questionId: "q1", selectedIds: ["a"] },
      { questionId: "q2", selectedIds: ["b"] },
    ], configuration, true);
    expect(result.scaled).toBe(1000);
    expect(result.timedOut).toBe(true);
    expect(result.passed).toBe(false);
  });

  it("ignore les choix falsifiés qui ne figurent pas dans la session scellée", () => {
    const result = scoreStoredExamSession(questions, [
      { questionId: "q1", selectedIds: ["forged"] },
      { questionId: "q2", selectedIds: ["b"] },
    ], configuration, false);
    expect(result.correct).toBe(1);
    expect(result.passed).toBe(false);
  });
});
