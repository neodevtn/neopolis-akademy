import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__03.json",
);

describe("nettoyage pédagogique Anthropic — Associate Foundations 03", () => {
  it("retire le seul paragraphe redondant confirmé et localise les cartes concernées", async () => {
    const course = JSON.parse(await readFile(coursePath, "utf8"));
    const lesson = course.lessons[0];
    const verification = lesson.chapters.find((chapter: any) =>
      chapter.blocks.some((block: any) =>
        block.type === "flip_cards" && block.cards.some((card: any) => card.back?.en?.includes("If the answer is not supported")),
      ),
    );
    const formats = lesson.chapters.find((chapter: any) => /output formats/i.test(chapter.title.en));
    expect(verification).toBeDefined();
    expect(formats).toBeDefined();
    const body = formats.blocks[0].body.fr;

    expect(body).toContain("Des entrées bien organisées donnent des sorties bien organisées.");
    expect(body).not.toContain("Des entrées organisées produisent des sorties organisées.");
    const titles = lesson.chapters.map((chapter: any) => chapter.title.fr);
    expect(titles).not.toContain("discernement");
    expect(titles).not.toContain("assiduité");
    expect(verification.blocks[1].cards[1].back.fr).toContain("Si la réponse n’est pas étayée");
    expect(verification.blocks[1].cards[1].back.fr).not.toContain("If the answer is not supported");
    expect(verification.blocks[1].cards[2].back.fr).toContain("Répondez uniquement à partir du contrat joint");
    expect(verification.blocks[1].cards[2].back.fr).not.toContain("Answer using only the attached contract");
  });
});
