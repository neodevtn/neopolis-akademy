import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/vibe_coding_with_replit__01.json";
import catalog from "../client/src/data/trainingIndex.json";

describe("cours DataCamp Coder en mode Vibe avec Replit", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("publie les compteurs canoniques et le rattachement catalogue", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_vibe_coding_with_replit");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === "vibe_coding_with_replit__01");
    expect(certification).toMatchObject({ totalLessons: 4, totalActivities: 31, totalVideos: 14, totalExercises: 17, totalDownloads: 4 });
    expect(courseIndex).toMatchObject({ certId: certification?.id, totalActivities: 31, videoCount: 14, exerciseCount: 17 });
  });

  it("préserve les leçons Projector et les formats interactifs canoniques", () => {
    const projectorVideos = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    expect(activities).toHaveLength(31);
    expect(projectorVideos).toHaveLength(14);
    expect(projectorVideos.every((block: any) => block.mp4Url && block.slidesPdf && block.projectorTimings?.length && block.transcriptSegments?.length)).toBe(true);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(4);
    expect(blocks.filter((block: any) => block.type === "single_choice_exercise" || block.type === "multi_choice_exercise")).toHaveLength(13);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "VisualExercise")).toHaveLength(7);
    expect(activities.filter((activity: any) => activity.requiredBeforeAdvance)).toHaveLength(24);
    expect(activities.filter((activity: any) => activity.requiredBeforeAdvance).every((activity: any) =>
      activity.blocks.some((block: any) => ["video", "single_choice_exercise", "multi_choice_exercise", "bucket_sort"].includes(block.type)),
    )).toBe(true);
    expect(blocks.filter((block: any) => ["cloud_exercise", "code_repl", "ai_evaluation", "free_text_exercise", "terminal_sim"].includes(block.type))).toHaveLength(0);
  });

  it("ne publie aucun lien source DataCamp ni chemin de stockage direct", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });
});
