import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/software_development_with_windsurf__01.json";
import catalog from "../client/src/data/trainingIndex.json";

describe("cours DataCamp Développement logiciel avec Windsurf", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("respecte les compteurs canoniques et le rattachement catalogue", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_software_development_with_windsurf");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === "software_development_with_windsurf__01");
    expect(certification).toMatchObject({ totalLessons: 3, totalActivities: 31, totalVideos: 11, totalExercises: 20, totalDownloads: 3 });
    expect(courseIndex).toMatchObject({ certId: certification?.id, totalActivities: 31, videoCount: 11, exerciseCount: 20 });
    expect(activities).toHaveLength(31);
  });

  it("préserve les Projector et les formats interactifs source", () => {
    const projector = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    expect(projector).toHaveLength(11);
    expect(projector.every((block: any) => (block.mp4Url || block.audioUrl) && block.projectorTimings?.length && block.transcriptSegments?.length)).toBe(true);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "VisualExercise")).toHaveLength(9);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "PureMultipleChoiceExercise")).toHaveLength(6);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "DragAndDropExercise")).toHaveLength(5);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("fournit une préparation Windsurf et ne publie aucune URL DataCamp", () => {
    expect(blocks[0]).toMatchObject({ type: "content" });
    expect(JSON.stringify(blocks[0])).toContain("Windsurf");
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });
});
