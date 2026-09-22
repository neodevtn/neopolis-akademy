import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const courseDirectory = path.join(root, "client/public/data/courses");

function getAtTrace(rootValue, trace) {
  return trace.split(".").reduce((value, part) => value?.[Number.isInteger(Number(part)) ? Number(part) : part], rootValue);
}

function getParentAtTrace(rootValue, trace) {
  const parts = trace.split(".");
  const key = parts.pop();
  return { parent: parts.reduce((value, part) => value?.[Number.isInteger(Number(part)) ? Number(part) : part], rootValue), key };
}

const candidates = [
  {
    courseId: "claude_certified_developer_foundations__02",
    file: "claude_certified_developer_foundations__02.json",
    trace: "lessons.0.chapters.4.blocks.0.body",
    targetLanguage: "fr",
    issue: "The French field interleaves the English original and French translation, duplicating almost every paragraph. Return a French-only learner-facing version with one rendering of each section, preserving the complete meaning and Markdown structure of the English source.",
  },
  {
    courseId: "transformation_processus_ia__03",
    file: "transformation_processus_ia__03.json",
    trace: "exercises.1.title",
    targetLanguage: "fr",
    issue: "The French title is an unrelated fallback message about incomplete text. Replace it with a faithful concise French exercise title that matches the supplied English title and prompt, without adding requirements.",
    contextTrace: "exercises.1.prompt",
  },
];

const models = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, { headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` } }).then((response) => response.json());
const model = models.data?.find((item) => item.id === "claude-sonnet-4-6")?.id;
if (!model) throw new Error("Claude Sonnet 4.6 is unavailable.");

const tasks = candidates.map((candidate) => {
  const course = JSON.parse(fs.readFileSync(path.join(courseDirectory, candidate.file), "utf8"));
  const localized = getAtTrace(course, candidate.trace);
  if (!localized || typeof localized.en !== "string" || typeof localized.fr !== "string") throw new Error(`Expected bilingual value at ${candidate.trace}.`);
  const context = candidate.contextTrace ? getAtTrace(course, candidate.contextTrace) : null;
  return { ...candidate, oldValue: localized[candidate.targetLanguage], englishSource: localized.en, frenchCurrent: localized.fr, context };
});

const schema = {
  type: "object",
  properties: {
    patches: {
      type: "array",
      items: {
        type: "object",
        properties: { courseId: { type: "string" }, trace: { type: "string" }, targetLanguage: { type: "string", enum: ["fr"] }, replacement: { type: "string" }, reason: { type: "string" } },
        required: ["courseId", "trace", "targetLanguage", "replacement", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["patches"],
  additionalProperties: false,
};

const prompt = `You are a senior bilingual instructional editor. Repair exactly the listed French learner-facing fields. Return JSON only. Preserve all Markdown, code tokens, technical identifiers, product names, URLs, file paths, API, JSON, HTTP, MCP, Claude, Anthropic, and literal errors. Do not invent facts, requirements, activities, examples or assessment answers. Do not summarize: retain the source's complete teaching scope.\n\nTASKS:\n${JSON.stringify(tasks)}`;
const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model, max_tokens: 12000, thinking: { type: "enabled", budget_tokens: 1536 }, response_format: { type: "json_schema", json_schema: { name: "residual_bilingual_content_repair", strict: true, schema } }, messages: [{ role: "user", content: prompt }] }),
}).then((result) => result.json());
const content = response.choices?.[0]?.message?.content;
if (!content) throw new Error(`Claude Sonnet returned no residual repair: ${JSON.stringify(response)}`);
const result = JSON.parse(content.replace(/^```json\s*|\s*```$/g, ""));
if (result.patches.length !== tasks.length) throw new Error(`Expected ${tasks.length} residual repairs; received ${result.patches.length}.`);

for (const patch of result.patches) {
  const task = tasks.find((item) => item.courseId === patch.courseId && item.trace === patch.trace && item.targetLanguage === patch.targetLanguage);
  if (!task || !patch.replacement.trim()) throw new Error(`Unexpected residual patch ${patch.courseId}:${patch.trace}.`);
  const coursePath = path.join(courseDirectory, task.file);
  const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
  const { parent, key } = getParentAtTrace(course, task.trace);
  if (parent?.[key]?.[task.targetLanguage] !== task.oldValue) throw new Error(`Source drift at ${task.courseId}:${task.trace}.`);
  parent[key][task.targetLanguage] = patch.replacement;
  fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
}
console.log(`Applied ${result.patches.length} residual Claude Sonnet bilingual repairs.`);
