import { describe, expect, it } from "vitest";
import { getPublicTrainingTheme } from "./publicTrainingThemes";
import { publicTrainingHrefAlternates, publicTrainingPath } from "./publicTrainingLocale";

describe("localisation des pages publiques de formation", () => {
  it("fournit des routes stables distinctes pour le français, l’anglais et l’arabe", () => {
    expect(publicTrainingPath("fr")).toBe("/formations-ia");
    expect(publicTrainingPath("en", "finance-comptabilite-controle-gestion")).toBe("/en/ai-training/finance-comptabilite-controle-gestion");
    expect(publicTrainingPath("ar", "finance-comptabilite-controle-gestion")).toBe("/ar/ai-training/finance-comptabilite-controle-gestion");
    expect(publicTrainingHrefAlternates("finance-comptabilite-controle-gestion")).toHaveLength(3);
  });

  it("localise les contenus éditoriaux et les cartes de formation sans modifier les métriques", () => {
    const financeFr = getPublicTrainingTheme("finance-comptabilite-controle-gestion", "fr");
    const financeEn = getPublicTrainingTheme("finance-comptabilite-controle-gestion", "en");
    const financeAr = getPublicTrainingTheme("finance-comptabilite-controle-gestion", "ar");

    expect(financeFr?.metrics).toEqual(financeEn?.metrics);
    expect(financeFr?.metrics).toEqual(financeAr?.metrics);
    expect(financeEn?.title).toContain("Free");
    expect(financeAr?.title).toContain("الذكاء الاصطناعي");
    expect(financeAr?.certifications[0]?.title).toContain("أتمتة المحاسبة");
  });
});
