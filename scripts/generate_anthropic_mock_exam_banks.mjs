import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const defaultPlanPath = path.join(root, "scripts/data/anthropicMockExamGenerationPlan.json");
const defaultSamplePath = "/home/ubuntu/upload/deepseek_csv_20260915_98cf71.txt";
const defaultCoursesDir = path.join(root, "client/public/data/courses");
const defaultWorkDir = "/home/ubuntu/anthropic-mock-exam-generation";
const generatedAt = new Date().toISOString();
const model = "claude-sonnet-4-6";

function readArgs(argv) {
  const args = { mode: "all", plan: defaultPlanPath, sample: defaultSamplePath, coursesDir: defaultCoursesDir, workDir: defaultWorkDir, concurrency: 3, batchSize: 10 };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === "--mode") args.mode = argv[++index];
    else if (item === "--plan") args.plan = argv[++index];
    else if (item === "--sample") args.sample = argv[++index];
    else if (item === "--courses-dir") args.coursesDir = argv[++index];
    else if (item === "--work-dir") args.workDir = argv[++index];
    else if (item === "--output") args.output = argv[++index];
    else if (item === "--certification") args.certification = argv[++index];
    else if (item === "--concurrency") args.concurrency = Math.max(1, Math.min(5, Number(argv[++index]) || 3));
    else if (item === "--batch-size") args.batchSize = Math.max(1, Math.min(10, Number(argv[++index]) || 10));
    else if (item === "--dry-run") args.dryRun = true;
    else if (item === "--help") args.help = true;
    else throw new Error(`Argument inconnu : ${item}`);
  }
  return args;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (character === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else cell += character;
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n") {
      row.push(cell.replace(/\r$/, ""));
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += character;
  }
  if (cell || row.length) rows.push([...row, cell.replace(/\r$/, "")]);
  return rows;
}

function certificationFromSample(value) {
  if (value.includes("(CCAR-F)")) return "claude_certified_architect_foundations";
  if (value.includes("(CCAO-F)")) return "claude_certified_associate_foundations";
  if (value.includes("(CCDV-F)")) return "claude_certified_developer_foundations";
  return null;
}

function parseSampleDomain(theme) {
  return theme.match(/^Domain\s+\d+:\s+(.+?)\s+\/\s+Subdomain\s+\d+(?:\.\d+)?:\s+(.+)$/i)?.slice(1) || [null, null];
}

function parseOptions(value) {
  return value.split(" | ").map((entry) => {
    const match = entry.trim().match(/^([A-F])\.\s+([\s\S]+)$/);
    return match ? { id: match[1].toLowerCase(), text: match[2].trim() } : null;
  });
}

function isEligibleSampleRow(entry) {
  const options = parseOptions(entry.options);
  const answers = entry.answer.split(",").map((value) => value.trim()).filter(Boolean);
  return options.length === 4 && options.every(Boolean) && answers.length === 1 && /^[A-D]$/.test(answers[0]);
}

