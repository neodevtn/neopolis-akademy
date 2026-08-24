import course from "../client/public/data/courses/building_ai_agents_with_haystack__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Créer des agents d’IA avec Haystack", () => {
  it("préserve les activités, les TP autonomes et les médias locaux", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    expect(activities).toHaveLength(11);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(5);
    expect(blocks.filter((block: any) => block.type === "cloud_exercise")).toHaveLength(6);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
