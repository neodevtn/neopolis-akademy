import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "client/src/data/trainingIndex.json");
const coursesDirectory = path.join(root, "client/public/data/courses");
const refIndex = process.argv.indexOf("--ref");
const ref = refIndex >= 0 ? process.argv[refIndex + 1] : "";
const outputIndex = process.argv.indexOf("--output");
const reportPath = path.join(root, outputIndex >= 0 ? process.argv[outputIndex + 1] : "docs/visible-datacamp-mentions-audit.json");
const technicalKeyPattern = /^(id|certId|courseId|lessonId|chapterId|blockId|sourceUrl|url|href|path|fileName|filename|assetId|mediaId|provider|partner|origin|catalog|repository|rubricVersion|schemaVersion|internal[A-Z]|external[A-Z])/i;

function readJson(relativePath) {
  const raw = ref
    ? execFileSync("git", ["show", `${ref}:${relativePath}`], { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
    : fs.readFileSync(path.join(root, relativePath), "utf8");
  return JSON.parse(raw);
}

function listCourseFiles() {
  if (!ref) return fs.readdirSync(coursesDirectory).filter((name) => name.endsWith(".json")).map((name) => `client/public/data/courses/${name}`);
  return execFileSync("git", ["ls-tree", "-r", "--name-only", ref, "--", "client/public/data/courses"], { cwd: root, encoding: "utf8" })
    .split("\n")
    .filter((name) => name.endsWith(".json"));
}

function localizedText(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return Object.values(value).filter((entry) => typeof entry === "string").join(" ");
  return "";
}

function collectVisibleMentions(value, file, pointer = "", key = "") {
  if (pointer === "datacampImport" || pointer.startsWith("datacampImport.")) return [];
  if (typeof value === "string") {
    return /datacamp/i.test(value) && !technicalKeyPattern.test(key)
      ? [{ file, pointer, key, value }]
      : [];
  }
  if (Array.isArray(value)) return value.flatMap((entry, index) => collectVisibleMentions(entry, file, `${pointer}[${index}]`, key));
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([childKey, childValue]) => collectVisibleMentions(childValue, file, pointer ? `${pointer}.${childKey}` : childKey, childKey));
}

const catalog = readJson("client/src/data/trainingIndex.json");
const catalogMentions = collectVisibleMentions(catalog, "client/src/data/trainingIndex.json");
const courseMentions = listCourseFiles()
  .flatMap((relativePath) => collectVisibleMentions(readJson(relativePath), relativePath));
const mentionedCourseIds = [...new Set(courseMentions.map((entry) => path.basename(entry.file, ".json")))].sort();
const report = {
  generatedAt: new Date().toISOString(),
  sourceRevision: ref || "working-tree",
  catalogMentionCount: catalogMentions.length,
  courseMentionCount: courseMentions.length,
  mentionedCourseIds,
  catalogMentions,
  courseMentions,
  complete: catalogMentions.length === 0 && courseMentions.length === 0,
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  catalogMentionCount: report.catalogMentionCount,
  courseMentionCount: report.courseMentionCount,
  mentionedCourseIds: report.mentionedCourseIds,
  complete: report.complete,
}, null, 2));
if (!report.complete) process.exitCode = 1;
