import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const model = "claude-sonnet-4-6";
const baseUrl = process.env.BUILT_IN_FORGE_API_URL;
const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
if (!baseUrl || !apiKey) throw new Error("Forge credentials are unavailable.");
const courseId = "claude_certified_architect_foundations__01";
const course = JSON.parse(await readFile(resolve(process.cwd(), `client/public/data/courses/${courseId}.json`), "utf8"));
const rendered = new Set(course.lessons.flatMap((lesson) => lesson.chapters || []).flatMap((chapter) => chapter.blocks || []).filter((block) => block.type === "checkpoint").map((block) => block.exerciseId));
const unrendered = (course.exercises || []).filter((exercise) => !rendered.has(exercise.id)).map((exercise) => ({
  id: exercise.id,
  required: exercise.required === true,
  interactionType: exercise.interactionType,
  title: exercise.title?.en || exercise.title || "",
  prompt: (exercise.prompt?.en || exercise.prompt || "").slice(0, 600),
  skillTags: exercise.skillTags || [],
}));
const input = {
  courseId,
  courseTitle: course.sourceCourseTitle,
  localLessonTitles: (course.lessons || []).map((lesson) => lesson.title?.en || lesson.title),
  renderedCheckpointCount: rendered.size,
  unrendered,
};
const schema = {
  type: "object",
  properties: {
    decisions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          classification: { type: "string", enum: ["likely_required_course_activity", "legacy_optional_content", "uncertain_needs_source"] },
          rationale: { type: "string" },
          safeAction: { type: "string", enum: ["locate_before_rendering", "preserve_unrendered_and_document", "do_not_publish_without_source"] },
        },
        required: ["id", "classification", "rationale", "safeAction"],
        additionalProperties: false,
      },
    },
  },
  required: ["decisions"],
  additionalProperties: false,
};
const prompt = `You are reviewing unused exercise records from a private e-learning migration. Use only the supplied titles, snippets and course sequence. Do not invent their original placement. Classify each item conservatively: only mark likely_required_course_activity when it is explicitly required and plausibly aligns with a local course lesson; use uncertain when placement or source is not proven; mark legacy_optional_content when it is not required and clearly unrelated to the named course scope. Preserve sequential gating and do not recommend making generic legacy content mandatory. Answer in French JSON, exactly matching the schema.\n\n${JSON.stringify(input)}`;
const response = await fetch(`${baseUrl}/v1/chat/completions`, {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model,
    messages: [{ role: "system", content: "You are a conservative e-learning migration reviewer. Return JSON only." }, { role: "user", content: prompt }],
    max_tokens: 8000,
    thinking: { type: "enabled", budget_tokens: 2048 },
    response_format: { type: "json_schema", json_schema: { name: "architect_course1_unrendered_exercises", strict: true, schema } },
  }),
});
if (!response.ok) throw new Error(`Claude Sonnet course exercise review failed: ${response.status} ${await response.text()}`);
const payload = await response.json();
const review = JSON.parse(payload.choices?.[0]?.message?.content || "{}");
if (!Array.isArray(review.decisions) || review.decisions.length !== unrendered.length) throw new Error("Claude Sonnet returned an incomplete exercise review.");
await writeFile(resolve(process.cwd(), "docs/architect-foundations-course1-unrendered-exercises-claude-review.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), model, ...review }, null, 2)}\n`, "utf8");
console.table(review.decisions.map((item) => ({ id: item.id.slice(-3), classification: item.classification, safeAction: item.safeAction })));
