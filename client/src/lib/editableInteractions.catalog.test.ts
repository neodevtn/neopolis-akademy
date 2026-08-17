import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveEditableInteractions } from "./editableInteractions";

const root = process.cwd();
const coursesDir = path.join(root, "client", "public", "data", "courses");
const lessonQuizzes = JSON.parse(fs.readFileSync(path.join(root, "client", "public", "data", "lessonQuizzes.json"), "utf-8"));

describe("catalogue editable interactions", () => {
  it("does not expose a legacy exercise unless a checkpoint block references it", () => {
    const files = fs.readdirSync(coursesDir).filter((file) => file.endsWith(".json"));
    let resolvedInteractions = 0;
    for (const file of files) {
      const course = JSON.parse(fs.readFileSync(path.join(coursesDir, file), "utf-8"));
      for (const [lessonIndex, lesson] of (course.lessons || []).entries()) {
        for (const [chapterIndex, chapter] of (lesson.chapters || []).entries()) {
          const checkpointIds = new Set((chapter.blocks || []).filter((block: any) => block.type === "checkpoint" && block.exerciseId).map((block: any) => block.exerciseId));
          const interactions = resolveEditableInteractions({ course, lessonIndex, chapterIndex, lessonQuizzes });
          interactions.filter((interaction) => interaction.source === "checkpoint_exercise").forEach((interaction) => expect(checkpointIds.has(interaction.id)).toBe(true));
          resolvedInteractions += interactions.length;
        }
      }
    }
    expect(files.length).toBe(80);
    expect(resolvedInteractions).toBeGreaterThan(2_000);
  });

  it("resolves the real chapter quiz bank for the documented Claude example", () => {
    const course = JSON.parse(fs.readFileSync(path.join(coursesDir, "claude_certified_associate_foundations__01.json"), "utf-8"));
    const interactions = resolveEditableInteractions({ course, lessonIndex: 0, chapterIndex: 1, lessonQuizzes });
    const chapterQuiz = interactions.filter((interaction) => interaction.source === "chapter_quiz");
    expect(chapterQuiz).toHaveLength(11);
    expect(chapterQuiz.some((interaction) => interaction.title.includes("qualité compte tenu de la variabilité"))).toBe(true);
    expect(interactions.some((interaction) => interaction.id === "ex_claude_certified_associate_foundations__01_001")).toBe(false);
  });
});
