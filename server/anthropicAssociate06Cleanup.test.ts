import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__06.json",
);

describe("nettoyage pédagogique Anthropic — Associate Foundations 06", () => {
  it("structure les critères et corrige les reliquats sans retirer les exercices", async () => {
    const course = JSON.parse(await readFile(coursePath, "utf8"));
    const screening = course.exercises.find((exercise: any) => exercise.prompt.en.includes("## Delegation criteria for screening"));
    const trust = course.exercises.find((exercise: any) => exercise.prompt.en.includes("Review each trust check below"));
    const ethics = course.exercises.find((exercise: any) => exercise.prompt.fr.includes("productions assistées par l’IA"));

    expect(course.exercises.length).toBeGreaterThanOrEqual(9);
    expect(screening.prompt.en).toContain("| Criterion | The question to ask |");
    expect(screening.prompt.fr).toContain("| Critère | Question à poser |");
    expect(trust.prompt.en).not.toContain("Flip each check");
    expect(trust.prompt.fr).not.toContain("Basculez chaque vérification");
    expect(ethics.prompt.fr).not.toContain("AI-assisted work products");
  });
});
