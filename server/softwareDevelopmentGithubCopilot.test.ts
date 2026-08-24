import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/software_development_with_github_copilot__01.json";
import catalog from "../client/src/data/trainingIndex.json";

describe("cours DataCamp Développement logiciel avec GitHub Copilot", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("publie les compteurs canoniques et le rattachement catalogue", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_software_development_with_github_copilot");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === "software_development_with_github_copilot__01");
    expect(certification).toMatchObject({ totalLessons: 4, totalActivities: 40, totalVideos: 13, totalExercises: 27, totalDownloads: 4 });
    expect(courseIndex).toMatchObject({ certId: certification?.id, totalActivities: 40, videoCount: 13, exerciseCount: 27 });
  });

  it("préserve les 13 Projector locaux et chaque type d’activité interactive", () => {
    const projectorVideos = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    expect(activities).toHaveLength(40);
    expect(projectorVideos).toHaveLength(13);
    expect(projectorVideos.every((block: any) => block.mp4Url && block.slidesPdf && block.projectorTimings?.length && block.transcriptSegments?.length)).toBe(true);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(13);
    expect(blocks.filter((block: any) => block.type === "single_choice_exercise" || block.type === "multi_choice_exercise")).toHaveLength(14);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "VisualExercise")).toHaveLength(6);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "VisualExercise").every((activity: any) => activity.blocks[0]?.visualAssetUrl?.startsWith("/api/assets/"))).toBe(true);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("ne publie aucun lien source DataCamp ni chemin de stockage direct", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });
});
