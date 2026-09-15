import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__04.json",
);

describe("nettoyage pédagogique Anthropic — Associate Foundations 04", () => {
  it("conserve les deux exemples tout en supprimant leur en-tête dupliqué et en rendant les tables", async () => {
    const course = JSON.parse(await readFile(coursePath, "utf8"));
    const chapter = course.lessons[0].chapters.find((chapter: any) =>
      chapter.blocks.some((block: any) => block.body?.fr?.includes("## Exemple 1 — Revue de contrat")),
    );
    const body = chapter.blocks[0].body.fr;
    const englishBody = chapter.blocks[0].body.en;

    expect(body).toContain("## Exemple 1 — Revue de contrat");
    expect(body).toContain("## Exemple 2 — Documents d’intégration");
    expect(body).not.toContain("Deux schémas fonctionnels, mêmes critères");
    expect(body.match(/\| Étape du flux de travail \| Délégation \| Pourquoi \|/g)).toHaveLength(2);
    expect(body).toContain("| Signer et envoyer | réservée à l’humain | Irréversible, externe, juridiquement contraignant |");
    expect(body).toContain("Envoyer l’offre signée | réservée à l’humain");
    expect(englishBody).toContain("## Example 1 — Contract review");
    expect(englishBody).toContain("## Example 2 — Onboarding documents");
    expect(englishBody).not.toContain("Workflow stepDelegationWhy");
    expect(englishBody.match(/\| Workflow step \| Delegation \| Why \|/g)).toHaveLength(2);
  });
});
