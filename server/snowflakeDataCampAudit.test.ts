import { describe, expect, it } from "vitest";
import catalog from "../client/src/data/trainingIndex.json";
import course from "../client/public/data/courses/introduction_to_generative_ai_in_snowflake__01.json";

describe("cours DataCamp Introduction à l’IA générative dans Snowflake", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters ?? []);
  const blocks = activities.flatMap((activity: any) => activity.blocks ?? []);

  it("conserve uniquement les sept activités vidéo reproductibles après retrait des TP cloud non rubricés", () => {
    expect(activities).toHaveLength(7);
    expect(activities.every((activity: any) => activity.sourceActivityType === "VideoExercise")).toBe(true);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(activities.map((activity: any) => activity.id)).not.toEqual(expect.arrayContaining([
      "dc_ch01_act02", "dc_ch01_act03", "dc_ch01_act04", "dc_ch01_act06", "dc_ch01_act07", "dc_ch01_act09", "dc_ch01_act10",
      "dc_ch02_act02", "dc_ch02_act03", "dc_ch02_act05", "dc_ch02_act06", "dc_ch02_act08", "dc_ch02_act09",
    ]));
  });

  it("conserve les sept médias locaux et publie des métriques catalogue cohérentes", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_introduction_to_generative_ai_in_snowflake");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === course.courseId);

    expect(blocks.filter((block: any) => block.type === "video")).toHaveLength(7);
    expect(blocks.filter((block: any) => block.type === "video").every((block: any) => block.audioUrl?.startsWith("/api/assets/") && block.slidesPdf?.startsWith("/api/assets/"))).toBe(true);
    expect(certification).toMatchObject({ totalActivities: 7, totalExercises: 0, totalVideos: 7, totalDownloads: 2 });
    expect(courseIndex).toMatchObject({ totalActivities: 7, exerciseCount: 0, videoCount: 7, downloadCount: 2 });
  });

  it("n’expose aucune URL fournisseur, laboratoire ou libellé XP dans les blocs apprenants", () => {
    const visibleBlocks = JSON.stringify(blocks);
    expect(visibleBlocks).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(visibleBlocks).not.toMatch(/DataCamp\s*(?:Lab|Workspace|Campus)|cloud\s+lab|VM\s+DataCamp/i);
    expect(visibleBlocks).not.toMatch(/\b\d+\s*XP\b/i);
  });
});