function normalizedText(value) {
  return String(value || "")
    .toLocaleLowerCase("en")
    .replace(/\(q\d+\)/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(values, maxCharacters) {
  const output = [];
  const seen = new Set();
  let total = 0;
  for (const raw of values) {
    const value = String(raw || "").replace(/\s+/g, " ").trim();
    const key = normalizedText(value);
    if (value.length < 16 || seen.has(key)) continue;
    if (total + value.length > maxCharacters) break;
    seen.add(key);
    output.push(value);
    total += value.length + 1;
  }
  return output;
}

function collectEnglishText(value, entries) {
  if (typeof value === "string") {
    entries.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => collectEnglishText(entry, entries));
    return;
  }
  if (!value || typeof value !== "object") return;
  if (typeof value.en === "string") {
    entries.push(value.en);
    return;
  }
  Object.values(value).forEach((entry) => collectEnglishText(entry, entries));
}

async function loadCourseContext(courseId, coursesDir) {
  const raw = JSON.parse(await fs.readFile(path.join(coursesDir, `${courseId}.json`), "utf8"));
  const entries = [];
  collectEnglishText(raw, entries);
  return uniqueStrings(entries, 18000).join("\n");
}

async function loadContexts(plan, coursesDir) {
  const ids = new Set(Object.values(plan.certifications).flatMap((certification) => certification.courseIds));
  const contexts = await Promise.all(Array.from(ids).map(async (courseId) => [courseId, await loadCourseContext(courseId, coursesDir)]));
  return new Map(contexts);
}

function responseSchema() {
  return {
    type: "json_schema",
    json_schema: {
      name: "anthropic_mock_exam_batch",
      strict: true,
      schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            minItems: 1,
            maxItems: 10,
            items: {
              type: "object",
              properties: {
                subdomain: { type: "string", minLength: 4 },
                objective: { type: "string", minLength: 12 },
                difficulty: { type: "string", enum: ["foundational", "intermediate", "advanced"] },
                scenarioTitle: { type: "string", minLength: 4 },
                question: {
                  type: "object",
                  properties: { en: { type: "string", minLength: 80 }, fr: { type: "string", minLength: 80 } },
                  required: ["en", "fr"],
                  additionalProperties: false,
                },
                choices: {
                  type: "array",
                  minItems: 4,
                  maxItems: 4,
                  items: {
                    type: "object",
                    properties: {
                      text: {
                        type: "object",
                        properties: { en: { type: "string", minLength: 3 }, fr: { type: "string", minLength: 3 } },
                        required: ["en", "fr"],
                        additionalProperties: false,
                      },
                      rationale: {
                        type: "object",
                        properties: { en: { type: "string", minLength: 25 }, fr: { type: "string", minLength: 25 } },
                        required: ["en", "fr"],
                        additionalProperties: false,
                      },
                    },
                    required: ["text", "rationale"],
                    additionalProperties: false,
                  },
                },
                correctIndex: { type: "integer", minimum: 0, maximum: 3 },
                explanation: {
                  type: "object",
                  properties: { en: { type: "string", minLength: 60 }, fr: { type: "string", minLength: 60 } },
                  required: ["en", "fr"],
                  additionalProperties: false,
                },
              },
              required: ["subdomain", "objective", "difficulty", "scenarioTitle", "question", "choices", "correctIndex", "explanation"],
              additionalProperties: false,
            },
          },
        },
        required: ["questions"],
        additionalProperties: false,
      },
    },
  };
}

function sampleEnrichmentSchema() {
  return {
    type: "json_schema",
    json_schema: {
      name: "anthropic_mock_exam_sample_enrichment",
      strict: true,
      schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            minItems: 1,
            maxItems: 10,
            items: {
              type: "object",
              properties: {
                sourceId: { type: "string", minLength: 4 },
                subdomain: { type: "string", minLength: 4 },
                objective: { type: "string", minLength: 12 },
                difficulty: { type: "string", enum: ["foundational", "intermediate", "advanced"] },
                questionFr: { type: "string", minLength: 80 },
                choicesFr: { type: "array", minItems: 4, maxItems: 4, items: { type: "string", minLength: 3 } },
                rationales: {
                  type: "array",
                  minItems: 4,
                  maxItems: 4,
                  items: {
                    type: "object",
                    properties: {
                      en: { type: "string", minLength: 25 },
                      fr: { type: "string", minLength: 25 },
                    },
                    required: ["en", "fr"],
                    additionalProperties: false,
                  },
                },
                explanation: {
                  type: "object",
                  properties: { en: { type: "string", minLength: 60 }, fr: { type: "string", minLength: 60 } },
                  required: ["en", "fr"],
                  additionalProperties: false,
                },
              },
              required: ["sourceId", "subdomain", "objective", "difficulty", "questionFr", "choicesFr", "rationales", "explanation"],
              additionalProperties: false,
            },
          },
        },
        required: ["questions"],
        additionalProperties: false,
      },
    },
  };
}

