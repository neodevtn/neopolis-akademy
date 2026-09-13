import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__07.json",
);

describe("nettoyage pédagogique Anthropic — Associate Foundations 07", () => {
  it("complète le titre tronqué et localise le reliquat français sans retirer l’exercice", async () => {
    const course = JSON.parse(await readFile(coursePath, "utf8"));
    const vagueFeedback = course.exercises.find((exercise: any) => exercise.title.en.includes("does not improve the result"));
    const promotedFix = course.exercises.find((exercise: any) => exercise.prompt.fr.includes("La Mémoire de Claude"));

    expect(vagueFeedback.title.en).not.toContain("...");
    expect(vagueFeedback.title.fr).toContain("n’améliore pas le résultat");
    expect(promotedFix.prompt.fr).not.toContain("Claude's Memory");
    expect(promotedFix.prompt.fr).toContain("Comparez la correction conservée");
  });
});
