import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const coursePath = path.resolve(process.cwd(), "client/public/data/courses/ai_for_finance__01.json");
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const catalogPath = path.resolve(process.cwd(), "client/src/data/trainingIndex.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const activities = course.lessons.flatMap((lesson: { chapters?: unknown[] }) => lesson.chapters ?? []) as Array<Record<string, unknown>>;

describe("adaptation DataCamp AI for Finance", () => {
  it("retire uniquement les deux TP sans rubrique ni ressource locale exploitable", () => {
    expect(activities).toHaveLength(28);
    expect(activities.some((activity) => activity.id === "dc_ch01_act08")).toBe(false);
    expect(activities.some((activity) => activity.id === "dc_ch01_act11")).toBe(false);
  });

  it("conserve neuf TP cloud rubricés et autonomes", () => {
    const cloudBlocks = activities.flatMap((activity) => (activity.blocks as Array<Record<string, unknown>> | undefined) ?? []).filter((block) => block.type === "cloud_exercise");
    const rubricBlocks = cloudBlocks.filter((block) => Array.isArray(block.rubricCriteria) && block.rubricCriteria.length > 0);
    expect(rubricBlocks).toHaveLength(9);
    const learnerFacingFields = ["title", "assignment", "instructions", "hint", "solution", "successMessage", "evaluationPrompt", "environmentGuide", "steps", "resources"];
    expect(rubricBlocks.every((block) => {
      const learnerFacingText = JSON.stringify(Object.fromEntries(learnerFacingFields.map((field) => [field, block[field]])));
      return block.environmentGuide && !learnerFacingText.match(/Copilot|datacamp\.com|\b\d+\s*XP\b|DataCamp\s+(?:VM|Lab|Campus|Workspace)/i);
    })).toBe(true);
  });

  it("n’expose aucun breakdown manuel périmé dans la carte du catalogue", () => {
    const courseEntry = catalog.courses.find((entry: { id: string }) => entry.id === "ai_for_finance__01");
    expect(courseEntry).toMatchObject({ totalActivities: 28, exerciseCount: 18, videoCount: 10, downloadCount: 3 });
    expect(courseEntry).not.toHaveProperty("breakdown");
    expect(courseEntry).not.toHaveProperty("exerciseLabel");
  });
});
