import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__04.json",
);
const course = JSON.parse(await readFile(coursePath, "utf8"));
const lesson = course.lessons?.[0];
const workflowChapter = lesson?.chapters?.find((chapter) =>
  chapter.blocks?.some(
    (block) =>
      block.body?.fr?.includes("Deux schémas fonctionnels, mêmes critères") ||
      block.body?.fr?.includes("## Exemple 1 — Revue de contrat"),
  ),
);

if (lesson?.id !== "lesson_01" || workflowChapter?.blocks?.[0]?.type !== "content") {
  throw new Error("Le chapitre de cartographie des workflows attendu est introuvable.");
}

function markdownTable(section, endingMarker) {
  const header = "Étape du workflow | Délégation | Pourquoi";
  const start = section.indexOf(header);
  const end = section.indexOf(endingMarker);
  if (start < 0 || end < 0 || end <= start) return section;

  const before = section.slice(0, start);
  const rawRows = section
    .slice(start + header.length, end)
    .trim()
    .split("\n\n")
    .filter(Boolean);
  const rows = rawRows
    .map((row) => row.split(" | ").map((cell) => cell.trim()))
    .filter((cells) => cells.length === 3)
    .map((cells) => `| ${cells.join(" | ")} |`)
    .join("\n");
  return `${before}\n\n| Étape du workflow | Délégation | Pourquoi |\n| --- | --- | --- |\n${rows}${section.slice(end)}`;
}

const body = workflowChapter.blocks[0].body;
const marker = "Deux schémas fonctionnels, mêmes critères\n\nRevue de contrat\nDocuments d'intégration";
const occurrences = body.fr.split(marker);
if (occurrences.length === 3) {
  let first = `## Exemple 1 — Revue de contrat${occurrences[1]}`;
  let second = `## Exemple 2 — Documents d’intégration${occurrences[2]}`;
  first = markdownTable(first, "\n\nNotez que l'IA effectue un vrai travail ici");
  second = markdownTable(second, "\n\nRemarquez que ce motif est identique");
  body.fr = `${occurrences[0]}${first}${second}`;
}

const secondExampleMarker = "## Exemple 2 — Documents d’intégration";
const secondExampleIndex = body.fr.indexOf(secondExampleMarker);
const onboardingTable = `| Étape du workflow | Délégation | Pourquoi |
| --- | --- | --- |
| Extraire les données des nouveaux employés depuis l’export HRIS | AI-appropriate (exécution de code) | Mécanique, réversible, doit être exact |
| Rédiger l’offre à partir du modèle approuvé | AI-appropriate | Brouillon ; un Skill porte le modèle |
| Personnaliser la note de bienvenue | Collaborative | L’IA rédige, le responsable du recrutement apporte la voix humaine |
| Confirmer que les chiffres de rémunération correspondent à la demande approuvée | Human-retained | Enjeux élevés, la responsabilité ne délègue pas |
| Envoyer l’offre signée | Human-retained | Irréversible, juridiquement contraignant |`;
const secondExampleEnd = body.fr.indexOf("\n\nRemarquez que ce motif est identique", secondExampleIndex);
if (secondExampleIndex >= 0 && secondExampleEnd > secondExampleIndex) {
  body.fr = `${body.fr.slice(0, secondExampleIndex)}${secondExampleMarker}\n\n${onboardingTable}${body.fr.slice(secondExampleEnd)}`;
}

const contractTableEn = `| Workflow step | Delegation | Why |
| --- | --- | --- |
| Extract clauses from the contract | AI-appropriate | Reversible, low stakes, mechanical |
| Flag departures from the company playbook | AI-appropriate | Reversible; a Skill carries the playbook rules |
| Draft the redline and rationale | Collaborative | AI drafts, human judges each edit |
| Approve or reject each change | Human-retained | High stakes, accountability does not delegate |
| Compute financial exposure of a penalty clause | AI-appropriate (code execution) | Numeric; must be computed, not estimated |
| Sign and send | Human-retained | Irreversible, external, legally binding |`;
const onboardingTableEn = `| Workflow step | Delegation | Why |
| --- | --- | --- |
| Pull new-hire details from the HRIS export | AI-appropriate (code execution) | Mechanical, reversible, must be exact |
| Draft the offer letter from the approved template | AI-appropriate | Reversible draft; a Skill carries the template |
| Personalize the welcome note | Collaborative | AI drafts, hiring manager adds the human voice |
| Confirm compensation figures match the approved req | Human-retained | High stakes, accountability does not delegate |
| Send the signed offer | Human-retained | Irreversible, legally binding |`;
const englishExamplesStart = body.en.indexOf("Two worked maps, same criteria");
const englishExamplesEnd = body.en.indexOf("\n\nNotice the pattern is identical", englishExamplesStart);
if (englishExamplesStart >= 0 && englishExamplesEnd > englishExamplesStart) {
  const examples = `## Example 1 — Contract review

${contractTableEn}

Note that the AI does real work here, including the redline draft, not just a summary. The human owns the decisions and the irreversible steps. That split is the redesign.

The same three criteria produce a very different outcome when stakes and reversibility change. A People team generates offer letters and onboarding packets from templates.

## Example 2 — Onboarding documents

${onboardingTableEn}`;
  body.en = `${body.en.slice(0, englishExamplesStart)}${examples}${body.en.slice(englishExamplesEnd)}`;
}

if (process.argv[2] !== "--write") {
  console.log("Contrôle réussi. Relancez avec --write pour appliquer les corrections.");
  process.exit(0);
}

await writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
console.log(`Corrections appliquées : ${coursePath}`);
