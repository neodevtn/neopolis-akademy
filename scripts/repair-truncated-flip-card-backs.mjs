#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const courseDir = path.join(root, "client/public/data/courses");
const cachePath = "/tmp/neopolis-flip-card-truncation-repairs.json";
const modelId = "claude-sonnet-4-6";
const batchSize = 6;
const concurrency = 3;

function resolveLocalized(value, language) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return typeof value[language] === "string" ? value[language] : "";
}

function visit(value, callback, trace = "$", parent = null, key = null) {
  if (!value || typeof value !== "object") return;
  callback(value, trace, parent, key);
  if (Array.isArray(value)) value.forEach((item, index) => visit(item, callback, `${trace}[${index}]`, value, index));
  else Object.entries(value).forEach(([childKey, child]) => visit(child, callback, `${trace}.${childKey}`, value, childKey));
}

function getAtTrace(value, trace) {
  const parts = trace.replace(/^\$\.?/, "").replaceAll("[", ".").replaceAll("]", "").split(".").filter(Boolean);
  return parts.reduce((node, part) => node?.[/^\d+$/.test(part) ? Number(part) : part], value);
}

function languageLooksCorrect(language, text) {
  const french = (text.match(/\b(?:le|la|les|des|du|une|pour|avec|dans|sur|vous|votre|cette|est|sont|doit|peut|permet|données|résultat|modèle|étape|outil|sécurité)\b/giu) || []).length;
  const english = (text.match(/\b(?:the|and|for|with|your|this|that|is|are|must|can|allows|data|result|model|step|tool|security)\b/giu) || []).length;
  return language === "fr" ? !(english >= 5 && english > french * 1.8) : !(french >= 4 && french > english * 1.5);
}

function endsCleanly(text) {
  return !/(?:\b(?:a|an|the|and|or|to|of|for|with|in|on|at|from|that|this|le|la|les|un|une|de|du|des|et|ou|à|pour|avec|dans|sur|ce|cette)|[,;])\s*$/iu.test(text);
}

