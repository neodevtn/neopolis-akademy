import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/ai_for_human_resources__01.json";
import catalog from "../client/src/data/trainingIndex.json";

describe("cours DataCamp L’IA pour les ressources humaines", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("respecte les compteurs canoniques et le rattachement catalogue", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_ai_for_human_resources");
    const indexCourse = catalog.courses.find((entry: any) => entry.id === "ai_for_human_resources__01");
    expect(certification).toMatchObject({ totalLessons: 3, totalActivities: 25, totalVideos: 11, totalExercises: 14, totalDownloads: 3 });
    expect(indexCourse).toMatchObject({ certId: certification?.id, totalActivities: 25, videoCount: 11, exerciseCount: 14, downloadCount: 3 });
  });

  it("préserve les Projector, les TP et les tris interactifs", () => {
    const projectorVideos = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    expect(activities).toHaveLength(25);
    expect(projectorVideos).toHaveLength(11);
    expect(projectorVideos.every((block: any) => (block.audioUrl || block.mp4Url) && block.slidesPdf && block.projectorTimings?.length && block.transcriptSegments?.length)).toBe(true);
    const rubricTps = blocks.filter((block: any) => block.type === "cloud_exercise");
    expect(rubricTps).toHaveLength(9);
    expect(rubricTps.every((block: any) => Array.isArray(block.rubricCriteria) && block.rubricCriteria.length > 0 && block.maxScore === block.passingScore && block.rubricVersion === "datacamp-source-2026-08-28")).toBe(true);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(5);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("publie uniquement des médias locaux Neopolis", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });

  it("retire uniquement les TP source sans rubrique explicite ni asset déclaré", () => {
    const removed = ["dc_ch01_act08", "dc_ch02_act02", "dc_ch02_act05", "dc_ch02_act11", "dc_ch03_act03", "dc_ch03_act05", "dc_ch03_act09"];
    expect(activities.some((activity: any) => removed.includes(activity.id))).toBe(false);
  });
});
