import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { sanitizeCourseDataForLearner } from "./courseDataRoute";
import { CLAUDE_SCIENCE_V2_CHECKPOINT_KEYS, CLAUDE_SCIENCE_V2_FINAL_QUIZZES, CLAUDE_SCIENCE_V2_LABS } from "./claudeScienceV2Assessments";

const root = path.resolve(import.meta.dirname, "..");
const coursesDir = path.join(root, "client", "public", "data", "courses");
const courseIds = ["claude_science_01_initiation", "claude_science_02_pratique", "claude_science_03_travaux_pratiques"] as const;
const readCourse = (courseId: string) => JSON.parse(fs.readFileSync(path.join(coursesDir, `${courseId}.json`), "utf8"));
const blocksOf = (course: any) => course.lessons.flatMap((lesson: any) => lesson.chapters).flatMap((chapter: any) => chapter.blocks || []);

describe("Claude Science V2 course collection", () => {
  it("publishes exactly three French-only courses in their sequential collection", () => {
    const index = JSON.parse(fs.readFileSync(path.join(root, "client", "src", "data", "trainingIndex.json"), "utf8"));
    const certification = index.certifications.find((entry: any) => entry.id === "claude_science_recherche_medicale");
    expect(certification?.courses).toEqual([...courseIds]);
    expect(certification?.sequentialCourseLocking).toBe(true);
    expect(index.categories.some((entry: any) => entry.id === "ai_research_health")).toBe(true);
    for (const courseId of courseIds) {
      const course = readCourse(courseId);
      expect(course.supportedLanguages).toEqual(["fr"]);
      expect(course.languageSelectionDisabled).toBe(true);
      expect(course.safety.warning_fr).toMatch(/patient|non clinique|synth[eé]tiques/i);
    }
  });

  it("preserves the sourced V2 structural inventory", () => {
    const first = readCourse(courseIds[0]);
    const second = readCourse(courseIds[1]);
    const third = readCourse(courseIds[2]);
    expect(Object.keys(CLAUDE_SCIENCE_V2_CHECKPOINT_KEYS)).toHaveLength(15);
    expect(blocksOf(first).filter((block: any) => block.serverValidated)).toHaveLength(6);
    expect(blocksOf(second).filter((block: any) => block.serverValidated)).toHaveLength(9);
    expect(blocksOf(third).filter((block: any) => block.serverGradedAssessment === "claude_science_v2_lab")).toHaveLength(4);
    expect(Object.values(CLAUDE_SCIENCE_V2_FINAL_QUIZZES).map((quiz: any) => quiz.questions.length)).toEqual([6, 8]);
    expect(Object.keys(CLAUDE_SCIENCE_V2_LABS)).toHaveLength(4);
    expect([...courseIds].flatMap((courseId) => blocksOf(readCourse(courseId))).filter((block: any) => block.type === "annotated_screenshot")).toHaveLength(5);
    expect([...courseIds].flatMap((courseId) => blocksOf(readCourse(courseId))).filter((block: any) => block.type === "video").map((block: any) => block.videoId).sort()).toEqual(["NG4MEDQz30A", "i8g1pdzWJik"].sort());
  });

  it("keeps each supplied lesson as a sequential learner unit", () => {
    const expectedLessons = [6, 9, 4];
    courseIds.forEach((courseId, index) => {
      const course = readCourse(courseId);
      expect(course.lessons).toHaveLength(expectedLessons[index]);
      for (const lesson of course.lessons) {
        expect(lesson.chapters.length).toBeGreaterThan(0);
        const isPracticalLesson = blocksOf({ lessons: [lesson] }).some((block: any) => block.type === "cloud_exercise");
        const hasCheckpoint = blocksOf({ lessons: [lesson] }).some((block: any) => block.serverValidated === true);
        expect(isPracticalLesson || hasCheckpoint).toBe(true);
      }
    });
  });

  it("keeps checkpoint answers, final quiz keys and practical corrections out of learner JSON", () => {
    for (const courseId of courseIds) {
      const raw = fs.readFileSync(path.join(coursesDir, `${courseId}.json`), "utf8");
      const sanitized = sanitizeCourseDataForLearner(raw);
      expect(sanitized).not.toMatch(/"correctAnswer"/);
      expect(sanitized).not.toMatch(/"correction"\s*:/);
      expect(sanitized).not.toMatch(/solution_lab_0[1-4]/);
      expect(sanitized).not.toContain("correctChoiceId");
    }
  });

  it("uses only managed URLs for locally supplied screenshots and downloads", () => {
    for (const courseId of courseIds) {
      for (const block of blocksOf(readCourse(courseId))) {
        if (block.type === "annotated_screenshot") expect(block.imageUrl).toMatch(/^\/api\/assets\//);
        if (block.type === "cloud_exercise") for (const resource of block.resources || []) {
          expect(resource.url).toMatch(/^\/api\/assets\//);
          expect(resource.url).not.toMatch(/\/expected\/|\/solutions\/|\/scripts\/solution_/);
        }
      }
    }
  });

  it("excludes private corrections and expected outputs from the administrative media library", () => {
    const mediaLibrary = JSON.parse(fs.readFileSync(path.join(root, "client", "public", "data", "mediaLibrary.json"), "utf8"));
    const urls = Object.keys(mediaLibrary);

    expect(urls.some((url) => /\/claude-science-v2\/03_claude_science_travaux_pratiques\/(?:solutions\/|downloads\/expected\/|downloads\/scripts\/solution_)/.test(url))).toBe(false);
  });

  it("uses Claude Sonnet only for server-side practical evaluation", () => {
    const service = fs.readFileSync(path.join(root, "server", "claudeScienceV2AssessmentService.ts"), "utf8");
    expect(service).toContain('model: "claude-sonnet-4-6"');
    expect(service).not.toMatch(/openrouter|gpt-|deepseek|ollama/i);
    expect(service).toContain("N'acceptez jamais une conclusion clinique");
  });
});
