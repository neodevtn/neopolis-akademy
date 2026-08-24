import course from "../client/public/data/courses/end_to_end_rag_with_weaviate__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp RAG de bout en bout avec Weaviate", () => {
  it("préserve les activités, les TP autonomes et les médias locaux", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    expect(activities).toHaveLength(14);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(4);
    expect(blocks.filter((block: any) => block.type === "cloud_exercise")).toHaveLength(10);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
