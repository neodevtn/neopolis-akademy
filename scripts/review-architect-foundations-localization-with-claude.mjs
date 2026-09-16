import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const model = "claude-sonnet-4-6";
const baseUrl = process.env.BUILT_IN_FORGE_API_URL;
const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
if (!baseUrl || !apiKey) throw new Error("Forge credentials are unavailable.");
const courseIds = ["01", "02", "03", "05", "06"].map((suffix) => `claude_certified_architect_foundations__${suffix}`);
const suspectPattern = /assistant AI|modèles AI|outils AI|plateforme AI|systèmes AI|\bAI conçu|\bAI supplémentaire|flux de travail AI|évaluation AI|applications AI/i;

function collectCandidates(value, path = "$", candidates = []) {
  if (Array.isArray(value)) value.forEach((entry, index) => collectCandidates(entry, `${path}[${index}]`, candidates));
  else if (value && typeof value === "object") {
    if (typeof value.fr === "string" && suspectPattern.test(value.fr)) {
      const matches = [...value.fr.matchAll(new RegExp(suspectPattern.source, "gi"))].map((match) => ({
        term: match[0],
        excerpt: value.fr.slice(Math.max(0, match.index - 180), Math.min(value.fr.length, match.index + match[0].length + 220)),
      }));
      candidates.push({ path, matches });
    }
    Object.entries(value).forEach(([key, entry]) => collectCandidates(entry, `${path}.${key}`, candidates));
  }
  return candidates;
}

const inputs = [];
for (const courseId of courseIds) {
  const course = JSON.parse(await readFile(resolve(process.cwd(), `client/public/data/courses/${courseId}.json`), "utf8"));
  const candidates = collectCandidates(course);
  inputs.push({ courseId, title: course.sourceCourseTitle, candidates });
}
const outputSchema = {
  type: "object",
  properties: {
    decisions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          courseId: { type: "string" },
          path: { type: "string" },
          term: { type: "string" },
          verdict: { type: "string", enum: ["corriger", "conserver"] },
          replacement: { type: "string" },
          rationale: { type: "string" },
        },
        required: ["courseId", "path", "term", "verdict", "replacement", "rationale"],
        additionalProperties: false,
      },
    },
  },
  required: ["decisions"],
  additionalProperties: false,
};
const prompt = `You are reviewing French localization candidates in private Anthropic training content. Use only the candidate excerpts provided. Decide whether an English AI adjective or noun is an actual French-localization defect. Preserve product names such as Claude, Claude Code, MCP, Projects, Artifacts, Skills, Connectors, Enterprise Search, Research, and named features. Do not rewrite sentences. When correction is warranted, give only a literal phrase replacement that preserves the existing meaning (for example, "assistant AI" -> "assistant IA"). When a phrase should remain, use an empty replacement. Return only French JSON conforming exactly to the schema.\n\nCandidates:\n${JSON.stringify(inputs)}`;
const response = await fetch(`${baseUrl}/v1/chat/completions`, {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model,
    messages: [{ role: "system", content: "You are an exacting French localization reviewer. Return JSON only." }, { role: "user", content: prompt }],
    max_tokens: 8000,
    thinking: { type: "enabled", budget_tokens: 2048 },
    response_format: { type: "json_schema", json_schema: { name: "architect_foundations_localization_review", strict: true, schema: outputSchema } },
  }),
});
if (!response.ok) throw new Error(`Claude Sonnet localization review failed: ${response.status} ${await response.text()}`);
const payload = await response.json();
const parsed = JSON.parse(payload.choices?.[0]?.message?.content || "{}");
if (!Array.isArray(parsed.decisions)) throw new Error("Claude Sonnet did not return localization decisions.");
const report = { generatedAt: new Date().toISOString(), model, candidateCount: inputs.reduce((total, item) => total + item.candidates.reduce((sum, candidate) => sum + candidate.matches.length, 0), 0), ...parsed };
await writeFile(resolve(process.cwd(), "docs/architect-foundations-localization-claude-review.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.table(report.decisions.map((decision) => ({ course: decision.courseId.slice(-2), term: decision.term, verdict: decision.verdict, replacement: decision.replacement })));
