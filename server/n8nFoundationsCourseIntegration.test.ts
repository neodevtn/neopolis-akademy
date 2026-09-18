import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { sanitizeCourseDataForLearner } from "./courseDataRoute";
import { N8N_FOUNDATIONS_CORRECTION_KEYS, N8N_FOUNDATIONS_WORKFLOW_RESOURCES } from "./n8nFoundationsWorkflowRegistry";

const root = path.resolve(import.meta.dirname, "..");
const coursePath = path.join(root, "client/public/data/courses/initiation_automatisation_workflows_n8n__01.json");
const indexPath = path.join(root, "client/src/data/trainingIndex.json");
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const mappedIds = Object.keys(N8N_FOUNDATIONS_WORKFLOW_RESOURCES).sort();
const practicals = course.lessons.flatMap((lesson: any) => lesson.chapters ?? []).flatMap((chapter: any) => chapter.blocks ?? []).filter((block: any) => block.serverGradedAssessment === "n8n_foundations_workflow_json");

describe("n8n foundations course resource integration", () => {
  it("maintains the delivered 32-activity course structure and disclosed resource counts", () => {
    const certification = index.certifications.find((entry: any) => entry.id === "initiation_automatisation_workflows_n8n");
    expect(course.lessons).toHaveLength(3);
    expect(course.lessons.flatMap((lesson: any) => lesson.chapters ?? [])).toHaveLength(32);
    expect(certification).toMatchObject({ totalActivities: 32, totalVideos: 10, totalDownloads: 12 });
    expect(certification.resourceSummary.fr).toContain("3 PDF");
    expect(certification.resourceSummary.fr).toContain("9 workflows");
  });

  it("links every mapped TP to exactly one managed starter workflow", () => {
    expect(practicals.map((block: any) => block.id).sort()).toEqual(mappedIds);
    expect(new Set(practicals.map((block: any) => block.resources[0].url)).size).toBe(9);
    for (const practical of practicals) {
      expect(practical.workflowUploadRequired).toBe(true);
      expect(practical.resources).toHaveLength(1);
      expect(practical.resources[0]).toMatchObject({ url: expect.stringMatching(/^\/api\/assets\/n8n-foundations\/starters\//), filename: expect.stringMatching(/\.json$/) });
      expect(practical.environmentGuide.fr).toContain("votre propre espace n8n");
      expect(practical.environmentGuide.fr).not.toMatch(/Desktop\/Resources|VM formation|préconfigurés/i);
    }
  });

  it("does not expose corrections or outdated source-environment instructions in learner course data", () => {
    const learnerCourse = sanitizeCourseDataForLearner(JSON.stringify(course));
    expect(learnerCourse).not.toMatch(/n8n-foundations\/corrections|Desktop\/Resources|VM formation|identifiants préconfigurés/i);
    const learnerPracticals = JSON.parse(learnerCourse).lessons.flatMap((lesson: any) => lesson.chapters ?? []).flatMap((chapter: any) => chapter.blocks ?? []).filter((block: any) => block.serverGradedAssessment === "n8n_foundations_workflow_json");
    for (const practical of learnerPracticals) {
      expect(practical).not.toHaveProperty("solution");
      expect(practical).not.toHaveProperty("rubricCriteria");
      expect(practical).not.toHaveProperty("correctionResources");
    }
    expect(N8N_FOUNDATIONS_CORRECTION_KEYS).toHaveLength(10);
  });

  it("keeps all points under the Neopolis competency system and removes XP labels", () => {
    expect(JSON.stringify(course)).not.toMatch(/\bXP\b/i);
    expect(JSON.stringify(index.certifications.find((entry: any) => entry.id === "initiation_automatisation_workflows_n8n"))).not.toMatch(/\bXP\b/i);
  });
});
