import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "client/src/data/trainingIndex.json");
const coursesDirectory = path.join(root, "client/public/data/courses");
const technicalKeyPattern = /^(id|certId|courseId|lessonId|chapterId|blockId|sourceUrl|url|href|path|fileName|filename|assetId|mediaId|origin|catalog|repository|provider|rubricVersion|schemaVersion|internal[A-Z]|external[A-Z])/i;

function cleanVisibleText(value) {
  if (!/datacamp/i.test(value)) return value;
  return value
    .replace(/\bUn cours partenaire\s+DataCamp\s+autorisé\b/gi, "Une formation Neopolis Akademy")
    .replace(/\bAn authorized\s+DataCamp\s+partner course\b/gi, "A Neopolis Akademy course")
    .replace(/directement sur la plateforme de DataCamp/gi, "directement dans Neopolis Akademy")
    .replace(/directly on the DataCamp platform/gi, "directly in Neopolis Akademy")
    .replace(/Official course slides provided in the local DataCamp package\.?/gi, "Official course slides provided for this course.")
    .replace(/\b(cours|formation)\s+DataCamp\b/gi, "$1")
    .replace(/\bplateforme\s+(?:de\s+)?DataCamp\b/gi, "Neopolis Akademy")
    .replace(/\b(?:local\s+)?DataCamp\s+package\b/gi, "cette formation")
    .replace(/\bDataCamp['’]s\b/gi, "la formation")
    .replace(/\bDataCamp\s*[·•:—–-]\s*/gi, "")
    .replace(/\bDataCamp\s+partner\b/gi, "Neopolis Akademy")
    .replace(/DATACAMP(?=[_\s-])/g, "TRAINING")
    .replace(/Datacamp(?=[_\s-])/gi, "formation")
    .replace(/DataCamp/gi, "Neopolis Akademy")
    .replace(/\bTraining\s+(?=sur|dans|avec|pour)/gi, "")
    .replace(/\bplateforme de Neopolis Akademy\b/gi, "Neopolis Akademy")
    .replace(/\bNeopolis Akademy package\b/gi, "cette formation");
}

function cleanValue(value, pointer = "", key = "") {
  if (pointer === "datacampImport" || pointer.startsWith("datacampImport.") || technicalKeyPattern.test(key)) return value;
  if (typeof value === "string") return cleanVisibleText(value);
  if (Array.isArray(value)) return value.map((entry, index) => cleanValue(entry, `${pointer}[${index}]`, key));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, cleanValue(childValue, pointer ? `${pointer}.${childKey}` : childKey, childKey)]));
}

function normalizeSalesAssistantLanguage(value) {
  if (typeof value === "string") {
    return value
      .replace(/assistant IA choisi for Microsoft trois-cent-soixante-cinq/gi, "Microsoft Copilot pour Microsoft 365")
      .replace(/assistant IA choisi Studio/gi, "Microsoft Copilot Studio")
      .replace(/assistant IA choisi Agents/gi, "Microsoft Copilot Studio Agents")
      .replace(/agent l[’']assistant IA choisi/gi, "agent Microsoft Copilot")
      .replace(/votre agent l[’']assistant IA choisi/gi, "votre agent Microsoft Copilot")
      .replace(/l[’']assistant IA choisi/gi, "Microsoft Copilot")
      .replace(/assistant IA choisi/gi, "Microsoft Copilot")
      .replace(/Microsoft Copilot vs l[’']Microsoft Copilot Studio/gi, "Microsoft Copilot et Microsoft Copilot Studio")
      .replace(/l[’']Microsoft Copilot Studio/gi, "Microsoft Copilot Studio")
      .replace(/l[’']Microsoft Copilot/gi, "Microsoft Copilot");
  }
  if (Array.isArray(value)) return value.map(normalizeSalesAssistantLanguage);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, normalizeSalesAssistantLanguage(childValue)]));
}

const targets = [catalogPath, ...fs.readdirSync(coursesDirectory).filter((name) => name.endsWith(".json")).map((name) => path.join(coursesDirectory, name))];
for (const targetPath of targets) {
  const relativePath = path.relative(root, targetPath);
  const baseline = execFileSync("git", ["show", `HEAD:${relativePath}`], { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const cleaned = cleanValue(JSON.parse(baseline));
  const normalized = relativePath.endsWith("ai_for_sales__01.json") ? normalizeSalesAssistantLanguage(cleaned) : cleaned;
  fs.writeFileSync(targetPath, `${JSON.stringify(normalized, null, 2)}\n`);
}

console.log(JSON.stringify({ restoredFrom: "HEAD", cleanedFiles: targets.length }, null, 2));
