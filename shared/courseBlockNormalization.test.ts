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

  it("renders legacy lesson objectives before an existing video", () => {
    const source = { id: "objectives", body: { fr: "Objectifs de la leçon", en: "Lesson objectives" }, blocks: [{ type: "video", id: "v1" }] };
    const normalized = normalizeChapterBlocks(source);
    expect(normalized.blocks.map((block: any) => block.type)).toEqual(["content", "video"]);
    expect(normalized.blocks[0].body).toEqual(source.body);
    expect(source.blocks).toHaveLength(1);
    expect(normalizeChapterBlocks(normalized).blocks).toEqual(normalized.blocks);
  });

  it("does not repeat the body already transferred into a standard text block", () => {
    const body = { fr: "Objectifs", en: "Objectives" };
    const source = { id: "objectives", body, blocks: [{ type: "content", id: "c1", body }, { type: "video", id: "v1" }] };
    expect(normalizeChapterBlocks(source).blocks).toHaveLength(2);
  });

  it("does not revive outdated legacy promises beside an explicitly rewritten explanation", () => {
    const source = { id: "recap", body: "Go to a lab that was removed", blocks: [{ type: "content", id: "c1", body: "A complete case study with an integrated quiz" }, { type: "video", id: "v1" }] };
    expect(normalizeChapterBlocks(source).blocks).toEqual(source.blocks);
  });
});
