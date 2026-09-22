import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const courseDirectory = path.join(root, "client/public/data/courses");
const reportPath = path.join(root, "docs/bilingual-markdown-structure-audit.json");
const cachePath = "/tmp/neopolis-bilingual-markdown-structure-cache.json";
const concurrency = 6;

function signature(text) {
  const value = String(text).replace(/\\`/g, "`");
  const prose = value.replace(/```[\s\S]*?```/g, "");
  const inlineCodePairs = [...prose.matchAll(/`([^`\n]{1,80})`/g)].filter((match) => !/(?:\.\.\.|…)/u.test(match[1])).length;
  return {
    headings: (prose.match(/(?:^|\n)#{1,6}\s/g) || []).length,
    bullets: (prose.match(/(?:^|\n)\s*(?:[-*•]|\d+\.)\s+/g) || []).length,
    boldPairs: Math.floor((prose.match(/\*\*/g) || []).length / 2),
    inlineCodePairs,
    codeFences: (value.match(/```/g) || []).length / 2,
    tableRows: (prose.match(/(?:^|\n)\|.*\|/g) || []).length,
  };
}
function score(signatureValue) {
  return Object.values(signatureValue).reduce((total, value) => total + value, 0);
}
function coversStructure(source, target) {
  const from = signature(source);
  const to = signature(target);
  return Object.entries(from).every(([key, count]) => to[key] >= count);
}
function parentAtTrace(rootValue, trace) {
  const parts = trace.split(".");
  const key = parts.pop();
  const parent = parts.reduce((value, part) => value?.[Number.isInteger(Number(part)) ? Number(part) : part], rootValue);
  if (!parent || !key) throw new Error(`Invalid trace: ${trace}`);
  return { parent, key };
}

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const courses = new Map();
const candidates = report.findings.map((finding, index) => {
  if (!courses.has(finding.file)) courses.set(finding.file, JSON.parse(fs.readFileSync(path.join(courseDirectory, finding.file), "utf8")));
  const { parent, key } = parentAtTrace(courses.get(finding.file), finding.trace);
  const en = parent[key].en;
  const fr = parent[key].fr;
  const sourceLanguage = score(signature(en)) >= score(signature(fr)) ? "en" : "fr";
  const targetLanguage = sourceLanguage === "en" ? "fr" : "en";
  const sourceValue = parent[key][sourceLanguage];
  const oldValue = parent[key][targetLanguage];
  return { id: `structure-${index}`, file: finding.file, trace: finding.trace, sourceLanguage, targetLanguage, sourceValue, oldValue };
});
if (!candidates.length) {
  console.log("No Markdown parity repairs are needed.");
  process.exit(0);
}

const models = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, { headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` } }).then((response) => response.json());
if (!models.data?.some((item) => item.id === "claude-sonnet-4-6")) throw new Error("Claude Sonnet 4.6 is unavailable.");
const schema = { type: "object", properties: { replacement: { type: "string" } }, required: ["replacement"], additionalProperties: false };
const cached = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};

async function repair(candidate) {
  if (cached[candidate.id]) return { ...candidate, replacement: cached[candidate.id] };
  const expected = signature(candidate.sourceValue);
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const prompt = `Translate the source learner-facing course field into the target language, preserving exactly its structure. This repair exists because the current target loses headings, bullet/list items, bold emphasis, inline code, code fences or table rows.

Preserve all Markdown tokens and structure, code, JSON, URLs, filenames, product names, APIs, commands, node names, identifiers, literal errors, factual scope and learning actions. Do not invent or remove content; do not expose assessment answers. Keep code comments and executable code unchanged. Return only the full replacement target text.

The validated source structure is ${JSON.stringify(expected)}. The replacement must include at least these counts; do not collapse a list into prose or remove emphasis. This is retry ${attempt} of 3.

SOURCE LANGUAGE: ${candidate.sourceLanguage}
TARGET LANGUAGE: ${candidate.targetLanguage}
SOURCE:\n${candidate.sourceValue}\n\nCURRENT TARGET (reference only; do not copy its missing structure):\n${candidate.oldValue}`;
    const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 20000, thinking: { type: "enabled", budget_tokens: 1024 }, response_format: { type: "json_schema", json_schema: { name: "bilingual_markdown_structure_repair", strict: true, schema } }, messages: [{ role: "user", content: prompt }] }),
    }).then((result) => result.json());
    const replacement = JSON.parse(response.choices?.[0]?.message?.content || "{}").replacement;
    if (typeof replacement === "string" && replacement.trim() && coversStructure(candidate.sourceValue, replacement)) {
      cached[candidate.id] = replacement;
      fs.writeFileSync(cachePath, `${JSON.stringify(cached)}\n`);
      return { ...candidate, replacement };
    }
  }
  console.warn(`Skipped unresolved Markdown parity field after three validated retries: ${candidate.file}:${candidate.trace}.`);
  return null;
}

const repaired = [];
for (let offset = 0; offset < candidates.length; offset += concurrency) {
  repaired.push(...await Promise.all(candidates.slice(offset, offset + concurrency).map(repair)));
  console.log(`Completed ${Math.min(offset + concurrency, candidates.length)}/${candidates.length} Markdown parity repairs.`);
}
const successfulRepairs = repaired.filter(Boolean);
for (const candidate of successfulRepairs) {
  const course = courses.get(candidate.file);
  const { parent, key } = parentAtTrace(course, candidate.trace);
  if (parent[key][candidate.targetLanguage] !== candidate.oldValue || parent[key][candidate.sourceLanguage] !== candidate.sourceValue) throw new Error(`Source drift at ${candidate.file}:${candidate.trace}.`);
  parent[key][candidate.targetLanguage] = candidate.replacement;
}
for (const [file, course] of courses) fs.writeFileSync(path.join(courseDirectory, file), `${JSON.stringify(course, null, 2)}\n`);
fs.rmSync(cachePath, { force: true });
console.log(`Applied ${successfulRepairs.length} Claude Sonnet Markdown-structure repairs across ${courses.size} course files; ${repaired.length - successfulRepairs.length} fields remain for targeted review.`);
