import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const coursesDir = path.resolve(process.cwd(), "client/public/data/courses");
const gatedTypes = new Set([
  "checkpoint", "single_choice_exercise", "multi_choice_exercise", "resource_review",
  "cloud_exercise", "course_final_quiz", "reflection", "guided_action", "bucket_sort",
  "matching", "ordering", "knowledge_check", "inline_myth_reality",
  "inline_multiple_choice_feedback", "inline_scenario_question_feedback",
]);

describe("remédiation pédagogique structurelle P0/P1", () => {
  const courses = fs.readdirSync(coursesDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => ({ name, course: JSON.parse(fs.readFileSync(path.join(coursesDir, name), "utf8")) }));

  it("ne conserve aucun checkpoint free_text sans correction vérifiable", () => {
    const unverifiable: string[] = [];
    for (const { name, course } of courses) {
      const exercises = new Map((course.exercises ?? []).filter((entry: unknown) => Boolean(entry && typeof entry === "object")).map((entry: { id?: string }) => [entry.id, entry]));
      for (const lesson of course.lessons ?? []) {
        for (const chapter of lesson?.chapters ?? []) {
          for (const block of chapter?.blocks ?? []) {
            if (block?.type !== "checkpoint") continue;
            const exercise = exercises.get(block.exerciseId) as { interactionType?: string } | undefined;
            if (exercise?.interactionType === "free_text") unverifiable.push(`${name}:${chapter.id}:${block.exerciseId}`);
          }
        }
      }
    }
    expect(unverifiable).toEqual([]);
  });

  it("ne conserve aucune définition free_text devenue orpheline après retrait de son écran", () => {
    const orphanDefinitions = courses.flatMap(({ name, course }) =>
      (course.exercises ?? [])
        .filter((exercise: { interactionType?: string }) => exercise?.interactionType === "free_text")
        .map((exercise: { id?: string }) => `${name}:${exercise.id}`),
    );
    expect(orphanDefinitions).toEqual([]);
  });

  it("normalise les blocs texte historiques vers le format rendu content/body", () => {
    const legacyText: string[] = [];
    for (const { name, course } of courses) {
      for (const lesson of course.lessons ?? []) {
        for (const chapter of lesson?.chapters ?? []) {
          for (const block of chapter?.blocks ?? []) {
            if (block?.type === "text" && block.content && !block.body) legacyText.push(`${name}:${chapter.id}`);
          }
        }
      }
    }
    expect(legacyText).toEqual([]);
  });

  it("ne conserve pas requiredExercisesPassed sans activité rendue et verrouillable", () => {
    const phantomGates: string[] = [];
    for (const { name, course } of courses) {
      for (const lesson of course.lessons ?? []) {
        for (const chapter of lesson?.chapters ?? []) {
          const requires = chapter?.completionRule?.requires;
          if (!Array.isArray(requires) || !requires.includes("requiredExercisesPassed")) continue;
          const hasGatedActivity = (chapter.blocks ?? []).some((block: { type?: string; exercise_type?: string }) =>
            gatedTypes.has(block?.type ?? "") || (block?.type === "exercise" && block.exercise_type === "numeric_answers"),
          );
          if (!hasGatedActivity) phantomGates.push(`${name}:${chapter.id}`);
        }
      }
    }
    expect(phantomGates).toEqual([]);
  });
});