async function callClaude(messages, schema) {
  const endpoint = process.env.BUILT_IN_FORGE_API_URL;
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
  if (!endpoint || !apiKey) throw new Error("Forge Claude indisponible : variables d’environnement non configurées.");
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 300000);
      let response;
      try {
        response = await fetch(`${endpoint}/v1/chat/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages,
            response_format: schema,
            max_tokens: 26000,
            thinking: { type: "enabled", budget_tokens: 1024 },
          }),
        });
      } finally {
        clearTimeout(timeout);
      }
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Claude Sonnet a refusé le lot (${response.status}) : ${detail.slice(0, 400)}`);
      }
      const payload = await response.json();
      const text = payload?.choices?.[0]?.message?.content;
      if (typeof text !== "string") throw new Error("Claude Sonnet n’a pas renvoyé de contenu JSON pour ce lot.");
      return JSON.parse(text);
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("La génération Claude Sonnet a échoué.");
}

function sourceTag(certificationId) {
  return certificationId.replace("claude_certified_", "").replaceAll("_", "-");
}

function jaccard(left, right) {
  const a = new Set(normalizedText(left).split(" ").filter((token) => token.length >= 4));
  const b = new Set(normalizedText(right).split(" ").filter((token) => token.length >= 4));
  const intersection = Array.from(a).filter((token) => b.has(token)).length;
  return intersection / Math.max(1, a.size + b.size - intersection);
}

function longestCommonTokenRun(left, right) {
  const source = normalizedText(left).split(" ").filter(Boolean);
  const candidate = normalizedText(right).split(" ").filter(Boolean);
  let longest = 0;
  for (let leftIndex = 0; leftIndex < source.length; leftIndex += 1) {
    for (let rightIndex = 0; rightIndex < candidate.length; rightIndex += 1) {
      let run = 0;
      while (source[leftIndex + run] && source[leftIndex + run] === candidate[rightIndex + run]) run += 1;
      longest = Math.max(longest, run);
    }
  }
  return longest;
}

function conflictsWithExistingQuestion(candidate, existing) {
  const normalizedCandidate = normalizedText(candidate);
  const normalizedExisting = normalizedText(existing);
  return normalizedCandidate === normalizedExisting
    || (jaccard(candidate, existing) >= 0.65 && longestCommonTokenRun(candidate, existing) >= 18);
}

function validateQuestion(question, { generated, prohibitedTexts }) {
  const issues = [];
  const questionEn = question.question?.en || "";
  const questionFr = question.question?.fr || "";
  if (!questionEn || !questionFr) issues.push("énoncé non bilingue");
  if (generated && questionEn.length < 140) issues.push("vignette générée trop courte");
  if (!Array.isArray(question.choices) || question.choices.length !== 4) issues.push("nombre de choix différent de quatre");
  if (!Array.isArray(question.correctChoiceIds) || question.correctChoiceIds.length !== 1) issues.push("nombre de bonnes réponses différent de un");
  const choiceTexts = (question.choices || []).map((choice) => normalizedText(choice.text?.en));
  if (new Set(choiceTexts).size !== 4 || choiceTexts.some((value) => !value)) issues.push("choix dupliqués ou incomplets");
  for (const choice of question.choices || []) {
    if (!choice.text?.en || !choice.text?.fr || !choice.rationale?.en || !choice.rationale?.fr) issues.push(`choix ${choice.id} incomplet`);
  }
  const content = JSON.stringify(question).toLocaleLowerCase("en");
  if (/official exam question|real exam question|leaked exam question/.test(content)) issues.push("affirmation interdite de statut officiel");
  if (prohibitedTexts.some((text) => normalizedText(text) === normalizedText(questionEn))) issues.push("énoncé dupliqué");
  if (generated && prohibitedTexts.some((text) => conflictsWithExistingQuestion(questionEn, text))) issues.push("chevauchement substantiel avec un exemple ou une question déjà retenue");
  return issues;
}

