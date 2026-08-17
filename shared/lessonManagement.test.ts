import { describe, expect, it } from "vitest";
import { createLesson, duplicateLesson, moveItem, remapLessonQuizBanks } from "./lessonManagement";

describe("lesson management", () => {
  it("creates a complete lesson containing a standard content block", () => {
    const lesson = createLesson("demo");
    expect(lesson.id).toBe("lesson_demo");
    expect(lesson.chapters[0].blocks[0].type).toBe("content");
  });

  it("duplicates a lesson with new lesson and chapter identifiers", () => {
    const original = createLesson("original");
    const copy = duplicateLesson(original, "copy");
    expect(copy.id).not.toBe(original.id);
    expect(copy.chapters[0].id).not.toBe(original.chapters[0].id);
  });

  it("moves lessons without changing the remaining order", () => {
    expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
  });

  it("remaps lesson-qualified quiz keys after a reorder and removes deleted lesson keys", () => {
    const before = { lessons: [{ id: "a", chapters: [{ id: "a1" }] }, { id: "b", chapters: [{ id: "b1" }] }] };
    const after = { lessons: [{ id: "b", chapters: [{ id: "b1" }] }] };
    expect(remapLessonQuizBanks(before, after, { "0_0": ["remove"], "1_0": ["keep"], "0": ["legacy"] })).toEqual({ "0_0": ["keep"], "0": ["legacy"] });
  });
});
