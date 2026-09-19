import { describe, expect, it } from "vitest";
import { extractExplicitScreenHeading } from "./screenContentHeading";

describe("extractExplicitScreenHeading", () => {
  it("keeps a plain introductory paragraph in the learning content", () => {
    const content = "Claude Science est une application de bureau qui associe Claude à un environnement d’analyse contrôlé.\n\nLa méthode reste non clinique.";
    expect(extractExplicitScreenHeading(content)).toEqual({ title: "", content });
  });

  it("extracts and removes only a real Markdown heading", () => {
    const result = extractExplicitScreenHeading("## Préparer l’analyse\n\nConservez une trace reproductible.");
    expect(result).toEqual({
      title: "Préparer l’analyse",
      content: "\nConservez une trace reproductible.",
    });
  });

  it("accepts a dedicated bold-only heading without promoting regular bold text", () => {
    expect(extractExplicitScreenHeading("**À retenir**\n\nUne conclusion.").title).toBe("À retenir");
    expect(extractExplicitScreenHeading("**Claude Science** est un outil de recherche.").title).toBe("");
  });
});
