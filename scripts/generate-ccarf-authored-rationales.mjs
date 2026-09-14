import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const inputPath = resolve(root, "server/data/mockExamQuestions.json");
const outputPath = resolve(root, "docs/ccarf-authored-rationales-proposed.json");
const certificationId = "claude_certified_architect_foundations";
const model = "claude-sonnet-4-6";
const limit = Number(process.env.RATIONALE_LIMIT || "6");
const concurrency = Math.min(4, Math.max(1, Number(process.env.RATIONALE_CONCURRENCY || "2")));
const requestTimeoutMs = Math.min(180_000, Math.max(20_000, Number(process.env.RATIONALE_TIMEOUT_MS || "90_000")));
const apply = process.argv.includes("--apply");

if (!process.env.BUILT_IN_FORGE_API_URL || !process.env.BUILT_IN_FORGE_API_KEY) {
  throw new Error("Le proxy de génération côté serveur n’est pas configuré.");
}

const allQuestions = JSON.parse(await readFile(inputPath, "utf8"));
const targets = allQuestions
  .filter((question) => question.certificationId === certificationId && !question.choices.every((choice) => choice.rationale?.en && choice.rationale?.fr))
  .slice(0, Number.isFinite(limit) && limit > 0 ? limit : undefined);

const schema = {
  type: "json_schema",
  json_schema: {
    name: "ccarf_choice_rationales",
    strict: true,
    schema: {
      type: "object",
      properties: {
        rationales: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              en: { type: "string" },
              fr: { type: "string" },
            },
            required: ["id", "en", "fr"],
            additionalProperties: false,
          },
        },
      },
      required: ["rationales"],
      additionalProperties: false,
    },
  },
};

function sourceFor(question) {
  return {
    id: question.id,
    domain: question.domain,
    question: question.question,
    correctChoiceIds: question.correctChoiceIds,
    choices: question.choices.map(({ id, text }) => ({ id, text })),
  };
}

function validate(question, generated) {
  const expectedIds = question.choices.map((choice) => choice.id).sort();
  const receivedIds = generated.rationales.map((choice) => choice.id).sort();
  if (JSON.stringify(expectedIds) !== JSON.stringify(receivedIds)) throw new Error(`${question.id}: identifiants de choix incohérents`);
  const seen = new Set();
  for (const rationale of generated.rationales) {
    for (const [language, text] of Object.entries({ en: rationale.en, fr: rationale.fr })) {
      if (typeof text !== "string" || text.trim().length < 24 || text.trim().length > 700) throw new Error(`${question.id}:${rationale.id}:${language}: rationale invalide`);
      if (/certsafari|real exam|exam dump|actual exam/i.test(text)) throw new Error(`${question.id}:${rationale.id}:${language}: référence non autorisée`);
      const fingerprint = `${language}:${text.trim().toLowerCase()}`;
      if (seen.has(fingerprint)) throw new Error(`${question.id}:${rationale.id}:${language}: rationale dupliquée`);
      seen.add(fingerprint);
    }
  }
}

async function generate(question) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  let response;
  try {
    response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 1800,
        thinking: { type: "enabled", budget_tokens: 800 },
        response_format: schema,
        messages: [
          {
            role: "system",
            content: "You are an assessment writer for Neopolis Akademy. Write new, concise rationales for every option of one practice question. Use only the supplied question, answer key, options, and domain. Do not copy certification questions, do not claim access to any exam, and do not mention CertSafari or any third-party source. State why the correct option meets the evaluated decision rule and why each distractor is insufficient, inaccurate, risky, or out of scope. Keep Anthropic product names unchanged. Return English and faithful French rationales, each 1–2 sentences and specific to the option.",
          },
          { role: "user", content: JSON.stringify(sourceFor(question)) },
        ],
      }),
    });
  } catch (error) {
    throw new Error(`${question.id}: génération Claude expirée après ${requestTimeoutMs} ms (${error instanceof Error ? error.name : "erreur inconnue"})`);
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) throw new Error(`${question.id}: proxy HTTP ${response.status}`);
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error(`${question.id}: réponse de génération vide`);
  const generated = JSON.parse(content);
  validate(question, generated);
  return { questionId: question.id, rationales: generated.rationales };
}

const results = [];
const failures = [];
for (let index = 0; index < targets.length; index += concurrency) {
  const batch = targets.slice(index, index + concurrency);
  console.log(`Rationales CCAR-F : lot ${Math.floor(index / concurrency) + 1}/${Math.ceil(targets.length / concurrency)} (${batch.map((question) => question.id).join(", ")})`);
  const settled = await Promise.allSettled(batch.map(generate));
  settled.forEach((result, batchIndex) => {
    if (result.status === "fulfilled") results.push(result.value);
    else failures.push({ questionId: batch[batchIndex].id, error: result.reason instanceof Error ? result.reason.message : String(result.reason) });
  });
}

const report = { generatedAt: new Date().toISOString(), certificationId, model, requested: targets.length, generated: results.length, failures, results };
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (apply) {
  const byQuestion = new Map(results.map((result) => [result.questionId, new Map(result.rationales.map((rationale) => [rationale.id, { en: rationale.en, fr: rationale.fr }]))]));
  for (const question of allQuestions) {
    const rationales = byQuestion.get(question.id);
    if (!rationales) continue;
    question.choices = question.choices.map((choice) => ({ ...choice, rationale: rationales.get(choice.id) }));
  }
  if (results.length) await writeFile(inputPath, `${JSON.stringify(allQuestions, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify({ certificationId, requested: targets.length, generated: results.length, failures: failures.length, outputPath, applied: apply }, null, 2));
if (failures.length) process.exitCode = 1;
