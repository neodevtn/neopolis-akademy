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

  it("retire uniquement les marqueurs techniques ou visuels vides confirmés", () => {
    const content = "Avant\n\n(Illustrative Scenario)\n\n>> [music] >>\n\n${expls}\n\nAprès";

    expect(normalizeCourseContent(content, "en")).toBe("Avant\n\nAprès");
  });

  it("remplace une instruction de flip-card brute sans supprimer son contexte", () => {
    expect(normalizeCourseContent("Intro\n\nFlip each card\n\nSuite", "en")).toBe(
      "Intro\n\nExplore the cards below for the details.\n\nSuite",
    );
    expect(normalizeCourseContent("Intro\n\nRetournez chaque carte\n\nSuite", "fr")).toBe(
      "Intro\n\nConsultez les cartes ci-dessous pour le détail.\n\nSuite",
    );
  });

  it("remplace une instruction de bascule importée comme texte sans dépendre d’un composant propriétaire", () => {
    expect(normalizeCourseContent("Avant\n\nToggle to compare the same instruction, vague versus precise.\n\nAprès", "en")).toBe(
      "Avant\n\nCompare the two versions below.\n\nAprès",
    );
    expect(normalizeCourseContent("Avant\n\nBasculer pour comparer la même instruction, vague et précise.\n\nAprès", "fr")).toBe(
      "Avant\n\nComparez les deux versions ci-dessous.\n\nAprès",
    );
  });

  it("réduit les séparateurs vides sans perdre le contenu", () => {
    expect(normalizeCourseContent("Choisissez à gauche\n\n\n\nPuis continuez", "fr")).toBe(
      "Choisissez dans les options proposées\n\nPuis continuez",
    );
  });
});
