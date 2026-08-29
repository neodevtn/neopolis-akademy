import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/microsoft_copilot_in_word__01.json";
import catalog from "../client/src/data/trainingIndex.json";

describe("cours DataCamp Microsoft Copilot dans Word", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("conserve les compteurs canoniques et le rattachement catalogue", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_microsoft_copilot_in_word");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === "microsoft_copilot_in_word__01");
    expect(certification).toMatchObject({ totalLessons: 3, totalActivities: 24, totalVideos: 10, totalExercises: 14, totalDownloads: 3 });
    expect(courseIndex).toMatchObject({ certId: certification?.id, totalActivities: 24, videoCount: 10, exerciseCount: 14 });
    expect(activities).toHaveLength(24);
  });

  it("préserve les Projector et chaque grand type d’activité source", () => {
    const projector = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    expect(projector).toHaveLength(10);
    expect(projector.every((block: any) => (block.mp4Url || block.audioUrl) && block.projectorTimings?.length && block.transcriptSegments?.length && block.slidesPdf)).toBe(true);
    const labs = blocks.filter((block: any) => block.type === "cloud_exercise");
    expect(activities.filter((activity: any) => activity.sourceActivityType === "CloudExercise")).toHaveLength(9);
    expect(labs).toHaveLength(9);
    expect(labs.every((block: any) => block.rubricCriteria?.length && block.rubricVersion === "datacamp-source-2026-08-28" && block.passingScore === block.maxScore)).toBe(true);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "DragAndDropExercise")).toHaveLength(2);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "VisualExercise")).toHaveLength(2);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "PureMultipleChoiceExercise")).toHaveLength(1);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("utilise uniquement les médias locaux routés par le proxy", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });

  it("ne rend plus de recommandation DataCamp ou Microsoft dans les Projector", () => {
    const projectorText = blocks
      .filter((block: any) => block.type === "video")
      .flatMap((block: any) => [
        ...(block.projectorSlides || []).flatMap((slide: any) => [slide.script, slide.content, slide.contentLeft, slide.contentRight]),
        ...(block.transcriptSegments || []).flatMap((segment: any) => [segment.heading, segment.text]),
        block.transcript,
      ])
      .filter((value: unknown): value is string => typeof value === "string")
      .join("\n");

    expect(projectorText).not.toMatch(/Explorez plus de ressources DataCamp et Microsoft/i);
    expect(projectorText).not.toMatch(/we have more DataCamp content for you/i);
  });
});