function createGeneratedQuestion(raw, job, ordinal) {
  const choiceIds = ["a", "b", "c", "d"];
  const question = {
    id: `neo_${sourceTag(job.certificationId)}_${crypto.createHash("sha256").update(job.key).digest("hex").slice(0, 10)}_${String(ordinal).padStart(2, "0")}`,
    certificationId: job.certificationId,
    domain: job.domain,
    subdomain: raw.subdomain,
    objective: raw.objective,
    difficulty: raw.difficulty,
    ...(job.scenarioFamily ? { scenarioFamily: job.scenarioFamily, scenarioTitle: { en: raw.scenarioTitle, fr: raw.scenarioTitle } } : {}),
    competency: [job.domain],
    sourcePedagogique: `Local Anthropic course context: ${job.courseIds.join(", ")}`,
    sourceType: "claude-sonnet-original",
    version: "neopolis-original-2026-09-16",
    question: raw.question,
    choices: raw.choices.map((choice, index) => ({
      id: choiceIds[index],
      text: choice.text,
      rationale: choice.rationale,
      rationaleProvenance: { model, method: "claude_sonnet_exam_bank_generation", generatedAt },
    })),
    correctChoiceIds: [choiceIds[raw.correctIndex]],
    explanation: raw.explanation,
  };
  return question;
}

function createSampleQuestion(raw, source) {
  return {
    id: source.id,
    certificationId: source.certificationId,
    domain: source.domain,
    subdomain: raw.subdomain,
    objective: raw.objective,
    difficulty: raw.difficulty,
    competency: [source.domain],
    sourcePedagogique: "User-provided training sample mapped to local Anthropic course context",
    sourceType: "user-provided-mock-sample",
    version: "user-sample-2026-09-15",
    question: { en: source.question, fr: raw.questionFr },
    choices: source.choices.map((choice, index) => ({
      id: choice.id,
      text: { en: choice.text, fr: raw.choicesFr[index] },
      rationale: raw.rationales[index],
      rationaleProvenance: { model, method: "claude_sonnet_sample_translation_and_rationale", generatedAt },
    })),
    correctChoiceIds: [source.correctChoiceId],
    explanation: raw.explanation,
  };
}

