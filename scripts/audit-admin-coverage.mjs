import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const coursesDir = path.join(root, "client", "public", "data", "courses");
const registryPath = path.join(root, "shared", "blockRegistry.ts");
const indexPath = path.join(root, "client", "src", "data", "trainingIndex.json");
const outputPath = path.join(root, "docs", "admin-coverage-audit.md");

const registrySource = await fs.readFile(registryPath, "utf8");
const registryTypes = new Set([...registrySource.matchAll(/const\s+\w+Block:\s+BlockTypeDefinition\s*=\s*\{\s*type:\s*"([^"]+)"/g)].map((match) => match[1]));
const trainingIndex = JSON.parse(await fs.readFile(indexPath, "utf8"));
const courseFiles = (await fs.readdir(coursesDir)).filter((file) => file.endsWith(".json")).sort();
const blockTypes = new Map();
const chapterTypes = new Map();
const unknownBlockTypes = new Map();
const courseFields = new Set();
const lessonFields = new Set();
const chapterFields = new Set();

for (const file of courseFiles) {
  const course = JSON.parse(await fs.readFile(path.join(coursesDir, file), "utf8"));
  Object.keys(course).forEach((key) => courseFields.add(key));
  for (const lesson of course.lessons || []) {
    Object.keys(lesson).forEach((key) => lessonFields.add(key));
    for (const chapter of lesson.chapters || []) {
      Object.keys(chapter).forEach((key) => chapterFields.add(key));
      chapterTypes.set(chapter.type || "unspecified", (chapterTypes.get(chapter.type || "unspecified") || 0) + 1);
      for (const block of chapter.blocks || []) {
        const type = block.type || "unspecified";
        blockTypes.set(type, (blockTypes.get(type) || 0) + 1);
        if (!registryTypes.has(type)) unknownBlockTypes.set(type, (unknownBlockTypes.get(type) || 0) + 1);
      }
    }
  }
}

const indexRootFields = Object.keys(trainingIndex);
const certificationFields = new Set((trainingIndex.certifications || []).flatMap((certification) => Object.keys(certification)));
const categoryFields = new Set((trainingIndex.categories || []).flatMap((category) => Object.keys(category)));
const courseIndexFields = new Set((trainingIndex.courses || []).flatMap((course) => Object.keys(course)));
const table = (entries) => ["| Élément | Nombre |", "|---|---:|", ...entries.map(([name, count]) => `| ${name} | ${count} |`)].join("\n");
const list = (values) => values.length ? values.map((value) => `- \`${value}\``).join("\n") : "- Aucun";

const lines = [
  "# Audit de couverture d’administration", "",
  `Généré le ${new Date().toISOString()}.`, "",
  "## Bibliothèque de blocs", "",
  `- Types enregistrés : **${registryTypes.size}**`,
  `- Types rencontrés dans les cours : **${blockTypes.size}**`,
  `- Types rencontrés mais non enregistrés : **${unknownBlockTypes.size}**`, "",
  table([...blockTypes.entries()].sort(([a], [b]) => a.localeCompare(b))), "",
  "### Types non enregistrés", "", table([...unknownBlockTypes.entries()].sort(([a], [b]) => a.localeCompare(b))), "",
  "## Structure des cours", "", table([...chapterTypes.entries()].sort(([a], [b]) => a.localeCompare(b))), "",
  "### Champs observés", "",
  "#### Cours", list([...courseFields].sort()), "", "#### Leçons", list([...lessonFields].sort()), "", "#### Chapitres", list([...chapterFields].sort()), "",
  "## Index pédagogique", "",
  `- Champs racine : ${indexRootFields.map((field) => `\`${field}\``).join(", ") || "aucun"}`,
  "- Champs certification :", list([...certificationFields].sort()), "", "- Champs catégorie :", list([...categoryFields].sort()), "", "- Champs carte de cours :", list([...courseIndexFields].sort()),
];

await fs.writeFile(outputPath, `${lines.join("\n")}\n`);
console.log(`Audit d’administration : ${courseFiles.length} cours, ${registryTypes.size} types de blocs enregistrés, ${unknownBlockTypes.size} types non enregistrés.`);
console.log(`Rapport : ${outputPath}`);
