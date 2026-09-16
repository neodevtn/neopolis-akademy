import { describe, expect, it } from "vitest";
import { hasRequiredAnswerLength, resolveLocalizedBlockText, resolveMinimumAnswerLength } from "./cloudExerciseValidation";

describe("cloud exercise answer threshold", () => {
  it("conserve un seuil par défaut d’un caractère pour les TP existants", () => {
    expect(resolveMinimumAnswerLength(undefined)).toBe(1);
    expect(resolveMinimumAnswerLength(0)).toBe(1);
    expect(resolveMinimumAnswerLength("invalid")).toBe(1);
  });

  it("applique un seuil configuré et ignore les espaces de réponse", () => {
    expect(resolveMinimumAnswerLength("40")).toBe(40);
    expect(hasRequiredAnswerLength("  réponse ", 7)).toBe(true);
    expect(hasRequiredAnswerLength("   réponse   ", 8)).toBe(false);
  });

  it("résout les champs bilingues en privilégiant la langue apprenante", () => {
    const bilingual = { en: "Write your answer", fr: "Rédigez votre réponse" };
    expect(resolveLocalizedBlockText(bilingual, "fr")).toBe("Rédigez votre réponse");
    expect(resolveLocalizedBlockText(bilingual, "en")).toBe("Write your answer");
    expect(resolveLocalizedBlockText({ en: "Fallback" }, "fr")).toBe("Fallback");
  });
});
