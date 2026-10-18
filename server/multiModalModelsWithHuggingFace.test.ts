import course from "../client/public/data/courses/multi_modal_models_with_hugging_face__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Modèles multimodaux avec Hugging Face", () => {
  it("publie les écrans et médias vérifiés sans réintroduire les TPs retirés", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    const videos = blocks.filter((block: any) => block.type === "video");
    const practicalTypes = new Set(["cloud_exercise", "code_repl", "ai_evaluation", "free_text_exercise", "terminal_sim"]);

    expect(activities).toHaveLength(15);
    expect(videos).toHaveLength(14);
    expect(videos.every((block: any) =>
      block.mp4Url?.startsWith("/api/assets/")
      && block.audioUrl?.startsWith("/api/assets/")
      && block.subtitleUrlFr?.startsWith("/api/assets/")
      && block.slidesPdf?.startsWith("/api/assets/")
      && block.projectorSlides?.length > 0
      && block.projectorTimings?.length > 0
      && block.transcriptSegments?.length > 0,
    )).toBe(true);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance === true && activity.blocks?.length > 0)).toBe(true);
    expect(blocks.some((block: any) => practicalTypes.has(block.type))).toBe(false);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus|static)\.(?:datacamp|depositphotos)\.com|\/manus-storage\//i);
  });
});
