import catalog from "../client/src/data/trainingIndex.json";
import course from "../client/public/data/courses/deploying_ai_into_production_with_fastapi__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Déployer l’IA en production avec FastAPI", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("publie les compteurs canoniques et le rattachement catalogue", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_deploying_ai_into_production_with_fastapi");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === "deploying_ai_into_production_with_fastapi__01");

    expect(certification).toMatchObject({ group: "fullstack_ai_engineering", totalLessons: 4, totalActivities: 46, totalVideos: 14, totalExercises: 32, totalDownloads: 4 });
    expect(courseIndex).toMatchObject({ certId: certification?.id, totalActivities: 46, videoCount: 14, exerciseCount: 32, downloadCount: 4 });
  });

  it("préserve les Projector et les grands formats d’exercice avec progression séquentielle", () => {
    const projectorVideos = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    expect(activities).toHaveLength(46);
    expect(projectorVideos).toHaveLength(14);
    expect(projectorVideos.every((block: any) => block.audioUrl && block.slidesPdf && block.projectorTimings?.length && block.transcriptSegments?.length)).toBe(true);
    expect(projectorVideos.filter((block: any) => block.subtitleUrlFr || block.subtitleUrlEn)).toHaveLength(4);
    expect(blocks.filter((block: any) => block.type === "cloud_exercise")).toHaveLength(22);
    expect(blocks.filter((block: any) => block.type === "code_repl")).toHaveLength(9);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(1);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "NormalExercise")).toHaveLength(22);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "IDEExercise")).toHaveLength(9);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "DragAndDropExercise")).toHaveLength(1);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("affiche une préparation FastAPI explicite sans publier d’URL source externe", () => {
    const serialized = JSON.stringify(course);
    const firstBlocks = activities[0]?.blocks || [];
    expect(firstBlocks.some((block: any) => block.type === "content" && /FastAPI|uvicorn|donn(?:é|e)es personnelles/i.test(JSON.stringify(block.body)))).toBe(true);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });
});
