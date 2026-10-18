import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS } from "./architectFoundationsCorrectionRegistry";

const root = path.resolve(__dirname, "..");
const read = (courseId: string) => JSON.parse(fs.readFileSync(path.join(root, "client", "public", "data", "courses", `${courseId}.json`), "utf8"));
const localized = (value: unknown) => typeof value === "string" ? value : (value as { fr?: string; en?: string } | undefined)?.fr || (value as { en?: string } | undefined)?.en || "";
const blocks = (course: any) => course.lessons.flatMap((lesson: any) => lesson.chapters.flatMap((chapter: any) => chapter.blocks || []));

describe("remédiation pédagogique des trois formations prioritaires", () => {
  it("ne publie plus de checkpoint Architect libre ou non vérifiable", () => {
    for (let index = 1; index <= 7; index += 1) {
      const courseId = `claude_certified_architect_foundations__${String(index).padStart(2, "0")}`;
      const course = read(courseId);
      const exercises = new Map(course.exercises.map((exercise: any) => [exercise.id, exercise]));
      for (const block of blocks(course).filter((block: any) => block.type === "checkpoint")) {
        const exercise = exercises.get(block.exerciseId);
        expect(exercise?.interactionType, `${courseId}:${block.exerciseId}`).not.toBe("free_text");
        expect(ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS[courseId]?.[block.exerciseId]?.correctOptionIds?.length, `${courseId}:${block.exerciseId}`).toBeGreaterThan(0);
      }
    }
    const firstCourse = read("claude_certified_architect_foundations__01");
    expect(firstCourse.lessons[0].chapters.map((chapter: any) => chapter.id)).not.toEqual(expect.arrayContaining([
      "chapter_03", "chapter_03_video_2", "chapter_03_video_3", "chapter_03_video_4", "chapter_03_video_5", "chapter_03_video_6",
    ]));
    const fifthCourseText = JSON.stringify(read("claude_certified_architect_foundations__05"));
    expect(fifthCourseText).not.toContain(".ccc {");
    expect(fifthCourseText).not.toContain("function conn(name, on, svg)");
  });

  it("conserve Reporting BI praticable sans écrans dupliqués ou fausse soumission", () => {
    for (let index = 1; index <= 8; index += 1) {
      const course = read(`analyse_donnees_reporting_bi_codex__${String(index).padStart(2, "0")}`);
      const firstLesson = course.lessons[0];
      expect(firstLesson.chapters.some((chapter: any) => chapter.id === "chapter_00")).toBe(false);
      for (const chapter of firstLesson.chapters) {
        const title = localized(chapter.title);
        const body = (chapter.blocks || []).map((block: any) => localized(block.body || block.content)).join("\n");
        expect(/^checkpoint/i.test(title) && /\b(?:soumettez|submit)\b/i.test(body)).toBe(false);
      }
      for (const numeric of blocks(course).filter((block: any) => block.type === "exercise" && block.exercise_type === "numeric_answers")) {
        expect(numeric.id).toMatch(/^numeric_exercise_\d{2}$/);
        expect(numeric.questions.length).toBeGreaterThan(0);
        expect(numeric.questions.every((question: any) => question.expected_value !== undefined)).toBe(true);
      }
    }
    const first = read("analyse_donnees_reporting_bi_codex__01");
    expect(blocks(first).some((block: any) => block.type === "text")).toBe(false);
  });

  it("expose les critères Sales dans les deux langues et retire le TP Copilot Studio non fourni", () => {
    const course = read("ai_for_sales__01");
    const chapters = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const allBlocks = blocks(course);
    const practicals = blocks(course).filter((block: any) => block.type === "cloud_exercise");
    expect(practicals.length).toBeGreaterThan(0);
    expect(practicals.every((block: any) => Array.isArray(block.learnerCriteria) && block.learnerCriteria.length > 0 && block.learnerCriteria.every((criterion: any) => criterion.fr && criterion.en))).toBe(true);
    expect(chapters.every((chapter: any) => Array.isArray(chapter.blocks) && chapter.blocks.length > 0)).toBe(true);
    const sorts = allBlocks.filter((block: any) => block.type === "bucket_sort");
    expect(sorts.length).toBeGreaterThan(0);
    expect(sorts.every((block: any) => block.correction?.fr && block.correction?.en)).toBe(true);
    expect(allBlocks.some((block: any) => block.id === "dc_3_act_03_tp")).toBe(false);
    expect(allBlocks).toEqual(expect.arrayContaining([expect.objectContaining({ id: "dc_3_act_03_tp_learning_note", type: "content" })]));
    expect(chapters.filter((chapter: any) => chapter.completionRule?.requires?.includes("requiredExercisesPassed")).every((chapter: any) =>
      chapter.blocks.some((block: any) => ["cloud_exercise", "bucket_sort", "single_choice_exercise", "multi_choice_exercise", "matching", "ordering"].includes(block.type)),
    )).toBe(true);
  });
});
