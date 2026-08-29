import course from "../client/public/data/courses/graph_rag_with_langchain_and_neo4j__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Graph RAG avec LangChain et Neo4j", () => {
  it("préserve les compteurs, les TP et les médias locaux", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    expect(activities).toHaveLength(36);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(11);
    expect(blocks.filter((block: any) => block.type === "cloud_exercise")).toHaveLength(10);
    expect(blocks.filter((block: any) => block.type === "code_repl")).toHaveLength(12);
    expect(activities.some((activity: any) => activity.id === "dc_ch02_act02" || activity.sourceActivityType === "VisualExercise")).toBe(false);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
