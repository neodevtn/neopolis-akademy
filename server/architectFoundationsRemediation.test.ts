import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS } from "./architectFoundationsCorrectionRegistry";

const root = path.resolve(__dirname, "..");
const certificationId = "claude_certified_architect_foundations";
const courseIds = ["01", "02", "03", "04", "05", "06", "07"].map((suffix) => `${certificationId}__${suffix}`);
const interactiveBlockTypes = new Set([
  "checkpoint",
  "cloud_exercise",
  "single_choice_exercise",
  "multi_choice_exercise",
  "bucket_sort",
  "knowledge_check",
  "inline_myth_reality",
  "inline_multiple_choice_feedback",
  "inline_scenario_question_feedback",
  "course_final_quiz",
]);

const readCourse = (courseId: string) => JSON.parse(fs.readFileSync(path.join(root, "client", "public", "data", "courses", `${courseId}.json`), "utf8"));
const index = JSON.parse(fs.readFileSync(path.join(root, "client", "src", "data", "trainingIndex.json"), "utf8"));
const value = (item: unknown) => typeof item === "string" ? item : (item as { en?: string; fr?: string } | null)?.en || (item as { fr?: string } | null)?.fr || "";
const hasText = (item: unknown) => value(item).trim().length > 0;

function courseMetrics(course: any) {
  const chapters = course.lessons.flatMap((lesson: any) => lesson.chapters || []);
  const blocks = chapters.flatMap((chapter: any) => chapter.blocks || []);
  return {
    lessonCount: course.lessons.length,
    chapterCount: chapters.length,
    totalActivities: chapters.length,
    exerciseCount: blocks.filter((block: any) => interactiveBlockTypes.has(block.type)).length,
    videoCount: blocks.filter((block: any) => block.type === "video").length,
    downloadCount: blocks.filter((block: any) => block.type === "download").length,
  };
}

describe("Architect Foundations remediation", () => {
  it("removes only the four empty source-less lessons and cleans their section entries", () => {
    const expectations = {
      [`${certificationId}__03`]: ["Making a Request", "Prompts in the Client"],
      [`${certificationId}__06`]: ["Temperature", "Prompts in the Client"],
    };

    for (const [courseId, removedTitles] of Object.entries(expectations)) {
      const course = readCourse(courseId);
      const lessonTitles = course.lessons.map((lesson: any) => value(lesson.title));
      expect(lessonTitles).not.toEqual(expect.arrayContaining(removedTitles));
      expect(course.lessons.flatMap((lesson: any) => lesson.chapters || []).every((chapter: any) => (chapter.blocks || []).length > 0)).toBe(true);
      for (const section of course.sections || []) {
        expect((section.lessons || []).map(value)).not.toEqual(expect.arrayContaining(removedTitles));
      }
    }
  });

  it("synchronizes per-course and certification counters with published blocks", () => {
    const courseEntries = index.courses.filter((entry: any) => entry.certId === certificationId);
    const calculated = { totalLessons: 0, totalExercises: 0, totalVideos: 0, totalDownloads: 0, totalActivities: 0 };

    for (const courseId of courseIds) {
      const course = readCourse(courseId);
      const entry = courseEntries.find((candidate: any) => candidate.id === courseId);
      const metrics = courseMetrics(course);
      expect(entry).toMatchObject({ id: courseId, ...metrics });
      for (const [key, metric] of Object.entries(metrics)) {
        const totalKey = key === "lessonCount" ? "totalLessons" : key === "exerciseCount" ? "totalExercises" : key === "videoCount" ? "totalVideos" : key === "downloadCount" ? "totalDownloads" : key === "totalActivities" ? "totalActivities" : null;
        if (totalKey) calculated[totalKey as keyof typeof calculated] += metric as number;
      }
    }

    const certification = index.certifications.find((entry: any) => entry.id === certificationId);
    expect(certification).toMatchObject({ courseCount: 7, ...calculated });
  });

  it("keeps every published checkpoint linked to a clear, corrected exercise definition", () => {
    for (const courseId of courseIds) {
      const course = readCourse(courseId);
      const exerciseById = new Map((course.exercises || []).map((exercise: any) => [exercise.id, exercise]));
      const checkpoints = course.lessons.flatMap((lesson: any) => lesson.chapters || []).flatMap((chapter: any) => chapter.blocks || []).filter((block: any) => block.type === "checkpoint");
      for (const checkpoint of checkpoints) {
        const exercise = exerciseById.get(checkpoint.exerciseId);
        expect(exercise, `${courseId}:${checkpoint.exerciseId}`).toBeTruthy();
        expect(hasText(exercise.prompt) || hasText(exercise.question)).toBe(true);
        expect(exercise).toMatchObject({ serverCorrectionRequired: true });
        expect(exercise).not.toHaveProperty("correction");
        expect(ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS[courseId]?.[checkpoint.exerciseId]?.correction, `${courseId}:${checkpoint.exerciseId}`).toBeTruthy();
      }
    }
  });
});
