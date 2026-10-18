import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getBlockDef } from "./blockRegistry";

const course = JSON.parse(readFileSync(resolve(process.cwd(), "client/public/data/courses/automatisation_comptable_ia__01.json"), "utf8"));

describe("cours Novasavo paginé", () => {
  it("préserve les douze unités non vides dans l’ordre", () => {
    expect(course.lessons).toHaveLength(12);
    expect(course.lessons.map((lesson: any) => lesson.title.fr)).toEqual([
      "1. Fondamentaux de la comptabilité et de la tenue de livres", "2. L'intelligence artificielle appliquée à la finance", "3. Saisie automatisée des données comptables", "4. Catégorisation automatique des transactions", "5. Rapprochement bancaire intelligent", "6. Gestion automatisée des factures et des dépenses", "7. Prévisions financières et analyses prédictives", "8. Détection des anomalies et prévention de la fraude", "9. Automatisation de la paie et des déclarations fiscales", "10. Intégration des outils d'IA dans les systèmes comptables", "11. Gouvernance, conformité et éthique de l'IA en comptabilité", "12. L'avenir de la profession comptable à l'ère de l'IA",
    ]);
    expect(course.lessons.every((lesson: any) => Array.isArray(lesson.chapters) && lesson.chapters.length > 0 && lesson.chapters.every((chapter: any) => Array.isArray(chapter.blocks) && chapter.blocks.length > 0))).toBe(true);
  });

  it("conserve une unité 1 détaillée et des unités suivantes concises, sans chapitre vide", () => {
    const unitOne = course.lessons[0];
    const laterUnits = course.lessons.slice(1);
    expect(unitOne.chapters.length).toBeGreaterThan(0);
    expect(unitOne.chapters.length).toBeGreaterThan(laterUnits[0].chapters.length);
    expect(laterUnits.every((lesson: any) => lesson.chapters.length > 0 && lesson.chapters.every((chapter: any) => chapter.blocks.length > 0))).toBe(true);
    expect(course.lessons.flatMap((lesson: any) => lesson.chapters).every((chapter: any) => !chapter.completionRule?.requires?.includes("requiredExercisesPassed") || chapter.blocks.some((block: any) => ["knowledge_check", "single_choice_exercise", "multi_choice_exercise", "bucket_sort", "matching", "ordering"].includes(block.type)))).toBe(true);
  });

  it("utilise des familles génériques déclarées dans la bibliothèque standard", () => {
    const types = new Set(course.lessons.flatMap((lesson: any) => lesson.chapters.flatMap((chapter: any) => chapter.blocks.map((block: any) => block.type))));
    expect(types.size).toBeGreaterThan(0);
    [...types].forEach((type) => {
      expect(getBlockDef(type)).toBeDefined();
    });
    expect(types.has("learning_progress")).toBe(false);
    expect(course.lessons.flatMap((lesson: any) => lesson.chapters.flatMap((chapter: any) => chapter.blocks)).some((block: any) => block.toolMode === "notes")).toBe(false);
    ["unit_hero_blue", "inline_myth_reality", "inline_multiple_choice_feedback", "inline_scenario_question_feedback", "timeline_step_cards", "process_flow_diagram", "mistake_correction_pairs", "ai_assistant_prompt_panel", "accounting_comparison_visual", "key_points_summary", "notes_highlights_bookmarks_panel", "competency_progress_hud"].forEach((type) => expect(types.has(type)).toBe(false));
  });

  it("conserve des contenus pédagogiques publiés sans réintroduire de question non vérifiable ni libellé XP", () => {
    const unitOneBlocks = course.lessons[0].chapters.flatMap((chapter: any) => chapter.blocks);
    expect(unitOneBlocks.length).toBeGreaterThan(0);
    expect(unitOneBlocks.some((block: any) => block.type === "sequence_visual")).toBe(true);
    expect(unitOneBlocks.some((block: any) => block.type === "comparison_panel")).toBe(true);
    expect(unitOneBlocks.some((block: any) => block.type === "learning_tools")).toBe(true);
    expect(unitOneBlocks.some((block: any) => ["knowledge_check", "single_choice_exercise", "multi_choice_exercise", "bucket_sort", "matching", "ordering"].includes(block.type))).toBe(false);
    expect(JSON.stringify(course)).not.toContain("XP");
    expect(JSON.stringify(course)).not.toContain("xp_progress_hud");
  });

  it("désactive les illustrations heuristiques absentes des blocs déclarés par le cours", () => {
    const lessonViewer = readFileSync(resolve(process.cwd(), "client/src/pages/training/LessonViewer.tsx"), "utf8");
    expect(lessonViewer).toContain("const shouldRenderAutomaticIllustration = false");
    expect(lessonViewer).not.toContain("{isSparse && (");
  });
});
