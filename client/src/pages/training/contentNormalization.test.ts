import { describe, expect, it } from "vitest";
import { normalizeCourseContent } from "./contentNormalization";

describe("normalizeCourseContent", () => {
  it("normalise les artefacts concaténés et les repères spatiaux en français", () => {
    const rendered = normalizeCourseContent(
      "StrategyWhat it doesWhen to applyWhat continuity you lose\nPruning\nChoisissez la réponse à gauche.",
      "fr",
    );

    expect(rendered).toContain("Comparaison des stratégies de gestion du contexte");
    expect(rendered).toContain("Élagage du contexte");
    expect(rendered).not.toMatch(/à gauche|StrategyWhat/);
  });

  it("supprime les dépendances de position dans une vue anglaise", () => {
    expect(normalizeCourseContent("Choose the card on the left.", "en")).toBe(
      "Choose the card in the available options.",
    );
  });
});
