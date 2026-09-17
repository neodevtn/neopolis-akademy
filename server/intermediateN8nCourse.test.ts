import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { sanitizeCourseDataForLearner } from "./courseDataRoute";

const coursePath = path.resolve(import.meta.dirname, "..", "client", "public", "data", "courses", "intermediate_workflow_automation_with_n8n__01.json");
const rawCourse = fs.readFileSync(coursePath, "utf8");
const course = JSON.parse(rawCourse);

function practical(id: string) {
  for (const lesson of course.lessons ?? []) {
    for (const chapter of lesson.chapters ?? []) {
      const block = (chapter.blocks ?? []).find((candidate: any) => candidate.id === id);
      if (block) return block;
    }
  }
  throw new Error(`Missing practical ${id}`);
}

describe("Intermediate Workflow Automation with n8n — source-verified opening practices", () => {
  it("adds a personal environment preflight without a DataCamp VM claim", () => {
    const preflight = course.lessons.flatMap((lesson: any) => lesson.chapters).flatMap((chapter: any) => chapter.blocks).find((block: any) => block.id === "n8n_personal_environment_preflight");
    expect(preflight).toMatchObject({ type: "callout", variant: "info" });
    expect(JSON.stringify(preflight)).toContain("n8n Cloud");
    expect(JSON.stringify(preflight)).toContain("Docker");
    expect(JSON.stringify(preflight)).not.toMatch(/DataCamp VM/i);
  });

  it("restores the first two practices with standalone, source-verified setup", () => {
    for (const id of ["dc_1_act_02_tp", "dc_1_act_03_tp"]) {
      const block = practical(id);
      expect(block).toMatchObject({ type: "cloud_exercise", serverGradedAssessment: "intermediate_n8n_source_verified", practiceStatus: "source_screen_verified" });
      expect(block.steps.length).toBeGreaterThanOrEqual(3);
      expect(block.environmentGuide.fr).toContain("n8n Cloud");
      expect(block.resources).toEqual([]);
      expect(block.source_refs).toHaveLength(2);
    }
  });

  it("does not advertise a missing VM starter as a learner download", () => {
    const validation = practical("dc_1_act_03_tp");
    expect(validation.resources).toEqual([]);
    expect(validation.nonDownloadableFiles).toEqual(["1.1.2_starter_webhook-validation.json"]);
    expect(validation.instructions.fr).toContain("ne cherchez pas à le télécharger");
  });

  it("never sends source-verified correction material to the learner before submission", () => {
    const learner = JSON.parse(sanitizeCourseDataForLearner(rawCourse));
    const learnerPracticals = learner.lessons.flatMap((lesson: any) => lesson.chapters).flatMap((chapter: any) => chapter.blocks)
      .filter((block: any) => block.practiceStatus === "source_screen_verified");
    expect(learnerPracticals).toHaveLength(27);
    for (const block of learnerPracticals) {
      expect(block).not.toHaveProperty("solution");
      expect(block).not.toHaveProperty("evaluationPrompt");
      expect(block).not.toHaveProperty("rubricCriteria");
    }
  });

  it("replaces copied reliability pages with source-verified personal-environment practices", () => {
    const reliabilityIds = ["dc_4_act_02_tp", "dc_4_act_03_tp", "dc_4_act_04_tp", "dc_4_act_06_tp", "dc_4_act_07_tp", "dc_4_act_09_tp"];
    for (const id of reliabilityIds) {
      const block = practical(id);
      expect(block).toMatchObject({ type: "cloud_exercise", practiceStatus: "source_screen_verified", serverGradedAssessment: "intermediate_n8n_source_verified" });
      expect(block.environmentGuide.fr).toContain("instance personnelle n8n");
      expect(block.steps.length).toBeGreaterThanOrEqual(3);
      expect(block.source_refs?.[0]?.url).toContain("reliability-and-production-readiness");
      expect(JSON.stringify(block)).not.toContain("Apprendre\n/\nCours");
      expect(JSON.stringify(block)).not.toContain("Points de progression Neopolis\n40");
    }
    expect(practical("dc_4_act_02_tp").resources).toHaveLength(1);
    expect(practical("dc_4_act_06_tp").resources).toHaveLength(1);
    expect(practical("dc_4_act_09_tp").resources).toEqual([]);
  });
});
