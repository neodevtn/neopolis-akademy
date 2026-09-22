import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const courseDirectory = path.join(root, "client/public/data/courses");
const reportPath = path.join(root, "docs/bilingual-language-integrity-audit.json");
const targetCourseId = "intermediate_workflow_automation_with_n8n__01";
const chunkSize = 10;
const concurrency = 2;

function getParentAtTrace(rootValue, trace) {
  const parts = trace.split(".");
  const key = parts.pop();
  const parent = parts.reduce((value, part) => value?.[Number.isInteger(Number(part)) ? Number(part) : part], rootValue);
  if (!parent || !key) throw new Error(`Invalid trace: ${trace}`);
  return { parent, key };
}

function markdownSignature(text) {
  const value = String(text);
  return {
    headings: (value.match(/(?:^|\n)#{1,6}\s/g) || []).length,
    bullets: (value.match(/(?:^|\n)\s*(?:[-*•]|\d+\.)\s+/g) || []).length,
    bold: (value.match(/\*\*/g) || []).length,
    code: (value.match(/`/g) || []).length,
  };
}

function preservesStructure(source, target) {
  const from = markdownSignature(source);
  const to = markdownSignature(target);
  return Object.entries(from).every(([key, count]) => count === 0 || to[key] >= count);
}

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const reportCandidates = report.findings.filter((finding) => finding.courseId === targetCourseId && finding.targetLanguage === "en" && typeof finding.siblingValue === "string" && finding.siblingValue.trim());
if (!reportCandidates.length) throw new Error(`No French-in-English candidate is available for ${targetCourseId}.`);
const file = reportCandidates[0].file;
const coursePath = path.join(courseDirectory, file);
const initialCourse = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const candidates = reportCandidates.map((candidate) => {
  const { parent, key } = getParentAtTrace(initialCourse, candidate.trace);
  const sourceValue = parent.fr;
  const oldValue = parent[key];
  if (key !== "en" || typeof oldValue !== "string" || typeof sourceValue !== "string") throw new Error(`Expected bilingual English leaf at ${candidate.trace}.`);
  return { trace: candidate.trace, sourceValue, oldValue };
});

const models = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, { headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` } }).then((response) => response.json());
const model = models.data?.find((item) => item.id === "claude-sonnet-4-6")?.id;
if (!model) throw new Error("Claude Sonnet 4.6 is unavailable.");
const schema = {
  type: "object",
  properties: {
    patches: {
      type: "array",
      items: {
        type: "object",
        properties: { trace: { type: "string" }, replacement: { type: "string" } },
        required: ["trace", "replacement"],
        additionalProperties: false,
      },
    },
  },
  required: ["patches"],
  additionalProperties: false,
};

async function translate(chunk) {
  const prompt = `Translate the supplied French learner-facing n8n course fields into natural English. Every target field is currently French by mistake. Return exactly one replacement for every trace; do not omit or merge fields.

Preserve Markdown headings, bullet counts, emphasis, inline code, JSON, URLs, filenames, API names, n8n node names, variable names, literal errors and all technical identifiers. Never invent content, activities, corrections, requirements or outcomes; faithfully translate only the provided French source. Do not expose answers before an assessment attempt. Use English technical terms naturally, including n8n, Webhook Trigger, Respond to Webhook, Execute Sub-workflow, Data Table, Edit Fields, If, Manual Trigger, Stop and Error, HTTP Request, Schedule Trigger, Code, JSON and HTTP.

COURSE: ${targetCourseId}
FIELDS:
${JSON.stringify(chunk)}`;
  const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 14000, thinking: { type: "enabled", budget_tokens: 1536 }, response_format: { type: "json_schema", json_schema: { name: "n8n_english_localization", strict: true, schema } }, messages: [{ role: "user", content: prompt }] }),
  }).then((result) => result.json());
  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Claude Sonnet returned no n8n localization: ${JSON.stringify(response)}`);
  const result = JSON.parse(content.replace(/^```json\s*|\s*```$/g, ""));
  const sourceByTrace = new Map(chunk.map((item) => [item.trace, item]));
  if (result.patches.length !== chunk.length) throw new Error(`Expected ${chunk.length} patches; received ${result.patches.length}.`);
  return result.patches.map((patch) => {
    const source = sourceByTrace.get(patch.trace);
    if (!source || !patch.replacement?.trim()) throw new Error(`Unexpected or blank n8n localization patch: ${patch.trace}.`);
    if (!preservesStructure(source.sourceValue, patch.replacement)) throw new Error(`Markdown structure was lost at ${patch.trace}.`);
    return { ...source, replacement: patch.replacement };
  });
}

const chunks = Array.from({ length: Math.ceil(candidates.length / chunkSize) }, (_, index) => candidates.slice(index * chunkSize, (index + 1) * chunkSize));
const patches = [];
for (let offset = 0; offset < chunks.length; offset += concurrency) {
  const batch = chunks.slice(offset, offset + concurrency);
  patches.push(...(await Promise.all(batch.map(translate))).flat());
  console.log(`Completed ${Math.min(offset + concurrency, chunks.length)}/${chunks.length} n8n localization batches.`);
}

const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
for (const patch of patches) {
  const { parent, key } = getParentAtTrace(course, patch.trace);
  if (parent[key] !== patch.oldValue || parent.fr !== patch.sourceValue) throw new Error(`Source drift while applying ${patch.trace}.`);
  parent[key] = patch.replacement;
}
fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
console.log(`Applied ${patches.length} Claude Sonnet English localizations to ${targetCourseId}.`);
