import { describe, expect, it } from "vitest";
import { createMediaBlock, linkMediaToBlock } from "./mediaInsertion";

const youtube = { id: "yt", kind: "youtube" as const, url: "https://www.youtube.com/watch?v=abc123", title: "Démo", usedBy: [] };
const image = { id: "img", kind: "image" as const, url: "/api/assets/demo.png", title: "Schéma", usedBy: [] };

describe("liaison média vers visual designer", () => {
  it("crée le type de bloc adapté à la ressource sélectionnée", () => {
    expect(createMediaBlock(youtube)).toMatchObject({ type: "video", url: youtube.url });
    expect(createMediaBlock(image)).toMatchObject({ type: "content", body: { fr: "![Schéma](/api/assets/demo.png)" } });
  });

  it("insère une image dans un bloc texte bilingue existant", () => {
    const result = linkMediaToBlock({ type: "content", body: { en: "Start", fr: "Début" } }, image);
    expect(result.body.fr).toContain("![Schéma](/api/assets/demo.png)");
    expect(result.body.en).toContain("![Schéma](/api/assets/demo.png)");
  });
});
