import course from "../client/public/data/courses/building_agentic_workflows_with_llamaindex__01.json";
import { describe, expect, it } from "vitest";

const hasText = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;

describe("Cours : Créer des workflows agentiques avec LlamaIndex", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters || []);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);
  const contentBlocks = blocks.filter((block: any) => block.type === "content");
  const quizzes = blocks.filter((block: any) => block.type === "single_choice_exercise");

  it("préserve les IDs source et les nouveaux points de contrôle explicitement ajoutés", () => {
    expect(contentBlocks.map((block: any) => block.id)).toEqual([
      "neopolis_building_agentic_workflows_with_llamaindex__01_environment_preparation",
      "neopolis_building_agentic_workflows_with_llamaindex__01_agent_bilingual_summary",
      "neopolis_building_agentic_workflows_with_llamaindex__01_memory_bilingual_summary",
      "neopolis_building_agentic_workflows_with_llamaindex__01_multi_agent_bilingual_summary",
      "neopolis_building_agentic_workflows_with_llamaindex__01_summary_learning_recap",
    ]);
    expect(quizzes.map((quiz: any) => quiz.id)).toEqual([
      "neopolis_building_agentic_workflows_with_llamaindex__01_welcome_checkpoint",
      "neopolis_building_agentic_workflows_with_llamaindex__01_agent_checkpoint",
      "neopolis_building_agentic_workflows_with_llamaindex__01_memory_checkpoint",
      "neopolis_building_agentic_workflows_with_llamaindex__01_multi_agent_checkpoint",
      "neopolis_building_agentic_workflows_with_llamaindex__01_summary_checkpoint",
    ]);
    expect(blocks.map((block: any) => block.id)).not.toContain("dc_1_act_01_video");
    expect(blocks.map((block: any) => block.id)).not.toContain("dc_2_act_08_video");
  });

  it("fournit pour chaque notion une synthèse française et anglaise utile", () => {
    const expectedBilingualConcepts = {
      neopolis_building_agentic_workflows_with_llamaindex__01_environment_preparation: {
        fr: "trois leçons audio-visuelles",
        en: "three English audiovisual lessons",
      },
      neopolis_building_agentic_workflows_with_llamaindex__01_agent_bilingual_summary: {
        fr: "appel direct à un LLM",
        en: "directly called LLM",
      },
      neopolis_building_agentic_workflows_with_llamaindex__01_memory_bilingual_summary: {
        fr: "sans état entre deux exécutions",
        en: "stateless between runs",
      },
      neopolis_building_agentic_workflows_with_llamaindex__01_multi_agent_bilingual_summary: {
        fr: "système multi-agents",
        en: "multi-agent system",
      },
      neopolis_building_agentic_workflows_with_llamaindex__01_summary_learning_recap: {
        fr: "trois notions effectivement couvertes",
        en: "three ideas actually covered",
      },
    } as const;

    for (const [id, excerpts] of Object.entries(expectedBilingualConcepts)) {
      const content = contentBlocks.find((block: any) => block.id === id);
      expect(content?.body.fr).toContain(excerpts.fr);
      expect(content?.body.en).toContain(excerpts.en);
    }
  });

  it("rend les cinq mini-quiz bilingues et corrigés côté serveur", () => {
    expect(
      quizzes.map((quiz: any) => ({ id: quiz.id, correctAnswer: quiz.correctAnswer }))
    ).toEqual([
      {
        id: "neopolis_building_agentic_workflows_with_llamaindex__01_welcome_checkpoint",
        correctAnswer: "c",
      },
      {
        id: "neopolis_building_agentic_workflows_with_llamaindex__01_agent_checkpoint",
        correctAnswer: "c",
      },
      {
        id: "neopolis_building_agentic_workflows_with_llamaindex__01_memory_checkpoint",
        correctAnswer: "a",
      },
      {
        id: "neopolis_building_agentic_workflows_with_llamaindex__01_multi_agent_checkpoint",
        correctAnswer: "b",
      },
      {
        id: "neopolis_building_agentic_workflows_with_llamaindex__01_summary_checkpoint",
        correctAnswer: "b",
      },
    ]);

    for (const quiz of quizzes) {
      expect(quiz.serverValidated).toBe(true);
      expect(quiz.options.map((option: any) => option.id)).toEqual(["a", "b", "c", "d"]);
      expect(quiz.options.find((option: any) => option.id === quiz.correctAnswer)).toBeDefined();
      expect(hasText(quiz.question.fr)).toBe(true);
      expect(hasText(quiz.question.en)).toBe(true);
      expect(hasText(quiz.explanation.fr)).toBe(true);
      expect(hasText(quiz.explanation.en)).toBe(true);
    }
  });
});
