import { describe, expect, it } from "vitest";
import {
  answerSelectionProgressLabel,
  expectedAnswerCountLabel,
  hasExpectedAnswerCount,
  resolveExpectedAnswerCount,
  toggleExpectedSelection,
} from "./expectedAnswerCount";

describe("expected answer count", () => {
  it("prioritizes public requiredSelections without exposing an answer key", () => {
    expect(resolveExpectedAnswerCount({ requiredSelections: 3, correctChoiceIds: ["a"] })).toBe(3);
  });

  it("derives counts from each supported legacy question shape", () => {
    expect(resolveExpectedAnswerCount({ correctChoiceIds: ["a", "c"] })).toBe(2);
    expect(resolveExpectedAnswerCount({ correctAnswers: "a, c, d" })).toBe(3);
    expect(resolveExpectedAnswerCount({ correctAnswers: ["a", "c"] })).toBe(2);
    expect(resolveExpectedAnswerCount({ options: [{ correct: true }, { correct: false }, { correct: true }] })).toBe(2);
    expect(resolveExpectedAnswerCount({})).toBe(1);
  });

  it("localizes singular, plural, and progress in French, English, and Arabic", () => {
    expect(expectedAnswerCountLabel(1, "fr")).toBe("1 réponse attendue");
    expect(expectedAnswerCountLabel(2, "fr")).toBe("2 réponses attendues");
    expect(expectedAnswerCountLabel(1, "en")).toBe("1 answer expected");
    expect(expectedAnswerCountLabel(2, "en")).toBe("2 answers expected");
    expect(expectedAnswerCountLabel(1, "ar")).toBe("إجابة واحدة مطلوبة");
    expect(expectedAnswerCountLabel(2, "ar")).toBe("2 إجابات مطلوبة");
    expect(answerSelectionProgressLabel(1, 2, "fr")).toBe("1 sur 2 sélectionnées");
  });

  it("prevents over-selection and validates only the exact expected count", () => {
    expect(toggleExpectedSelection([], "a", 1)).toEqual(["a"]);
    expect(toggleExpectedSelection(["a"], "b", 1)).toEqual(["b"]);
    expect(toggleExpectedSelection(["a"], "b", 2)).toEqual(["a", "b"]);
    expect(toggleExpectedSelection(["a", "b"], "c", 2)).toEqual(["a", "b"]);
    expect(toggleExpectedSelection(["a", "b"], "a", 2)).toEqual(["b"]);
    expect(hasExpectedAnswerCount(1, 2)).toBe(false);
    expect(hasExpectedAnswerCount(2, 2)).toBe(true);
    expect(hasExpectedAnswerCount(3, 2)).toBe(false);
  });
});
