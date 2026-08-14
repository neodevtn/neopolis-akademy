import { describe, expect, it } from "vitest";
import { collectMediaAssets, validateStructuredCourse } from "./contentStudio";

describe("content studio model", () => {
  const course = {
    courseId: "pilot",
    lessons: [{
      chapters: [{
        id: "chapter_01",
        title: { fr: "Introduction" },
        blocks: [{
          type: "video",
          mp4Url: "/api/assets/intro.mp4",
          slidesPdf: "/api/assets/slides.pdf",
          projectorSlides: [{ images: [{ url: "/api/assets/slide.png" }] }],
        }],
      }],
    }],
  };

  it("collects local video, PDF and image media references without rewriting them", () => {
    const assets = collectMediaAssets(course);
    expect(assets.map((asset) => asset.url)).toEqual(expect.arrayContaining([
      "/api/assets/intro.mp4",
      "/api/assets/slides.pdf",
      "/api/assets/slide.png",
    ]));
  });

  it("rejects duplicate chapter ids while retaining legacy unknown block types as warnings", () => {
    const result = validateStructuredCourse({
      ...course,
      lessons: [{ chapters: [course.lessons[0].chapters[0], { id: "chapter_01", blocks: [{ type: "legacy_block" }] }] }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((issue) => issue.message.includes("dupliqué"))).toBe(true);
    expect(result.warnings.some((issue) => issue.message.includes("legacy_block"))).toBe(true);
  });
});
