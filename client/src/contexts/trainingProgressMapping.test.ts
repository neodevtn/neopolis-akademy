import { describe, expect, it } from "vitest";
import { canMapChapterProgressToLessons } from "./trainingProgressMapping";

describe("canMapChapterProgressToLessons", () => {
  it("refuses legacy activity-screen progress for a three-lesson course", () => {
    expect(canMapChapterProgressToLessons(9, 3)).toBe(false);
  });

  it("accepts an explicit one-to-one chapter-to-lesson mapping", () => {
    expect(canMapChapterProgressToLessons(3, 3)).toBe(true);
  });
});
