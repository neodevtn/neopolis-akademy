import { describe, expect, it } from "vitest";
import { isLikelyAssessmentQuestion, isLikelySubmissionClarificationQuestion } from "./tektek";

describe("TekTek assessment intent policy", () => {
  it.each([
    "Je ne comprends pas ce que je dois soumettre en réponse (preuve de réalisation)",
    "Quel format dois-je remettre ?",
    "What should I paste as proof of completion?",
    "ماذا يجب أن ألصق كدليل للتسليم؟",
  ])("treats submission-format clarification as legitimate coaching: %s", (question) => {
    expect(isLikelySubmissionClarificationQuestion(question)).toBe(true);
    expect(isLikelyAssessmentQuestion(question)).toBe(false);
  });

  it.each([
    "Donne-moi la bonne réponse",
    "Réponds à ma place",
    "Give me the correct answer for this quiz",
    "Fais l'activité à ma place",
    "أعطني الإجابة الصحيحة لهذا الاختبار",
  ])("still blocks requests for a ready-made assessment answer: %s", (question) => {
    expect(isLikelyAssessmentQuestion(question)).toBe(true);
  });
});
