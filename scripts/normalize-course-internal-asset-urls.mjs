#!/usr/bin/env node
/**
 * Remplace les liens directs /manus-storage/ par le proxy stable /api/assets/
 * dans le contenu pédagogique. Les fichiers ne sont ni recréés ni déplacés :
 * seul le chemin de présentation est normalisé pour éviter les redirections
 * signées et préserver les téléchargements côté apprenant.
 *
 * Usage:
 *   node scripts/normalize-course-internal-asset-urls.mjs
 *   node scripts/normalize-course-internal-asset-urls.mjs --check
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const coursesDir = path.join(root, "client/public/data/courses");
const manifestPath = path.join(root, "pedagogical-audit/internal-asset-url-migration.json");
const checkOnly = process.argv.includes("--check");
const sourcePrefix = "/manus-storage/";
const targetPrefix = "/api/assets/";

function normalize(value, trail, changes) {
  if (typeof value === "string") {
    if (!value.includes(sourcePrefix)) return value;
    const normalized = value.replaceAll(sourcePrefix, targetPrefix);
    changes.push({ path: trail, replacements: value.split(sourcePrefix).length - 1 });
    return normalized;
  }
  if (Array.isArray(value)) return value.map((item, index) => normalize(item, `${trail}[${index}]`, changes));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalize(item, `${trail}.${key}`, changes)]));
  }
  return value;
}

const migratedFiles = [];
let totalReplacements = 0;
for (const filename of fs.readdirSync(coursesDir).filter((name) => name.endsWith(".json")).sort()) {
  const filePath = path.join(coursesDir, filename);
  const source = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const changes = [];
  const normalized = normalize(source, "$", changes);
  if (!changes.length) continue;
  const replacements = changes.reduce((sum, item) => sum + item.replacements, 0);
  totalReplacements += replacements;
  migratedFiles.push({ file: filename, courseId: source.courseId || filename.replace(/\.json$/, ""), replacements, paths: changes.map((item) => item.path) });
  if (!checkOnly) fs.writeFileSync(filePath, `${JSON.stringify(normalized, null, 2)}\n`);
}

const manifest = {
  generatedAt: new Date().toISOString(),
  policy: "Learner-facing course resources must use /api/assets/ rather than direct /manus-storage/ paths.",
  checkOnly,
  courseFilesChanged: migratedFiles.length,
  totalReplacements,
  migratedFiles,
};
if (!checkOnly) fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ checkOnly, courseFilesChanged: migratedFiles.length, totalReplacements, manifest: path.relative(root, manifestPath) }, null, 2));
