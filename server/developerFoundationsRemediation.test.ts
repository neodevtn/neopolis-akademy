import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { DEVELOPER_FOUNDATIONS_SECURE_CORRECTIONS } from "./developerFoundationsCorrectionRegistry";

const root = path.resolve(__dirname, "..");
const certificationId = "claude_certified_developer_foundations";
const courseIds = ["01", "02", "03", "04", "05"].map((suffix) => `${certificationId}__${suffix}`);
const index = JSON.parse(fs.readFileSync(path.join(root, "client", "src", "data", "trainingIndex.json"), "utf8"));
const readCourse = (courseId: string) => JSON.parse(fs.readFileSync(path.join(root, "client", "public", "data", "courses", `${courseId}.json`), "utf8"));
const text = (value: any) => typeof value === "string" ? value : value?.fr || value?.en || "";

function blocks(course: any) {
  return course.lessons.flatMap((lesson: any) => lesson.chapters || []).flatMap((chapter: any) => chapter.blocks || []);
}

describe("Developer Foundations remediation", () => {
  it("retains only referenced, complete checkpoint definitions", () => {
    for (const courseId of courseIds) {
      const course = readCourse(courseId);
      const checkpointIds = new Set(blocks(course).filter((block: any) => block.type === "checkpoint").map((block: any) => block.exerciseId));
      expect((course.exercises || []).map((exercise: any) => exercise.id).sort()).toEqual(Array.from(checkpointIds).sort());
      for (const exercise of course.exercises || []) {
        expect(text(exercise.prompt).trim(), `${courseId}:${exercise.id}`).not.toHaveLength(0);
        expect(exercise).toMatchObject({ serverCorrectionRequired: true });
        expect(exercise).not.toHaveProperty("correction");
        expect(exercise).not.toHaveProperty("rubric");
        expect((exercise.options || []).some((option: any) => option.correct === true)).toBe(false);
        expect((DEVELOPER_FOUNDATIONS_SECURE_CORRECTIONS as any)[courseId]?.[exercise.id]).toBeTruthy();
      }
    }
  });

  it("removes source-incomplete cards and duplicate static cumulative activity screens", () => {
    const course4 = readCourse(`${certificationId}__04`);
    const security = course4.lessons[0].chapters.find((chapter: any) => chapter.id === "chapter_11");
    expect(security.blocks.filter((block: any) => block.type === "content")).toHaveLength(1);
    expect(security.blocks.filter((block: any) => block.type === "flip_cards")).toHaveLength(1);
    const course5 = readCourse(`${certificationId}__05`);
    const trust = course5.lessons[0].chapters.find((chapter: any) => chapter.id === "chapter_13");
    expect(trust.blocks.filter((block: any) => block.type === "flip_cards")).toHaveLength(1);
    const cardBacks = [course4, course5].flatMap((course: any) => blocks(course)).filter((block: any) => block.type === "flip_cards").flatMap((block: any) => block.cards || []).map((card: any) => text(card.back));
    expect(cardBacks).not.toContain("Gate the new version through your eval before y");
    expect(cardBacks).not.toContain("Then the agent wrote a file no");
    expect(cardBacks).not.toContain("earlier modul");
  });

  it("synchronizes catalogue counters to the remediated course payload", () => {
    const entries = index.courses.filter((entry: any) => entry.certId === certificationId);
    for (const courseId of courseIds) {
      const course = readCourse(courseId);
      const courseBlocks = blocks(course);
      const entry = entries.find((item: any) => item.id === courseId);
      expect(entry).toBeTruthy();
      expect(entry).toMatchObject({
        chapterCount: course.lessons.flatMap((lesson: any) => lesson.chapters || []).length,
        exerciseCount: (course.exercises || []).length,
        totalActivities: courseBlocks.filter((block: any) => ["checkpoint", "cloud_exercise"].includes(block.type)).length,
        videoCount: courseBlocks.filter((block: any) => block.type === "video").length,
        downloadCount: courseBlocks.filter((block: any) => block.type === "download").length,
      });
    }
  });
});
