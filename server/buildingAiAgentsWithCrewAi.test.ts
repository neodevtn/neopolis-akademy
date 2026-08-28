import course from "../client/public/data/courses/building_ai_agents_with_crewai__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Créer des agents d’IA avec CrewAI", () => {
  it("conserve uniquement les deux Projector reproductibles après retrait des DataLab", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    expect(activities).toHaveLength(2);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(2);
    expect(activities.every((activity: any) => activity.sourceActivityType !== "DatalabExercise")).toBe(true);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
