import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const coursePath = path.resolve(process.cwd(), "client/public/data/courses/ai_for_consulting__01.json");
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const chapters = course.lessons.flatMap((lesson: any) => lesson.chapters ?? []);
const blocks = chapters.flatMap((chapter: any) => chapter.blocks ?? []);

describe("adaptation locale du cours DataCamp ai-for-consulting", () => {
  it("retire uniquement le TP sans rubrique ni ressources locales exploitables", () => {
    expect(chapters.some((chapter: any) => chapter.id === "dc_ch03_act09")).toBe(false);
    expect(chapters).toHaveLength(30);
  });

  it("conserve les TP rubricés avec des critères source et un seuil complet", () => {
    const rubricBlocks = blocks.filter((block: any) => block.type === "cloud_exercise" && Array.isArray(block.rubricCriteria) && block.rubricCriteria.length > 0);
    expect(rubricBlocks).toHaveLength(16);
    for (const block of rubricBlocks) {
      expect(block.maxScore).toBe(block.rubricCriteria.length);
      expect(block.passingScore).toBe(block.rubricCriteria.length);
      expect(block.rubricVersion).toBe("datacamp-source-2026-08-28");
    }
  });

  it("n’expose ni XP DataCamp ni lien externe DataCamp dans le cours", () => {
    const serialised = JSON.stringify(course);
    expect(serialised).not.toMatch(/\bXP\b/i);
    expect(serialised).not.toMatch(/https?:\/\/(?:www\.)?datacamp\.com/i);
    expect(serialised).not.toMatch(/<\/?(details|summary|strong|em|p|br|li|ul|span|div)\b/i);
  });

  it("rend les TP réalisables avec un assistant IA accessible et non une interface Copilot imposée", () => {
    const cloudBlocks = blocks.filter((block: any) => block.type === "cloud_exercise");
    expect(cloudBlocks).toHaveLength(16);
    for (const block of cloudBlocks) {
      expect(JSON.stringify(block)).toMatch(/assistant IA génératif|assistant IA choisi/i);
      expect(JSON.stringify(block)).not.toMatch(/Microsoft Copilot|Can['’]t log in/i);
    }
  });

  it("ne laisse pas Copilot dans les titres et rubriques des TP locaux affichés", () => {
    const exerciseChapters = chapters.filter((chapter: any) => (chapter.blocks ?? []).some((block: any) => block.type === "cloud_exercise"));
    for (const chapter of exerciseChapters) expect(JSON.stringify(chapter.title)).not.toMatch(/Copilot/i);
    const labels = blocks.flatMap((block: any) => block.rubricCriteria ?? []).map((criterion: any) => criterion.label);
    expect(labels).not.toContain("Use-cases about consultancy");
  });
});
