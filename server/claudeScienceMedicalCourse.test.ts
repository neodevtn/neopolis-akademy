import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sanitizeCourseDataForLearner } from "./courseDataRoute";
import { CLAUDE_SCIENCE_CHECKPOINT_KEYS, CLAUDE_SCIENCE_MODULE_QUIZZES } from "./claudeScienceCourseAssessments";
import { hasOptionalSupplementaryVideos } from "../client/src/pages/training/chapterProgress";

const root = process.cwd();
const coursePath = resolve(root, "client/public/data/courses/claude_science_recherche_medicale__01.json");
const cataloguePath = resolve(root, "client/src/data/trainingIndex.json");
const course = JSON.parse(readFileSync(coursePath, "utf8"));
const catalogue = JSON.parse(readFileSync(cataloguePath, "utf8"));
const allChapters = course.lessons.flatMap((lesson: any) => lesson.chapters);
const allBlocks = allChapters.flatMap((chapter: any) => chapter.blocks || []);

function recursiveValues(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap(recursiveValues);
  if (value && typeof value === "object") return [value, ...Object.values(value as Record<string, unknown>).flatMap(recursiveValues)];
  return [value];
}

describe("Claude Science medical research course integration", () => {
  it("preserves the supplied 8-module instructional structure", () => {
    expect(course.courseId).toBe("claude_science_recherche_medicale__01");
    expect(course.modules).toHaveLength(8);
    expect(course.sections).toHaveLength(8);
    expect(course.lessons).toHaveLength(32);
    expect(course.lessons.every((lesson: any, index: number) => lesson.moduleId === course.modules[Math.floor(index / 4)].id)).toBe(true);
    expect(course.lessons.every((lesson: any) => lesson.unlockRule === "previous_lesson_checkpoint_passed_or_first_lesson")).toBe(true);
  });

  it("has exactly 32 secure checkpoints, 8 labs, 8 module quizzes and 64 questions", () => {
    const checkpoints = allBlocks.filter((block: any) => block.type === "checkpoint");
    const labs = allBlocks.filter((block: any) => block.type === "cloud_exercise");
    const quizzes = allBlocks.filter((block: any) => block.type === "module_quiz");
    const quizQuestionCount = Object.values(CLAUDE_SCIENCE_MODULE_QUIZZES).reduce((count, quiz: any) => count + quiz.questions.length, 0);
    expect(checkpoints).toHaveLength(32);
    expect(labs).toHaveLength(8);
    expect(quizzes).toHaveLength(8);
    expect(course.exercises).toHaveLength(32);
    expect(Object.keys(CLAUDE_SCIENCE_CHECKPOINT_KEYS)).toHaveLength(32);
    expect(Object.keys(CLAUDE_SCIENCE_MODULE_QUIZZES)).toHaveLength(8);
    expect(quizQuestionCount).toBe(64);
    expect(quizzes.every((quiz: any) => quiz.questionCount === 8 && quiz.passingScore === 75)).toBe(true);
    const checkpointsById = new Map(checkpoints.map((checkpoint: any) => [checkpoint.exerciseId, checkpoint]));
    expect(course.exercises.every((exercise: any) => {
      const checkpoint = checkpointsById.get(exercise.id);
      return checkpoint && exercise.lessonId && exercise.chapterId && Number.isInteger(exercise.lessonIndex) && Number.isInteger(exercise.chapterIndex);
    })).toBe(true);
  });

  it("uses stable managed media URLs and retains source references", () => {
    expect(course.downloadableResources).toHaveLength(19);
    expect(course.downloadableResources.every((resource: any) => resource.url.startsWith("/api/assets/") && resource.source === "neopolis_media_library")).toBe(true);
    const screenshots = allBlocks.filter((block: any) => block.type === "annotated_screenshot");
    expect(screenshots.length).toBeGreaterThan(0);
    expect(screenshots.every((block: any) => block.imageUrl.startsWith("/api/assets/") && block.alt.fr && block.caption.fr && block.sourceRefs.length > 0)).toBe(true);
    expect(allBlocks.every((block: any) => Array.isArray(block.source_refs) && block.source_refs.length > 0)).toBe(true);
    expect(allBlocks.filter((block: any) => block.type === "video").every((block: any) => block.language && block.durationSeconds > 0 && block.objectiveBefore.fr && block.questionsAfter.length > 0 && block.alternativeTextFr)).toBe(true);
    const optionalVideoChapter = allChapters.find((chapter: any) => chapter.id === "csm_01_01_optional_video");
    expect(optionalVideoChapter.blocks.find((block: any) => block.type === "video")?.optional).toBe(true);
    expect(hasOptionalSupplementaryVideos(optionalVideoChapter)).toBe(true);
  });

  it("contains the non-clinical synthetic-data boundary at entry and before every practical activity", () => {
    const warnings = allBlocks.filter((block: any) => block.type === "callout" && block.variant === "danger");
    expect(warnings).toHaveLength(9);
    expect(warnings.every((warning: any) => warning.body.fr.includes("données synthétiques") && warning.body.fr.includes("ni diagnostic"))).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/\bXP\b/i);
  });

  it("does not disclose checkpoint choices, explanations, quiz keys, or corrections in learner course data", () => {
    const rawSerialized = JSON.stringify(course);
    const learner = JSON.parse(sanitizeCourseDataForLearner(rawSerialized));
    const learnerSerialized = JSON.stringify(learner);
    expect(learnerSerialized).not.toContain("correctAnswer");
    expect(learnerSerialized).not.toContain("feedback_correct_fr");
    expect(learnerSerialized).not.toContain("explanation_fr");
    expect(recursiveValues(learner.exercises).some((value) => value && typeof value === "object" && "correct" in (value as Record<string, unknown>))).toBe(false);
    expect(learnerSerialized).not.toContain("CLAUDE_SCIENCE_MODULE_QUIZZES");
  });

  it("registers a searchable research-and-health training category without replacing existing courses", () => {
    const category = catalogue.categories.find((entry: any) => entry.id === "ai_research_health");
    const certification = catalogue.certifications.find((entry: any) => entry.id === "claude_science_recherche_medicale");
    const courseMetadata = catalogue.courses.find((entry: any) => entry.id === course.courseId);
    expect(category?.title.fr).toBe("IA pour la recherche et la santé");
    expect(certification).toMatchObject({ group: "ai_research_health", totalLessons: 32, totalVideos: 4, totalDownloads: 19 });
    expect(courseMetadata).toMatchObject({ certId: certification.id, lessonCount: 32, exerciseCount: 32, videoCount: 4, downloadCount: 19 });
  });
});
