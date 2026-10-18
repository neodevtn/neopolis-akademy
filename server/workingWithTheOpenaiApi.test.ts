import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const course = JSON.parse(fs.readFileSync(path.join(root, "client/public/data/courses/working_with_the_openai_api__01.json"), "utf8"));
const index = JSON.parse(fs.readFileSync(path.join(root, "client/src/data/trainingIndex.json"), "utf8"));
const activities = course.lessons.flatMap((lesson: { chapters?: unknown[] }) => lesson.chapters ?? []) as Array<Record<string, unknown>>;
const blocks = activities.flatMap((activity: { blocks?: unknown[] }) => activity.blocks ?? []) as Array<Record<string, unknown>>;
const text = JSON.stringify(course);

describe("Travailler avec l’API OpenAI", () => {
  it("publie les écrans et médias locaux restants sans gamification, DataLab ni TP non fourni", () => {
    const videos = blocks.filter((block) => block.type === "video");
    const practicalTypes = new Set(["cloud_exercise", "code_repl", "ai_evaluation", "free_text_exercise", "terminal_sim"]);
    const courseIndex = index.courses.find((entry: any) => entry.id === course.courseId);
    const certification = index.certifications.find((entry: any) => entry.id === courseIndex?.certId);

    expect(course.lessons).toHaveLength(3);
    expect(activities).toHaveLength(11);
    expect(videos).toHaveLength(9);
    expect(videos.every((block: any) =>
      (block.mp4Url?.startsWith("/api/assets/") || block.audioUrl?.startsWith("/api/assets/"))
      && block.slidesPdf?.startsWith("/api/assets/")
      && String(block.transcript || "").trim().length > 0
      && block.transcriptSegments?.length > 0,
    )).toBe(true);
    expect(activities.filter((activity: any) => activity.requiredBeforeAdvance)).toHaveLength(9);
    expect(activities.filter((activity: any) => activity.requiredBeforeAdvance).every((activity: any) => activity.type === "teaching" && activity.blocks?.length > 0)).toBe(true);
    expect(blocks.some((block) => practicalTypes.has(String(block.type)))).toBe(false);
    expect(courseIndex).toMatchObject({ lessonCount: 3, chapterCount: 11, totalActivities: 11, exerciseCount: 0, videoCount: 9, downloadCount: 3 });
    expect(certification).toMatchObject({ totalLessons: 3, totalActivities: 11, totalExercises: 0, totalVideos: 9, totalDownloads: 3 });
    expect(text).not.toMatch(/XP quotidiens|datacamp\.com\/datalab|\/manus-storage\//i);
  });
});
