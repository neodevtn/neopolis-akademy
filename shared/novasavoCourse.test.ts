import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getBlockDef } from "./blockRegistry";

const course = JSON.parse(readFileSync(resolve(process.cwd(), "client/public/data/courses/automatisation_comptable_ia__01.json"), "utf8"));

describe("cours Novasavo paginé", () => {
  it("préserve les douze unités dans l’ordre et place l’examen final en dernier", () => {
    expect(course.lessons).toHaveLength(13);
    expect(course.lessons.slice(0, 12).map((lesson: any) => lesson.title.fr)).toEqual([
      "1. Fondamentaux de la comptabilité et de la tenue de livres", "2. L'intelligence artificielle appliquée à la finance", "3. Saisie automatisée des données comptables", "4. Catégorisation automatique des transactions", "5. Rapprochement bancaire intelligent", "6. Gestion automatisée des factures et des dépenses", "7. Prévisions financières et analyses prédictives", "8. Détection des anomalies et prévention de la fraude", "9. Automatisation de la paie et des déclarations fiscales", "10. Intégration des outils d'IA dans les systèmes comptables", "11. Gouvernance, conformité et éthique de l'IA en comptabilité", "12. L'avenir de la profession comptable à l'ère de l'IA",
    ]);
    expect(course.lessons.at(-1).id).toBe("novasavo_final_exam");
  });

  it("reconstruit l’unité 1 en dix-sept écrans courts et retire les écrans artificiels des autres unités", () => {
    expect(course.lessons[0].chapters).toHaveLength(17);
    expect(course.lessons.slice(1, 12).every((lesson: any) => lesson.chapters.length === 5)).toBe(true);
    expect(course.lessons[0].chapters.filter((chapter: any) => chapter.requiredBeforeAdvance)).toHaveLength(4);
  });

  it("utilise des familles génériques déclarées dans la bibliothèque standard", () => {
    const types = new Set(course.lessons.flatMap((lesson: any) => lesson.chapters.flatMap((chapter: any) => chapter.blocks.map((block: any) => block.type))));
    ["learning_section", "knowledge_check", "sequence_visual", "comparison_panel", "learning_tools"].forEach((type) => {
      expect(types.has(type)).toBe(true);
      expect(getBlockDef(type)).toBeDefined();
    });
    expect(types.has("learning_progress")).toBe(false);
    expect(course.lessons.flatMap((lesson: any) => lesson.chapters.flatMap((chapter: any) => chapter.blocks)).some((block: any) => block.toolMode === "notes")).toBe(false);
    ["unit_hero_blue", "inline_myth_reality", "inline_multiple_choice_feedback", "inline_scenario_question_feedback", "timeline_step_cards", "process_flow_diagram", "mistake_correction_pairs", "ai_assistant_prompt_panel", "accounting_comparison_visual", "key_points_summary", "notes_highlights_bookmarks_panel", "competency_progress_hud"].forEach((type) => expect(types.has(type)).toBe(false));
  });

  it("conserve les deux questions visibles dans les captures source et ne publie aucun libellé XP", () => {
    const unitOneBlocks = course.lessons[0].chapters.flatMap((chapter: any) => chapter.blocks);
    const firstStep = unitOneBlocks.find((block: any) => block.id === "novasavo_u01_first_step");
    const scenario = unitOneBlocks.find((block: any) => block.id === "novasavo_u01_scenario");
    expect(firstStep.prompt.fr).toBe("Quelle est la première étape du cycle comptable manuel ?");
    expect(scenario.scenario.fr).toContain("fournitures de bureau pour 300 €");
    expect(JSON.stringify(course)).not.toContain("XP");
    expect(JSON.stringify(course)).not.toContain("xp_progress_hud");
  });

  it("désactive les illustrations heuristiques absentes des blocs déclarés par le cours", () => {
    const lessonViewer = readFileSync(resolve(process.cwd(), "client/src/pages/training/LessonViewer.tsx"), "utf8");
    expect(lessonViewer).toContain("const shouldRenderAutomaticIllustration = false");
    expect(lessonViewer).not.toContain("{isSparse && (");
  });
});
