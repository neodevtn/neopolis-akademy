import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/TrainingCourse.tsx"), "utf8");

describe("TrainingCourse TekTek context contract", () => {
  it("keeps TekTek mounted with the displayed lesson when no lesson parameter is selected", () => {
    expect(source).toContain("const coachLessonIndex = isSingleLessonCourse ? 0 : activeMultiLessonIndex;");
    expect(source).toContain("{certId && courseId && courseLessons.length > 0 && (");
    expect(source).toContain("lessonIndex={coachLessonIndex}");
    expect(source).not.toContain("{certId && courseId && activeLessonIndex !== null && (");
  });
});
