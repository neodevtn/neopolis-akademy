import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const learnerQuestionRenderers = [
  "client/src/pages/MockExam.tsx",
  "client/src/components/SingleChoiceExercise.tsx",
  "client/src/components/ExerciseRenderer.tsx",
  "client/src/components/ChapterQuiz.tsx",
  "client/src/pages/training/LessonQuiz.tsx",
  "client/src/components/blocks/CourseFinalQuizBlock.tsx",
  "client/src/components/blocks/MultiChoiceBlock.tsx",
  "client/src/components/blocks/GenericLearningBlocks.tsx",
  "client/src/components/blocks/NovasavoLearningBlocks.tsx",
  "client/src/components/blocks/FillBlankBlock.tsx",
  "client/src/components/blocks/MatchingBlock.tsx",
  "client/src/components/blocks/OrderingBlock.tsx",
  "client/src/components/NumericAnswerExercise.tsx",
  "client/src/components/MatchingExercise.tsx",
] as const;

describe("expected answer count UI coverage", () => {
  it.each(learnerQuestionRenderers)("keeps the shared indicator in %s", (relativePath) => {
    const source = readFileSync(resolve(process.cwd(), relativePath), "utf8");
    expect(source).toContain("ExpectedAnswerCount");
  });

  it("requires the exact count in the certification mock exam", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/MockExam.tsx"), "utf8");
    expect(source).toContain("hasExpectedAnswerCount(selectedForCurrent.length, requiredSelections)");
    expect(source).toContain("toggleExpectedSelection(current, choiceId, expected)");
    expect(source).not.toContain("requiredSelections > 1 &&");
  });

  it("exposes selected answer state to assistive technology", () => {
    for (const relativePath of [
      "client/src/pages/MockExam.tsx",
      "client/src/components/ExerciseRenderer.tsx",
      "client/src/components/blocks/MultiChoiceBlock.tsx",
    ]) {
      const source = readFileSync(resolve(process.cwd(), relativePath), "utf8");
      expect(source).toContain("aria-checked");
    }
  });
});
