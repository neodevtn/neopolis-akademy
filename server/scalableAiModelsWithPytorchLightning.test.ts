import course from "../client/public/data/courses/scalable_ai_models_with_pytorch_lightning__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Modèles d’IA évolutifs avec PyTorch Lightning", () => {
  it("publie les médias et interactions vérifiables sans conserver de TP dépendant d’actifs absents", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    const videos = blocks.filter((block: any) => block.type === "video");
    const interactions = blocks.filter((block: any) => ["single_choice_exercise", "bucket_sort"].includes(block.type));
    const practicalTypes = new Set(["cloud_exercise", "code_repl", "ai_evaluation", "free_text_exercise", "terminal_sim"]);

    expect(activities).toHaveLength(30);
    expect(videos).toHaveLength(10);
    expect(videos.every((block: any) =>
      block.audioUrl?.startsWith("/api/assets/")
      && block.slidesPdf?.startsWith("/api/assets/")
      && block.projectorSlides?.length > 0
      && block.projectorTimings?.length > 0
      && block.transcriptSegments?.length > 0,
    )).toBe(true);
    expect(interactions).toHaveLength(3);
    expect(interactions.every((block: any) =>
      block.type === "bucket_sort"
        ? block.cards?.length > 0 && block.buckets?.length > 0
        : block.options?.some((option: any) => option.id === block.correctAnswer) && String(block.explanation?.fr || block.explanation?.en || "").trim().length > 20,
    )).toBe(true);
    expect(activities.filter((activity: any) => activity.requiredBeforeAdvance)).toHaveLength(3);
    expect(activities.filter((activity: any) => activity.requiredBeforeAdvance).every((activity: any) =>
      activity.blocks.some((block: any) => ["single_choice_exercise", "bucket_sort"].includes(block.type)),
    )).toBe(true);
    expect(blocks.some((block: any) => practicalTypes.has(block.type))).toBe(false);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
