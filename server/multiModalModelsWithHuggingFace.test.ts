import course from "../client/public/data/courses/multi_modal_models_with_hugging_face__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Modèles multimodaux avec Hugging Face", () => {
  it("préserve les compteurs, les TP et les médias locaux", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    expect(activities).toHaveLength(45);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(14);
    expect(blocks.filter((block: any) => block.type === "cloud_exercise")).toHaveLength(3);
    expect(blocks.filter((block: any) => block.type === "code_repl")).toHaveLength(27);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus|static)\.(?:datacamp|depositphotos)\.com|\/manus-storage\//i);
  });
});
