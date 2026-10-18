import course from "../client/public/data/courses/building_ai_agents_with_crewai__01.json";
import { describe, expect, it } from "vitest";

const hasText = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;
const practicalBlockTypes = new Set([
  "cloud_exercise",
  "code_repl",
  "ai_evaluation",
  "terminal_sim",
]);

describe("cours DataCamp Créer des agents d’IA avec CrewAI", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters || []);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);
  const contentBlocks = blocks.filter((block: any) => block.type === "content");
  const quizzes = blocks.filter((block: any) => block.type === "single_choice_exercise");

  it("préserve les cinq leçons conceptuelles restaurées avec une explication utile en français et anglais", () => {
    const expectedConcepts = {
      dc_1_act_02_content: { fr: "rôle", en: "role" },
      dc_1_act_03_content: { fr: "Une **Task**", en: "A **Task**" },
      dc_2_act_01_content: { fr: "état", en: "state" },
      dc_2_act_02_content: { fr: "contexte", en: "context" },
      dc_2_act_03_content: { fr: "@router()", en: "@router()" },
    } as const;

    expect(Object.keys(expectedConcepts)).toEqual([
      "dc_1_act_02_content",
      "dc_1_act_03_content",
      "dc_2_act_01_content",
      "dc_2_act_02_content",
      "dc_2_act_03_content",
    ]);
    for (const [id, excerpts] of Object.entries(expectedConcepts)) {
      const content = contentBlocks.find((block: any) => block.id === id);
      expect(content?.body.fr).toContain(excerpts.fr);
      expect(content?.body.en).toContain(excerpts.en);
    }
  });

  it("rend les sept mini-quiz bilingues et validés côté serveur", () => {
    expect(
      quizzes.map((quiz: any) => ({ id: quiz.id, correctAnswer: quiz.correctAnswer }))
    ).toEqual([
      { id: "dc_1_act_01_qcm", correctAnswer: "b" },
      { id: "dc_1_act_02_qcm", correctAnswer: "c" },
      { id: "dc_1_act_03_qcm", correctAnswer: "a" },
      { id: "dc_2_act_01_qcm", correctAnswer: "b" },
      { id: "dc_2_act_02_qcm", correctAnswer: "b" },
      { id: "dc_2_act_03_qcm", correctAnswer: "c" },
      { id: "dc_2_act_04_qcm", correctAnswer: "a" },
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

  it("ne transforme aucune des cinq remédiations en TP externe ou DataLab", () => {
    const conceptualCases = activities.filter(
      (activity: any) => activity.sourceActivityType === "ConceptualCase"
    );
    expect(
      conceptualCases.map((activity: any) => ({
        id: activity.id,
        blockTypes: activity.blocks.map((block: any) => block.type),
        requiresExternalEnvironment: activity.remediation?.requires_external_environment,
      }))
    ).toEqual([
      {
        id: "dc_ch01_act02",
        blockTypes: ["content", "single_choice_exercise"],
        requiresExternalEnvironment: false,
      },
      {
        id: "dc_ch01_act03",
        blockTypes: ["content", "single_choice_exercise"],
        requiresExternalEnvironment: false,
      },
      {
        id: "dc_ch02_act01",
        blockTypes: ["content", "single_choice_exercise"],
        requiresExternalEnvironment: false,
      },
      {
        id: "dc_ch02_act02",
        blockTypes: ["content", "single_choice_exercise"],
        requiresExternalEnvironment: false,
      },
      {
        id: "dc_ch02_act03",
        blockTypes: ["content", "single_choice_exercise"],
        requiresExternalEnvironment: false,
      },
    ]);
    expect(blocks.filter((block: any) => practicalBlockTypes.has(block.type))).toEqual([]);
    expect(JSON.stringify(activities)).not.toMatch(
      /datalab|https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i
    );
  });
});
