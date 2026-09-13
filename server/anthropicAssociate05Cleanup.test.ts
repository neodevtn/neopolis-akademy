import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__05.json",
);

describe("nettoyage pédagogique Anthropic — Associate Foundations 05", () => {
  it("complète la carte Project tronquée sans supprimer les flip-cards", async () => {
    const course = JSON.parse(await readFile(coursePath, "utf8"));
    const chapter = course.lessons[0].chapters.find((chapter: any) =>
      chapter.blocks.some((block: any) => block.type === "flip_cards" && block.cards?.[0]?.front?.en === "Configuring Claude Projects"),
    );
    const card = chapter.blocks[1].cards[0];

    expect(chapter.blocks[1].type).toBe("flip_cards");
    expect(card.back.en).toContain("what makes a Project effective.");
    expect(card.back.en).not.toMatch(/what makes a Proj$/);
    expect(card.back.fr).toContain("rend un Projet efficace.");
  });
});
