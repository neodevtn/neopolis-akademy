import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "client/src/data/trainingIndex.json");
const coursesDirectory = path.join(root, "client/public/data/courses");
const technicalKeyPattern = /^(id|certId|courseId|lessonId|chapterId|blockId|sourceUrl|url|href|path|fileName|filename|assetId|mediaId|origin|catalog|repository|internal[A-Z]|external[A-Z])/i;

function cleanVisibleText(value) {
  return value
    .replace(/\bUn cours partenaire\s+DataCamp\s+autorisé\b/gi, "Un cours Neopolis Akademy")
    .replace(/\bAn authorized\s+DataCamp\s+partner course\b/gi, "A Neopolis Akademy course")
    .replace(/directement sur la plateforme de DataCamp/gi, "directement dans Neopolis Akademy")
    .replace(/directly on the DataCamp platform/gi, "directly in Neopolis Akademy")
    .replace(/Official course slides provided in the local DataCamp package\.?/gi, "Official course slides provided for this course.")
    .replace(/\b(cours|formation)\s+DataCamp\b/gi, "$1")
    .replace(/\bplateforme\s+(?:de\s+)?DataCamp\b/gi, "Neopolis Akademy")
    .replace(/\b(?:local\s+)?DataCamp\s+package\b/gi, "cette formation")
    .replace(/\bDataCamp\s*[·•:—–-]\s*/gi, "")
    .replace(/\bDataCamp\s+partner\b/gi, "Neopolis Akademy")
    .replace(/DataCamp/gi, "Neopolis Akademy");
}

function cleanValue(value, key = "") {
  if (typeof value === "string") {
    if (technicalKeyPattern.test(key)) return value;
    return cleanVisibleText(value);
  }
  if (Array.isArray(value)) return value.map((entry) => cleanValue(entry, key));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, cleanValue(childValue, childKey)]));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

const targets = [catalogPath, ...fs.readdirSync(coursesDirectory).filter((name) => name.endsWith(".json")).map((name) => path.join(coursesDirectory, name))];
let changedFiles = 0;
for (const filePath of targets) {
  const before = fs.readFileSync(filePath, "utf8");
  const after = `${JSON.stringify(cleanValue(JSON.parse(before)), null, 2)}\n`;
  if (before !== after) {
    fs.writeFileSync(filePath, after);
    changedFiles += 1;
  }
}

console.log(JSON.stringify({ changedFiles, targetCount: targets.length }, null, 2));
