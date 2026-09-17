import course from "../client/public/data/courses/building_agentic_workflows_with_llamaindex__01.json";
import trainingIndex from "../client/src/data/trainingIndex.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp Créer des workflows agentiques avec LlamaIndex", () => {
  it("préserve les Projector locaux et retire les TP DataLab sans rubrique", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    expect(activities).toHaveLength(5);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(5);
    expect(blocks.filter((block: any) => ["cloud_exercise", "ai_evaluation", "code_repl"].includes(block.type))).toHaveLength(0);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });

  it("annonce seulement les activités réellement livrées et ne promet pas de TP absent", () => {
    expect(course.datacampImport.delivered).toMatchObject({
      chapters: 2,
      activities: 5,
      videos: 5,
      downloads: 2,
      interactiveExercises: 0,
      excludedSourcePracticalActivities: 10,
    });
    const serializedCourse = JSON.stringify(course);
    expect(serializedCourse).not.toMatch(/Mettez immédiatement la main à la pâte|pleinement opérationnel|activités interactives/i);
    expect(serializedCourse).toContain("découverte vidéo");
    const training = trainingIndex.certifications.find((entry: any) => entry.id === "datacamp_building_agentic_workflows_with_llamaindex");
    expect(training).toMatchObject({ totalActivities: 5, totalExercises: 0, totalVideos: 5, totalDownloads: 2 });
    expect(training?.breakdown?.fr).toBe("2 chapitres · 5 leçons vidéo · 2 téléchargements");
  });
});
