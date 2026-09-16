import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const model = "claude-sonnet-4-6";
const baseUrl = process.env.BUILT_IN_FORGE_API_URL;
const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
if (!baseUrl || !apiKey) throw new Error("Forge credentials are unavailable.");
const sourceMilestones = [
  "Meet Claude", "What is Claude?", "Your first conversation with Claude", "Getting better results", "How you'll work with Claude on your desktop", "Organizing your work and knowledge", "Introduction to projects", "Creating with artifacts", "Working with skills", "Expanding Claude's reach", "Connecting your tools", "Enterprise search", "Research for deep dives", "Putting it all together", "Claude in action: use-cases by role", "Other ways to work with Claude", "Conclusion & certificate", "What's next?", "Certificate of completion",
];
const course = JSON.parse(await readFile(resolve(process.cwd(), "client/public/data/courses/claude_certified_architect_foundations__05.json"), "utf8"));
const local = course.lessons.map((lesson, index) => ({
  index,
  lessonTitle: lesson.title?.en || lesson.title || "",
  chapters: (lesson.chapters || []).map((chapter) => ({
    title: chapter.title?.en || chapter.title || "",
    firstContent: ((chapter.blocks || []).find((block) => block.type === "content" || block.type === "text")?.body?.en || "").replace(/\s+/g, " ").slice(0, 260),
    blockTypes: (chapter.blocks || []).map((block) => block.type),
  })),
}));
const schema = {
  type: "object",
  properties: {
    coveredMilestones: { type: "array", items: { type: "string" } },
    unprovenMilestones: { type: "array", items: { type: "string" } },
    structuralWrappers: { type: "array", items: { type: "string" } },
    safeActions: { type: "array", items: { type: "string", enum: ["preserve_current_structure", "label_structural_wrapper", "do_not_invent_missing_milestone", "remove_duplicate_only_if_proven"] } },
    rationale: { type: "string" },
  },
  required: ["coveredMilestones", "unprovenMilestones", "structuralWrappers", "safeActions", "rationale"],
  additionalProperties: false,
};
const prompt = `You are a conservative e-learning migration reviewer. Compare public Claude 101 milestones to local records. The public list is not permission to recreate absent proprietary screens. Treat equivalent local learning content as coverage even when the title varies. Classify Module Introduction and Module Complete as structural wrappers, not missing source content, unless supplied data proves otherwise. Do not recommend removing legitimate local content based only on a title difference. Answer in French JSON matching the schema exactly.\n\n${JSON.stringify({ sourceMilestones, local })}`;
const response = await fetch(`${baseUrl}/v1/chat/completions`, {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model,
    messages: [{ role: "system", content: "You are a rigorous learning-content parity reviewer. Return strict JSON only." }, { role: "user", content: prompt }],
    max_tokens: 4000,
    thinking: { type: "enabled", budget_tokens: 1500 },
    response_format: { type: "json_schema", json_schema: { name: "architect_course5_parity_review", strict: true, schema } },
  }),
});
if (!response.ok) throw new Error(`Claude Sonnet Claude 101 parity review failed: ${response.status} ${await response.text()}`);
const payload = await response.json();
const review = JSON.parse(payload.choices?.[0]?.message?.content || "{}");
await writeFile(resolve(process.cwd(), "docs/architect-foundations-course5-parity-claude-review.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), model, review }, null, 2)}\n`, "utf8");
console.log(JSON.stringify(review, null, 2));
