import { describe, expect, it } from "vitest";
import trainingIndex from "../client/src/data/trainingIndex.json";
import { normalizeExamConfiguration } from "../shared/examConfiguration";
import { selectExamQuestions, toLearnerExamQuestions, type ExamQuestion } from "./examDefinition";
import allQuestions from "./data/mockExamQuestions.json";

const cases = [
  ["claude_certified_developer_foundations", 53],
  ["claude_certified_associate_foundations", 60],
  ["claude_certified_architect_foundations", 60],
  ["claude_certified_architect_professional", 63],
] as const;

describe("CertSafari — diversité des quatre examens blancs et corrigé côté serveur", () => {
  it("mélange réellement les choix à chaque tentative sans modifier les ids utilisés pour noter", () => {
    const source = (allQuestions as ExamQuestion[]).find((question) => question.choices.length === 4
      && question.correctChoiceIds.length === 1 && question.correctChoiceIds[0] === "a")!;
    expect(source).toBeTruthy();
    const config = normalizeExamConfiguration({ totalQuestions: 1, shuffleQuestions: true, shuffleChoices: true, domains: [] }, 1);
    const positions = [0, 0, 0, 0];
    for (let run = 0; run < 400; run += 1) {
      const selected = selectExamQuestions([source], config)[0];
      const index = selected.choices.findIndex((choice) => choice.id === source.correctChoiceIds[0]);
      positions[index] += 1;
      expect(selected.correctChoiceIds).toEqual(source.correctChoiceIds);
    }
    expect(positions.every((count) => count > 60 && count < 140)).toBe(true);
  });

  for (const [certificationId, perAttempt] of cases) {
    it(`${certificationId}: tire une session conforme, variée et sans corrigé transmis`, () => {
      const bank = (allQuestions as ExamQuestion[]).filter((question) => question.certificationId === certificationId);
      const raw = (trainingIndex.examConfig as Record<string, unknown>)[certificationId];
      const config = normalizeExamConfiguration(raw, bank.length);
      expect(config.totalQuestions).toBe(perAttempt);
      expect(bank.length).toBeGreaterThanOrEqual(perAttempt * 5);
      const seen = new Set<string>();
      for (let run = 0; run < 12; run += 1) {
        const attempt = selectExamQuestions(bank, config);
        expect(attempt).toHaveLength(perAttempt);
        expect(new Set(attempt.map((question) => question.id)).size).toBe(perAttempt);
        expect(attempt.some((question) => question.sourceType === "certsafari-partner-practice")).toBe(true);
        expect(attempt.some((question) => question.sourceType === "neopolis-original")).toBe(true);
        const learner = toLearnerExamQuestions(attempt);
        expect(learner).toHaveLength(perAttempt);
        expect(JSON.stringify(learner)).not.toMatch(/correctChoiceIds|sourceQuestionId|sourceRefs|rationaleProvenance|translationProvenance/);
        for (const question of attempt) seen.add(question.id);
      }
      expect(seen.size).toBeGreaterThan(perAttempt * 2);
    });
  }
});
