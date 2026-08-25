import { describe, expect, it } from "vitest";
import { resolveLocalizedText } from "./localizedText";

describe("resolveLocalizedText", () => {
  it("rend un titre bilingue comme une chaîne et jamais comme un objet React", () => {
    expect(resolveLocalizedText({ en: "Accounting automation", fr: "Automatisation comptable" })).toBe("Automatisation comptable");
    expect(typeof resolveLocalizedText({ en: "Accounting automation", fr: "Automatisation comptable" })).toBe("string");
  });

  it("utilise l’anglais ou le repli lorsqu’une traduction française est absente", () => {
    expect(resolveLocalizedText({ en: "Accounting automation" }, "Sans titre")).toBe("Accounting automation");
    expect(resolveLocalizedText({}, "Sans titre")).toBe("Sans titre");
  });
});
