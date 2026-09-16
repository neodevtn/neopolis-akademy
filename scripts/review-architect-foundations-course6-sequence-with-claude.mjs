import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const model = "claude-sonnet-4-6";
const baseUrl = process.env.BUILT_IN_FORGE_API_URL;
const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
if (!baseUrl || !apiKey) throw new Error("Forge credentials are unavailable.");

const course = JSON.parse(await readFile(resolve(process.cwd(), "client/public/data/courses/claude_certified_architect_foundations__06.json"), "utf8"));
const lessons = course.lessons.map((lesson, index) => ({
  index,
  title: lesson.title?.en || lesson.title || "",
  chapterTitles: (lesson.chapters || []).map((chapter) => chapter.title?.en || chapter.title || ""),
  blockTypes: (lesson.chapters || []).flatMap((chapter) => (chapter.blocks || []).map((block) => block.type)),
}));
const sourceFacts = [
  "The public Skilljar curriculum begins with a course introduction and then covers multi-turn conversations, system prompts, prompt evaluation, JSON Schema tools, RAG, advanced features, Claude Code and MCP.",
  "The public source does not identify the placement of the 12 exercises, the Module 06 introduction, or the two Module Complete screens.",
  "The local course contains 80 chapters and 12 checkpoint-backed exercises, which matches the working audit target.",
];
const schema = {
  type: "object",
  properties: {
    module6Introduction: { type: "string", enum: ["placement_defensible", "needs_source_before_move"] },
    moduleCompleteBeforeRemainingExercises: { type: "string", enum: ["placement_defensible", "needs_source_before_move"] },
    exerciseTail: { type: "string", enum: ["likely_standard_practice", "likely_supplement", "needs_source_before_labeling"] },
    safeActions: { type: "array", items: { type: "string", enum: ["preserve_order", "document_ambiguity", "move_module_intro", "move_module_complete", "label_tail_as_supplement"] } },
    rationale: { type: "string" },
  },
  required: ["module6Introduction", "moduleCompleteBeforeRemainingExercises", "exerciseTail", "safeActions", "rationale"],
  additionalProperties: false,
};
const prompt = `You are a conservative e-learning migration reviewer. Assess only whether the supplied local ordering is safe to change. You must not invent an original source sequence. A title such as "Module Complete" is not evidence that all following exercises are incorrect: they may belong to a later module. A placement is defensible when it aligns with the local Module 06 introduction immediately before the first five exercises, even if it follows earlier agent lessons. Recommend movement only when the public source facts prove it. Return French JSON exactly matching the schema.\n\n${JSON.stringify({ sourceFacts, lessons })}`;
const response = await fetch(`${baseUrl}/v1/chat/completions`, {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model,
    messages: [{ role: "system", content: "You return only strict JSON and do not infer proprietary course content." }, { role: "user", content: prompt }],
    max_tokens: 2800,
    thinking: { type: "enabled", budget_tokens: 1200 },
    response_format: { type: "json_schema", json_schema: { name: "architect_course6_sequence_review", strict: true, schema } },
  }),
});
if (!response.ok) throw new Error(`Claude Sonnet course sequence review failed: ${response.status} ${await response.text()}`);
const payload = await response.json();
const review = JSON.parse(payload.choices?.[0]?.message?.content || "{}");
await writeFile(resolve(process.cwd(), "docs/architect-foundations-course6-sequence-claude-review.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), model, review }, null, 2)}\n`, "utf8");
console.log(JSON.stringify(review, null, 2));