const courses = new Map();
const candidates = [];
for (const file of fs.readdirSync(courseDir).filter((name) => name.endsWith(".json")).sort()) {
  const course = JSON.parse(fs.readFileSync(path.join(courseDir, file), "utf8"));
  courses.set(file, course);
  visit(course, (node, trace) => {
    if (node.type !== "flip_cards" || !Array.isArray(node.cards)) return;
    node.cards.forEach((card, cardIndex) => {
      const en = resolveLocalized(card.back, "en");
      const fr = resolveLocalized(card.back, "fr");
      if (en.length !== 300 || /[.!?…:)\]}`'”»]\s*$/u.test(en)) return;
      candidates.push({
        id: `card-${candidates.length + 1}`,
        file,
        trace,
        cardIndex,
        frontEn: resolveLocalized(card.front, "en"),
        frontFr: resolveLocalized(card.front, "fr"),
        en,
        fr,
      });
    });
  });
}

if (!candidates.length) {
  console.log("No 300-character flip-card backs require repair.");
  process.exit(0);
}

const modelsResponse = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, {
  headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` },
}).then((response) => response.json());
if (!modelsResponse.data?.some((model) => model.id === modelId)) throw new Error(`${modelId} is unavailable.`);

const schema = {
  type: "object",
  properties: {
    repairs: {
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
  required: ["repairs"],
  additionalProperties: false,
};

async function repairBatch(batch, attempt = 1) {
  const prompt = `Repair truncated learner-facing flip-card backs in English and French.

Each supplied back was cut at exactly 300 English characters. Return exactly one repair for every id. Produce equivalent English and French text, each concise and self-contained (normally 1–4 complete sentences). Use only factual claims already present in the supplied snippets; do not guess missing product behavior, add examples, add recommendations, or invent a continuation. Preserve technical identifiers, product names, commands, parameter names, URLs, numbers and explicit cautions that are present. Remove incomplete trailing fragments and reorganize the retained facts into complete prose when necessary. Do not include UI residue such as “Reveal model answer”, “Skip for now” or “Model answer”. Do not mention truncation. Never return an assessment answer that is absent from the source.

CARDS:\n${JSON.stringify(batch)}`;
  const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 7000,
      thinking: { type: "enabled", budget_tokens: 1024 },
      response_format: {
        type: "json_schema",
        json_schema: { name: "flip_card_truncation_repairs", strict: true, schema },
      },
      messages: [{ role: "user", content: prompt }],
    }),
  }).then((result) => result.json());
  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Claude Sonnet returned no content: ${JSON.stringify(response)}`);
  const parsed = JSON.parse(content.replace(/^```json\s*|\s*```$/g, ""));
  const byId = new Map(parsed.repairs.map((item) => [item.id, item]));
  const missing = batch.filter((item) => !byId.has(item.id));
  if (missing.length) {
    if (attempt >= 3) throw new Error(`Claude Sonnet omitted: ${missing.map((item) => item.id).join(", ")}`);
    const retry = await repairBatch(missing, attempt + 1);
    retry.forEach((item) => byId.set(item.id, item));
  }
  return batch.map((source) => {
    const repair = byId.get(source.id);
    for (const language of ["en", "fr"]) {
      let text = String(repair?.[language] ?? "").trim();
      if (/[\p{L}\p{N}]$/u.test(text)) text = `${text}.`;
      repair[language] = text;
      if (text.length < 35 || text.length > 900) throw new Error(`Invalid ${language} length for ${source.id}: ${text.length}`);
      if (!languageLooksCorrect(language, text)) throw new Error(`Wrong ${language} language for ${source.id}.`);
      if (!endsCleanly(text)) throw new Error(`Incomplete ${language} ending for ${source.id}: ${text.slice(-50)}`);
      const sourceWasVisiblyTruncated = language === "en" && !/[.!?…:)\]}`'”»]\s*$/u.test(source.en);
      if (sourceWasVisiblyTruncated && (text === source.en || text.endsWith(source.en.slice(-24)))) {
        throw new Error(`Truncated source ending was not repaired for ${source.id} (${language}).`);
      }
      if (/Reveal model answer|Skip for now|Afficher la réponse du modèle|Passer pour l'instant/iu.test(text)) throw new Error(`UI residue in ${source.id}.`);
    }
    return repair;
  });
}

const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};
const pending = candidates.filter((candidate) => !cache[candidate.id]);
const batches = [];
for (let index = 0; index < pending.length; index += batchSize) batches.push(pending.slice(index, index + batchSize));
for (let offset = 0; offset < batches.length; offset += concurrency) {
  const completed = (await Promise.all(batches.slice(offset, offset + concurrency).map((batch) => repairBatch(batch)))).flat();
  completed.forEach((repair) => { cache[repair.id] = repair; });
  fs.writeFileSync(cachePath, `${JSON.stringify(cache)}\n`, "utf8");
  console.log(`Completed ${Math.min(offset + concurrency, batches.length)}/${batches.length} Claude Sonnet requests.`);
}

const touched = new Set();
for (const candidate of candidates) {
  const repair = cache[candidate.id];
  if (!repair) throw new Error(`Missing cached repair for ${candidate.id}.`);
  const course = courses.get(candidate.file);
  const block = getAtTrace(course, candidate.trace);
  const card = block?.cards?.[candidate.cardIndex];
  if (!card || resolveLocalized(card.back, "en") !== candidate.en || resolveLocalized(card.back, "fr") !== candidate.fr) {
    throw new Error(`Source drift at ${candidate.file}:${candidate.trace}.cards[${candidate.cardIndex}]`);
  }
  card.back = { en: repair.en.trim(), fr: repair.fr.trim() };
  touched.add(candidate.file);
}
for (const file of touched) fs.writeFileSync(path.join(courseDir, file), `${JSON.stringify(courses.get(file), null, 2)}\n`, "utf8");
fs.rmSync(cachePath, { force: true });
console.log(JSON.stringify({ model: modelId, repairedCards: candidates.length, files: touched.size }, null, 2));
