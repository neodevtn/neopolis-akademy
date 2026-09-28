#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const courseDir = path.join(root, "client/public/data/courses");
const extraJsonFiles = [
  path.join(root, "client/public/data/lessonQuizzes.json"),
  path.join(root, "server/data/mockExamQuestions.json"),
].filter(fs.existsSync);

const LANGS = ["en", "fr", "ar"];
const INTERACTION_TYPES = new Set([
  "single_choice_exercise", "multi_choice_exercise", "knowledge_check", "flip_cards",
  "bucket_sort", "matching", "fill_blank", "ordering", "terminal_sim", "code_repl",
]);

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
}

function localized(value, lang) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const exact = value[lang];
  return typeof exact === "string" || typeof exact === "number" ? String(exact) : "";
}

function anyText(value) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  for (const lang of LANGS) if (typeof value[lang] === "string" && value[lang].trim()) return value[lang];
  return "";
}

function optionText(option, lang) {
  if (typeof option === "string" || typeof option === "number") return String(option);
  if (!option || typeof option !== "object") return "";
  return localized(option.text ?? option.label ?? option.option ?? option.value, lang);
}

function optionId(option, index) {
  if (option && typeof option === "object" && !Array.isArray(option)) {
    return String(option.id ?? option.value ?? index);
  }
  return String(index);
}

function parseAnswerIds(value) {
  if (Array.isArray(value)) return value.map(String).map((x) => x.trim()).filter(Boolean);
  if (value === null || value === undefined || value === "") return [];
  return String(value).split(",").map((x) => x.trim()).filter(Boolean);
}

const findings = [];
const stats = { files: 0, questions: 0, flipCards: 0, interactions: 0, arabicFallbackFields: 0 };

function add(level, code, file, trace, details = {}) {
  findings.push({ level, code, file, trace, ...details });
}

function auditLocalizedArray(items, field, file, trace, code, { minimum = 1 } = {}) {
  if (!Array.isArray(items) || items.length < minimum) {
    add("error", `${code}_missing`, file, trace, { count: Array.isArray(items) ? items.length : 0 });
    return;
  }
  for (const lang of LANGS) {
    const seen = new Map();
    items.forEach((item, index) => {
      const raw = localized(item?.[field] ?? item, lang);
      if (!raw.trim()) return;
      const key = normalize(raw);
      if (!key) return;
      if (seen.has(key)) add("error", `${code}_duplicate_${lang}`, file, trace, { firstIndex: seen.get(key), secondIndex: index, text: raw });
      else seen.set(key, index);
    });
  }
}

function auditQuestion(question, file, trace) {
  const options = Array.isArray(question.choices) ? question.choices : Array.isArray(question.options) ? question.options : null;
  if (!options) return;
  stats.questions++;
  if (options.length < 2) add("error", "question_too_few_options", file, trace, { optionCount: options.length });

  const ids = options.map(optionId);
  const idSet = new Set();
  ids.forEach((id, index) => {
    if (!id.trim()) add("error", "question_empty_option_id", file, trace, { index });
    if (idSet.has(id)) add("error", "question_duplicate_option_id", file, trace, { id, index });
    idSet.add(id);
  });

  for (const lang of LANGS) {
    const present = options.map((option) => optionText(option, lang));
    if (!present.some((text) => text.trim())) {
      if (lang === "ar") stats.arabicFallbackFields += options.length;
      continue;
    }
    const seen = new Map();
    present.forEach((raw, index) => {
      const key = normalize(raw);
      if (!key) {
        add("error", `question_empty_option_${lang}`, file, trace, { id: ids[index], index });
        return;
      }
      if (seen.has(key)) {
        add("error", `question_duplicate_option_${lang}`, file, trace, {
          firstId: ids[seen.get(key)], secondId: ids[index], firstIndex: seen.get(key), secondIndex: index, text: raw,
        });
      } else seen.set(key, index);
    });
  }

  const answerValues = [];
  if ("correctChoiceIds" in question) answerValues.push(...parseAnswerIds(question.correctChoiceIds));
  if ("correctAnswers" in question) answerValues.push(...parseAnswerIds(question.correctAnswers));
  if ("correctAnswer" in question) answerValues.push(...parseAnswerIds(question.correctAnswer));
  if ("correctId" in question) answerValues.push(...parseAnswerIds(question.correctId));
  if ("answer" in question && typeof question.answer !== "object") answerValues.push(...parseAnswerIds(question.answer));
  options.forEach((option, index) => {
    if (option && typeof option === "object" && (option.correct === true || option.isCorrect === true)) {
      answerValues.push(ids[index]);
    }
  });
  const uniqueAnswers = [...new Set(answerValues)];
  if (!uniqueAnswers.length && question.serverValidated !== true && question.serverCorrectionRequired !== true) {
    add("error", "question_missing_correct_answer", file, trace);
  }
  if (answerValues.length !== uniqueAnswers.length) add("error", "question_duplicate_correct_id", file, trace, { answerValues });
  for (const id of uniqueAnswers) {
    if (!idSet.has(id)) add("error", "question_invalid_correct_id", file, trace, { id, optionIds: ids });
  }

  if (uniqueAnswers.length) {
    for (const lang of LANGS) {
      const correctLabels = uniqueAnswers.map((id) => optionText(options[ids.indexOf(id)], lang)).filter(Boolean).map(normalize);
      for (const label of correctLabels) {
        const matchingIds = options.flatMap((option, index) => normalize(optionText(option, lang)) === label ? [ids[index]] : []);
        if (matchingIds.length > 1) add("error", `question_ambiguous_correct_label_${lang}`, file, trace, { correctIds: uniqueAnswers, matchingIds, text: optionText(options[ids.indexOf(matchingIds[0])], lang) });
      }
    }
  }
}

