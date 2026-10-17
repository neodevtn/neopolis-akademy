import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { normalizeCourseContent } from "../client/src/pages/training/contentNormalization";

const coursesDir = path.resolve(__dirname, "../client/public/data/courses");
const tracks = [
  "claude_certified_associate_foundations",
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

function collectFrenchStrings(value: unknown, values: string[] = []): string[] {
  if (typeof value === "string") return values;
  if (Array.isArray(value)) {
    value.forEach((item) => collectFrenchStrings(item, values));
    return values;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.fr === "string") values.push(record.fr);
    Object.entries(record)
      .filter(([key]) => key !== "fr")
      .forEach(([, nested]) => collectFrenchStrings(nested, values));
  }
  return values;
}

describe("Anthropic certification audit corrections", () => {
  it("restores the verified official source titles", () => {
    for (const [courseId, title] of Object.entries(expectedSourceTitles)) {
      expect(readCourse(courseId).sourceCourseTitle).toBeDefined();
      expect(readCourse(courseId).sourceCourseTitle.split(" / ").at(-1)).toBe(title);
    }
  });

  it("covers every preparation course from all four Anthropic certification tracks", () => {
    expect(allAuditFiles()).toHaveLength(25);
  });

  it("uses the Neopolis media proxy for every local media reference", () => {
    for (const file of allAuditFiles()) {
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

  it("normalizes French structural labels and removes visual-position dependencies in every certification course", () => {
    const forbiddenFrench = /StrategyWhat|What it doesWhen|à gauche|à droite|sur la gauche|sur la droite/i;
    for (const file of allAuditFiles()) {
      const course = JSON.parse(fs.readFileSync(path.join(coursesDir, file), "utf8"));
      for (const text of collectFrenchStrings(course)) {
        expect(normalizeCourseContent(text, "fr")).not.toMatch(forbiddenFrench);
      }
    }
  });

  it("keeps checkpoint markers distinct so their rendered options remain separated", () => {
    for (const file of allAuditFiles()) {
      const course = JSON.parse(fs.readFileSync(path.join(coursesDir, file), "utf8"));
      const checkpointIds = new Set<string>();
      for (const lesson of course.lessons || []) {
        for (const chapter of lesson.chapters || []) {
          for (const block of chapter.blocks || []) {
            if (block.type === "checkpoint") {
              expect(typeof block.exerciseId).toBe("string");
              expect(checkpointIds.has(block.exerciseId)).toBe(false);
              checkpointIds.add(block.exerciseId);
            }
          }
        }
      }
    }
  });

  it("removes the unverifiable Rewind checkpoint and leaves Plugins as an informational review", () => {
    const course = readCourse("claude_certified_architect_foundations__04");
    const rewindExerciseId = "ex_claude_certified_architect_foundations__04_005";
    const rewindBlocks = course.lessons.flatMap((lesson: any) => lesson.chapters || [])
      .flatMap((chapter: any) => chapter.blocks || [])
      .filter((block: any) => block.type === "checkpoint" && block.exerciseId === rewindExerciseId);
    expect(rewindBlocks).toHaveLength(0);
    expect(course.exercises.find((exercise: any) => exercise.id === rewindExerciseId)).toBeUndefined();
    const pluginsLesson = course.lessons.find((lesson: any) => lesson.title?.en === "Plugins");
    const review = pluginsLesson.chapters.find((chapter: any) => chapter.title?.en === "Review: Plugins");
    expect(review).toMatchObject({ type: "teaching", completionRule: { requires: ["contentViewed"] } });
    expect(review.blocks.some((block: any) => block.type === "checkpoint")).toBe(false);
    expect(JSON.stringify(review)).not.toContain("Rewind");
  });

  it("uses the canonical RAG acronym in the Amazon Bedrock lesson and its screen title", () => {
    const course = readCourse("claude_certified_architect_foundations__06");
    const lesson = course.lessons.find((item: any) => item.title?.en === "Implementing the RAG Flow");
    expect(lesson).toBeTruthy();
    expect(lesson.chapters.some((chapter: any) => chapter.title?.en === "Implementing the RAG Flow")).toBe(true);
    expect(JSON.stringify(course)).not.toContain("Implementing the Rag Flow");
  });

  it("keeps verified download provenance on the Architect Foundations courses with legacy assets", () => {
    const courseIds = ["02", "03", "06", "07"].map((suffix) => `claude_certified_architect_foundations__${suffix}`);
    for (const courseId of courseIds) {
      const course = readCourse(courseId);
      const downloads = course.lessons.flatMap((lesson: any) => lesson.chapters || []).flatMap((chapter: any) => chapter.blocks || []).filter((block: any) => block.type === "download");
      expect(downloads.length).toBeGreaterThan(0);
      for (const download of downloads) {
        expect(download.assetMeta).toMatchObject({ origin: "anthropic", official: true });
        expect(download.assetMeta.sourceUrl).toMatch(/^https:\/\/anthropic-partners\.skilljar\.com\//);
        expect(download.assetMeta.mimeType).toBeTruthy();
        expect(download.assetMeta.bytes).toBeGreaterThan(0);
        expect(download.assetMeta.checksum).toMatch(/^sha256:[a-f0-9]{64}$/);
        expect(Number.isNaN(Date.parse(download.assetMeta.testedAt))).toBe(false);
      }
    }
  });

  it("keeps verified source metadata on official videos that have a local transcript", () => {
    const sourceByCourse: Record<string, string> = {
      claude_certified_architect_foundations__04: "https://anthropic-partners.skilljar.com/claude-code-in-action",
      claude_certified_architect_foundations__05: "https://anthropic-partners.skilljar.com/claude-101",
    };
    for (const [courseId, sourceUrl] of Object.entries(sourceByCourse)) {
      const course = readCourse(courseId);
      const chapters = course.lessons.flatMap((lesson: any) => lesson.chapters || []);
      const transcripts = new Set(chapters.flatMap((chapter: any) => chapter.blocks || []).filter((block: any) => block.type === "transcript").map((block: any) => block.videoId));
      const videos = chapters.flatMap((chapter: any) => chapter.blocks || []).filter((block: any) => block.type === "video");
      expect(videos.length).toBeGreaterThan(0);
      for (const video of videos) {
        expect(video.mediaMeta).toMatchObject({ origin: "anthropic", official: true, sourceUrl, localAssetId: video.videoId, transcriptId: `transcript_${video.videoId}` });
        expect(video.mediaMeta.checksum).toMatch(/^sha256:[a-f0-9]{64}$/);
        expect(transcripts.has(video.videoId)).toBe(true);
      }
    }
  });

  it("removes the unscorable AI Fluency reflection while preserving its explanatory content", () => {
    const course = readCourse("claude_certified_architect_foundations__01");
    const chapter = course.lessons.find((lesson: any) => lesson.id === "lesson_10").chapters.find((item: any) => item.id === "chapter_02");
    expect(chapter.blocks.some((block: any) => block.type === "checkpoint")).toBe(false);
    expect(course.exercises.some((exercise: any) => exercise.id === "ex_ai_fluency_intro_reflection")).toBe(false);
    expect(course.exercises.some((exercise: any) => exercise.id === "ex_claude_certified_architect_foundations__01_010")).toBe(false);
    expect(chapter.blocks.find((block: any) => block.type === "content").body.en).toContain("Exercise: Putting Things into Practice");
  });

  it("keeps the AI Fluency source content and download without a phantom activity gate", () => {
    const course = readCourse("claude_certified_architect_foundations__01");
    const lesson = course.lessons.find((item: any) => item.id === "lesson_10");
    const chapter = lesson.chapters.find((item: any) => item.id === "chapter_02");
    const content = chapter.blocks.find((block: any) => block.type === "content");
    const download = chapter.blocks.find((block: any) => block.type === "download");

    expect(chapter.completionRule).toBeUndefined();
    expect(chapter.blocks[0]).toMatchObject({ type: "callout", variant: "info", title: { fr: "Contenu officiel Anthropic" } });
    expect(content.body.en).toContain("Exercise: Putting Things into Practice");
    expect(content.body.en).not.toContain("Option 3");
    expect(download.download_url).toBe("/api/assets/01_AI_Fluency_vocabulary_cheat_sheet_d44ea415.pdf");
    expect(download).not.toHaveProperty("image");
    expect(chapter.blocks.some((block: any) => block.type === "checkpoint")).toBe(false);
    expect(course.exercises.some((item: any) => item.id === "ex_ai_fluency_intro_reflection")).toBe(false);
  });

  it("does not retain the supplemental tutorial screen after its media was removed", () => {
    const course = readCourse("claude_certified_architect_foundations__01");
    const lesson = course.lessons.find((item: any) => item.id === "lesson_10");
    const chapter = lesson.chapters.find((item: any) => item.id === "chapter_03");
    expect(chapter).toBeUndefined();
  });

  it("does not retain orphan free-text correction targets in Architect Foundations course 1", () => {
    const architectFoundations = readCourse("claude_certified_architect_foundations__01");
    expect(architectFoundations.exercises.some((exercise: any) => exercise.interactionType === "free_text")).toBe(false);
  });
});
