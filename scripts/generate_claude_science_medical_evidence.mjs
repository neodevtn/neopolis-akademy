import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const deliveryRoot = path.join(root, ".work", "claude-science-medical-2026-09-17", "package", "claude_science_medical_fr_2026-09-17");
const source = JSON.parse(fs.readFileSync(path.join(deliveryRoot, "COURSE.json"), "utf8"));
const output = JSON.parse(fs.readFileSync(path.join(root, "client/public/data/courses/claude_science_recherche_medicale__01.json"), "utf8"));
const assetMap = JSON.parse(fs.readFileSync(path.join(root, ".work", "claude-science-medical-2026-09-17", "asset-map.json"), "utf8"));
const sourceToBlock = {
  Objectives: "learning_section (objectives)",
  SourceGroundedText: "content",
  AnnotatedScreenshot: "annotated_screenshot",
  PromptTemplate: "callout (tip)",
  GuidedAction: "learning_section (content)",
  CheckpointMCQ: "checkpoint (correction côté serveur)",
  VideoEmbed: "video (YouTube standard)",
  LessonSummary: "learning_section (summary)",
};
const header = [
  "# Matrice écran source → bloc Neopolis", "",
  "Cette matrice est générée depuis `COURSE.json`. Elle ne reproduit pas le contenu des sources ; elle trace le type d’écran, son titre et le bloc standard qui le rend dans Neopolis Akademy.", "",
  "| Module | Leçon | Écran source | Type source | Bloc Neopolis |", "|---|---|---|---|---|",
];
for (const module of source.modules) {
  for (const lesson of module.lessons) {
    for (const screen of lesson.screens) {
      header.push(`| ${module.order}. ${module.title.replaceAll("|", "\\|")} | ${lesson.id} — ${lesson.title.replaceAll("|", "\\|")} | ${screen.order}. ${screen.title.replaceAll("|", "\\|")} | \`${screen.type}\` | \`${sourceToBlock[screen.type] || "non pris en charge"}\` |`);
    }
  }
}
header.push("", "Le manifeste fourni référence également une vidéo sans écran `COURSE.json` associé. Elle est intégrée comme **ressource facultative**, explicitement non bloquante, au premier cours afin de conserver l’inventaire sans inventer un prérequis.");
fs.writeFileSync(path.join(root, "docs", "claude-science-medical-screen-block-matrix.md"), `${header.join("\n")}\n`);

const entries = Object.entries(assetMap).sort(([a], [b]) => a.localeCompare(b)).map(([relative, asset]) => {
  const file = path.join(deliveryRoot, relative);
  const bytes = fs.readFileSync(file);
  return {
    relative,
    kind: asset.kind || "download",
    mimeType: asset.mimeType || "application/octet-stream",
    bytes: bytes.length,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
    url: asset.url,
  };
});
const inventory = [
  "# Inventaire des ressources Claude Science", "",
  "Les fichiers ci-dessous proviennent du package fourni, sont stockés via la médiathèque Neopolis et sont référencés par une URL stable `/api/assets/…`. Les vidéos restent intégrées par URL YouTube, conformément à la consigne, et ne sont donc pas téléchargées ni hachées ici.", "",
  "| Ressource source | Type | MIME | Octets | SHA-256 | URL médiathèque |", "|---|---|---|---:|---|---|",
  ...entries.map((entry) => `| \`${entry.relative}\` | ${entry.kind} | \`${entry.mimeType}\` | ${entry.bytes} | \`${entry.sha256}\` | \`${entry.url}\` |`),
  "",
  `**Total : ${entries.length} ressources gérées.**`,
];
fs.writeFileSync(path.join(root, "docs", "claude-science-medical-asset-inventory.md"), `${inventory.join("\n")}\n`);

const metrics = {
  modules: output.modules.length,
  lessons: output.lessons.length,
  checkpoints: output.exercises.length,
  labs: output.lessons.flatMap((lesson) => lesson.chapters).flatMap((chapter) => chapter.blocks || []).filter((block) => block.type === "cloud_exercise").length,
  quizzes: output.lessons.flatMap((lesson) => lesson.chapters).flatMap((chapter) => chapter.blocks || []).filter((block) => block.type === "module_quiz").length,
  videos: output.lessons.flatMap((lesson) => lesson.chapters).flatMap((chapter) => chapter.blocks || []).filter((block) => block.type === "video").length,
};
console.log(JSON.stringify({ matrixRows: header.length - 7, inventoryAssets: entries.length, metrics }, null, 2));
