import { describe, expect, it } from "vitest";
import catalog from "../client/src/data/trainingIndex.json";
import course from "../client/public/data/courses/building_scalable_agentic_systems__01.json";

describe("cours DataCamp Concevoir des systèmes agentiques évolutifs", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("publie les compteurs dérivés après les trois retraits visuels canoniquement justifiés", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_building_scalable_agentic_systems");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === "building_scalable_agentic_systems__01");
    expect(certification).toMatchObject({ group: "claude_ai_agents", totalLessons: 3, totalActivities: 26, totalVideos: 10, totalExercises: 16, totalDownloads: 3 });
    expect(courseIndex).toMatchObject({ certId: certification?.id, totalActivities: 26, videoCount: 10, exerciseCount: 16, downloadCount: 3 });
  });

  it("préserve les médias Projector locaux, l’interactivité et la progression séquentielle", () => {
    const projectorVideos = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    expect(activities).toHaveLength(26);
    expect(projectorVideos).toHaveLength(10);
    expect(projectorVideos.every((block: any) => block.audioUrl && block.slidesPdf && block.subtitleUrlFr && block.projectorTimings?.length && block.transcriptSegments?.length)).toBe(true);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(6);
    expect(blocks.filter((block: any) => block.type === "multi_choice_exercise" || block.type === "single_choice_exercise")).toHaveLength(10);
    expect(blocks.some((block: any) => block.chatScenario?.messages?.length === 3)).toBe(true);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "PureMultipleChoiceExercise")).toHaveLength(9);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "DragAndDropExercise")).toHaveLength(6);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "VisualExercise")).toHaveLength(0);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "ChatExercise")).toHaveLength(1);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(activities.map((activity: any) => activity.id)).not.toEqual(expect.arrayContaining(["dc_ch02_act06", "dc_ch02_act07", "dc_ch02_act09"]));
  });

  it("n’expose ni URL de recommandation, ni libellé fournisseur, ni XP dans les blocs publiés", () => {
    const serialized = JSON.stringify(course);
    const visibleBlocks = JSON.stringify(blocks);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
    expect(visibleBlocks).not.toMatch(/DataCamp|\bXP\b/i);
  });
});
