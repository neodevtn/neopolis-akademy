import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const courseDirectory = path.join(root, "client/public/data/courses");
const repairsPath = path.join(root, "docs/bilingual-content-parity-repairs.json");
const dryRun = process.argv.includes("--dry-run");

function getParentAtTrace(rootValue, trace) {
  const parts = trace.split(".");
  const key = parts.pop();
  const parent = parts.reduce((value, part) => value?.[Number.isInteger(Number(part)) ? Number(part) : part], rootValue);
  if (!parent || !key) throw new Error(`Invalid trace ${trace}.`);
  return { parent, key };
}

function compact(text) {
  return String(text).replace(/\s+/g, " ").trim();
}

function wordCount(text) {
  return compact(text).split(/\s+/).filter(Boolean).length;
}

function hasMarkdownStructure(text) {
  return /(?:^|\n)#{1,6}\s|\*\*|`|^\s*(?:[-*•]|\d+\.)\s/m.test(String(text));
}

const repairs = JSON.parse(fs.readFileSync(repairsPath, "utf8"));
const patchesByFile = new Map();
for (const patch of repairs.patches || []) {
  if (!patch.file || !patch.trace || !["en", "fr"].includes(patch.targetLanguage)) throw new Error("Repair patch has an invalid shape.");
  if (!patch.replacement?.trim()) throw new Error(`Repair patch is empty for ${patch.file}:${patch.trace}.`);
  if (!patchesByFile.has(patch.file)) patchesByFile.set(patch.file, []);
  patchesByFile.get(patch.file).push(patch);
}

const results = [];
for (const [file, patches] of patchesByFile) {
  const coursePath = path.join(courseDirectory, file);
  const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
  for (const patch of patches) {
    const { parent, key } = getParentAtTrace(course, patch.trace);
    const localized = parent[key];
    if (!localized || typeof localized[patch.targetLanguage] !== "string") throw new Error(`Target is not bilingual at ${file}:${patch.trace}.`);
    if (localized[patch.targetLanguage] !== patch.oldValue) throw new Error(`Source drift at ${file}:${patch.trace}; refusing to overwrite an edited translation.`);
    if (localized[patch.sourceLanguage] !== patch.sourceValue) throw new Error(`Authoritative-source drift at ${file}:${patch.trace}; refusing to apply.`);
    if (wordCount(patch.replacement) < Math.max(5, Math.floor(wordCount(patch.sourceValue) * 0.45))) {
      throw new Error(`Replacement remains too abbreviated at ${file}:${patch.trace}.`);
    }
    if (hasMarkdownStructure(patch.sourceValue) && !hasMarkdownStructure(patch.replacement)) {
      throw new Error(`Replacement lost visible Markdown structure at ${file}:${patch.trace}.`);
    }
    localized[patch.targetLanguage] = patch.replacement;
    results.push({ file, courseId: patch.courseId, trace: patch.trace, language: patch.targetLanguage });
  }
  if (!dryRun) fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
}

console.log(JSON.stringify({ dryRun, files: patchesByFile.size, applied: results.length, results }, null, 2));
