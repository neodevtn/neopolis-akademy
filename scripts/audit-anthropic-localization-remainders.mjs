import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const courseDir = path.join(root, "client/public/data/courses");
const outPath = path.join(root, "docs/anthropic-localization-remainders.json");
const terms = ["best practices", "key takeaways", "human-in-the-loop", "guardrail", "rollout plan", "model card"];
const matcher = new RegExp(`\\b(${terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi");

function extractFrench(value, pointer, courseId, candidates) {
  if (typeof value === "string") {
    const matches = [...value.matchAll(matcher)];
    if (matches.length) candidates.push({ courseId, pointer, terms: [...new Set(matches.map((match) => match[0].toLowerCase()))], text: value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => extractFrench(item, `${pointer}/${index}`, courseId, candidates));
    return;
  }
  if (value && typeof value === "object") {
    if (typeof value.fr === "string") extractFrench(value.fr, `${pointer}/fr`, courseId, candidates);
    for (const [key, item] of Object.entries(value)) if (key !== "fr") extractFrench(item, `${pointer}/${key}`, courseId, candidates);
  }
}

const files = (await fs.readdir(courseDir)).filter((file) => /^claude_certified_.*\.json$/.test(file)).sort();
const candidates = [];
for (const file of files) {
  const course = JSON.parse(await fs.readFile(path.join(courseDir, file), "utf8"));
  extractFrench(course, "", course.courseId || file.replace(/\.json$/, ""), candidates);
}

const output = {
  generatedAt: new Date().toISOString(),
  terms,
  courseCount: files.length,
  candidateCount: candidates.length,
  byCourse: Object.fromEntries(files.map((file) => {
    const courseId = file.replace(/\.json$/, "");
    return [courseId, candidates.filter((candidate) => candidate.courseId === courseId).length];
  }).filter(([, count]) => count > 0)),
  candidates,
};
await fs.writeFile(outPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ courseCount: output.courseCount, candidateCount: output.candidateCount, byCourse: output.byCourse }, null, 2));
