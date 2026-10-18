import course from "../client/public/data/courses/text_to_query_agents_with_mongodb_and_langgraph__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Agents de text-to-query avec MongoDB et LangGraph", () => {
  it("préserve les Projector publiés et retire les DataLab non rubricés sans verrou résiduel", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    const videos = blocks.filter((block: any) => block.type === "video");
    const practicalTypes = new Set(["cloud_exercise", "ai_evaluation", "code_repl", "free_text_exercise", "terminal_sim"]);

    expect(activities).toHaveLength(5);
    expect(videos).toHaveLength(5);
    expect(videos.every((block: any) =>
      (block.mp4Url?.startsWith("/api/assets/") || block.audioUrl?.startsWith("/api/assets/"))
      && block.slidesPdf?.startsWith("/api/assets/")
      && String(block.transcript || "").trim().length > 0
      && block.transcriptSegments?.length > 0,
    )).toBe(true);
    expect(blocks.filter((block: any) => practicalTypes.has(block.type))).toHaveLength(0);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance === false && activity.blocks?.length > 0)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
