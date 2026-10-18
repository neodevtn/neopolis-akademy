import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const coursePath = path.resolve(import.meta.dirname, "../client/public/data/courses/huggingface_llm_course__01.json");
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
const blocks = activities.flatMap((activity: any) => activity.blocks);

describe("Hugging Face Learn · LLM Course", () => {
  it("préserve les 103 pages et l’ordre des 14 unités canoniques", () => {
    expect(course.huggingFaceImport.expected.pages_expected).toBe(103);
    expect(course.lessons).toHaveLength(14);
    expect(activities).toHaveLength(103);
    expect(activities[0].title.en).toBe("Introduction");
  });

  it("conserve le contenu publié sans réintroduire les checkpoints ou laboratoires non vérifiables", () => {
    const optionalSourcePages = activities.filter((activity: any) =>
      ["checkpoint_or_quiz", "exercise_or_lab"].includes(activity.sourceActivityType),
    );
    const practicalTypes = new Set(["cloud_exercise", "code_repl", "ai_evaluation", "free_text_exercise", "terminal_sim"]);

    expect(optionalSourcePages).toHaveLength(82);
    expect(optionalSourcePages.every((activity: any) => activity.requiredBeforeAdvance === false)).toBe(true);
    expect(activities.every((activity: any) => activity.blocks?.length > 0)).toBe(true);
    expect(blocks.every((block: any) => ["content", "download"].includes(block.type))).toBe(true);
    expect(blocks.filter((block: any) => practicalTypes.has(block.type))).toHaveLength(0);
    expect(activities.filter((activity: any) => activity.requiredBeforeAdvance).every((activity: any) => activity.type === "teaching")).toBe(true);
  });

  it("publie seulement les téléchargements locaux via le proxy média", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toContain("https://huggingface.co");
    expect(serialized).not.toContain("youtube.com");
    expect(serialized).not.toContain("youtu.be");
    expect(serialized).not.toContain("/manus-storage/");
    const downloads = blocks.filter((block: any) => block.type === "download");
    expect(downloads).toHaveLength(11);
    expect(downloads.every((block: any) => block.download_url.startsWith("/api/assets/"))).toBe(true);
  });
});
