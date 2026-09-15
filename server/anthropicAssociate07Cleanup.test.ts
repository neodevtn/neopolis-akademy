import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__07.json",
);

describe("nettoyage pédagogique Anthropic — Associate Foundations 07", () => {
  it("conserve les notions dans les chapitres standards sans conserver les fragments racine hors flux", async () => {
    const course = JSON.parse(await readFile(coursePath, "utf8"));
    const chapter = course.lessons[0].chapters.find((item: any) => item.id === "chapter_02");
    const content = chapter.blocks.find((block: any) => block.type === "content").body.fr;

    expect(course.exercises).toEqual([]);
    expect(content).toContain("ce n’est pas tout à fait ça");
    expect(content).toContain("Memory peut repérer les motifs");
    expect(content).not.toContain("édition lucky");
  });
});
