import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__08.json",
);

describe("nettoyage pédagogique Anthropic — Associate Foundations 08", () => {
  it("retire les métadonnées UI et les doublons sans supprimer les cartes de récapitulatif", async () => {
    const course = JSON.parse(await readFile(coursePath, "utf8"));
    const chapter = course.lessons[0].chapters.find((chapter: any) => chapter.blocks?.[0]?.body?.en?.includes("## The AI Fluency thread"));
    const body = chapter.blocks[0].body;
    const cards = chapter.blocks[1].cards;

    expect(body.en).not.toContain("Table of contents");
    expect(body.en).not.toContain("Begin module →");
    expect(body.fr).not.toContain("Table des matières");
    expect(body.en).toContain("| Competency | What it means |");
    expect(body.fr).toContain("| Compétence | Ce qu’elle recouvre |");
    expect(body.en).not.toMatch(/\nM1\n/);
    expect(cards.length).toBeGreaterThanOrEqual(6);
    expect(cards[1].front.en).toBe("Operating Claude with discipline");
  });
});
