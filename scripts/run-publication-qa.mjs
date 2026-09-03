import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const reportDir = resolve(root, "docs");
const reportPath = resolve(reportDir, "publication_qa_report.json");
const qaEmail = process.env.QA_EMAIL || process.env.DEMO_EMAIL;
const qaPassword = process.env.QA_PASSWORD || process.env.DEMO_PASSWORD;
const qaBaseUrl = process.env.BLOCK_QA_URL || "http://127.0.0.1:3000";

const stages = [
  { name: "typescript", command: ["pnpm", ["check"]] },
  { name: "course_validation", command: ["pnpm", ["validate-courses"]] },
  { name: "unit_tests", command: ["pnpm", ["vitest", "run"]] },
  { name: "public_training_seo", command: ["node", ["scripts/check-public-training-themes-browser.mjs"]], env: { ...process.env, PUBLIC_TRAINING_THEMES_QA_URL: qaBaseUrl } },
  { name: "social_share_metadata", command: ["node", ["scripts/check-social-share-metadata.mjs"]], env: { ...process.env, SOCIAL_SHARE_QA_URL: qaBaseUrl } },
  { name: "interaction_audit", command: ["pnpm", ["audit-interactions"]] },
];

if (!qaEmail || !qaPassword) {
  stages.push({ name: "block_qa_desktop", command: null });
  stages.push({ name: "block_qa_mobile", command: null });
} else {
  const qaEnv = {
    ...process.env,
    QA_EMAIL: qaEmail,
    QA_PASSWORD: qaPassword,
    BLOCK_QA_URL: qaBaseUrl,
    BLOCK_QA_MAX_SAMPLES: process.env.BLOCK_QA_MAX_SAMPLES || "24",
  };
  stages.push({ name: "block_qa_desktop", command: ["pnpm", ["check:block-qa"]], env: qaEnv });
  stages.push({ name: "block_qa_mobile", command: ["pnpm", ["check:block-qa", "--mobile"]], env: qaEnv });
}

const results = [];
for (const stage of stages) {
  if (!stage.command) {
    results.push({ name: stage.name, status: "blocked", reason: "QA_EMAIL et QA_PASSWORD sont requis pour contrôler les blocs dans le navigateur." });
    continue;
  }

  const [binary, args] = stage.command;
  const execution = spawnSync(binary, args, {
    cwd: root,
    env: stage.env || process.env,
    encoding: "utf8",
    stdio: "pipe",
  });
  results.push({
    name: stage.name,
    status: execution.status === 0 ? "passed" : "failed",
    exitCode: execution.status,
    outputTail: `${execution.stdout || ""}${execution.stderr || ""}`.slice(-1600),
  });
}

const failed = results.filter((result) => result.status !== "passed");
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl: qaBaseUrl,
  passed: failed.length === 0,
  results,
};

if (!existsSync(reportDir)) mkdirSync(reportDir, { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.table(results.map(({ name, status, exitCode, reason }) => ({ name, status, exitCode: exitCode ?? "", reason: reason ?? "" })));
if (failed.length) {
  console.error(`Publication QA bloquée : ${failed.map((result) => result.name).join(", ")}. Rapport : ${reportPath}`);
  process.exitCode = 1;
}
