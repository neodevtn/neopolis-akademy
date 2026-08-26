import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/introduction_to_model_context_protocol_mcp__01.json";
import catalog from "../client/src/data/trainingIndex.json";

describe("cours DataCamp Introduction au Model Context Protocol", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("respecte les compteurs canoniques et le classement développeur", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_introduction_to_model_context_protocol_mcp");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === "introduction_to_model_context_protocol_mcp__01");
    expect(certification).toMatchObject({ group: "fullstack_ai_engineering", totalLessons: 3, totalActivities: 34, totalVideos: 11, totalExercises: 21, totalDownloads: 3 });
    expect(courseIndex).toMatchObject({ certId: certification?.id, totalActivities: 34, videoCount: 11, exerciseCount: 21 });
  });

  it("préserve les Projector, TP MCP et tris interactifs avec verrouillage", () => {
    const projector = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    const labs = blocks.filter((block: any) => block.type === "cloud_exercise");
    expect(activities).toHaveLength(34);
    expect(projector).toHaveLength(11);
    expect(projector.every((block: any) => block.audioUrl && block.slidesPdf && block.transcriptSegments?.length)).toBe(true);
    expect(labs).toHaveLength(18);
    expect(labs.every((block: any) => block.environmentGuide && !JSON.stringify(block).includes("<exercise_objective>"))).toBe(true);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(3);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("ne publie que des références média locales", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });
});
