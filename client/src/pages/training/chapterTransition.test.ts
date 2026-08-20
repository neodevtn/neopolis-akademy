import { describe, expect, it } from "vitest";
import { getChapterTransitionKey } from "./chapterTransition";

describe("getChapterTransitionKey", () => {
  it("changes identity when the chapter changes", () => {
    expect(getChapterTransitionKey("lesson_00", 0)).not.toBe(getChapterTransitionKey("lesson_00", 1));
  });

  it("changes identity when the lesson changes at the same chapter index", () => {
    expect(getChapterTransitionKey("lesson_00", 0)).not.toBe(getChapterTransitionKey("lesson_01", 0));
  });

  it("normalizes a missing lesson id and an invalid chapter index", () => {
    expect(getChapterTransitionKey(undefined, Number.NaN)).toBe("chapter-unknown-lesson-0");
  });
});
