import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { sanitizeCourseDataForLearner } from "./courseDataRoute";
import { isPrivateLearningCorrectionAssetKey } from "./assetProxy";
import { CLAUDE_SCIENCE_V2_CHECKPOINT_KEYS, CLAUDE_SCIENCE_V2_FINAL_QUIZZES, CLAUDE_SCIENCE_V2_LABS } from "./claudeScienceV2Assessments";
import { getSensitiveExerciseAnswerKey } from "./sensitiveExerciseAnswerKeys";

const root = path.resolve(import.meta.dirname, "..");
const coursesDir = path.join(root, "client", "public", "data", "courses");
const courseIds = ["claude_science_01_fondamentaux", "claude_science_02_pratique", "claude_science_03_tp"] as const;
const readJson = <T,>(file: string) => JSON.parse(fs.readFileSync(file, "utf8")) as T;
const readCourse = (courseId: string) => readJson<any>(path.join(coursesDir, `${courseId}.json`));
const blocksOf = (course: any) => course.lessons.flatMap((lesson: any) => lesson.chapters).flatMap((chapter: any) => chapter.blocks || []);

describe("Claude Science V3 source-locked collection", () => {
  it("indexes exactly the supplied three-course sequential collection", () => {
    const index = readJson<any>(path.join(root, "client", "src", "data", "trainingIndex.json"));
    const collection = index.certifications.find((entry: any) => entry.id === "claude_science_recherche_sante_v3");
    expect(collection?.courses).toEqual([...courseIds]);
    expect(collection?.sequentialCourseLocking).toBe(true);
    expect(index.categories.some((entry: any) => entry.id === "ai_research_health")).toBe(true);
    expect(index.courses.filter((entry: any) => entry.certId === "claude_science_recherche_medicale")).toEqual([]);
    expect(index.courses.filter((entry: any) => entry.certId === collection.id).map((entry: any) => entry.id)).toEqual([...courseIds]);
  });

  it("preserves the V3 canonical counters and one-screen-at-a-time structure", () => {
    const courses = courseIds.map(readCourse);
    expect(courses).toHaveLength(3);
    expect(courses.reduce((sum, course) => sum + course.lessons.length, 0)).toBe(12);
    expect(Object.keys(CLAUDE_SCIENCE_V2_CHECKPOINT_KEYS)).toHaveLength(9);
    expect(Object.keys(CLAUDE_SCIENCE_V2_LABS)).toHaveLength(3);
    expect(Object.values(CLAUDE_SCIENCE_V2_FINAL_QUIZZES).reduce((sum: number, quiz: any) => sum + quiz.questions.length, 0)).toBe(12);
    for (const course of courses) {
      for (const lesson of course.lessons) {
        expect(lesson.chapters.length).toBeGreaterThan(0);
        expect(lesson.chapters.every((chapter: any) => Array.isArray(chapter.blocks) && chapter.blocks.length > 0)).toBe(true);
      }
    }
  });

  it("maps every supplied source screen only to established standard Neopolis block types", () => {
    const types = new Set(courseIds.flatMap((courseId) => blocksOf(readCourse(courseId)).map((block: any) => block.type)));
    for (const type of ["learning_objectives", "content", "source_references", "video", "annotated_screenshot", "guided_action", "single_choice_exercise", "lesson_summary", "callout", "download", "cloud_exercise", "reflection", "course_final_quiz"]) {
      expect(types.has(type)).toBe(true);
    }
    expect(types.has("html")).toBe(false);
  });

  it("keeps every checkpoint key and final-quiz answer exclusively in the server registries", () => {
    for (const exerciseId of Object.keys(CLAUDE_SCIENCE_V2_CHECKPOINT_KEYS)) {
      const courseId = courseIds.find((id) => exerciseId.startsWith(`${id}_`));
      expect(courseId).toBeTruthy();
      expect(getSensitiveExerciseAnswerKey(courseId!, exerciseId)).not.toBeNull();
    }
    for (const courseId of courseIds) {
      const raw = fs.readFileSync(path.join(coursesDir, `${courseId}.json`), "utf8");
      const learner = sanitizeCourseDataForLearner(raw);
      expect(learner).not.toContain('"correctAnswer"');
      expect(learner).not.toContain('"correction"');
      expect(learner).not.toMatch(/solution_lab_0[1-3]/);
      expect(learner).not.toContain("correct_option_index");
    }
  });

  it("provides the declared public files in the media library and reserves correction material", () => {
    const mediaLibrary = readJson<any>(path.join(root, "client", "public", "data", "mediaLibrary.json"));
    const mediaUrls = Object.keys(mediaLibrary).filter((url) => url.startsWith("/api/assets/claude-science-v3/"));
    expect(mediaUrls).toHaveLength(19);
    expect(mediaUrls.every((url) => !/\/downloads\/(?:expected\/|scripts\/solution_)/.test(url))).toBe(true);
    const practicals = blocksOf(readCourse("claude_science_03_tp")).filter((block: any) => block.type === "cloud_exercise");
    expect(practicals).toHaveLength(3);
    expect(practicals.flatMap((block: any) => block.resources).every((resource: any) => resource.url.startsWith("/api/assets/claude-science-v3/"))).toBe(true);
    expect(isPrivateLearningCorrectionAssetKey("claude-science-v3/courses/03_travaux_pratiques/downloads/expected/example_12345678.json")).toBe(true);
    expect(isPrivateLearningCorrectionAssetKey("claude-science-v3/courses/03_travaux_pratiques/downloads/scripts/solution_example_12345678.py")).toBe(true);
  });

  it("retains the five declared readable images and two supplied video embeddings", () => {
    const allBlocks = courseIds.flatMap((courseId) => blocksOf(readCourse(courseId)));
    const screenshots = allBlocks.filter((block: any) => block.type === "annotated_screenshot");
    expect(screenshots).toHaveLength(5);
    for (const screenshot of screenshots) {
      expect(screenshot.imageUrl).toMatch(/^\/api\/assets\/claude-science-v3\//);
      expect(screenshot.displayPolicy).toMatchObject({ allowZoom: true, allowFullscreen: true });
      expect(screenshot.sourceRefs[0].url).toMatch(/^https:\/\//);
    }
    const embeddedVideos = allBlocks.filter((block: any) => block.type === "video");
    expect(embeddedVideos.map((block: any) => block.videoId).sort()).toEqual(["idtMsa_1yNk", "sHImlfVM9r4"].sort());
    for (const video of embeddedVideos) {
      expect(video.embedUrl).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\//);
      expect(video.watchUrl).toMatch(/^https:\/\/www\.youtube\.com\/watch/);
      expect(video.alternativeTextFr).toBeTruthy();
    }
  });

  it("preserves source-backed references, safety boundaries, and no-XP policy", () => {
    for (const courseId of courseIds) {
      const course = readCourse(courseId);
      expect(course.safety.warning_fr).toBeTruthy();
      expect(course.supportedLanguages).toEqual(["fr"]);
      expect(course.languageSelectionDisabled).toBe(true);
      expect(JSON.stringify(course)).not.toMatch(/\bXP\b/i);
      for (const sourceBlock of blocksOf(course).filter((block: any) => block.type === "source_references")) {
        for (const reference of sourceBlock.sources) {
          expect(reference.id).toBeTruthy();
          expect(reference.title).toBeTruthy();
          expect(reference.url).toMatch(/^https:\/\//);
        }
      }
    }
  });

  it("gates the final quiz behind every source checkpoint and uses Claude Sonnet only for lab evaluation", () => {
    const service = fs.readFileSync(path.join(root, "server", "claudeScienceV2AssessmentService.ts"), "utf8");
    expect(service).toContain('model: "claude-sonnet-4-6"');
    expect(service).not.toMatch(/openrouter|gpt-|deepseek|ollama/i);
    for (const courseId of courseIds) {
      const course = readCourse(courseId);
      const finalQuiz = blocksOf(course).find((block: any) => block.type === "course_final_quiz");
      expect(finalQuiz).toBeTruthy();
      if (courseId === "claude_science_03_tp") {
        expect(finalQuiz).toBeTruthy();
      } else {
        expect(Object.keys(CLAUDE_SCIENCE_V2_CHECKPOINT_KEYS).filter((id) => id.startsWith(`${courseId}_`))).not.toHaveLength(0);
      }
    }
  });
});
