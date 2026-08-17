import { describe, expect, it } from "vitest";
import { getExercisesForSelectedChapter, isLegacyExerciseInteractionType } from "./exerciseEditor";

const exercises = [
  { id: "one", lessonId: "lesson_01", chapterId: "chapter_01" },
  { id: "two", lessonId: "lesson_01", chapterId: "chapter_04" },
  { id: "three", lessonId: "lesson_02", chapterId: "chapter_01" },
  { id: "legacy", lessonId: "lesson_01" },
];

describe("getExercisesForSelectedChapter", () => {
  it("only returns exercises bound to the selected lesson and chapter", () => {
    expect(getExercisesForSelectedChapter({ exercises, lesson: { id: "lesson_01" }, lessonIndex: 0, chapterId: "chapter_04", chapterIndex: 3 }).map((exercise) => exercise.id)).toEqual(["two"]);
  });

  it("keeps legacy exercises without chapter metadata on the first chapter only", () => {
    expect(getExercisesForSelectedChapter({ exercises, lesson: { id: "lesson_01" }, lessonIndex: 0, chapterId: "chapter_01", chapterIndex: 0 }).map((exercise) => exercise.id)).toEqual(["one", "legacy"]);
  });

  it("covers every interaction type currently rendered by legacy course exercises", () => {
    ["free_text", "scenario", "code", "single_choice", "multi_choice", "checklist"].forEach((interactionType) => expect(isLegacyExerciseInteractionType(interactionType)).toBe(true));
  });
});
