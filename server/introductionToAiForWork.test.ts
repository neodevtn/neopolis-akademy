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
      totalActivities: 30,
      totalVideos: 11,
      totalDownloads: 4,
      group: "workplace_ai_productivity",
      provider: "datacamp",
    });
    expect(catalogCourse).toMatchObject({
      certId: "datacamp_introduction_to_ai_for_work",
      lessonCount: 4,
      chapterCount: 30,
      totalActivities: 30,
      exerciseCount: 19,
      videoCount: 11,
      downloadCount: 4,
    });
  });

  it("préserve les onze leçons Projector audio avec slides, sous-titres et transcriptions locales", () => {
    const projectorVideos = blocks.filter((block) => block.type === "video" && block.audioUrl);

    expect(course.lessons).toHaveLength(4);
    expect(chapters).toHaveLength(30);
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

  it("conserve les interactions rendables comme seules activités obligatoires après le retrait des TP non vérifiables", () => {
    const interactiveTypes = new Set(["bucket_sort", "single_choice_exercise", "multi_choice_exercise", "resource_review"]);
    const practicalTypes = new Set(["cloud_exercise", "code_repl", "ai_evaluation", "free_text_exercise", "terminal_sim"]);
    const interactiveChapters = chapters.filter((chapter: any) => chapter.blocks.some((block: any) => interactiveTypes.has(block.type)));

    expect(blocks.filter((block) => block.type === "bucket_sort")).toHaveLength(9);
    expect(blocks.filter((block) => block.type === "single_choice_exercise" || block.type === "multi_choice_exercise")).toHaveLength(9);
    expect(interactiveChapters).toHaveLength(19);
    expect(interactiveChapters.every((chapter: any) => chapter.requiredBeforeAdvance === true)).toBe(true);
    expect(blocks.filter((block) => practicalTypes.has(block.type))).toHaveLength(0);
    expect(blocks.filter((block) => block.type === "resource_review").every((block: any) => String(block.resourceUrl).startsWith("/api/assets/"))).toBe(true);
  });

  it("ne conserve aucune URL média DataCamp externe dans le cours publié", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });
});
