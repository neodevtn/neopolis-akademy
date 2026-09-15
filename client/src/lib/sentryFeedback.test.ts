import { describe, expect, it } from "vitest";
import { validateTechnicalFeedbackInput } from "./sentryFeedback";

describe("validateTechnicalFeedbackInput", () => {
  it("accepte un signalement suffisamment détaillé sans créer un événement Sentry navigateur", () => {
    expect(() => validateTechnicalFeedbackInput({
      message: "Le bouton reste bloqué après la validation.",
      url: "https://akademy.neodev.click/training/demo",
    })).not.toThrow();
  });

  it("refuse un message trop court avant tout transport", () => {
    expect(() => validateTechnicalFeedbackInput({ message: "court", url: "https://akademy.neodev.click" }))
      .toThrow("six caractères");
  });
});
