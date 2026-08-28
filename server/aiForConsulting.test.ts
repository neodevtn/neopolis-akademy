import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/ai_for_consulting__01.json";
import catalog from "../client/src/data/trainingIndex.json";

describe("cours DataCamp L’IA pour le conseil", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("préserve les compteurs canoniques et son rattachement au catalogue", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_ai_for_consulting");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === "ai_for_consulting__01");
    expect(certification).toMatchObject({ totalLessons: 3, totalActivities: 30, totalVideos: 11, totalExercises: 19, totalDownloads: 3, group: "workplace_ai_productivity" });
    expect(courseIndex).toMatchObject({ certId: certification?.id, totalActivities: 30, videoCount: 11, exerciseCount: 19 });
    expect(activities).toHaveLength(30);
    expect(activities.some((activity: any) => activity.id === "dc_ch03_act09")).toBe(false);
  });

  it("rend les Projector et les activités pratiques par les blocs standards", () => {
    const projectorVideos = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    expect(projectorVideos).toHaveLength(11);
    expect(projectorVideos.every((block: any) => (block.audioUrl || block.mp4Url) && block.slidesPdf && block.projectorTimings?.length && block.transcriptSegments?.length)).toBe(true);
    expect(blocks.filter((block: any) => block.type === "cloud_exercise")).toHaveLength(16);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(1);
    expect(blocks.filter((block: any) => block.type === "single_choice_exercise")).toHaveLength(2);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("n’expose ni stockage direct ni média DataCamp externe", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });
});