function auditFlipCards(block, file, trace) {
  stats.flipCards++;
  const cards = block.cards;
  if (!Array.isArray(cards) || cards.length === 0) {
    add("error", "flip_cards_empty", file, trace);
    return;
  }
  for (const lang of LANGS) {
    const hasLanguage = cards.some((card) => localized(card?.front, lang).trim() || localized(card?.back, lang).trim());
    if (!hasLanguage) {
      if (lang === "ar") stats.arabicFallbackFields += cards.length * 2;
      continue;
    }
    const seenFront = new Map();
    cards.forEach((card, index) => {
      const front = localized(card?.front, lang).trim();
      const back = localized(card?.back, lang).trim();
      if (!front) add("error", `flip_card_missing_front_${lang}`, file, trace, { index });
      if (!back) add("error", `flip_card_missing_back_${lang}`, file, trace, { index });
      if (lang === "en" && back.length === 300 && !/[.!?…:)\]}`'”»]\s*$/u.test(back)) {
        add("error", "flip_card_hard_limit_truncation", file, trace, { index, text: back.slice(-80) });
      }
      if (/Reveal model answer|Skip for now|Afficher la réponse du modèle|Passer pour l'instant/iu.test(back)) {
        add("error", `flip_card_ui_residue_${lang}`, file, trace, { index, text: back });
      }
      if (
        lang === "en"
        && front.split(/\s+/u).length >= 4
        && !/[.!?…:)\]}`'”»]$/u.test(front)
        && /^[a-z]/u.test(back)
        && normalize(front).split(" ")[0] !== normalize(back).split(" ")[0]
      ) {
        add("error", "flip_card_split_sentence", file, trace, { index, front, back: back.slice(0, 120) });
      }
      if (front && back && normalize(front) === normalize(back)) add("error", `flip_card_same_front_back_${lang}`, file, trace, { index, text: front });
      if (back && normalize(back).split(" ").length < 3) add("warn", `flip_card_back_too_short_${lang}`, file, trace, { index, text: back });
      if (back && /(?:\b(?:and|or|with|to|the|a|an|de|du|des|et|ou|avec|la|le|un|une)\s*|[,;])$/iu.test(back)) {
        add("warn", `flip_card_back_maybe_truncated_${lang}`, file, trace, { index, text: back.slice(-120) });
      }
      const key = normalize(front);
      if (key) {
        if (seenFront.has(key)) add("error", `flip_card_duplicate_front_${lang}`, file, trace, { firstIndex: seenFront.get(key), secondIndex: index, text: front });
        else seenFront.set(key, index);
      }
    });
  }
}

