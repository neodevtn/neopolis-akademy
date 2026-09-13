import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const coursesDir = resolve(process.cwd(), "client/public/data/courses");
const files = (await readdir(coursesDir)).filter((file) => file.startsWith("claude_") && file.endsWith(".json"));

function cleanText(value, lang) {
  const flipInstruction = lang === "fr" ? "Consultez les cartes ci-dessous pour le détail." : "Explore the cards below for the details.";
  const toggleInstruction = lang === "fr" ? "Comparez les deux versions ci-dessous." : "Compare the two versions below.";
  const trustInstruction = lang === "fr" ? "Examinez chaque vérification de confiance ci-dessous avant de répondre." : "Review each trust check below before answering.";

  return value
    .replace(/^[ \t]*\(?\s*(?:Illustrative Scenario|Scénario illustratif)\s*\)?[ \t]*$/gim, "")
    .replace(/^[ \t]*>>\s*\[(?:music|musique)\]\s*>>[ \t]*$/gim, "")
    .replace(/\$\{expls\}/g, "")
    .replace(/^[ \t]*(?:Flip each card(?: to see what it controls)?|Retournez chaque carte(?: pour voir ce qu'elle contrôle)?)[ \t]*$/gim, flipInstruction)
    .replace(/^[ \t]*(?:Toggle to compare.*|Basculer pour comparer.*)[ \t]*$/gim, toggleInstruction)
    .replace(/^[ \t]*(?:Flip each check to see the question to ask\.|Basculez chaque vérification pour voir la question à poser\.)[ \t]*$/gim, trustInstruction)
    .replace(/\n{3,}/g, "\n\n");
}

function walk(value, locale = "en") {
  if (typeof value === "string") return cleanText(value, locale);
  if (Array.isArray(value)) return value.map((item) => walk(item, locale));
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, walk(child, key === "fr" || key === "en" ? key : locale)]),
  );
}

let changedFiles = 0;
for (const file of files) {
  const path = resolve(coursesDir, file);
  const raw = await readFile(path, "utf8");
  const cleaned = `${JSON.stringify(walk(JSON.parse(raw)), null, 2)}\n`;
  if (cleaned !== raw) {
    changedFiles += 1;
    if (process.argv[2] === "--write") await writeFile(path, cleaned, "utf8");
  }
}

console.log(`${changedFiles} fichier(s) nécessitent le nettoyage générique.`);
if (process.argv[2] !== "--write") console.log("Relancez avec --write pour appliquer les corrections.");
