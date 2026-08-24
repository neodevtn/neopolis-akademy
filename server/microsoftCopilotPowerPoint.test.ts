import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/microsoft_copilot_in_powerpoint__01.json";
import catalog from "../client/src/data/trainingIndex.json";

describe("cours DataCamp Microsoft Copilot dans PowerPoint", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("respecte les compteurs canoniques et la catégorie de productivité", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_microsoft_copilot_in_powerpoint");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === "microsoft_copilot_in_powerpoint__01");
    expect(certification).toMatchObject({ group: "workplace_ai_productivity", totalLessons: 3, totalActivities: 20, totalVideos: 7, totalExercises: 13, totalDownloads: 3 });
    expect(courseIndex).toMatchObject({ certId: certification?.id, totalActivities: 20, videoCount: 7, exerciseCount: 13 });
  });

  it("préserve les Projector, TP autonomes et QCM interactifs avec verrouillage", () => {
    const projector = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    const labs = blocks.filter((block: any) => block.type === "cloud_exercise");
    expect(activities).toHaveLength(20);
    expect(projector).toHaveLength(7);
    expect(projector.every((block: any) => block.audioUrl && block.slidesPdf && block.transcriptSegments?.length)).toBe(true);
    expect(labs).toHaveLength(11);
    expect(labs.every((block: any) => block.environmentGuide && !JSON.stringify(block).includes("<exercise_objective>"))).toBe(true);
    expect(blocks.filter((block: any) => block.type === "multi_choice_exercise" || block.type === "single_choice_exercise")).toHaveLength(2);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("ne publie que des médias locaux exposés par le proxy", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });
});
