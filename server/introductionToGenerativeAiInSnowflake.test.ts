import course from "../client/public/data/courses/introduction_to_generative_ai_in_snowflake__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp IA générative dans Snowflake", () => {
  it("préserve les compteurs, la préparation et les médias locaux", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    expect(activities).toHaveLength(7);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(7);
    expect(blocks.filter((block: any) => block.type === "cloud_exercise")).toHaveLength(0);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
