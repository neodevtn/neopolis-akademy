import fs from "node:fs";
import path from "node:path";
import { invokeLLM } from "../server/_core/llm";

const root = path.resolve(import.meta.dirname, "..");
const coursePath = path.join(root, "client", "public", "data", "courses", "ai_for_marketing__01.json");
const outputPath = path.join(root, ".work", "datacamp-audit-2026-09-17", "ai-marketing-practical-guides.json");
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const localized = (value: unknown) => typeof value === "string" ? value : (value && typeof value === "object" ? ((value as Record<string, unknown>).fr || (value as Record<string, unknown>).en || "") : "");
const practices = course.lessons.flatMap((lesson: any) => lesson.chapters ?? []).flatMap((chapter: any) => chapter.blocks ?? [])
  .filter((block: any) => block.type === "cloud_exercise")
  .map((block: any) => ({ id: block.id, title: localized(block.title), assignment: localized(block.assignment), hint: localized(block.hint), existingResources: (block.resources ?? []).map((resource: any) => ({ title: localized(resource.title), url: resource.url })) }));

const schema = {
  type: "object",
  properties: {
    guides: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          objectiveFr: { type: "string" },
          setupFr: { type: "string" },
          stepsFr: { type: "array", items: { type: "string" } },
          expectedEvidenceFr: { type: "array", items: { type: "string" } },
          recoveryFr: { type: "string" },
          hintFr: { type: "string" },
          needsSyntheticResource: { type: "string" },
        },
        required: ["id", "objectiveFr", "setupFr", "stepsFr", "expectedEvidenceFr", "recoveryFr", "hintFr", "needsSyntheticResource"],
        additionalProperties: false,
      },
    },
  },
  required: ["guides"],
  additionalProperties: false,
};

const response = await invokeLLM({
  model: "claude-sonnet-4-6",
  maxTokens: 9000,
  thinking: { type: "enabled", budget_tokens: 2048 },
  messages: [
    { role: "system", content: "You are a precise French instructional designer. Produce JSON only. Adapt each existing marketing practical for a learner's own generic AI assistant without inventing source functionality. You may only use facts present in assignment and hint. Do not mention DataCamp, Microsoft Copilot, proprietary agents, pre-authenticated accounts, a source desktop, a source VM, or an inaccessible external lab. Replace such dependencies with a generic personal AI assistant. The learner must use only synthetic/non-confidential information. Give 4 to 6 concise operational steps. expectedEvidenceFr must contain 2 or 3 observable completion elements, not secret answers. recoveryFr must say what to do if an assistant cannot upload files or is unavailable, without inventing a feature. needsSyntheticResource must be exactly one of '', 'customer_pain_points', 'article_outline', 'zenleaf_logo', or 'onyx_paid_media_guidelines', and only when that named source file is explicitly present in the hint." },
    { role: "user", content: `Create source-bounded learner guides from these existing practical records:\n${JSON.stringify(practices)}` },
  ],
  response_format: { type: "json_schema", json_schema: { name: "ai_marketing_practical_guides", strict: true, schema } },
});
const content = response.choices?.[0]?.message?.content;
if (typeof content !== "string") throw new Error("Claude did not return AI marketing guides.");
const parsed = JSON.parse(content);
const expected = new Set(practices.map((practice: { id: string }) => practice.id));
if (parsed.guides.length !== expected.size) throw new Error(`Expected ${expected.size} guides, received ${parsed.guides.length}.`);
for (const guide of parsed.guides) {
  if (!expected.has(guide.id) || guide.stepsFr.length < 4 || guide.expectedEvidenceFr.length < 2) throw new Error(`Invalid guide for ${guide.id}`);
}
fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), model: "claude-sonnet-4-6", guides: parsed.guides }, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, guideCount: parsed.guides.length, model: "claude-sonnet-4-6" }, null, 2));
