import { describe, expect, it } from "vitest";
import { validateAnthropicExamQuestion, type ExamQuestion } from "./examDefinition";

const question: ExamQuestion = {
  id: "new_multi", certificationId: "claude_certified_developer_foundations",
  question: { en: "Which two controls should be applied?", fr: "Quels deux contrôles appliquer ?" },
  choices: ["a", "b", "c", "d", "e"].map((id) => ({ id, text: { en: `Option ${id}`, fr: `Option ${id}` }, rationale: { en: `Because of condition ${id}.`, fr: `À cause de la condition ${id}.` } })),
  correctChoiceIds: ["a", "c"],
};

describe("édition sécurisée de la banque Anthropic", () => {
  it("autorise cinq choix et deux bonnes réponses lorsque toutes les explications sont disponibles", () => {
    expect(() => validateAnthropicExamQuestion(question)).not.toThrow();
  });
  it("rejette les doublons de réponse et les corrections manquantes en français", () => {
    expect(() => validateAnthropicExamQuestion({ ...question, correctChoiceIds: ["a", "a"] })).toThrow();
    expect(() => validateAnthropicExamQuestion({ ...question, choices: question.choices.map((c, index) => index ? c : { ...c, rationale: { en: "English only" } }) })).toThrow();
  });
});
