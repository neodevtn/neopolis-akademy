import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__02.json",
);

describe("nettoyage pédagogique Anthropic — Associate Foundations 02", () => {
  it("conserve les flip-cards et retire seulement leur répétition textuelle", async () => {
    const course = JSON.parse(await readFile(coursePath, "utf8"));
    const lesson = course.lessons[0];
    const anatomy = lesson.chapters[1];
    const iteration = lesson.chapters[3];

    expect(anatomy.blocks[1].type).toBe("flip_cards");
    expect(anatomy.blocks[1].cards).toHaveLength(5);
    expect(anatomy.blocks[0].body.fr).toContain("Consultez les cinq cartes ci-dessous");
    expect(anatomy.blocks[0].body.fr).not.toContain("Retournez chaque carte");
    expect(anatomy.blocks[0].body.fr).not.toContain("\n\nComposant\n\nRôle");
    expect(anatomy.blocks[1].cards[4].back.en).toContain("which components a given task requires.");

    expect(iteration.blocks[1].type).toBe("flip_cards");
    expect(iteration.blocks[1].cards.length).toBeGreaterThan(2);
    expect(iteration.blocks[0].body.fr).toContain("Consultez les cartes de diagnostic");
    expect(iteration.blocks[0].body.fr).not.toContain("Symptôme — Cause probable — Correctif\nLe résultat est générique");
    expect(iteration.blocks[1].cards[2].front.fr).toBe("Symptôme · Cause probable · Correctif");
  });
});
