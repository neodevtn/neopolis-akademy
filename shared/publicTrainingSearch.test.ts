import { describe, expect, it } from "vitest";
import { getPublicCatalogueTrainings } from "./publicTrainingCatalog";
import { normalizePublicTrainingSearchText, searchPublicCatalogueTrainings } from "./publicTrainingSearch";

describe("recherche publique de formations", () => {
  it("normalise les accents et conserve les caractères arabes", () => {
    expect(normalizePublicTrainingSearchText("Analyse & données")).toBe("analyse donnees");
    expect(normalizePublicTrainingSearchText("أتمتة المحاسبة")).toBe("أتمتة المحاسبة");
  });

  it("retourne des formations publiques pertinentes dans chaque langue", () => {
    const french = searchPublicCatalogueTrainings(getPublicCatalogueTrainings("fr"), "finance");
    const english = searchPublicCatalogueTrainings(getPublicCatalogueTrainings("en"), "bookkeeping");
    const arabic = searchPublicCatalogueTrainings(getPublicCatalogueTrainings("ar"), "المحاسبة");

    expect(french.some((training) => training.title === "L’IA pour la finance")).toBe(true);
    expect(english.some((training) => training.title === "Build a bookkeeping agent")).toBe(true);
    expect(arabic.some((training) => training.title.includes("المحاسبة"))).toBe(true);
  });
});
