import course from "../client/public/data/courses/ai_for_marketing__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp IA pour le marketing", () => {
  it("préserve la structure, les formats interactifs et les médias locaux", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    expect(activities).toHaveLength(27);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(10);
    expect(blocks.filter((block: any) => block.type === "cloud_exercise")).toHaveLength(12);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(2);
    expect(blocks.filter((block: any) => /choice_exercise/.test(block.type))).toHaveLength(3);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
