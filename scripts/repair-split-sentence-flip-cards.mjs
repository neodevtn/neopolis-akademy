#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const courseDir = path.resolve("client/public/data/courses");
const cachePath = "/tmp/neopolis-split-flip-card-repairs.json";
const model = "claude-sonnet-4-6";
const batchSize = 8;
const concurrency = 3;

const localized = (value, language) => typeof value === "string" ? value : (value?.[language] ?? "");
const looksSplit = (front, back) => Boolean(
  front && back
  && !/[.!?…:)\]}`'”»]$/u.test(front.trim())
  && /^[a-z]/u.test(back.trim())
  && front.trim().split(/\s+/u).length >= 4
);

function visit(value, callback, trace = "$", parent = null, key = null) {
  if (!value || typeof value !== "object") return;
  callback(value, trace, parent, key);
  if (Array.isArray(value)) value.forEach((item, index) => visit(item, callback, `${trace}[${index}]`, value, index));
  else Object.entries(value).forEach(([childKey, child]) => visit(child, callback, `${trace}.${childKey}`, value, childKey));
}
function getAtTrace(value, trace) {
  return trace.replace(/^\$\.?/, "").replaceAll("[", ".").replaceAll("]", "").split(".").filter(Boolean)
    .reduce((node, part) => node?.[/^\d+$/.test(part) ? Number(part) : part], value);
}
function languageLooksCorrect(language, text) {
  const french = (text.match(/\b(?:le|la|les|des|du|une|pour|avec|dans|sur|vous|votre|cette|est|sont|doit|peut|permet|données|résultat|modèle|étape|outil|sécurité)\b/giu) || []).length;
  const english = (text.match(/\b(?:the|and|for|with|your|this|that|is|are|must|can|allows|data|result|model|step|tool|security)\b/giu) || []).length;
  return language === "fr" ? !(english >= 5 && english > french * 1.8) : !(french >= 4 && french > english * 1.5);
}

const courses = new Map();
const candidates = [];
for (const file of fs.readdirSync(courseDir).filter((name) => name.endsWith(".json")).sort()) {
  const course = JSON.parse(fs.readFileSync(path.join(courseDir, file), "utf8"));
  courses.set(file, course);
  visit(course, (node, trace) => {
    if (node.type !== "flip_cards" || !Array.isArray(node.cards)) return;
    node.cards.forEach((card, cardIndex) => {
      const frontEn = localized(card.front, "en");
      const backEn = localized(card.back, "en");
      if (!looksSplit(frontEn, backEn)) return;
      candidates.push({
        id: `split-${candidates.length + 1}`,
        file,
        trace,
        cardIndex,
        frontEn,
        backEn,
        frontFr: localized(card.front, "fr"),
        backFr: localized(card.back, "fr"),
      });
    });
  });
}
if (!candidates.length) {
  console.log("No split-sentence flip cards require repair.");
  process.exit(0);
}

const models = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, {
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` },
}).then((response) => response.json());
if (!models.data?.some((item) => item.id === model)) throw new Error(`${model} is unavailable.`);

const schema = {
  type: "object",
  properties: {
    repairs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          frontEn: { type: "string" },
          backEn: { type: "string" },
          frontFr: { type: "string" },
          backFr: { type: "string" },
        },
        required: ["id", "frontEn", "backEn", "frontFr", "backFr"],
        additionalProperties: false,
      },
    },
  },
  required: ["repairs"],
  additionalProperties: false,
};

async function repair(batch, attempt = 1) {
  const prompt = `Convert each malformed bilingual flip card into a real concept-and-explanation card. The current front and back are fragments of one sentence that were split at an arbitrary character boundary.

For each id:
- frontEn/frontFr: a concise standalone concept, step name, or question (not a sentence fragment);
- backEn/backFr: a complete self-contained explanation that recombines all facts from the supplied front and back;
- English and French must be equivalent;
- preserve every technical identifier, command, parameter, URL, number, product name and explicit caution;
- do not add facts, examples, assessment answers, recommendations or product behavior absent from the source;
- remove duplicated words caused by the old split;
- do not mention this migration or truncation.

CARDS:\n${JSON.stringify(batch)}`;
  const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      thinking: { type: "enabled", budget_tokens: 1024 },
      response_format: { type: "json_schema", json_schema: { name: "split_flip_card_repairs", strict: true, schema } },
      messages: [{ role: "user", content: prompt }],
    }),
  }).then((result) => result.json());
  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Claude Sonnet returned no content: ${JSON.stringify(response)}`);
  const parsed = JSON.parse(content.replace(/^```json\s*|\s*```$/g, ""));
  const byId = new Map(parsed.repairs.map((item) => [item.id, item]));
  const missing = batch.filter((item) => !byId.has(item.id));
  if (missing.length) {
    if (attempt >= 3) throw new Error(`Claude Sonnet omitted ${missing.map((item) => item.id).join(", ")}.`);
    (await repair(missing, attempt + 1)).forEach((item) => byId.set(item.id, item));
  }
  return batch.map((source) => {
    const result = byId.get(source.id);
    for (const [language, frontKey, backKey] of [["en", "frontEn", "backEn"], ["fr", "frontFr", "backFr"]]) {
      result[frontKey] = String(result[frontKey] ?? "").trim();
      result[backKey] = String(result[backKey] ?? "").trim();
      if (/[\p{L}\p{N}]$/u.test(result[backKey])) result[backKey] += ".";
      if (result[frontKey].length < 3 || result[frontKey].length > 150) throw new Error(`Invalid ${frontKey} for ${source.id}.`);
      if (result[backKey].length < 20 || result[backKey].length > 1000) throw new Error(`Invalid ${backKey} for ${source.id}.`);
      if (!languageLooksCorrect(language, `${result[frontKey]} ${result[backKey]}`)) throw new Error(`Wrong language for ${source.id}:${language}.`);
    }
    return result;
  });
}

const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};
const pending = candidates.filter((item) => !cache[item.id]);
const batches = [];
for (let index = 0; index < pending.length; index += batchSize) batches.push(pending.slice(index, index + batchSize));
for (let offset = 0; offset < batches.length; offset += concurrency) {
  const done = (await Promise.all(batches.slice(offset, offset + concurrency).map((batch) => repair(batch)))).flat();
  done.forEach((item) => { cache[item.id] = item; });
  fs.writeFileSync(cachePath, `${JSON.stringify(cache)}\n`, "utf8");
  console.log(`Completed ${Math.min(offset + concurrency, batches.length)}/${batches.length} Claude Sonnet requests.`);
}

const touched = new Set();
for (const candidate of candidates) {
  const course = courses.get(candidate.file);
  const card = getAtTrace(course, candidate.trace)?.cards?.[candidate.cardIndex];
  if (!card || localized(card.front, "en") !== candidate.frontEn || localized(card.back, "en") !== candidate.backEn) {
    throw new Error(`Source drift at ${candidate.file}:${candidate.trace}.cards[${candidate.cardIndex}]`);
  }
  const replacement = cache[candidate.id];
  card.front = { en: replacement.frontEn, fr: replacement.frontFr };
  card.back = { en: replacement.backEn, fr: replacement.backFr };
  touched.add(candidate.file);
}
for (const file of touched) fs.writeFileSync(path.join(courseDir, file), `${JSON.stringify(courses.get(file), null, 2)}\n`, "utf8");
fs.rmSync(cachePath, { force: true });
console.log(JSON.stringify({ model, repairedCards: candidates.length, files: touched.size }, null, 2));
