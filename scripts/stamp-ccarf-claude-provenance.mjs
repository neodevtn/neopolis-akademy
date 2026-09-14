import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const inputPath = resolve(root, "server/data/mockExamQuestions.json");
const reportPath = resolve(root, "docs/ccarf-claude-provenance.json");
const certificationId = "claude_certified_architect_foundations";
const model = "claude-sonnet-4-6";
const generatedAt = new Date().toISOString();
const questions = JSON.parse(await readFile(inputPath, "utf8"));
const targetQuestions = questions.filter((question) => question.certificationId === certificationId);
const missingRationales = [];

for (const question of targetQuestions) {
  for (const choice of question.choices) {
    if (!choice.rationale?.en || !choice.rationale?.fr) {
      missingRationales.push(`${question.id}:${choice.id}`);
      continue;
    }
    choice.rationaleProvenance = {
      model,
      method: "claude_authored_choice_rationale",
      generatedAt,
    };
  }
}

if (missingRationales.length) throw new Error(`Provenance refusée : rationales absentes pour ${missingRationales.join(", ")}`);

const choiceCount = targetQuestions.reduce((total, question) => total + question.choices.length, 0);
await writeFile(inputPath, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
await writeFile(reportPath, `${JSON.stringify({ generatedAt, certificationId, model, method: "claude_authored_choice_rationale", questions: targetQuestions.length, choices: choiceCount, missingRationales }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ certificationId, model, questions: targetQuestions.length, choices: choiceCount, reportPath }, null, 2));
