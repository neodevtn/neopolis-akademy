import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/text_to_query_agents_with_mongodb_and_langgraph__01.json";

describe("cours Agents text-to-query avec MongoDB et LangGraph", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks ?? []);
  it("conserve cinq Projector locaux après retrait des DataLab non rubricés", () => {
    expect(activities).toHaveLength(5);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(5);
    expect(blocks.filter((block: any) => ["cloud_exercise", "ai_evaluation", "code_repl"].includes(block.type))).toHaveLength(0);
  });
});
