import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const model = "claude-sonnet-4-6";
const root = process.cwd();
const baseUrl = process.env.BUILT_IN_FORGE_API_URL;
const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
if (!baseUrl || !apiKey) throw new Error("Forge credentials are unavailable.");

const audit = JSON.parse(await readFile(resolve(root, "docs/architect-foundations-current-audit.json"), "utf8"));
const publicObjectives = {
  "02": "Seven public sections cover Claude API requests, multi-turn conversations, streaming, structured output, prompt evaluation, tool use, RAG, MCP, Claude Code, computer use, and agent architectures.",
  "03": "Seven public sections cover Google Cloud/Vertex AI, SDK, streaming, tool use, prompt evaluation, RAG, MCP, workflows and agents.",
  "04": "Nine lessons: steer the work, configure Claude, automate repeat work, verify and share. Rewind is in steering; plugins are in verify/share.",
  "05": "Publicly listed milestones span Meet Claude, conversations, Projects, Artifacts, Skills, Connectors, Enterprise Search, Research, role use cases, conclusion and certificate. Four direct local videos have verified transcripts; public listings do not name the reportedly missing videos.",
  "06": "Six public sections cover AWS Bedrock (16 lessons), prompt engineering & evaluation (16), tool use (14), RAG (10), MCP (12), and Claude Code & Computer Use (8). The local Module Introduction explicitly belongs to Module 06 and directly precedes its first exercises.",
  "07": "MCP architecture, servers, clients, tools, resources, prompts, Inspector, async cleanup and a document-management project.",
};

function resolveText(value) {
  return typeof value === "string" ? value : value?.en || value?.fr || "";
}

async function compactCourse(record) {
  const course = JSON.parse(await readFile(resolve(root, `client/public/data/courses/${record.courseId}.json`), "utf8"));
  return {
    courseId: record.courseId,
    title: resolveText(course.sourceCourseTitle),
    localLessonTitles: (course.lessons || []).map((lesson) => resolveText(lesson.title)),
    observed: record.observed,
    targetGaps: record.targetGaps,
    sourceInventorySignals: record.sourceInventorySignals,
    integrity: {
      duplicateCheckpointIds: record.integrity.duplicateCheckpointIds,
      unrenderedExerciseCount: record.integrity.unrenderedExercises.length,
      mediaMetadataIssueCount: record.integrity.videosMissingRequiredMetadata.length + record.integrity.downloadsMissingRequiredMetadata.length,
      frenchTerminologySignals: record.integrity.frenchTerminologySignals,
    },
    publicObjectiveSummary: publicObjectives[record.courseId.slice(-2)] || "AI fluency framework, delegation, description, discernment and diligence.",
  };
}

const inputs = await Promise.all(audit.courses.map(compactCourse));
const responseSchema = {
  type: "object",
  properties: {
    reviews: {
      type: "array",
      items: {
        type: "object",
        properties: {
          courseId: { type: "string" },
          priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
          provenFindings: { type: "array", items: { type: "string" } },
          needsSourceReconciliation: { type: "array", items: { type: "string" } },
          safeNextAction: { type: "string" },
          doNotDo: { type: "string" },
        },
        required: ["courseId", "priority", "provenFindings", "needsSourceReconciliation", "safeNextAction", "doNotDo"],
        additionalProperties: false,
      },
    },
  },
  required: ["reviews"],
  additionalProperties: false,
};

const prompt = `You are reviewing a private e-learning migration audit for Anthropic certification preparation. Use only the supplied data. Do not claim to have seen private source lessons and do not invent missing content, media, labs, questions, or exercises. Identify only findings supported by explicit local or public-summary evidence. Treat every sourceInventorySignal as an unverified historical count, not proof of a missing or extra item: it lacks a nominative manifest. Do not label as a defect a Module Introduction that the input explicitly identifies as the opening of its module. Prioritize only actual flow defects, duplicate required interactions, wrong-topic content, broken media evidence, and incomplete provenance. Preserve existing standard components and sequential gating. Return French JSON that conforms exactly to the provided schema.\n\nAudit inputs:\n${JSON.stringify(inputs)}`;

const response = await fetch(`${baseUrl}/v1/chat/completions`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model,
    messages: [
      { role: "system", content: "You are a precise education-content quality reviewer. Return JSON only." },
      { role: "user", content: prompt },
    ],
    max_tokens: 12000,
    response_format: { type: "json_schema", json_schema: { name: "architect_foundations_audit", strict: true, schema: responseSchema } },
    thinking: { type: "enabled", budget_tokens: 2048 },
  }),
});
if (!response.ok) throw new Error(`Claude Sonnet review failed: ${response.status} ${await response.text()}`);
const payload = await response.json();
const rawContent = payload.choices?.[0]?.message?.content;
let review;
try {
  review = JSON.parse(rawContent || "{}");
} catch {
  throw new Error(`Claude Sonnet returned non-JSON content: ${String(rawContent).slice(0, 300)}`);
}
if (!Array.isArray(review.reviews) || review.reviews.length !== inputs.length) {
  throw new Error(`Claude Sonnet returned an incomplete review: ${JSON.stringify({ keys: Object.keys(review || {}), reviewCount: Array.isArray(review?.reviews) ? review.reviews.length : null, expectedCount: inputs.length, finishReason: payload.choices?.[0]?.finish_reason })}`);
}
const output = {
  generatedAt: new Date().toISOString(),
  model,
  source: "Claude Sonnet structured review over local audit and public-source summaries",
  review,
};
await writeFile(resolve(root, "docs/architect-foundations-claude-review.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.table(review.reviews.map((item) => ({ courseId: item.courseId.slice(-2), priority: item.priority, findings: item.provenFindings.length, reconciliation: item.needsSourceReconciliation.length })));
