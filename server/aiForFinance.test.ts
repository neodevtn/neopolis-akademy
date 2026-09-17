import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/ai_for_finance__01.json";
import catalog from "../client/src/data/trainingIndex.json";
import { sanitizeCourseDataForLearner } from "./courseDataRoute";

describe("cours DataCamp L’IA pour la finance", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("respecte les compteurs et le classement BI", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_ai_for_finance");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === "ai_for_finance__01");
    expect(certification).toMatchObject({ group: "bi_data_analytics", totalLessons: 3, totalActivities: 28, totalVideos: 10, totalExercises: 18, totalDownloads: 3 });
    expect(courseIndex).toMatchObject({ certId: certification?.id, totalActivities: 28, videoCount: 10, exerciseCount: 18 });
  });

  it("préserve Projector, TP autonomes, QCM et tris interactifs", () => {
    const projector = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    const cloudExercises = blocks.filter((block: any) => block.type === "cloud_exercise");
    expect(activities).toHaveLength(28);
    expect(projector).toHaveLength(10);
    expect(projector.every((block: any) => block.audioUrl && block.slidesPdf && block.transcriptSegments?.length)).toBe(true);
    expect(cloudExercises).toHaveLength(9);
    expect(cloudExercises.every((block: any) => block.environmentGuide && !JSON.stringify(block).includes("<exercise_objective>"))).toBe(true);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(6);
    expect(blocks.filter((block: any) => ["single_choice_exercise", "multi_choice_exercise"].includes(block.type))).toHaveLength(3);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
  });

  it("n’expose ni URL DataCamp ni fichier 404 dans le cours publié", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
    expect(serialized).not.toContain("Perplexity_AI_logo.svg");
  });

  it("fournit des TP guidés, des ressources gérées et une évaluation protégée", () => {
    const practicals = blocks.filter((block: any) => block.type === "cloud_exercise");
    for (const practical of practicals) {
      expect(practical).toMatchObject({ practiceStatus: "source_adapted_personal_environment", serverGradedAssessment: "ai_finance_source_adapted" });
      expect(practical.steps.length).toBeGreaterThanOrEqual(4);
      expect(practical.learnerCriteria.length).toBeGreaterThanOrEqual(2);
      expect(practical.environmentGuide.fr).toContain("ressources synthétiques");
      expect(practical.resources.every((resource: any) => String(resource.url).startsWith("/api/assets/"))).toBe(true);
      expect(practical.source_refs?.[0]?.url).toBe("https://app.datacamp.com/learn/courses/ai-for-finance");
    }
    const learner = JSON.parse(sanitizeCourseDataForLearner(JSON.stringify(course)));
    const learnerPracticals = learner.lessons.flatMap((lesson: any) => lesson.chapters).flatMap((chapter: any) => chapter.blocks || []).filter((block: any) => block.type === "cloud_exercise");
    for (const practical of learnerPracticals) {
      expect(practical).not.toHaveProperty("solution");
      expect(practical).not.toHaveProperty("rubricCriteria");
      expect(practical).not.toHaveProperty("evaluationPrompt");
    }
  });
});
