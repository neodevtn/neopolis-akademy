import { describe, expect, it } from "vitest";
import { homePublicAnchorIds, isHomePublicAnchor, navigateToHomePublicAnchor } from "./homePublicAnchors";

describe("ancres publiques de l’accueil", () => {
  it("conserve les quatre destinations exposées par le menu et le footer", () => {
    expect(homePublicAnchorIds).toEqual(["formule", "pourquoi", "partenaires", "faq"]);
    expect(isHomePublicAnchor("formule")).toBe(true);
    expect(isHomePublicAnchor("faq")).toBe(true);
    expect(isHomePublicAnchor("catalogue")).toBe(false);
  });

  it("met à jour le hash puis défile lors d’un clic vers une autre ancre de l’accueil", () => {
    const updatedHashes: string[] = [];
    const scrolledHashes: string[] = [];

    expect(navigateToHomePublicAnchor("#pourquoi", {
      currentHash: "#formule",
      updateHash: (hash) => updatedHashes.push(hash),
      scroll: (hash) => { scrolledHashes.push(hash); return true; },
    })).toBe(true);
    expect(updatedHashes).toEqual(["#pourquoi"]);
    expect(scrolledHashes).toEqual(["#pourquoi"]);
  });

  it("rejoue le défilement même lorsque le hash demandé est déjà actif", () => {
    const updatedHashes: string[] = [];
    const scrolledHashes: string[] = [];

    expect(navigateToHomePublicAnchor("#faq", {
      currentHash: "#faq",
      updateHash: (hash) => updatedHashes.push(hash),
      scroll: (hash) => { scrolledHashes.push(hash); return true; },
    })).toBe(true);
    expect(updatedHashes).toEqual([]);
    expect(scrolledHashes).toEqual(["#faq"]);
  });
});
