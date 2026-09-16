import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const defaultBankPath = path.join(root, "server/data/mockExamQuestions.json");
const defaultCandidatePath = "/home/ubuntu/anthropic-mock-exam-generation/anthropic-mock-exam-questions.json";
const targetCounts = {
  claude_certified_architect_foundations: 330,
  claude_certified_associate_foundations: 330,
  claude_certified_developer_foundations: 300,
  claude_certified_architect_professional: 315,
};

function parseArgs(argv) {
  const args = { bank: defaultBankPath, candidate: defaultCandidatePath, dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === "--bank") args.bank = argv[++index];
    else if (item === "--candidate") args.candidate = argv[++index];
    else if (item === "--dry-run") args.dryRun = true;
    else if (item === "--help") args.help = true;
    else throw new Error(`Argument inconnu : ${item}`);
  }
  return args;
}

function localized(value, locale) {
  if (typeof value === "string") return value;
  return value?.[locale] || "";
}

function validateCandidate(questions) {
  const ids = new Set();
  for (const question of questions) {
    if (!targetCounts[question.certificationId]) throw new Error(`Certification Anthropic inattendue : ${question.certificationId}`);
    if (ids.has(question.id)) throw new Error(`Identifiant dupliqué : ${question.id}`);
    ids.add(question.id);
    if (question.choices?.length !== 4 || question.correctChoiceIds?.length !== 1) throw new Error(`${question.id} ne respecte pas le format quatre choix / une réponse.`);
    if (!localized(question.question, "en") || !localized(question.question, "fr")) throw new Error(`${question.id} n’est pas bilingue.`);
    for (const choice of question.choices) {
      if (!localized(choice.text, "en") || !localized(choice.text, "fr") || !localized(choice.rationale, "en") || !localized(choice.rationale, "fr")) throw new Error(`${question.id}:${choice.id} est incomplet.`);
      if (choice.rationaleProvenance?.model !== "claude-sonnet-4-6") throw new Error(`${question.id}:${choice.id} ne porte pas la provenance Claude Sonnet.`);
    }
  }
  for (const [certificationId, expected] of Object.entries(targetCounts)) {
    const count = questions.filter((question) => question.certificationId === certificationId).length;
    if (count !== expected) throw new Error(`${certificationId} : ${count} questions au lieu de ${expected}.`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log("Usage: node scripts/apply_anthropic_mock_exam_banks.mjs [--candidate FILE] [--bank FILE] [--dry-run]");
    return;
  }
  const [current, candidate] = await Promise.all([
    fs.readFile(args.bank, "utf8").then(JSON.parse),
    fs.readFile(args.candidate, "utf8").then(JSON.parse),
  ]);
  if (!Array.isArray(current) || !Array.isArray(candidate)) throw new Error("Les banques doivent être des tableaux JSON.");
  validateCandidate(candidate);
  const untouched = current.filter((question) => !targetCounts[question.certificationId]);
  const result = [...untouched, ...candidate];
  const summary = {
    target: args.bank,
    dryRun: args.dryRun,
    removedAnthropicQuestions: current.length - untouched.length,
    preservedOtherQuestions: untouched.length,
    insertedAnthropicQuestions: candidate.length,
    totalQuestions: result.length,
    targetCounts,
  };
  if (!args.dryRun) {
    const temporary = `${args.bank}.tmp`;
    await fs.writeFile(temporary, `${JSON.stringify(result, null, 2)}\n`, "utf8");
    await fs.rename(temporary, args.bank);
  }
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
