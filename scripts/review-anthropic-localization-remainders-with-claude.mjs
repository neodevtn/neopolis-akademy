import fs from "node:fs/promises";
import path from "node:path";

const model = "claude-sonnet-4-6";
const baseUrl = process.env.BUILT_IN_FORGE_API_URL;
const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
if (!baseUrl || !apiKey) throw new Error("Forge credentials are unavailable.");

const args = process.argv.slice(2);
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 ? Number(args[index + 1]) : fallback;
};
const offset = Math.max(0, Math.floor(valueOf("--offset", 0)));
const limit = Math.min(30, Math.max(1, Math.floor(valueOf("--limit", 25))));
const root = process.cwd();
const audit = JSON.parse(await fs.readFile(path.join(root, "docs/anthropic-localization-remainders.json"), "utf8"));
const candidates = audit.candidates.slice(offset, offset + limit).map((candidate, index) => ({
  index: offset + index,
  courseId: candidate.courseId,
  pointer: candidate.pointer,
  terms: candidate.terms,
  excerpt: candidate.text.slice(0, 2400),
}));

const outputSchema = {
  type: "object",
  properties: {
    decisions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer", minimum: 0 },
          verdict: { type: "string", enum: ["corriger", "conserver"] },
          replacements: {
            type: "array",
            items: {
              type: "object",
              properties: { source: { type: "string" }, replacement: { type: "string" } },
              required: ["source", "replacement"],
              additionalProperties: false,
            },
          },
          rationale: { type: "string" },
        },
        required: ["index", "verdict", "replacements", "rationale"],
        additionalProperties: false,
      },
    },
  },
  required: ["decisions"],
  additionalProperties: false,
};

const prompt = `You review French strings in private training courses. The requested scope is strictly these generic English phrases: best practices, key takeaways, human-in-the-loop, guardrail, rollout plan, model card.

Return exactly one decision for every candidate. Mark "corriger" only when a literal French localization replacement is clearly appropriate in the displayed French prose. Preserve source quotes, code snippets, proper names, product/feature names, official course titles, URLs, identifiers and English terms intentionally introduced as technical vocabulary. Never rewrite a sentence; each replacement must be a literal exact substring from the excerpt with its shortest meaningful French replacement. Mark "conserver" with an empty replacements array for every ambiguous case.

Return French JSON exactly matching the schema.

CANDIDATES:
${JSON.stringify(candidates)}`;

const response = await fetch(`${baseUrl}/v1/chat/completions`, {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model,
    messages: [
      { role: "system", content: "You are a conservative French localization reviewer. Return JSON only and never invent course content." },
      { role: "user", content: prompt },
    ],
    max_tokens: 12000,
    thinking: { type: "enabled", budget_tokens: 2048 },
    response_format: { type: "json_schema", json_schema: { name: "anthropic_localization_remainder_review", strict: true, schema: outputSchema } },
  }),
});
if (!response.ok) throw new Error(`Claude Sonnet review failed: ${response.status} ${await response.text()}`);
const payload = await response.json();
const parsed = JSON.parse(payload.choices?.[0]?.message?.content || "{}");
const decisions = Array.isArray(parsed.decisions) ? parsed.decisions : [];
const expected = new Set(candidates.map((candidate) => candidate.index));
if (decisions.length !== candidates.length || decisions.some((decision) => !expected.has(decision.index))) throw new Error("Claude Sonnet did not return one decision per candidate.");
for (const decision of decisions) {
  const candidate = candidates.find((item) => item.index === decision.index);
  if (decision.verdict === "conserver" && decision.replacements.length) throw new Error(`Unexpected replacement for retained candidate ${decision.index}.`);
  for (const replacement of decision.replacements) {
    if (!replacement.source || !replacement.replacement || !candidate.excerpt.includes(replacement.source)) throw new Error(`Invalid literal replacement for candidate ${decision.index}.`);
  }
}

const report = { generatedAt: new Date().toISOString(), model, offset, limit, candidateCount: candidates.length, candidates: candidates.map(({ excerpt, ...candidate }) => candidate), decisions };
const output = path.join(root, "docs", `anthropic-localization-remainder-review-${String(offset).padStart(3, "0")}.json`);
await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.table(decisions.map((decision) => ({ index: decision.index, verdict: decision.verdict, replacements: decision.replacements.map((item) => `${item.source} → ${item.replacement}`).join("; ") })));
