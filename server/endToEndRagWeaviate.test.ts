import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/end_to_end_rag_with_weaviate__01.json";

describe("cours DataCamp RAG de bout en bout avec Weaviate", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks ?? []);

  it("conserve les quatre Projector locaux après retrait des DataLab non rubricés", () => {
    expect(activities).toHaveLength(4);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(4);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("ne crée pas de substitution libre ou de dépendance DataCamp externe", () => {
    expect(blocks.filter((block: any) => ["cloud_exercise", "ai_evaluation", "code_repl"].includes(block.type))).toHaveLength(0);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
  });
});
