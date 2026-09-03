import { describe, expect, it } from "vitest";
import { homePublicAnchorIds, isHomePublicAnchor } from "./homePublicAnchors";

describe("ancres publiques de l’accueil", () => {
  it("conserve les quatre destinations exposées par le menu et le footer", () => {
    expect(homePublicAnchorIds).toEqual(["formule", "pourquoi", "partenaires", "faq"]);
    expect(isHomePublicAnchor("formule")).toBe(true);
    expect(isHomePublicAnchor("faq")).toBe(true);
    expect(isHomePublicAnchor("catalogue")).toBe(false);
  });
});
