import course from "../client/public/data/courses/efficient_ai_model_training_with_pytorch__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Entraîner efficacement des modèles d’IA avec PyTorch", () => {
  it("préserve les activités, l’interactivité et les médias locaux disponibles", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    expect(activities).toHaveLength(45);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(13);
    expect(blocks.filter((block: any) => ["cloud_exercise", "code_repl", "bucket_sort"].includes(block.type))).toHaveLength(32);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
