import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const coursesDirectory = resolve(process.cwd(), "client/public/data/courses");
const args = process.argv.slice(2);
const needle = args[0] === "--extract" ? "" : args.join(" ").trim();
const files = (await readdir(coursesDirectory))
  .filter((file) => /^claude_certified_(architect_(foundations|professional)|associate_foundations|developer_foundations)__\d+\.json$/.test(file))
  .sort();

if (args[0] === "--extract") {
  const [file, rawPath] = args.slice(1);
  if (!files.includes(file) || !rawPath) throw new Error("Usage: --extract <cours.json> <chemin.json>");
  const payload = JSON.parse(await readFile(resolve(coursesDirectory, file), "utf8"));
  const tokens = rawPath.replace(/^\$\./, "").match(/[^.\[\]]+/g) || [];
  const target = tokens.reduce((current, token) => current?.[Number.isNaN(Number(token)) ? token : Number(token)], payload);
  console.log(JSON.stringify({ file, path: rawPath, target }, null, 2));
  process.exit(0);
}

const ignoredScalarFields = new Set(["id", "type", "slug", "url", "sourceUrl", "videoUrl", "mediaUrl", "assetUrl", "imageUrl", "fileUrl", "createdAt", "updatedAt"]);

function normalize(value) {
  return String(value)
    .replace(/<[^>]+>/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function titleOf(node) {
  if (!node || typeof node !== "object") return null;
  for (const key of ["title", "heading", "label", "name"]) {
    if (typeof node[key] === "string" && node[key].trim()) return node[key].trim().slice(0, 140);
  }
  return null;
}

function collectText(value, path = "$", contextTitle = null, found = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectText(entry, `${path}[${index}]`, contextTitle, found));
    return found;
  }
  if (!value || typeof value !== "object") return found;
  const nextTitle = titleOf(value) || contextTitle;
  for (const [key, entry] of Object.entries(value)) {
    const entryPath = `${path}.${key}`;
    if (typeof entry === "string" && !ignoredScalarFields.has(key)) {
      const compact = normalize(entry);
      if (compact.length >= 120 && !/^https? /.test(compact)) {
        found.push({ path: entryPath, title: nextTitle, rawLength: entry.length, normalized: compact, raw: entry });
      }
      continue;
    }
    if (entry && typeof entry === "object") collectText(entry, entryPath, nextTitle, found);
  }
  return found;
}

function tokenSet(text) {
  return new Set(text.split(" ").filter((token) => token.length > 3));
}

function similarity(a, b) {
  const aTokens = tokenSet(a);
  const bTokens = tokenSet(b);
  const shared = [...aTokens].filter((token) => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  return union ? shared / union : 0;
}

const report = [];
for (const file of files) {
  const payload = JSON.parse(await readFile(resolve(coursesDirectory, file), "utf8"));
  const entries = collectText(payload);
  if (needle) {
    const normalizedNeedle = normalize(needle);
    const matches = entries
      .filter((entry) => entry.normalized.includes(normalizedNeedle))
      .map(({ path, title, raw }) => ({ path, title, preview: raw.slice(0, 360) }));
    if (matches.length) report.push({ file, matches });
    continue;
  }
  const exact = new Map();
  for (const entry of entries) {
    const group = exact.get(entry.normalized) || [];
    group.push(entry);
    exact.set(entry.normalized, group);
  }
  const exactDuplicates = [...exact.values()]
    .filter((group) => group.length > 1)
    .map((group) => ({
      paths: group.map(({ path, title }) => ({ path, title })),
      length: group[0].rawLength,
      preview: group[0].normalized.slice(0, 180),
    }));

  const nearDuplicates = [];
  for (let left = 0; left < entries.length; left += 1) {
    for (let right = left + 1; right < entries.length; right += 1) {
      if (entries[left].normalized === entries[right].normalized) continue;
      const ratio = similarity(entries[left].normalized, entries[right].normalized);
      if (ratio >= 0.9) {
        nearDuplicates.push({
          ratio: Number(ratio.toFixed(3)),
          left: { path: entries[left].path, title: entries[left].title },
          right: { path: entries[right].path, title: entries[right].title },
          preview: entries[left].normalized.slice(0, 180),
        });
      }
    }
  }

  report.push({ file, textBlocks: entries.length, exactDuplicates, nearDuplicates });
}

console.log(JSON.stringify(needle
  ? { filesAudited: files.length, needle, matches: report }
  : (() => {
      const affected = report.filter((entry) => entry.exactDuplicates.length || entry.nearDuplicates.length);
      return { filesAudited: files.length, affectedCourses: affected.length, report: affected };
    })(), null, 2));
