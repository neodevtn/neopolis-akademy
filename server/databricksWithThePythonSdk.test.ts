import course from "../client/public/data/courses/databricks_with_the_python_sdk__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Databricks avec le SDK Python", () => {
  it("préserve les compteurs, les TP et les médias locaux", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    expect(activities).toHaveLength(24);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(8);
    expect(blocks.filter((block: any) => block.type === "cloud_exercise")).toHaveLength(15);
    expect(blocks.filter((block: any) => /choice_exercise$/.test(block.type))).toHaveLength(1);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