function auditInteraction(block, file, trace) {
  const type = block.type;
  if (!INTERACTION_TYPES.has(type)) return;
  stats.interactions++;
  if (type === "flip_cards") return auditFlipCards(block, file, trace);
  if (type === "single_choice_exercise" || type === "multi_choice_exercise" || type === "knowledge_check") return auditQuestion(block, file, trace);
  if (type === "bucket_sort") {
    const buckets = Array.isArray(block.buckets) ? block.buckets : [];
    const cards = Array.isArray(block.cards) ? block.cards : [];
    auditLocalizedArray(buckets, "label", file, trace, "bucket", { minimum: 2 });
    auditLocalizedArray(cards, "text", file, trace, "bucket_card", { minimum: 2 });
    const bucketIds = buckets.map((x, i) => optionId(x, i));
    const bucketSet = new Set(bucketIds);
    if (bucketIds.length !== bucketSet.size) add("error", "bucket_duplicate_id", file, trace, { bucketIds });
    const cardIds = cards.map((x, i) => optionId(x, i));
    if (cardIds.length !== new Set(cardIds).size) add("error", "bucket_card_duplicate_id", file, trace, { cardIds });
    cards.forEach((card, index) => { if (!bucketSet.has(String(card.correctBucket ?? ""))) add("error", "bucket_card_invalid_target", file, trace, { index, target: card.correctBucket, bucketIds }); });
    return;
  }
  if (type === "matching") {
    const pairs = Array.isArray(block.pairs) ? block.pairs : [];
    if (pairs.length < 2) add("error", "matching_too_few_pairs", file, trace, { count: pairs.length });
    auditLocalizedArray(pairs, "left", file, trace, "matching_left", { minimum: 2 });
    for (const lang of ["en", "fr"]) {
      pairs.forEach((pair, index) => {
        if (!localized(pair?.right, lang).trim()) add("error", `matching_missing_right_${lang}`, file, trace, { index });
      });
    }
    pairs.forEach((pair) => {
      if (!localized(pair?.left, "ar").trim()) stats.arabicFallbackFields++;
      if (!localized(pair?.right, "ar").trim()) stats.arabicFallbackFields++;
    });
    for (const lang of LANGS) {
      const labels = pairs.map((pair) => normalize(localized(pair?.right, lang))).filter(Boolean);
      const reused = labels.length - new Set(labels).size;
      if (reused > 0) add("info", `matching_shared_category_${lang}`, file, trace, { reused, pairCount: pairs.length, categoryCount: new Set(labels).size });
    }
    return;
  }
  if (type === "fill_blank") {
    const blanks = Array.isArray(block.blanks) ? block.blanks : [];
    if (!blanks.length) add("error", "fill_blank_missing_answers", file, trace);
    const ids = blanks.map((x, i) => optionId(x, i));
    if (ids.length !== new Set(ids).size) add("error", "fill_blank_duplicate_id", file, trace, { ids });
    blanks.forEach((blank, index) => { if (!String(blank.answer ?? "").trim()) add("error", "fill_blank_empty_answer", file, trace, { index }); });
    const template = anyText(block.template);
    const placeholders = [...template.matchAll(/\{\{blank(?::[^}]*)?\}\}/g)].length;
    if (placeholders !== blanks.length) add("error", "fill_blank_placeholder_mismatch", file, trace, { placeholders, answers: blanks.length });
    return;
  }
  if (type === "ordering") {
    const items = Array.isArray(block.items) ? block.items : [];
    auditLocalizedArray(items, "text", file, trace, "ordering_item", { minimum: 2 });
    const ids = items.map((x, i) => optionId(x, i));
    if (ids.length !== new Set(ids).size) add("error", "ordering_duplicate_id", file, trace, { ids });
    return;
  }
  if (type === "terminal_sim") {
    const steps = Array.isArray(block.steps) ? block.steps : [];
    if (!steps.length) add("error", "terminal_missing_steps", file, trace);
    steps.forEach((step, index) => { if (!String(step.command ?? "").trim()) add("error", "terminal_empty_command", file, trace, { index }); });
    return;
  }
  if (type === "code_repl") {
    if (!anyText(block.instructions).trim()) add("error", "code_repl_missing_instructions", file, trace);
  }
}

function scan(node, file, trace = "$") {
  if (Array.isArray(node)) {
    node.forEach((item, index) => scan(item, file, `${trace}[${index}]`));
    return;
  }
  if (!node || typeof node !== "object") return;
  const interactionQuestion = typeof node.type === "string" && ["single_choice_exercise", "multi_choice_exercise", "knowledge_check"].includes(node.type);
  if (typeof node.type === "string") auditInteraction(node, file, trace);
  const hasQuestion = "question" in node || "prompt" in node;
  if (!interactionQuestion && hasQuestion && (Array.isArray(node.choices) || Array.isArray(node.options))) auditQuestion(node, file, trace);
  Object.entries(node).forEach(([key, value]) => scan(value, file, `${trace}.${key}`));
}

const fixtureArg = process.argv.find((arg) => arg.startsWith("--fixture="));
const files = fixtureArg
  ? [path.resolve(fixtureArg.slice("--fixture=".length))]
  : [
      ...fs.readdirSync(courseDir).filter((name) => name.endsWith(".json")).sort().map((name) => path.join(courseDir, name)),
      ...extraJsonFiles,
    ];
for (const filename of files) {
  stats.files++;
  const relative = path.relative(root, filename);
  let data;
  try { data = JSON.parse(fs.readFileSync(filename, "utf8")); }
  catch (error) { add("error", "invalid_json", relative, "$", { message: error.message }); continue; }
  scan(data, relative);
}

const summary = {
  ...stats,
  errors: findings.filter((x) => x.level === "error").length,
  warnings: findings.filter((x) => x.level === "warn").length,
  byCode: Object.entries(findings.reduce((acc, x) => { acc[x.code] = (acc[x.code] || 0) + 1; return acc; }, {})).sort((a,b)=>b[1]-a[1]).map(([code,count])=>({code,count})),
};
const report = { generatedAt: new Date().toISOString(), summary, findings };
const outputArg = process.argv.find((arg) => arg.startsWith("--output="));
if (outputArg) fs.writeFileSync(path.resolve(outputArg.slice(9)), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));
if (process.argv.includes("--strict") && summary.errors > 0) process.exit(1);
