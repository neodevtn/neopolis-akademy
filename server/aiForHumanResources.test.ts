import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/ai_for_human_resources__01.json";
import catalog from "../client/src/data/trainingIndex.json";

describe("cours DataCamp L’IA pour les ressources humaines", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("respecte les compteurs canoniques et le rattachement catalogue", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_ai_for_human_resources");
    const indexCourse = catalog.courses.find((entry: any) => entry.id === "ai_for_human_resources__01");
    expect(certification).toMatchObject({ totalLessons: 3, totalActivities: 32, totalVideos: 11, totalExercises: 21, totalDownloads: 3 });
    expect(indexCourse).toMatchObject({ certId: certification?.id, totalActivities: 32, videoCount: 11, exerciseCount: 21 });
  });

  it("préserve les Projector, les TP et les tris interactifs", () => {
    const projectorVideos = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    expect(activities).toHaveLength(32);
    expect(projectorVideos).toHaveLength(11);
    expect(projectorVideos.every((block: any) => (block.audioUrl || block.mp4Url) && block.slidesPdf && block.projectorTimings?.length && block.transcriptSegments?.length)).toBe(true);
    expect(blocks.filter((block: any) => block.type === "cloud_exercise")).toHaveLength(16);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(5);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("publie uniquement des médias locaux Neopolis", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });
});
