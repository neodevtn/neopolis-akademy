import course from "../client/public/data/courses/introduction_to_generative_ai_in_snowflake__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp IA générative dans Snowflake", () => {
  it("publie les sept vidéos locales et ne bloque plus sur les TPs cloud retirés", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    const videos = blocks.filter((block: any) => block.type === "video");
    const practicalTypes = new Set(["cloud_exercise", "code_repl", "ai_evaluation", "free_text_exercise", "terminal_sim"]);

    expect(activities).toHaveLength(7);
    expect(activities.every((activity: any) => activity.sourceActivityType === "VideoExercise" && activity.requiredBeforeAdvance === false)).toBe(true);
    expect(videos).toHaveLength(7);
    expect(videos.every((block: any) =>
      block.audioUrl?.startsWith("/api/assets/")
      && block.slidesPdf?.startsWith("/api/assets/")
      && block.projectorSlides?.length > 0
      && block.projectorTimings?.length > 0
      && String(block.transcript || "").trim().length > 0,
    )).toBe(true);
    expect(videos.filter((block: any) => block.subtitleUrlFr).every((block: any) => block.subtitleUrlFr.startsWith("/api/assets/"))).toBe(true);
    expect(blocks.some((block: any) => practicalTypes.has(block.type))).toBe(false);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
