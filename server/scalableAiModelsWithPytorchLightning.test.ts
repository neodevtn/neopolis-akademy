import course from "../client/public/data/courses/scalable_ai_models_with_pytorch_lightning__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Modèles d’IA évolutifs avec PyTorch Lightning", () => {
  it("préserve les activités, l’interactivité et les médias locaux", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    expect(activities).toHaveLength(30);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(10);
    expect(blocks.filter((block: any) => ["cloud_exercise", "single_choice_exercise", "bucket_sort"].includes(block.type))).toHaveLength(20);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
