import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const coursesDir = resolve(process.cwd(), "client/public/data/courses");
const bannedArtifacts = [
  /\(Illustrative Scenario\)/i,
  /\(Scénario illustratif\)/i,
  /\$\{expls\}/,
  /^\s*>>\s*\[(?:music|musique)\]\s*>>\s*$/im,
  /^\s*Flip each card(?: to see what it controls)?\s*$/im,
  /^\s*Retournez chaque carte(?: pour voir ce qu'elle contrôle)?\s*$/im,
  /^\s*Toggle to compare.*$/im,
  /^\s*Basculer pour comparer.*$/im,
];

describe("nettoyage générique des artefacts Anthropic", () => {
  it("retire de chaque contenu Claude les marqueurs UI et techniques non sémantiques ciblés", async () => {
    const files = (await readdir(coursesDir)).filter((file) => file.startsWith("claude_") && file.endsWith(".json"));
    // New Claude learning content must join the hygiene scan automatically.
    expect(files.length).toBeGreaterThanOrEqual(28);

    const sources = await Promise.all(files.map((file) => readFile(resolve(coursesDir, file), "utf8")));
    for (const source of sources) {
      for (const artifact of bannedArtifacts) expect(source).not.toMatch(artifact);
    }
  });
});
