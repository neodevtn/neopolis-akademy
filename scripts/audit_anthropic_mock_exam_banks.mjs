import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import mysql from "mysql2/promise";

const root = process.cwd();
const samplePath = "/home/ubuntu/upload/deepseek_csv_20260915_98cf71.txt";
const bankPath = path.join(root, "server/data/mockExamQuestions.json");
const indexPath = path.join(root, "client/src/data/trainingIndex.json");
const outputPath = path.join(root, "docs/anthropic-mock-exam-audit.json");

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
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
      continue;
    }
    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function countBy(values) {
  return values.reduce((counts, value) => {
    const key = value || "(missing)";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function sortedCounts(values) {
  return Object.fromEntries(Object.entries(countBy(values)).sort(([left], [right]) => left.localeCompare(right)));
}

function localized(value, locale = "en") {
  if (typeof value === "string") return value.trim();
  return String(value?.[locale] || value?.en || value?.fr || "").trim();
}

function normalizedText(value) {
  return localized(value, "en").toLocaleLowerCase("en").replace(/\s+/g, " ").replace(/\(q\d+\)\s*/g, "").trim();
}

function getSampleSummary(rows) {
  const [header, ...entries] = rows;
  const questions = entries.filter((entry) => entry.length === header.length && entry.some((value) => value.trim()));
  const directUseEligible = questions.filter((entry) => {
    const choices = entry[3].split(" | ").filter(Boolean);
    const answers = entry[4].split(",").map((answer) => answer.trim()).filter(Boolean);
    return choices.length === 4 && answers.length === 1 && /^[A-D]$/.test(answers[0]);
  });
  const scenarioVignettes = questions.filter((entry) => entry[2].trim().length >= 120 && /^(an|a|your|you are|while|during)\b/i.test(entry[2].trim()));
  return {
    schema: header,
    questionCount: questions.length,
    certificationCounts: sortedCounts(questions.map((entry) => entry[0])),
    themeCounts: sortedCounts(questions.map((entry) => entry[1])),
    answerDistribution: sortedCounts(questions.map((entry) => entry[4])),
    questionLength: summarizeLengths(questions.map((entry) => entry[2])),
    optionCountDistribution: sortedCounts(questions.map((entry) => entry[3].split(" | ").filter(Boolean).map((option) => option.trim()).length)),
    directUseEligible: {
      questionCount: directUseEligible.length,
      certificationCounts: sortedCounts(directUseEligible.map((entry) => entry[0])),
      themeCounts: sortedCounts(directUseEligible.map((entry) => entry[1])),
    },
    rowsRequiringFormatAdaptation: questions.length - directUseEligible.length,
    scenarioVignetteCount: scenarioVignettes.length,
    completeRows: questions.filter((entry) => entry.every((value) => value.trim().length > 0)).length,
  };
}

function summarizeLengths(values) {
  const lengths = values.map((value) => value.trim().length).filter(Boolean).sort((left, right) => left - right);
  if (!lengths.length) return { min: 0, median: 0, max: 0, mean: 0 };
  const mean = lengths.reduce((sum, length) => sum + length, 0) / lengths.length;
  return {
    min: lengths[0],
    median: lengths[Math.floor(lengths.length / 2)],
    max: lengths[lengths.length - 1],
    mean: Number(mean.toFixed(1)),
  };
}

function getBankSummary(questions, certificationId) {
  const scoped = questions.filter((question) => question.certificationId === certificationId);
  const texts = scoped.map((question) => normalizedText(question.question));
  const duplicateCounts = countBy(texts);
  const exactDuplicateQuestionCount = Object.values(duplicateCounts).reduce((total, count) => total + (count > 1 ? count - 1 : 0), 0);
  return {
    totalQuestions: scoped.length,
    domains: sortedCounts(scoped.map((question) => localized(question.domain))),
    subdomains: sortedCounts(scoped.map((question) => question.subdomain)),
    objectives: sortedCounts(scoped.map((question) => question.objective)),
    difficulties: sortedCounts(scoped.map((question) => question.difficulty)),
    scenarioFamilies: sortedCounts(scoped.map((question) => question.scenarioFamily)),
    scenarioQuestions: scoped.filter((question) => Boolean(question.scenarioFamily)).length,
    correctChoiceDistribution: sortedCounts(scoped.flatMap((question) => question.correctChoiceIds || [])),
    choiceCountDistribution: sortedCounts(scoped.map((question) => question.choices?.length || 0)),
    bilingualQuestionCount: scoped.filter((question) => localized(question.question, "en") && localized(question.question, "fr")).length,
    bilingualChoicesCount: scoped.filter((question) => (question.choices || []).every((choice) => localized(choice.text, "en") && localized(choice.text, "fr"))).length,
    fourChoiceOneKeyCount: scoped.filter((question) => question.choices?.length === 4 && question.correctChoiceIds?.length === 1).length,
    choiceRationaleCoverageCount: scoped.filter((question) => (question.choices || []).every((choice) => localized(choice.rationale, "en") && localized(choice.rationale, "fr"))).length,
    questionLength: summarizeLengths(scoped.map((question) => localized(question.question, "en"))),
    sourcePedagogique: sortedCounts(scoped.map((question) => question.sourcePedagogique)),
    versions: sortedCounts(scoped.map((question) => question.version)),
    provenanceModels: sortedCounts(scoped.flatMap((question) => (question.choices || []).map((choice) => choice.rationaleProvenance?.model))),
    exactDuplicateQuestionCount,
  };
}

async function getDatabaseExamSummary() {
  if (!process.env.DATABASE_URL) return { status: "not_available", exams: [] };
  let connection;
  try {
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows] = await connection.query(
      "SELECT certificationId, JSON_LENGTH(questions) AS questionCount, JSON_EXTRACT(configuration, '$.totalQuestions') AS configuredQuestionCount, JSON_EXTRACT(configuration, '$.isPublished') AS isPublished, updatedAt FROM certification_exams WHERE certificationId LIKE 'claude_%' ORDER BY certificationId",
    );
    return {
      status: "available",
      exams: rows.map((row) => ({
        certificationId: row.certificationId,
        questionCount: Number(row.questionCount || 0),
        configuredQuestionCount: row.configuredQuestionCount === null ? null : Number(row.configuredQuestionCount),
        isPublished: row.isPublished === null ? null : Boolean(Number(row.isPublished)),
        updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt || ""),
      })),
    };
  } catch (error) {
    return { status: "unavailable", error: error instanceof Error ? error.message.replace(/:\/\/[^\s@]+@/, "://[redacted]@") : "unknown", exams: [] };
  } finally {
    await connection?.end();
  }
}

const [sampleText, rawBank, rawIndex] = await Promise.all([
  fs.readFile(samplePath, "utf8"),
  fs.readFile(bankPath, "utf8"),
  fs.readFile(indexPath, "utf8"),
]);
const sampleRows = parseCsv(sampleText);
const sample = getSampleSummary(sampleRows);
const questions = JSON.parse(rawBank);
const index = JSON.parse(rawIndex);
const certificationIds = [...new Set(questions.map((question) => question.certificationId))].filter((id) => id.startsWith("claude_")).sort();
const database = await getDatabaseExamSummary();
const output = {
  generatedAt: new Date().toISOString(),
  scope: {
    sampleClassification: "private_user_provided_training_sample",
    sampleContentCopied: false,
    questionBank: "server/data/mockExamQuestions.json",
    sourceResolution: "Rows persisted in certification_exams replace static questions for their certificationId.",
  },
  sample,
  certifications: Object.fromEntries(certificationIds.map((certificationId) => [
    certificationId,
    {
      configuredExam: index.examConfig?.[certificationId] || null,
      bank: getBankSummary(questions, certificationId),
    },
  ])),
  database,
};
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ outputPath, sampleQuestionCount: sample.questionCount, certifications: certificationIds, databaseStatus: database.status }, null, 2));
