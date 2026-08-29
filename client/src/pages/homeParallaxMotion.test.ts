import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("parallaxe de l’accueil", () => {
  it("utilise le défilement global sans cible dans le conteneur document statique", () => {
    const source = fs.readFileSync("client/src/pages/Home.tsx", "utf8");

    expect(source).toContain("const { scrollY } = useScroll();");
    expect(source).not.toContain("target: ref,");
  });
});
