import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const apply = process.argv.includes("--apply");
const root = process.cwd();
const review = JSON.parse(await readFile(resolve(root, "docs/architect-foundations-localization-claude-review.json"), "utf8"));
const corrections = new Map();
for (const decision of review.decisions || []) {
  if (decision.verdict !== "corriger" || !decision.term || !decision.replacement) continue;
  const previous = corrections.get(decision.term);
  if (previous && previous !== decision.replacement) throw new Error(`Conflicting replacement for ${decision.term}`);
  corrections.set(decision.term, decision.replacement);
}
const courseIds = [...new Set((review.decisions || []).filter((decision) => decision.verdict === "corriger").map((decision) => decision.courseId))];

function replaceFrench(value, counts) {
  if (Array.isArray(value)) return value.map((entry) => replaceFrench(entry, counts));
  if (!value || typeof value !== "object") return value;
  const next = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key === "fr" && typeof entry === "string") {
      let updated = entry;
      for (const [term, replacement] of corrections) {
        const occurrences = updated.split(term).length - 1;
        if (occurrences > 0) {
          counts[term] = (counts[term] || 0) + occurrences;
          updated = updated.replaceAll(term, replacement);
        }
      }
      next[key] = updated;
    } else next[key] = replaceFrench(entry, counts);
  }
  return next;
}

const result = [];
for (const courseId of courseIds) {
  const coursePath = resolve(root, `client/public/data/courses/${courseId}.json`);
  const course = JSON.parse(await readFile(coursePath, "utf8"));
  const counts = {};
  const updated = replaceFrench(course, counts);
  result.push({ courseId, replacements: counts, total: Object.values(counts).reduce((sum, count) => sum + count, 0) });
  if (apply) await writeFile(coursePath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
}
console.table(result.map((item) => ({ course: item.courseId.slice(-2), replacements: item.total, details: JSON.stringify(item.replacements) })));
if (!apply) console.log("Dry run only. Add --apply to write the confirmed replacements.");
