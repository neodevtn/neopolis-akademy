import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const coursesDir = path.resolve(__dirname, "../client/public/data/courses");
const tracks = [
  "claude_certified_developer_foundations",
  "claude_certified_architect_foundations",
  "claude_certified_architect_professional",
];
const expectedSourceTitles: Record<string, string> = {
  claude_certified_developer_foundations__01: "MSO Foundations",
  claude_certified_developer_foundations__02: "Production-Grade Prompting, Agents & Tool Use",
  claude_certified_developer_foundations__03: "Claude Code, MCP & Integration",
  claude_certified_developer_foundations__04: "Production Engineering, Evals, and Security",
  claude_certified_developer_foundations__05: "Accelerators & IP Contribution",
  claude_certified_architect_professional__01: "Claude Platform & Solution Design",
  claude_certified_architect_professional__02: "Enterprise Integration & Production",
  claude_certified_architect_professional__03: "Responsible AI, Safety & Risk for Architects",
  claude_certified_architect_professional__04: "Stakeholder Engagement, Lifecycle & GTM",
  claude_certified_architect_professional__05: "Team Enablement & Operational Productivity",
};

function readCourse(courseId: string): any {
  return JSON.parse(fs.readFileSync(path.join(coursesDir, `${courseId}.json`), "utf8"));
}

function allAuditFiles(): string[] {
  return fs.readdirSync(coursesDir)
    .filter((file) => file.endsWith(".json") && tracks.some((track) => file.startsWith(`${track}__`)))
    .sort();
}

describe("Anthropic certification audit corrections", () => {
  it("restores the verified official source titles", () => {
    for (const [courseId, title] of Object.entries(expectedSourceTitles)) {
      expect(readCourse(courseId).sourceCourseTitle).toBeDefined();
      expect(readCourse(courseId).sourceCourseTitle.split(" / ").at(-1)).toBe(title);
    }
  });

  it("uses the Neopolis media proxy for every local media reference in the three tracks", () => {
    const files = allAuditFiles();
    expect(files).toHaveLength(17);
    for (const file of files) {
      const content = fs.readFileSync(path.join(coursesDir, file), "utf8");
      expect(content).not.toContain("/manus-storage/");
    }
  });

  it("keeps every video block playable", () => {
    for (const file of allAuditFiles()) {
      const course = JSON.parse(fs.readFileSync(path.join(coursesDir, file), "utf8"));
      for (const lesson of course.lessons || []) {
        for (const chapter of lesson.chapters || []) {
          for (const block of chapter.blocks || []) {
            if (block.type === "video") {
              expect(Boolean(block.videoId || block.mp4Url || block.audioUrl)).toBe(true);
            }
          }
        }
      }
    }
  });

  it("replaces the AI Fluency exercise with the official reflection and preserves its completion rule", () => {
    const course = readCourse("claude_certified_architect_foundations__01");
    const lesson = course.lessons.find((item: any) => item.id === "lesson_10");
    const chapter = lesson.chapters.find((item: any) => item.id === "chapter_02");
    const content = chapter.blocks.find((block: any) => block.type === "content");
    const download = chapter.blocks.find((block: any) => block.type === "download");
    const exercise = course.exercises.find((item: any) => item.id === "ex_claude_certified_architect_foundations__01_010");

    expect(chapter.completionRule.requires).toEqual(["requiredExercisesPassed"]);
    expect(chapter.blocks[0]).toMatchObject({ type: "callout", variant: "info", title: { fr: "Contenu officiel Anthropic" } });
    expect(content.body.en).toContain("Exercise: Putting Things into Practice");
    expect(content.body.en).toContain("What challenges have you encountered");
    expect(content.body.en).not.toContain("Option 3");
    expect(download.download_url).toBe("/api/assets/01_AI_Fluency_vocabulary_cheat_sheet_d44ea415.pdf");
    expect(download).not.toHaveProperty("image");
    expect(exercise).toMatchObject({ chapterId: "chapter_02", required: true, title: { en: "Exercise: Putting Things into Practice" } });
    expect(exercise.prompt.en).not.toContain("Option 3");
  });

  it("labels the practical tutorials as a Neopolis supplement", () => {
    const course = readCourse("claude_certified_architect_foundations__01");
    const lesson = course.lessons.find((item: any) => item.id === "lesson_10");
    const chapter = lesson.chapters.find((item: any) => item.id === "chapter_03");
    expect(chapter.blocks[0]).toMatchObject({ type: "callout", variant: "info", title: { fr: "Complément Neopolis" } });
  });
});
