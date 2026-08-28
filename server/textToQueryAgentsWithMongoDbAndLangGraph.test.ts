import course from "../client/public/data/courses/text_to_query_agents_with_mongodb_and_langgraph__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Agents de text-to-query avec MongoDB et LangGraph", () => {
  it("préserve les Projector et retire les DataLab non rubricés", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    expect(activities).toHaveLength(5);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(5);
    expect(blocks.filter((block: any) => ["cloud_exercise", "ai_evaluation", "code_repl"].includes(block.type))).toHaveLength(0);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