function chunks(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

async function exists(filePath) {
  return fs.access(filePath).then(() => true).catch(() => false);
}

async function mapWithConcurrency(items, concurrency, handler) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const index = next;
      next += 1;
      if (index >= items.length) return;
      results[index] = await handler(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

function makePromptForGeneration(job) {
  const answerPositions = job.answerPositions.map((position) => ["A", "B", "C", "D"][position]).join(", ");
  return [
    {
      role: "system",
      content: "You are an assessment author for an internal learning platform. Create training questions, not official examination questions. Output only the requested JSON schema. Do not claim that any item is official, real, leaked, or copied. Use only supported facts in the supplied course context. Avoid memorization prompts and write clear business or engineering decision vignettes.",
    },
    {
      role: "user",
      content: `Create exactly ${job.count} fully original single-best-answer questions for ${job.examCode}.\n\nDomain: ${job.domain}\n${job.scenarioFamily ? `Scenario family: ${job.scenarioFamily}. Keep a coherent professional setting across this batch while making each decision distinct.` : "Create varied professional contexts; do not label questions as scenarios."}\n\nEach question must:\n- contain a concrete professional vignette of at least 140 English characters, with a decision, constraint, symptom, or trade-off;\n- have exactly four plausible answers, one best answer;\n- include rigorous choice-specific rationales in English and French for all four answers;\n- include an English and a French explanation that distinguish the best decision from the distractors;\n- name a concise internal subdomain and observable learning objective;\n- use a mix of foundational, intermediate, and advanced difficulty;\n- place the correct choices in this order for the batch: ${answerPositions};\n- avoid labels such as Q1, official exam, real exam, leaked question, certification answer, or answer key.\n\nStyle reference only: use detailed scenario stems, credible distractors, and a single decision rule. Do not reuse, paraphrase closely, or mention any sample question.${job.excludedStems?.length ? `\n\nDo not reuse the situation, decision or wording of these rejected stems:\n${job.excludedStems.map((stem, index) => `${index + 1}. ${stem}`).join("\n")}` : ""}\n\nLocal course context (the sole factual basis):\n${job.context}`,
    },
  ];
}

function makePromptForSampleEnrichment(items, context) {
  return [
    {
      role: "system",
      content: "You are translating and enriching user-provided internal training examples. Preserve each English question and English option text exactly as supplied; do not claim the examples are official. Output only the requested JSON schema.",
    },
    {
      role: "user",
      content: `For each supplied training example, produce a faithful French translation of the question and each option, a concise internal subdomain, an observable learning objective, a calibrated difficulty, four choice-specific rationales in English and French, and a detailed bilingual explanation. The English source text remains unchanged outside your output. Correctness is provided by the source and must not change. Use the course context only to ensure the rationales remain factually supported.\n\nExamples:\n${JSON.stringify(items)}\n\nLocal course context:\n${context}`,
    },
  ];
}

async function generateExactQuestionBatch(job) {
  const questions = [];
  for (let attempt = 1; attempt <= 3 && questions.length < job.count; attempt += 1) {
    const remaining = {
      ...job,
      count: job.count - questions.length,
      answerPositions: job.answerPositions.slice(questions.length),
    };
    const response = await callClaude(makePromptForGeneration(remaining), responseSchema());
    if (!Array.isArray(response.questions) || response.questions.length === 0 || response.questions.length > remaining.count) {
      throw new Error(`${job.key} : Claude Sonnet a fourni un volume de questions invalide.`);
    }
    questions.push(...response.questions);
  }
  if (questions.length !== job.count) throw new Error(`${job.key} : génération incomplète après trois tentatives (${questions.length}/${job.count}).`);
  return questions;
}

function makeJobs(plan, sampleQuestions, contexts, batchSize, certificationFilter) {
  const jobs = [];
  for (const [certificationId, certification] of Object.entries(plan.certifications)) {
    if (certificationFilter && certificationId !== certificationFilter) continue;
    const directCounts = sampleQuestions.filter((question) => question.certificationId === certificationId).reduce((counts, question) => {
      counts[question.domain] = (counts[question.domain] || 0) + 1;
      return counts;
    }, {});
    const directChoiceCounts = sampleQuestions.filter((question) => question.certificationId === certificationId).reduce((counts, question) => {
      const key = question.correctChoiceIds?.[0] || "";
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
    const targetChoiceCounts = ["a", "b", "c", "d"].reduce((counts, choiceId, index) => {
      counts[choiceId] = Math.floor(certification.targetTotal / 4) + (index < certification.targetTotal % 4 ? 1 : 0);
      return counts;
    }, {});
    const remainingChoiceCounts = ["a", "b", "c", "d"].reduce((counts, choiceId) => {
      const needed = targetChoiceCounts[choiceId] - (directChoiceCounts[choiceId] || 0);
      if (needed < 0) throw new Error(`Les exemples fournis surchargent la position ${choiceId.toUpperCase()} pour ${certificationId}.`);
      counts[choiceId] = needed;
      return counts;
    }, {});
    const answerPositions = [];
    while (Object.values(remainingChoiceCounts).some((count) => count > 0)) {
      for (const [position, choiceId] of ["a", "b", "c", "d"].entries()) {
        if (remainingChoiceCounts[choiceId] <= 0) continue;
        answerPositions.push(position);
        remainingChoiceCounts[choiceId] -= 1;
      }
    }
    let answerOffset = 0;
    const scenarioCounts = Object.fromEntries(Object.entries(certification.scenarioFamilies || {}).map(([family, value]) => [family, value.count]));
    for (const [domain, domainPlan] of Object.entries(certification.domains)) {
      const totalScenarioInDomain = Object.entries(certification.scenarioFamilies || {})
        .filter(([, scenario]) => scenario.domain === domain)
        .reduce((sum, [, scenario]) => sum + scenario.count, 0);
      const regularCount = domainPlan.target - (directCounts[domain] || 0) - totalScenarioInDomain;
      if (regularCount < 0) throw new Error(`Le plan surcharge le domaine ${certificationId}/${domain}.`);
      const regularBatches = chunks(Array.from({ length: regularCount }, (_, index) => index), batchSize);
      regularBatches.forEach((batch, batchIndex) => jobs.push({
        kind: "generated",
        key: `${certificationId}__${domain.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}__regular_${String(batchIndex + 1).padStart(2, "0")}`,
        certificationId,
        examCode: certification.examCode,
        domain,
        domainSlug: domain.replace(/[^a-z0-9]+/gi, "_").toLowerCase().replace(/^_|_$/g, ""),
        courseIds: domainPlan.courseIds,
        context: domainPlan.courseIds.map((courseId) => contexts.get(courseId)).join("\n\n"),
        count: batch.length,
        answerPositions: answerPositions.slice(answerOffset + batchIndex * batchSize, answerOffset + batchIndex * batchSize + batch.length),
      }));
      answerOffset += regularCount;
    }
    for (const [scenarioFamily, scenarioPlan] of Object.entries(certification.scenarioFamilies || {})) {
      const scenarioBatches = chunks(Array.from({ length: scenarioCounts[scenarioFamily] }, (_, index) => index), batchSize);
      scenarioBatches.forEach((batch, batchIndex) => jobs.push({
        kind: "generated",
        key: `${certificationId}__scenario_${scenarioFamily}_${String(batchIndex + 1).padStart(2, "0")}`,
        certificationId,
        examCode: certification.examCode,
        domain: scenarioPlan.domain,
        domainSlug: scenarioPlan.domain.replace(/[^a-z0-9]+/gi, "_").toLowerCase().replace(/^_|_$/g, ""),
        scenarioFamily,
        courseIds: scenarioPlan.courseIds,
        context: scenarioPlan.courseIds.map((courseId) => contexts.get(courseId)).join("\n\n"),
        count: batch.length,
        answerPositions: answerPositions.slice(answerOffset + batchIndex * batchSize, answerOffset + batchIndex * batchSize + batch.length),
      }));
    }
    answerOffset += Object.values(certification.scenarioFamilies || {}).reduce((sum, scenario) => sum + scenario.count, 0);
    if (answerOffset !== answerPositions.length) throw new Error(`Répartition des clés incomplète pour ${certificationId}.`);
  }
  return jobs;
}

async function main() {
  const args = readArgs(process.argv.slice(2));
  if (args.help) {
    console.log("Usage: node scripts/generate_anthropic_mock_exam_banks.mjs [--mode all|samples|generated] [--certification ID] [--output FILE] [--dry-run]");
    return;
  }
  if (!["all", "samples", "generated"].includes(args.mode)) throw new Error("--mode doit valoir all, samples ou generated.");
  const [rawPlan, sampleText] = await Promise.all([fs.readFile(args.plan, "utf8"), fs.readFile(args.sample, "utf8")]);
  const plan = JSON.parse(rawPlan);
  if (plan.model !== model) throw new Error("Le plan doit verrouiller claude-sonnet-4-6.");
  const rows = parseCsv(sampleText);
  const [header, ...data] = rows;
  if (header?.join("|") !== "Certification|Thème|Question|Options|Réponse correcte|Explication") throw new Error("Format de l’échantillon privé non reconnu.");
  const allSampleEntries = data.map((row, index) => {
    const [certificationName, theme, question, options, answer, explanation] = row;
    const certificationId = certificationFromSample(certificationName);
    const [domain, subdomain] = parseSampleDomain(theme);
    return { id: `sample_${String(index + 1).padStart(3, "0")}`, certificationId, certificationName, theme, domain, subdomain, question, options, answer, explanation, choices: parseOptions(options) };
  }).filter((entry) => entry.certificationId && entry.domain && plan.certifications[entry.certificationId]);
  const eligibleSamples = allSampleEntries.filter(isEligibleSampleRow).filter((entry) => !args.certification || entry.certificationId === args.certification).map((entry) => ({ ...entry, correctChoiceId: entry.answer.toLowerCase() }));
  const contexts = await loadContexts(plan, args.coursesDir);
  const sampleDir = path.join(args.workDir, "sample-enrichment");
  const batchDir = path.join(args.workDir, "generated-batches");
  await Promise.all([fs.mkdir(sampleDir, { recursive: true }), fs.mkdir(batchDir, { recursive: true })]);

  const preparedSamples = [];
  if (args.mode === "all" || args.mode === "samples") {
    const sampleBatches = chunks(eligibleSamples, args.batchSize);
    const sampleResults = await mapWithConcurrency(sampleBatches, args.concurrency, async (items, batchIndex) => {
      const key = `samples_${args.certification || "all"}_${String(batchIndex + 1).padStart(2, "0")}`;
      const filePath = path.join(sampleDir, `${key}.json`);
      if (await exists(filePath)) return JSON.parse(await fs.readFile(filePath, "utf8"));
      if (args.dryRun) return { key, questions: [] };
      const relevantContext = uniqueStrings(items.flatMap((item) => {
        const cert = plan.certifications[item.certificationId];
        const courses = cert.domains[item.domain]?.courseIds || cert.courseIds;
        return courses.map((courseId) => contexts.get(courseId));
      }), 30000).join("\n\n");
      const response = await callClaude(makePromptForSampleEnrichment(items.map((item) => ({
        sourceId: item.id,
        theme: item.theme,
        question: item.question,
        options: item.choices.map((choice) => ({ id: choice.id, text: choice.text })),
        correctChoiceId: item.correctChoiceId,
        suppliedExplanation: item.explanation,
      })), relevantContext), sampleEnrichmentSchema());
      if (!Array.isArray(response.questions) || response.questions.length !== items.length) throw new Error(`${key} : nombre d’exemples enrichis incorrect.`);
      const value = { key, questions: response.questions };
      await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
      return value;
    });
    const byId = new Map(sampleResults.flatMap((result) => result.questions).map((question) => [question.sourceId, question]));
    for (const sample of eligibleSamples) {
      const enriched = byId.get(sample.id);
      if (!enriched) continue;
      const question = createSampleQuestion(enriched, sample);
      const issues = validateQuestion(question, { generated: false, prohibitedTexts: [] });
      if (issues.length) throw new Error(`${question.id} : ${issues.join(", ")}`);
      preparedSamples.push(question);
    }
  }

  if (args.mode === "samples") {
    const output = args.output || path.join(args.workDir, "prepared-samples.json");
    await fs.writeFile(output, `${JSON.stringify(preparedSamples, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ mode: args.mode, model, sampleQuestions: preparedSamples.length, output }, null, 2));
    return;
  }

  const sourceSamples = args.mode === "generated"
    ? JSON.parse(await fs.readFile(args.output || path.join(args.workDir, "prepared-samples.json"), "utf8"))
    : preparedSamples;
  const jobs = makeJobs(plan, sourceSamples, contexts, args.batchSize, args.certification);
  if (args.dryRun) {
    console.log(JSON.stringify({ mode: args.mode, model, jobs: jobs.length, sampleQuestions: sourceSamples.length, jobsByCertification: Object.fromEntries(Object.entries(plan.certifications).map(([id]) => [id, jobs.filter((job) => job.certificationId === id).length])) }, null, 2));
    return;
  }
  const rawResults = await mapWithConcurrency(jobs, args.concurrency, async (job) => {
    const filePath = path.join(batchDir, `${job.key}.json`);
    if (await exists(filePath)) return JSON.parse(await fs.readFile(filePath, "utf8"));
    const questions = await generateExactQuestionBatch(job);
    const value = { key: job.key, certificationId: job.certificationId, questions };
    await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    return value;
  });

  const prohibited = sourceSamples.map((question) => question.question.en);
  const allQuestions = [...sourceSamples];
  const ids = new Set(allQuestions.map((question) => question.id));
  const texts = allQuestions.map((question) => question.question.en);
  for (const job of jobs) {
    const result = rawResults.find((item) => item.key === job.key);
    for (let index = 0; index < result.questions.length; index += 1) {
      let rawQuestion = result.questions[index];
      let question = createGeneratedQuestion(rawQuestion, job, index + 1);
      let issues = validateQuestion(question, { generated: true, prohibitedTexts: texts });
      for (let attempt = 1; issues.length && attempt <= 3; attempt += 1) {
        const conflictingStem = texts.find((text) => conflictsWithExistingQuestion(question.question.en, text));
        const replacement = await generateExactQuestionBatch({
          ...job,
          key: `${job.key}__replacement_${String(index + 1).padStart(2, "0")}_${attempt}`,
          count: 1,
          answerPositions: [rawQuestion.correctIndex],
          excludedStems: uniqueStrings([question.question.en, conflictingStem], 6000),
        });
        rawQuestion = replacement[0];
        result.questions[index] = rawQuestion;
        question = createGeneratedQuestion(rawQuestion, job, index + 1);
        issues = validateQuestion(question, { generated: true, prohibitedTexts: texts });
      }
      if (issues.length) throw new Error(`${question.id} : ${issues.join(", ")}`);
      if (ids.has(question.id)) throw new Error(`Identifiant dupliqué : ${question.id}`);
      ids.add(question.id);
      texts.push(question.question.en);
      allQuestions.push(question);
    }
    await fs.writeFile(path.join(batchDir, `${job.key}.json`), `${JSON.stringify(result, null, 2)}\n`, "utf8");
  }
  for (const [certificationId, certification] of Object.entries(plan.certifications)) {
    if (args.certification && certificationId !== args.certification) continue;
    const scoped = allQuestions.filter((question) => question.certificationId === certificationId);
    if (scoped.length !== certification.targetTotal) throw new Error(`${certificationId} : ${scoped.length} questions générées, cible ${certification.targetTotal}.`);
    for (const [domain, domainPlan] of Object.entries(certification.domains)) {
      const count = scoped.filter((question) => question.domain === domain).length;
      if (count !== domainPlan.target) throw new Error(`${certificationId}/${domain} : ${count} questions, cible ${domainPlan.target}.`);
    }
    for (const [scenarioFamily, scenarioPlan] of Object.entries(certification.scenarioFamilies || {})) {
      const count = scoped.filter((question) => question.scenarioFamily === scenarioFamily).length;
      if (count !== scenarioPlan.count) throw new Error(`${certificationId}/${scenarioFamily} : ${count} questions de scénario, cible ${scenarioPlan.count}.`);
    }
    const keyCounts = scoped.reduce((counts, question) => {
      const key = question.correctChoiceIds[0];
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
    for (const choiceId of ["a", "b", "c", "d"]) {
      const share = (keyCounts[choiceId] || 0) / scoped.length;
      if (share < 0.18 || share > 0.32) throw new Error(`${certificationId} : distribution de réponses déséquilibrée pour ${choiceId.toUpperCase()} (${(share * 100).toFixed(1)} %).`);
    }
  }
  const output = args.output || path.join(args.workDir, "anthropic-mock-exam-questions.json");
  await fs.writeFile(output, `${JSON.stringify(allQuestions, null, 2)}\n`, "utf8");
  const checksum = crypto.createHash("sha256").update(JSON.stringify(allQuestions)).digest("hex");
  console.log(JSON.stringify({ mode: args.mode, model, output, checksum, questionCount: allQuestions.length, byCertification: Object.fromEntries(Object.entries(plan.certifications).filter(([id]) => !args.certification || id === args.certification).map(([id]) => [id, allQuestions.filter((question) => question.certificationId === id).length])) }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
