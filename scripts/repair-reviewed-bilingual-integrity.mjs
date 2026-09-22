import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const courseDirectory = path.join(root, "client/public/data/courses");
const tasks = [
  {
    courseId: "transformation_processus_ia__03",
    file: "transformation_processus_ia__03.json",
    trace: "exercises.1.title",
    targetLanguage: "en",
    sourceLanguage: "fr",
    issue: "The English title is visibly ellipsized and must become a complete, concise faithful translation of the French title. Keep the same exercise scope; do not add requirements.",
  },
  {
    courseId: "claude_certified_associate_foundations__05",
    file: "claude_certified_associate_foundations__05.json",
    trace: "lessons.0.chapters.1.blocks.0.body",
    targetLanguage: "fr",
    sourceLanguage: "en",
    issue: "The existing French translation is semantically close but lost Markdown structure from the English source. Replace it with a faithful French translation preserving every heading, bullet/list item, bold emphasis, inline code and learner-facing scope. Do not translate product names or technical identifiers.",
  },
];

function atTrace(rootValue, trace) {
  return trace.split(".").reduce((value, part) => value?.[Number.isInteger(Number(part)) ? Number(part) : part], rootValue);
}
function parentAtTrace(rootValue, trace) {
  const parts = trace.split(".");
  const key = parts.pop();
  return { parent: parts.reduce((value, part) => value?.[Number.isInteger(Number(part)) ? Number(part) : part], rootValue), key };
}
function signature(text) {
  const value = String(text);
  return {
    headings: (value.match(/(?:^|\n)#{1,6}\s/g) || []).length,
    bullets: (value.match(/(?:^|\n)\s*(?:[-*•]|\d+\.)\s+/g) || []).length,
    bold: (value.match(/\*\*/g) || []).length,
    code: (value.match(/`/g) || []).length,
  };
}
function preservesStructure(source, target) {
  const from = signature(source);
  const to = signature(target);
  return Object.entries(from).every(([key, count]) => count === 0 || to[key] >= count);
}

const contexts = tasks.map((task) => {
  const course = JSON.parse(fs.readFileSync(path.join(courseDirectory, task.file), "utf8"));
  const localized = atTrace(course, task.trace);
  if (!localized || typeof localized[task.sourceLanguage] !== "string" || typeof localized[task.targetLanguage] !== "string") throw new Error(`Invalid bilingual task ${task.courseId}:${task.trace}.`);
  return { ...task, sourceValue: localized[task.sourceLanguage], oldValue: localized[task.targetLanguage] };
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
        properties: { courseId: { type: "string" }, trace: { type: "string" }, targetLanguage: { type: "string", enum: ["en", "fr"] }, replacement: { type: "string" } },
        required: ["courseId", "trace", "targetLanguage", "replacement"],
        additionalProperties: false,
      },
    },
  },
  required: ["patches"],
  additionalProperties: false,
};
const prompt = `You are a senior bilingual instructional editor. Apply exactly the listed repairs. Preserve every fact, activity, learning action, technical identifier, product name, code token, URL, filename, API name and Markdown structural token from the source. Do not invent anything or expose assessment answers. Return one nonempty patch for every task.\n\nTASKS:\n${JSON.stringify(contexts)}`;
const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model, max_tokens: 16000, thinking: { type: "enabled", budget_tokens: 2048 }, response_format: { type: "json_schema", json_schema: { name: "reviewed_bilingual_integrity_repairs", strict: true, schema } }, messages: [{ role: "user", content: prompt }] }),
}).then((result) => result.json());
const content = response.choices?.[0]?.message?.content;
if (!content) throw new Error(`Claude Sonnet returned no reviewed repair: ${JSON.stringify(response)}`);
const result = JSON.parse(content.replace(/^```json\s*|\s*```$/g, ""));
if (result.patches.length !== contexts.length) throw new Error(`Expected ${contexts.length} reviewed repairs; received ${result.patches.length}.`);
for (const patch of result.patches) {
  const task = contexts.find((item) => item.courseId === patch.courseId && item.trace === patch.trace && item.targetLanguage === patch.targetLanguage);
  if (!task || !patch.replacement?.trim()) throw new Error(`Unexpected reviewed repair ${patch.courseId}:${patch.trace}.`);
  if (!preservesStructure(task.sourceValue, patch.replacement)) throw new Error(`Markdown structure lost at ${task.courseId}:${task.trace}.`);
  const coursePath = path.join(courseDirectory, task.file);
  const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
  const { parent, key } = parentAtTrace(course, task.trace);
  if (parent?.[key]?.[task.targetLanguage] !== task.oldValue || parent[key][task.sourceLanguage] !== task.sourceValue) throw new Error(`Source drift at ${task.courseId}:${task.trace}.`);
  parent[key][task.targetLanguage] = patch.replacement;
  fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
}
console.log(`Applied ${result.patches.length} reviewed Claude Sonnet bilingual integrity repairs.`);
