import { describe, expect, it } from "vitest";
import { getPublicTrainingTheme } from "./publicTrainingThemes";
import { publicTrainingHrefAlternates, publicTrainingPath } from "./publicTrainingLocale";

describe("localisation des pages publiques de formation", () => {
  it("fournit des routes stables distinctes pour le français, l’anglais et l’arabe", () => {
    expect(publicTrainingPath("fr")).toBe("/formations-ia");
    expect(publicTrainingPath("en", "comptabilite-finance")).toBe("/en/ai-training/comptabilite-finance");
    expect(publicTrainingPath("ar", "comptabilite-finance")).toBe("/ar/ai-training/comptabilite-finance");
    expect(publicTrainingHrefAlternates("comptabilite-finance")).toHaveLength(3);
  });

  it("localise les contenus éditoriaux et les cartes de formation sans modifier les métriques", () => {
    const financeFr = getPublicTrainingTheme("comptabilite-finance", "fr");
    const financeEn = getPublicTrainingTheme("comptabilite-finance", "en");
    const financeAr = getPublicTrainingTheme("comptabilite-finance", "ar");

    expect(financeFr?.metrics).toEqual(financeEn?.metrics);
    expect(financeFr?.metrics).toEqual(financeAr?.metrics);
    expect(financeEn?.title).toContain("Free");
    expect(financeAr?.title).toContain("الذكاء الاصطناعي");
    expect(financeAr?.certifications.some((certification) => certification.title.includes("أتمتة المحاسبة"))).toBe(true);
  });
});
