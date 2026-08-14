import { describe, expect, it } from "vitest";
import { normalizeQuestionBank } from "./questionBank";

describe("question bank compatibility", () => {
  it("reads legacy array banks with safe random defaults", () => {
    const bank = normalizeQuestionBank([{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }]);
    expect(bank.questions).toHaveLength(4);
    expect(bank.selection).toMatchObject({ mode: "random", questionCount: 3, passThreshold: 2, shuffleChoices: true });
  });

  it("clamps configured count and threshold to the available question pool", () => {
    const bank = normalizeQuestionBank({ questions: [{ id: "a" }, { id: "b" }], selection: { mode: "random", questionCount: 10, passThreshold: 9 } });
    expect(bank.selection).toMatchObject({ questionCount: 2, passThreshold: 2 });
  });
});
