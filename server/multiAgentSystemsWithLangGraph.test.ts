import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/multi_agent_systems_with_langgraph__01.json";
import catalog from "../client/src/data/trainingIndex.json";

describe("cours DataCamp Systèmes multi-agents avec LangGraph", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("préserve les compteurs source et son rattachement catalogue", () => {
    const certification = catalog.certifications.find((item: any) => item.id === "datacamp_multi_agent_systems_with_langgraph");
    const courseIndex = catalog.courses.find((item: any) => item.id === "multi_agent_systems_with_langgraph__01");
    expect(certification).toMatchObject({ totalLessons: 2, totalActivities: 4, totalVideos: 4, totalExercises: 0, totalDownloads: 2 });
    expect(courseIndex).toMatchObject({ certId: certification?.id, totalActivities: 4, videoCount: 4, exerciseCount: 0 });
  });

  it("retire les DataLab non rubricés et conserve les leçons Projector", () => {
    const projectors = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    const practicals = blocks.filter((block: any) => ["cloud_exercise", "ai_evaluation", "code_repl"].includes(block.type));
    expect(activities).toHaveLength(4);
    expect(projectors).toHaveLength(4);
    expect(practicals).toHaveLength(0);
    expect(projectors.every((block: any) => block.audioUrl && block.slidesPdf && block.projectorTimings?.length && block.transcriptSegments?.length)).toBe(true);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("reste entièrement local côté médias et conserve les tags d’orchestration", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
    expect(course.lessons.some((lesson: any) => lesson.competencyTags.includes("ai_orchestration"))).toBe(true);
  });
});
