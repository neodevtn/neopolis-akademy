import { describe, expect, it } from "vitest";
import { normalizeChapterBlocks, normalizeCourseBlocks } from "./courseBlockNormalization";

describe("course block normalization", () => {
  it("preserves existing blocks and appends a legacy block", () => {
    const chapter = normalizeChapterBlocks({ blocks: [{ type: "content", body: "new" }], block: { type: "video", url: "https://example.com" } });
    expect(chapter.blocks.map((block: any) => block.type)).toEqual(["content", "video"]);
  });

  it("turns direct checkpoint questions into standard single-choice blocks", () => {
    const chapter = normalizeChapterBlocks({ type: "checkpoint", questions: [{ question: "Q", choices: [{ id: "a", text: "A" }], correctId: "a" }] });
    expect(chapter.blocks[0]).toMatchObject({ type: "single_choice_exercise", correctAnswer: "a" });
  });

  it("normalizes every lesson without removing original course information", () => {
    const course = normalizeCourseBlocks({ courseId: "demo", lessons: [{ id: "l", chapters: [{ body: "Hello" }] }] });
    expect(course.courseId).toBe("demo");
    expect(course.lessons?.[0].chapters[0].blocks[0]).toMatchObject({ type: "content", body: "Hello" });
  });
});
