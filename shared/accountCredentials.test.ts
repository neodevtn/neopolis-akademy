import { describe, expect, it } from "vitest";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, isValidPassword, normalizeAccountEmail } from "./accountCredentials";

describe("contrat d’identifiants de compte", () => {
  it("normalise les adresses e-mail avant contrôle d’unicité", () => {
    expect(normalizeAccountEmail("  Apprenant@Neopolis.Dev ")).toBe("apprenant@neopolis.dev");
  });

  it("accepte seulement les mots de passe dans les bornes prévues", () => {
    expect(isValidPassword("x".repeat(MIN_PASSWORD_LENGTH))).toBe(true);
    expect(isValidPassword("x".repeat(MIN_PASSWORD_LENGTH - 1))).toBe(false);
    expect(isValidPassword("x".repeat(MAX_PASSWORD_LENGTH))).toBe(true);
    expect(isValidPassword("x".repeat(MAX_PASSWORD_LENGTH + 1))).toBe(false);
  });
});
