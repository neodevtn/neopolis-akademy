import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import trainingIndex from "../client/src/data/trainingIndex.json";

const course = JSON.parse(
  readFileSync(
    new URL("../client/public/data/courses/introduction_to_ai_for_work__01.json", import.meta.url),
    "utf8",
  ),
);

const chapters = course.lessons.flatMap((lesson: { chapters: unknown[] }) => lesson.chapters);
const blocks = chapters.flatMap((chapter: { blocks: unknown[] }) => chapter.blocks) as Array<Record<string, unknown>>;

describe("Introduction à l’IA pour le travail — import DataCamp", () => {
  it("publie les compteurs canoniques dans le catalogue", () => {
    const certification = trainingIndex.certifications.find(
      (entry) => entry.id === "datacamp_introduction_to_ai_for_work",
    );
    const catalogCourse = trainingIndex.courses.find(
      (entry) => entry.id === "introduction_to_ai_for_work__01",
    );

    expect(certification).toMatchObject({
      totalLessons: 4,
      totalActivities: 33,
      totalVideos: 11,
      totalDownloads: 4,
      group: "workplace_ai_productivity",
      provider: "datacamp",
    });
    expect(catalogCourse).toMatchObject({
      certId: "datacamp_introduction_to_ai_for_work",
      lessonCount: 4,
      totalActivities: 33,
      videoCount: 11,
      downloadCount: 4,
    });
  });

  it("préserve les onze leçons Projector audio avec slides, sous-titres et transcriptions locales", () => {
    const projectorVideos = blocks.filter((block) => block.type === "video" && block.audioUrl);

    expect(course.lessons).toHaveLength(4);
    expect(chapters).toHaveLength(33);
    expect(projectorVideos).toHaveLength(11);
    for (const block of projectorVideos) {
      expect(block.audioUrl).toMatch(/^\/api\/assets\//);
      expect(block.subtitleUrlFr).toMatch(/^\/api\/assets\//);
      expect(block.slidesPdf).toMatch(/^\/api\/assets\//);
      expect(block.projectorSlides).toEqual(expect.any(Array));
      expect((block.projectorSlides as unknown[]).length).toBeGreaterThan(0);
      expect(block.projectorTimings).toEqual(expect.any(Array));
      expect((block.projectorTimings as unknown[]).length).toBeGreaterThan(0);
      expect(block.projectorTimingUnit).toBe("fraction");
      expect(String(block.transcript || "").length).toBeGreaterThan(0);
    }
  });

  it("restitue des activités interactives et garde le verrouillage séquentiel", () => {
    expect(chapters.every((chapter: { requiredBeforeAdvance?: boolean }) => chapter.requiredBeforeAdvance)).toBe(true);
    expect(blocks.filter((block) => block.type === "bucket_sort")).toHaveLength(9);
    expect(blocks.filter((block) => block.type === "single_choice_exercise" || block.type === "multi_choice_exercise")).toHaveLength(12);
    expect(blocks.some((block) => block.type === "resource_review")).toBe(true);
  });

  it("ne conserve aucune URL média DataCamp externe dans le cours publié", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });
});
