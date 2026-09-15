import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const index = JSON.parse(readFileSync(resolve(process.cwd(), "client/src/data/trainingIndex.json"), "utf8"));
const course = JSON.parse(readFileSync(resolve(process.cwd(), "client/public/data/courses/claude_certified_associate_foundations__02.json"), "utf8"));

describe("Claude Certified Associate course 2 contract", () => {
  const chapters = course.lessons[0].chapters;

  it("keeps the official title, the nine-screen sequence, and the 53-minute source duration", () => {
    const metadata = index.courses.find((item: { id: string }) => item.id === "claude_certified_associate_foundations__02");
    expect(metadata).toMatchObject({ title: { en: "Prompting & Task Execution" }, chapterCount: 9, exerciseCount: 7, officialDurationMinutes: 53 });
    expect(chapters).toHaveLength(9);
    expect(chapters[0].blocks[0].body.en).toContain("Official duration (Skilljar):** 53 minutes");
    expect(chapters[0].blocks[0].body.fr).toContain("Durée officielle (Skilljar) :** 53 minutes");
  });

  it("keeps a complete weak-versus-strong prompt example rather than an empty comparison", () => {
    const anatomy = chapters.find((chapter: { id: string }) => chapter.id === "chapter_01");
    const comparison = anatomy.blocks.find((block: { type: string }) => block.type === "comparison");
    const strongPrompt = comparison.items.find((item: { variant: string }) => item.variant === "right");
    const weakPrompt = comparison.items.find((item: { variant: string }) => item.variant === "wrong");
    expect(strongPrompt.content.en).toContain("You are an operations analyst");
    expect(strongPrompt.content.fr).toContain("Vous êtes analyste des opérations");
    expect(weakPrompt.content.fr).toContain("Rédigez un résumé de nos opérations trimestrielles");
  });

  it("preserves the applied checkpoint, task-type matching activity, and final quiz", () => {
    const strategy = chapters.find((chapter: { id: string }) => chapter.id === "chapter_06");
    const repair = chapters.find((chapter: { id: string }) => chapter.id === "chapter_08");
    const quiz = chapters.find((chapter: { id: string }) => chapter.id === "chapter_09");
    const checkpoint = course.exercises.find((exercise: { id: string }) => exercise.id === "ex_claude_certified_associate_foundations__02_002");
    expect(strategy.blocks.some((block: { type: string }) => block.type === "bucket_sort")).toBe(true);
    expect(repair.blocks.some((block: { type: string; exerciseId?: string }) => block.type === "checkpoint" && block.exerciseId === "ex_claude_certified_associate_foundations__02_002")).toBe(true);
    expect(checkpoint).toMatchObject({ interactionType: "single_choice", required: true, completionRequiresCorrectAnswer: true });
    expect(checkpoint.options.filter((option: { correct: boolean }) => option.correct)).toHaveLength(1);
    expect(quiz.blocks.filter((block: { type: string }) => block.type === "single_choice_exercise")).toHaveLength(5);
  });
});
