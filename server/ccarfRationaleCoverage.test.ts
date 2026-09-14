import { describe, expect, it } from "vitest";
import allQuestions from "./data/mockExamQuestions.json";
import { toLearnerExamReview, type ExamQuestion } from "./examDefinition";

const certificationId = "claude_certified_architect_foundations";
const genericRationales = new Set([
  "This is the keyed answer because it meets the decision rule evaluated by the question.",
  "This option is not the best answer because it does not meet all conditions of the decision rule evaluated by the question.",
]);

function isGenericRationale(value: string | { en?: string; fr?: string } | undefined) {
  if (typeof value === "string") return genericRationales.has(value);
  return Boolean(value && [value.en, value.fr].some((text) => text && genericRationales.has(text)));
}

describe("CCAR-F rationale coverage", () => {
  it("reports every choice that still lacks an authored choice-specific rationale", () => {
    const review = toLearnerExamReview((allQuestions as ExamQuestion[]).filter((question) => question.certificationId === certificationId));
    const unresolved = review.flatMap((question) => question.choices
      .filter((choice) => isGenericRationale(choice.rationale))
      .map((choice) => `${question.id}:${choice.id}`));

    console.info(JSON.stringify({ certificationId, questions: review.length, unresolvedRationales: unresolved }, null, 2));
    expect(unresolved).toEqual([]);
  });
});
