import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const defaultCourseIds = ["claude_101__01", "claude_code_101__01", "claude_code_in_action__01"];
const requestedCourse = process.argv.find((argument) => argument.startsWith("--course="))?.split("=")[1];
const requestedLimit = Number(process.argv.find((argument) => argument.startsWith("--limit="))?.split("=")[1] ?? "0");
const courseIds = requestedCourse ? [requestedCourse] : defaultCourseIds;
const coursesDir = resolve(process.cwd(), "client/public/data/courses");
const proposalPath = resolve(process.cwd(), "docs/anthropic-localization-proposed.json");
const apply = process.argv.includes("--write");
const batchSize = 10;
const maxWorkers = 4;

function collectCandidates(value, path = "$", results = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectCandidates(item, `${path}[${index}]`, results));
    return results;
  }
  if (!value || typeof value !== "object") return results;
  if (typeof value.en === "string" && typeof value.fr === "string") {
    const en = value.en.trim();
    const fr = value.fr.trim();
    if (en === fr && en.length > 18 && /[A-Za-z]{5,}/.test(en)) results.push({ path, en });
  }
  Object.entries(value).forEach(([key, child]) => collectCandidates(child, `${path}.${key}`, results));
  return results;
}

function tokenizePath(path) {
  return [...path.matchAll(/\.([A-Za-z_$][\w$]*)|\[(\d+)\]/g)].map((match) => match[1] ?? Number(match[2]));
}

function atPath(root, path) {
  return tokenizePath(path).reduce((value, token) => value[token], root);
}

async function translateBatch(items) {
  const payload = {
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a precise professional English-to-French course localizer. Translate each string faithfully. Preserve Markdown, punctuation, line breaks, numbered lists, quoted prompts, code, URLs, product names (Claude, Claude Code, Skills, Projects, Code Execution, Memory, APIs, SDKs, MCP), variable names, file names, and options used as exact technical labels when translation would impair usability. Do not summarize, alter questions, change correct answers, add content, or explain. Return valid JSON only.",
      },
      {
        role: "user",
        content: JSON.stringify({
          items: items.map((item, index) => ({ id: index, english: item.en })),
          requiredShape: { items: [{ id: 0, french: "", confidence: 0.0 }] },
        }),
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "localized_items",
        strict: true,
        schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  french: { type: "string" },
                  confidence: { type: "number" },
                },
                required: ["id", "french", "confidence"],
                additionalProperties: false,
              },
            },
          },
          required: ["items"],
          additionalProperties: false,
        },
      },
    },
    max_completion_tokens: 6000,
  };

  const response = await fetch(`${process.env.OPENAI_API_BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Traduction refusée (${response.status}) : ${await response.text()}`);
  const data = await response.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
  if (!Array.isArray(parsed.items) || parsed.items.length !== items.length) throw new Error("Réponse de traduction incomplète.");
  const ids = parsed.items.map((item) => item.id).sort((left, right) => left - right);
  if (ids.some((id, index) => id !== index)) throw new Error("Réponse de traduction avec identifiants incohérents.");
  return parsed.items;
}

const proposals = [];
for (const courseId of courseIds) {
  const coursePath = resolve(coursesDir, `${courseId}.json`);
  const course = JSON.parse(await readFile(coursePath, "utf8"));
  const candidates = requestedLimit > 0 ? collectCandidates(course).slice(0, requestedLimit) : collectCandidates(course);
  const batches = Array.from({ length: Math.ceil(candidates.length / batchSize) }, (_, index) =>
    candidates.slice(index * batchSize, (index + 1) * batchSize),
  );
  const translatedBatches = [];
  for (let offset = 0; offset < batches.length; offset += maxWorkers) {
    const group = batches.slice(offset, offset + maxWorkers);
    translatedBatches.push(...(await Promise.all(group.map((batch) => translateBatch(batch)))).map((translations, index) => ({ batch: group[index], translations })));
  }
  for (const { batch, translations } of translatedBatches) {
    translations.forEach((translation) => {
      const source = batch[translation.id];
      const french = typeof translation.french === "string" ? translation.french.trim() : "";
      const ratio = source.en.length ? french.length / source.en.length : 0;
      proposals.push({
        courseId,
        path: source.path,
        english: source.en,
        french,
        confidence: translation.confidence,
        accepted: french.length > 0 && ratio >= 0.35 && ratio <= 2.8 && translation.confidence >= 0.8,
      });
    });
  }

  if (apply) {
    for (const proposal of proposals.filter((item) => item.courseId === courseId && item.accepted)) {
      const localized = atPath(course, proposal.path);
      if (!localized || typeof localized.en !== "string" || typeof localized.fr !== "string") {
        throw new Error(`Le champ localisé attendu est introuvable : ${courseId} ${proposal.path}`);
      }
      localized.fr = proposal.french;
    }
    await writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
  }
}

await writeFile(proposalPath, `${JSON.stringify({ model: "gpt-5-mini", proposals }, null, 2)}\n`, "utf8");
const accepted = proposals.filter((item) => item.accepted).length;
console.log(`${proposals.length} propositions générées ; ${accepted} satisfont les garde-fous.`);
if (!apply) console.log("Relancez avec --write pour appliquer uniquement les propositions acceptées.");
