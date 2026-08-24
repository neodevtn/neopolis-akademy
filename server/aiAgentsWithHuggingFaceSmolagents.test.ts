import course from "../client/public/data/courses/ai_agents_with_hugging_face_smolagents__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Agents IA avec Hugging Face smolagents", () => {
  it("préserve les compteurs, les formats interactifs et les médias locaux", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    expect(activities).toHaveLength(30);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(10);
    expect(blocks.filter((block: any) => block.type === "cloud_exercise")).toHaveLength(14);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(1);
    expect(blocks.filter((block: any) => /choice_exercise/.test(block.type))).toHaveLength(4);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
