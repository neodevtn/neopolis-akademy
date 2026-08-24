import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/ai_for_data_analysts__01.json";
import catalog from "../client/src/data/trainingIndex.json";

describe("cours DataCamp L’IA pour les data analysts", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("conserve les compteurs canoniques et le rattachement catalogue BI", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_ai_for_data_analysts");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === "ai_for_data_analysts__01");
    expect(certification).toMatchObject({ group: "bi_data_analytics", totalLessons: 4, totalActivities: 39, totalVideos: 11, totalExercises: 28, totalDownloads: 4 });
    expect(courseIndex).toMatchObject({ certId: certification?.id, totalActivities: 39, videoCount: 11, exerciseCount: 28 });
    expect(activities).toHaveLength(39);
  });

  it("préserve les Projector et chaque format interactif DataCamp", () => {
    const projectorVideos = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    expect(projectorVideos).toHaveLength(11);
    expect(projectorVideos.every((block: any) => (block.mp4Url || block.audioUrl) && block.slidesPdf && block.projectorTimings?.length && block.transcriptSegments?.length)).toBe(true);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "VisualExercise")).toHaveLength(21);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "DragAndDropExercise")).toHaveLength(4);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "PureMultipleChoiceExercise")).toHaveLength(3);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("ne publie ni URL DataCamp externe ni chemin de stockage direct", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });
});
