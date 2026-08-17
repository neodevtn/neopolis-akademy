import { describe, expect, it } from "vitest";
import { getContextualCourseEditorHref } from "./courseEditorLink";

describe("getContextualCourseEditorHref", () => {
  it("targets the exact course, lesson and chapter in edit mode", () => {
    expect(getContextualCourseEditorHref({
      courseId: "claude_certified_associate_foundations__01",
      lessonIndex: 2,
      chapterIndex: 4,
    })).toBe("/admin/content?courseId=claude_certified_associate_foundations__01&mode=edit&lesson=2&chapter=4");
  });

  it("encodes course identifiers and clamps negative positions", () => {
    expect(getContextualCourseEditorHref({
      courseId: "course / special",
      lessonIndex: -3,
      chapterIndex: -1,
    })).toBe("/admin/content?courseId=course+%2F+special&mode=edit&lesson=0&chapter=0");
  });
});
