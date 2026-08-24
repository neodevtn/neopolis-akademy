import catalog from "../client/src/data/trainingIndex.json";
import course from "../client/public/data/courses/advanced_ai_assisted_coding_for_developers__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Programmation assistée par IA avancée pour les développeurs", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("publie les compteurs canoniques et le rattachement catalogue", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_advanced_ai_assisted_coding_for_developers");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === "advanced_ai_assisted_coding_for_developers__01");

    expect(certification).toMatchObject({
      group: "fullstack_ai_engineering",
      totalLessons: 3,
      totalActivities: 32,
      totalVideos: 10,
      totalExercises: 22,
      totalDownloads: 3,
    });
    expect(courseIndex).toMatchObject({
      certId: certification?.id,
      totalActivities: 32,
      videoCount: 10,
      exerciseCount: 22,
      downloadCount: 3,
    });
  });

  it("préserve les activités Projector et interactives dans leur ordre séquentiel", () => {
    const projectorVideos = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    expect(activities).toHaveLength(32);
    expect(projectorVideos).toHaveLength(10);
    expect(projectorVideos.every((block: any) => block.audioUrl && block.slidesPdf && (block.subtitleUrlFr || block.subtitleUrlEn) && block.projectorTimings?.length && block.transcriptSegments?.length)).toBe(true);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(8);
    expect(blocks.filter((block: any) => block.type === "multi_choice_exercise")).toHaveLength(9);
    expect(blocks.filter((block: any) => block.type === "single_choice_exercise")).toHaveLength(5);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "DragAndDropExercise")).toHaveLength(8);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "VisualExercise")).toHaveLength(9);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "PureMultipleChoiceExercise")).toHaveLength(5);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("affiche une préparation explicite et ne publie aucune URL source externe", () => {
    const firstBlocks = activities[0]?.blocks || [];
    const serialized = JSON.stringify(course);

    expect(firstBlocks.some((block: any) => block.type === "content" && /donn(?:é|e)es sensibles|sensitive data/i.test(JSON.stringify(block.body)))).toBe(true);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });
});
