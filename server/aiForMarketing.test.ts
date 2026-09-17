import course from "../client/public/data/courses/ai_for_marketing__01.json";
import { describe, expect, it } from "vitest";
import { sanitizeCourseDataForLearner } from "./courseDataRoute";

describe("cours DataCamp IA pour le marketing", () => {
  it("préserve la structure, les formats interactifs et les médias locaux", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    expect(activities).toHaveLength(27);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(10);
    expect(blocks.filter((block: any) => block.type === "cloud_exercise")).toHaveLength(12);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(2);
    expect(blocks.filter((block: any) => /choice_exercise/.test(block.type))).toHaveLength(3);
    expect(activities.every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });

  it("adapts every retained practical to a learner-owned environment with managed resources", () => {
    const practicals = course.lessons.flatMap((lesson: any) => lesson.chapters).flatMap((activity: any) => activity.blocks || [])
      .filter((block: any) => block.type === "cloud_exercise");
    expect(practicals).toHaveLength(12);
    for (const practical of practicals) {
      expect(practical).toMatchObject({ practiceStatus: "source_adapted_personal_environment", serverGradedAssessment: "ai_marketing_source_adapted" });
      expect(practical.steps.length).toBeGreaterThanOrEqual(4);
      expect(practical.learnerCriteria.length).toBeGreaterThanOrEqual(2);
      expect(practical.environmentGuide.fr).toContain("assistant IA personnel");
      expect(practical.resources.every((resource: any) => String(resource.url).startsWith("/api/assets/"))).toBe(true);
      expect(JSON.stringify(practical)).not.toMatch(/Microsoft Copilot|DataCamp VM|Desktop\s*>\s*Resources/i);
      expect(practical.source_refs?.[0]?.url).toBe("https://app.datacamp.com/learn/courses/ai-for-marketing");
    }
  });

  it("does not expose practical rubrics or corrections before submission", () => {
    const learner = JSON.parse(sanitizeCourseDataForLearner(JSON.stringify(course)));
    const practicals = learner.lessons.flatMap((lesson: any) => lesson.chapters).flatMap((activity: any) => activity.blocks || [])
      .filter((block: any) => block.type === "cloud_exercise");
    expect(practicals).toHaveLength(12);
    for (const practical of practicals) {
      expect(practical).not.toHaveProperty("solution");
      expect(practical).not.toHaveProperty("rubricCriteria");
      expect(practical).not.toHaveProperty("evaluationPrompt");
    }
  });
});
