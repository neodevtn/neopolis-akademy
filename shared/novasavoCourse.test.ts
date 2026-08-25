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

  it("découpe chaque unité en écrans courts avec deux validations obligatoires", () => {
    course.lessons.slice(0, 12).forEach((lesson: any) => {
      expect(lesson.chapters).toHaveLength(6);
      expect(lesson.chapters.filter((chapter: any) => chapter.requiredBeforeAdvance)).toHaveLength(2);
    });
  });

  it("utilise uniquement des blocs Novasavo déclarés dans la bibliothèque standard", () => {
    const types = new Set(course.lessons.flatMap((lesson: any) => lesson.chapters.flatMap((chapter: any) => chapter.blocks.map((block: any) => block.type))));
    ["unit_hero_blue", "inline_myth_reality", "inline_scenario_question_feedback", "timeline_step_cards", "process_flow_diagram", "mistake_correction_pairs", "ai_assistant_prompt_panel", "notes_highlights_bookmarks_panel", "xp_progress_hud"].forEach((type) => {
      expect(types.has(type)).toBe(true);
      expect(getBlockDef(type)).toBeDefined();
    });
  });
});
