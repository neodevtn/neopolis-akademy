import { describe, expect, it } from "vitest";
import { canMapChapterProgressToLessons, shouldPreferChapterProgressForSingleLessonCourse } from "./trainingProgressMapping";

describe("canMapChapterProgressToLessons", () => {
  it("refuses legacy activity-screen progress for a three-lesson course", () => {
    expect(canMapChapterProgressToLessons(9, 3)).toBe(false);
  });

  it("accepts an explicit one-to-one chapter-to-lesson mapping", () => {
    expect(canMapChapterProgressToLessons(3, 3)).toBe(true);
  });

  it("prefers the chapter sentinel when one stored lesson contains several screens", () => {
    expect(shouldPreferChapterProgressForSingleLessonCourse({
      lessonCompletions: 1,
      totalUnits: 5,
      chapterTotal: 5,
    })).toBe(true);
  });

  it("keeps ordinary multi-lesson courses on lesson completion semantics", () => {
    expect(shouldPreferChapterProgressForSingleLessonCourse({
      lessonCompletions: 3,
      totalUnits: 3,
      chapterTotal: 3,
    })).toBe(false);
  });
});
