import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/building_agentic_workflows_with_llamaindex__01.json";

describe("cours DataCamp Créer des workflows agentiques avec LlamaIndex", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks ?? []);

  it("conserve uniquement les cinq activités Projector reproductibles", () => {
    expect(activities).toHaveLength(5);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(5);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("ne remplace pas les activités DataLab non rubricées par un exercice libre", () => {
    expect(blocks.filter((block: any) => ["cloud_exercise", "ai_evaluation", "code_repl"].includes(block.type))).toHaveLength(0);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
  });
});
