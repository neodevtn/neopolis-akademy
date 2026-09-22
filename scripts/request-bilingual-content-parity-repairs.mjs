import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const courseDirectory = path.join(root, "client/public/data/courses");
const auditPath = path.join(root, "docs/bilingual-content-parity-audit.json");
const outputPath = path.join(root, "docs/bilingual-content-parity-repairs.json");
const courseFilter = process.argv.find((arg) => arg.startsWith("--course="))?.slice("--course=".length) || null;
const maxPerRequest = 8;
const concurrency = 2;

function getAtTrace(rootValue, trace) {
  return trace.split(".").reduce((value, part) => value?.[Number.isInteger(Number(part)) ? Number(part) : part], rootValue);
}

function compact(text) {
  return String(text).replace(/\s+/g, " ").trim();
}

function wordCount(text) {
  return compact(text).split(/\s+/).filter(Boolean).length;
}

const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
const findings = audit.findings.filter((finding) => !courseFilter || finding.courseId === courseFilter);
if (!findings.length) throw new Error(`No parity finding matches ${courseFilter || "the current audit"}.`);

const sourceByCourse = new Map();
for (const finding of findings) {
  if (!sourceByCourse.has(finding.courseId)) {
    const coursePath = path.join(courseDirectory, finding.file);
    sourceByCourse.set(finding.courseId, { file: finding.file, course: JSON.parse(fs.readFileSync(coursePath, "utf8")), candidates: [] });
  }
  const entry = sourceByCourse.get(finding.courseId);
  const localized = getAtTrace(entry.course, finding.trace);
  if (!localized || typeof localized.en !== "string" || typeof localized.fr !== "string") continue;
  const targetLanguage = wordCount(localized.en) < wordCount(localized.fr) ? "en" : "fr";
  const sourceLanguage = targetLanguage === "en" ? "fr" : "en";
  entry.candidates.push({
    courseId: finding.courseId,
    file: finding.file,
    trace: finding.trace,
    targetLanguage,
    sourceLanguage,
    sourceValue: localized[sourceLanguage],
    oldValue: localized[targetLanguage],
  });
}

const models = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, {
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` },
}).then((response) => response.json());
const model = models.data?.find((item) => item.id === "claude-sonnet-4-6")?.id;
if (!model) throw new Error("Claude Sonnet 4.6 is unavailable.");

const tasks = [];
for (const entry of sourceByCourse.values()) {
  for (let offset = 0; offset < entry.candidates.length; offset += maxPerRequest) {
    tasks.push({ courseId: entry.course.courseId, file: entry.file, candidates: entry.candidates.slice(offset, offset + maxPerRequest) });
  }
}

const schema = {
  type: "object",
  properties: {
    patches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          trace: { type: "string" },
          targetLanguage: { type: "string", enum: ["en", "fr"] },
          replacement: { type: "string" },
          reason: { type: "string" },
        },
        required: ["trace", "targetLanguage", "replacement", "reason"],
        additionalProperties: false,
      },
    },
    unresolved: { type: "array", items: { type: "string" } },
  },
  required: ["patches", "unresolved"],
  additionalProperties: false,
};

async function request(task) {
  const prompt = `You are a senior bilingual instructional editor. Repair language parity in one Neopolis Akademy course. Each candidate includes an authoritative longer learner-facing source and a clearly incomplete translation in the other language. Produce a faithful replacement only for the target language so it conveys the same instructional scope, structure, examples, cautions and learner actions as the source.

Preserve Markdown, headings, bullets, numbering, bold/italic emphasis, table syntax, placeholders, quoted text, and line breaks where meaningful. Do not invent any fact, activity, assessment answer, statistic, source, claim, recommendation or product capability. Never translate or alter technical identifiers, code, code blocks, URLs, file paths, model IDs, commands, literal error messages, API, JSON, HTTP, MCP, Claude, Anthropic, ChatGPT, GitHub, YouTube, Waze, Google Maps, Netflix, Spotify, or other product/brand names. Keep accepted English technical terms when a forced translation would be unnatural. Do not summarize or omit examples: parity means equivalent learner content, not an executive summary.

Return a patch only when the target is an actual translation of the source. If the two versions are materially different source materials rather than translations, return its trace in unresolved and no patch. Do not return explanations outside the JSON schema.

COURSE: ${task.courseId}
CANDIDATES:
${JSON.stringify(task.candidates)}`;
  const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 20000,
      thinking: { type: "enabled", budget_tokens: 2048 },
      response_format: { type: "json_schema", json_schema: { name: "bilingual_content_parity_repairs", strict: true, schema } },
      messages: [{ role: "user", content: prompt }],
    }),
  }).then((result) => result.json());
  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Claude Sonnet returned no parity repair for ${task.courseId}: ${JSON.stringify(response)}`);
  const result = JSON.parse(content.replace(/^```json\s*|\s*```$/g, ""));
  const candidates = new Map(task.candidates.map((candidate) => [`${candidate.trace}:${candidate.targetLanguage}`, candidate]));
  const patches = result.patches.map((patch) => {
    const candidate = candidates.get(`${patch.trace}:${patch.targetLanguage}`);
    if (!candidate) throw new Error(`Unexpected patch target ${patch.trace}:${patch.targetLanguage} for ${task.courseId}.`);
    if (!patch.replacement.trim()) throw new Error(`Empty replacement for ${task.courseId}:${patch.trace}.`);
    return { ...candidate, replacement: patch.replacement, reason: patch.reason };
  });
  return { courseId: task.courseId, file: task.file, patches, unresolved: result.unresolved };
}

const results = [];
for (let offset = 0; offset < tasks.length; offset += concurrency) {
  const batch = tasks.slice(offset, offset + concurrency);
  results.push(...await Promise.all(batch.map(request)));
  console.log(`Completed ${Math.min(offset + concurrency, tasks.length)}/${tasks.length} Claude Sonnet parity-review requests.`);
}

const report = {
  generatedAt: new Date().toISOString(),
  model,
  courseFilter,
  candidates: findings.length,
  patches: results.flatMap((result) => result.patches),
  unresolved: results.flatMap((result) => result.unresolved.map((reason) => ({ courseId: result.courseId, reason }))),
};
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Generated ${report.patches.length} validated patches and ${report.unresolved.length} unresolved items in ${path.relative(root, outputPath)}.`);
