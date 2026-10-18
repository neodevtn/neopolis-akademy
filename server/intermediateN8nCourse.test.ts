import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { sanitizeCourseDataForLearner } from "./courseDataRoute";
import { getSensitiveExerciseAnswerKey } from "./sensitiveExerciseAnswerKeys";

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

function chapterForBlock(id: string) {
  for (const lesson of course.lessons ?? []) {
    const chapter = (lesson.chapters ?? []).find((candidate: any) => (candidate.blocks ?? []).some((block: any) => block.id === id));
    if (chapter) return chapter;
  }
  throw new Error(`Missing chapter for ${id}`);
}

function localizedText(value: unknown, locale: "fr" | "en") {
  return typeof value === "string" ? value : (value as { fr?: string; en?: string } | undefined)?.[locale] || "";
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

  it("conserve exactement onze TPs réellement réalisables dans une instance personnelle", () => {
    const expectedPracticalIds = [
      "dc_1_act_02_tp", "dc_1_act_03_tp", "dc_1_act_04_tp", "dc_2_act_09_tp", "dc_2_act_10_tp",
      "dc_3_act_02_tp", "dc_3_act_03_tp", "dc_3_act_05_tp", "dc_3_act_06_tp", "dc_3_act_07_tp", "dc_4_act_02_tp",
    ];
    const practicals = course.lessons.flatMap((lesson: any) => lesson.chapters).flatMap((chapter: any) => chapter.blocks)
      .filter((block: any) => block.practiceStatus === "source_screen_verified");

    expect(practicals.map((block: any) => block.id)).toEqual(expectedPracticalIds);
    practicals.forEach((block: any) => {
      expect(block).toMatchObject({ type: "cloud_exercise", serverGradedAssessment: "intermediate_n8n_source_verified" });
      expect(chapterForBlock(block.id).requiredBeforeAdvance).toBe(true);
      expect(block.steps.length).toBeGreaterThanOrEqual(3);
      expect(localizedText(block.environmentGuide, "fr")).toMatch(/instance personnelle|n8n Cloud|Docker/i);
      expect(localizedText(block.instructions, "fr").trim().length).toBeGreaterThan(20);
      expect(block.source_refs.length).toBeGreaterThan(0);
    });
    practicals.filter((block: any) => !["dc_1_act_02_tp", "dc_1_act_03_tp"].includes(block.id)).forEach((block: any) => {
      expect(block.resources).toHaveLength(1);
      expect(block.resources[0].url).toMatch(/^\/api\/assets\//);
    });
  });

  it("never sends source-verified correction material to the learner before submission", () => {
    const learner = JSON.parse(sanitizeCourseDataForLearner(rawCourse));
    const learnerPracticals = learner.lessons.flatMap((lesson: any) => lesson.chapters).flatMap((chapter: any) => chapter.blocks)
      .filter((block: any) => block.practiceStatus === "source_screen_verified");
    expect(learnerPracticals).toHaveLength(11);
    for (const block of learnerPracticals) {
      expect(block).not.toHaveProperty("solution");
      expect(block).not.toHaveProperty("evaluationPrompt");
      expect(block).not.toHaveProperty("rubricCriteria");
      expect(block.steps.length).toBeGreaterThanOrEqual(3);
      expect(block.environmentGuide.fr).toContain("n8n");
      expect(block.source_refs.length).toBeGreaterThan(0);
    }
  });

  it("remplace le douzième TP non corrigeable par une étude de cas locale corrigée côté serveur", () => {
    const allBlocks = course.lessons.flatMap((lesson: any) => lesson.chapters).flatMap((chapter: any) => chapter.blocks);
    const chapter = chapterForBlock("dc_2_act_07_qcm");
    const qcm = allBlocks.find((block: any) => block.id === "dc_2_act_07_qcm");

    expect(allBlocks.some((block: any) => block.id === "dc_2_act_07_tp")).toBe(false);
    expect(chapter.requiredBeforeAdvance).toBe(true);
    expect(chapter.blocks.map((block: any) => `${block.id}:${block.type}`)).toEqual([
      "dc_2_act_07_content:content",
      "dc_2_act_07_qcm:single_choice_exercise",
    ]);
    expect(qcm).toMatchObject({ type: "single_choice_exercise", serverValidated: true, correctAnswer: "c" });
    expect(qcm.options).toHaveLength(4);
    expect(qcm.options.map((option: any) => option.id)).toContain(qcm.correctAnswer);
    for (const locale of ["fr", "en"] as const) {
      expect(localizedText(qcm.question, locale).trim().length).toBeGreaterThan(20);
      expect(localizedText(qcm.explanation, locale).trim().length).toBeGreaterThan(80);
      expect(qcm.options.every((option: any) => localizedText(option.text, locale).trim().length > 10)).toBe(true);
    }
    expect(getSensitiveExerciseAnswerKey(course.courseId, qcm.id)).toEqual({
      correctAnswer: qcm.correctAnswer,
      explanation: qcm.explanation,
    });

    const learner = JSON.parse(sanitizeCourseDataForLearner(rawCourse));
    const learnerQcm = learner.lessons.flatMap((lesson: any) => lesson.chapters).flatMap((entry: any) => entry.blocks)
      .find((block: any) => block.id === qcm.id);
    expect(learnerQcm.question).toEqual(qcm.question);
    expect(learnerQcm.correctAnswer).toBeUndefined();
    expect(learnerQcm.explanation).toBeUndefined();
  });
});
