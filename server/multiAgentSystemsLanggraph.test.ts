import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/multi_agent_systems_with_langgraph__01.json";

describe("cours DataCamp Systèmes multi-agents avec LangGraph", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks ?? []);

  it("conserve les quatre Projector locaux et rend non bloquants les écrans après retrait des DataLab", () => {
    const projectors = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    expect(activities).toHaveLength(4);
    expect(projectors).toHaveLength(4);
    expect(projectors.every((block: any) =>
      block.audioUrl?.startsWith("/api/assets/")
      && block.slidesPdf?.startsWith("/api/assets/")
      && block.projectorTimings?.length > 0
      && block.transcriptSegments?.length > 0,
    )).toBe(true);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance === false)).toBe(true);
  });

  it("ne crée pas de TP libre ni de dépendance média DataCamp", () => {
    expect(blocks.filter((block: any) => ["cloud_exercise", "ai_evaluation", "code_repl"].includes(block.type))).toHaveLength(0);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
  });
});
