import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const docsDir = path.join(root, "docs");
const courseDir = path.join(root, "client/public/data/courses");
const dryRun = process.argv.includes("--dry-run");
const audit = JSON.parse(await fs.readFile(path.join(docsDir, "anthropic-localization-remainders.json"), "utf8"));
const reviewFiles = (await fs.readdir(docsDir)).filter((file) => /^anthropic-localization-remainder-review-\d+\.json$/.test(file)).sort();
const approved = [];
for (const file of reviewFiles) {
  const review = JSON.parse(await fs.readFile(path.join(docsDir, file), "utf8"));
  for (const decision of review.decisions || []) {
    if (decision.verdict !== "corriger") continue;
    const candidate = audit.candidates[decision.index];
    if (!candidate) throw new Error(`Unknown candidate index ${decision.index}.`);
    for (const replacement of decision.replacements || []) approved.push({ index: decision.index, courseId: candidate.courseId, pointer: candidate.pointer, ...replacement });
  }
}
if (!approved.length) throw new Error("No Claude Sonnet-approved localization replacement was found.");

function resolvePointer(rootValue, pointer) {
  const tokens = pointer.split("/").filter(Boolean).map((token) => token.replaceAll("~1", "/").replaceAll("~0", "~"));
  return tokens.reduce((current, token) => current?.[Number.isInteger(Number(token)) && String(Number(token)) === token ? Number(token) : token], rootValue);
}

const courses = new Map();
for (const item of approved) {
  if (!courses.has(item.courseId)) {
    const filePath = path.join(courseDir, `${item.courseId}.json`);
    courses.set(item.courseId, { filePath, data: JSON.parse(await fs.readFile(filePath, "utf8")), changes: [] });
  }
}

for (const item of approved) {
  const course = courses.get(item.courseId);
  const text = resolvePointer(course.data, item.pointer);
  if (typeof text !== "string" || !text.includes(item.source)) throw new Error(`The approved source literal is not present at ${item.courseId}${item.pointer}.`);
  const next = text.replaceAll(item.source, item.replacement);
  if (next === text) throw new Error(`No replacement applied at ${item.courseId}${item.pointer}.`);
  const tokens = item.pointer.split("/").filter(Boolean);
  const property = tokens.pop();
  const owner = resolvePointer(course.data, `/${tokens.join("/")}`);
  owner[property] = next;
  course.changes.push({ pointer: item.pointer, source: item.source, replacement: item.replacement });
}

if (!dryRun) for (const { filePath, data } of courses.values()) await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
const report = { generatedAt: new Date().toISOString(), model: "claude-sonnet-4-6", dryRun, appliedCount: approved.length, courses: Object.fromEntries([...courses.entries()].map(([courseId, course]) => [courseId, course.changes])) };
await fs.writeFile(path.join(docsDir, "anthropic-localization-remainder-application.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
