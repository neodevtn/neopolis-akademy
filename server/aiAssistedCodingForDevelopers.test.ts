import catalog from "../client/src/data/trainingIndex.json";
import course from "../client/public/data/courses/ai_assisted_coding_for_developers__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Coder avec l’aide de l’IA pour les développeurs", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("publie les compteurs canoniques et le rattachement catalogue", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_ai_assisted_coding_for_developers");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === "ai_assisted_coding_for_developers__01");
    expect(certification).toMatchObject({ group: "fullstack_ai_engineering", totalLessons: 3, totalActivities: 28, totalVideos: 10, totalExercises: 18, totalDownloads: 3 });
    expect(courseIndex).toMatchObject({ certId: certification?.id, totalActivities: 28, videoCount: 10, exerciseCount: 18 });
  });

  it("préserve les leçons Projector, les activités interactives et le verrouillage séquentiel", () => {
    const projectorVideos = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    expect(activities).toHaveLength(28);
    expect(projectorVideos).toHaveLength(10);
    expect(projectorVideos.every((block: any) => block.audioUrl && block.slidesPdf && block.subtitleUrlFr && block.projectorTimings?.length && block.transcriptSegments?.length)).toBe(true);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(4);
    expect(blocks.filter((block: any) => block.type === "single_choice_exercise" || block.type === "multi_choice_exercise")).toHaveLength(9);
    expect(blocks.filter((block: any) => block.type === "ai_evaluation")).toHaveLength(5);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "PromptingExercise")).toHaveLength(5);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("n’expose aucune URL DataCamp externe ni chemin de stockage direct", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });
});
