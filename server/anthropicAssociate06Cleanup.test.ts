import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__06.json",
);

describe("nettoyage pédagogique Anthropic — Associate Foundations 06", () => {
  it("conserve les activités standards intégrées et retire les artefacts racine mal rattachés", async () => {
    const course = JSON.parse(await readFile(coursePath, "utf8"));
    const lesson = course.lessons[0];
    const screening = lesson.chapters.find((chapter: any) => chapter.id === "chapter_01");
    const trust = lesson.chapters.find((chapter: any) => chapter.id === "chapter_02");
    const ethics = lesson.chapters.find((chapter: any) => chapter.id === "chapter_05");
    const quiz = lesson.chapters.find((chapter: any) => chapter.id === "chapter_06");

    expect(course.exercises).toEqual([]);
    expect(screening.blocks.some((block: any) => block.type === "bucket_sort")).toBe(true);
    expect(screening.completionRule).toEqual({ requires: ["contentViewed", "requiredExercisesPassed"] });
    expect(trust.title.fr).toBe("Confiance dans les Skills et risques liés aux fonctionnalités");
    expect(ethics.blocks[0].body.fr).not.toContain("AI-assisted work products");
    expect(quiz.blocks.filter((block: any) => block.type === "single_choice_exercise")).toHaveLength(5);
  });
});
