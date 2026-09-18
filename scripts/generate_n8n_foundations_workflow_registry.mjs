import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const mapPath = path.join(root, ".work", "datacamp-tp-remediation-2026-09-18", "n8n-foundations-workflow-assets.json");
const outputPath = path.join(root, "server", "n8nFoundationsWorkflowRegistry.ts");
const uploaded = JSON.parse(fs.readFileSync(mapPath, "utf8"));
const bySourcePath = new Map(uploaded.assets.map((asset) => [asset.sourcePath, asset]));
const mappings = [
  ["ch01_ex02_tp", "starters/currency_exchange.json", "starters/currency_exchange.json"],
  ["ch01_ex04_tp", "starters/currency_rates_start.json", "solutions/currency_rates_solution.json"],
  ["ch01_ex05_tp", "starters/event_signup_start.json", "solutions/event_signup_solution.json"],
  ["ch01_ex08_tp", "starters/contact_record_solution.json", "solutions/contact_record_filter_solution.json"],
  ["ch02_ex08_tp", "starters/nested_data_start.json", "solutions/nested_data_solution.json"],
  ["ch02_ex10_tp", "starters/merging_start.json", "solutions/merging_solution.json"],
  ["ch03_ex04_tp", "starters/feedback_summary.json", "solutions/feedback_report_solution.json"],
  ["ch03_ex06_tp", "starters/feedback_summary.json", "solutions/feedback_classify_route_solution.json"],
  ["ch03_ex07_tp", "starters/feedback_classify_route.json", "solutions/feedback_response_solution.json"],
  ["ch03_ex11_tp", "starters/onboarding_classifier.json", "solutions/onboarding_welcome_solution.json"],
].map(([blockId, starterPath, correctionPath]) => {
  const starter = bySourcePath.get(starterPath);
  const correction = bySourcePath.get(correctionPath);
  if (!starter || !correction) throw new Error(`Missing uploaded asset for ${blockId}.`);
  return { blockId, starterPath, correctionPath, starter, correction };
});

const publicMapping = Object.fromEntries(mappings.map((item) => [item.blockId, {
  starter: { filename: item.starter.filename, key: item.starter.key, url: item.starter.url, sha256: item.starter.sha256, size: item.starter.size },
  correction: { filename: item.correction.filename, key: item.correction.key, url: item.correction.url, sha256: item.correction.sha256, size: item.correction.size },
}]));
const registry = `/**\n * Managed n8n workflow references sourced from the validated 18 September 2026 remediation package.\n * Starter URLs are learner-facing. Correction URLs are released only by the server after a valid attempt.\n */\nexport const N8N_FOUNDATIONS_WORKFLOW_RESOURCES = ${JSON.stringify(publicMapping, null, 2)} as const;\n\nexport const N8N_FOUNDATIONS_CORRECTION_KEYS = new Set(\n  Object.values(N8N_FOUNDATIONS_WORKFLOW_RESOURCES).map((resource) => resource.correction.key),\n);\n\nexport function getN8nFoundationsWorkflowResource(blockId: string) {\n  return N8N_FOUNDATIONS_WORKFLOW_RESOURCES[blockId as keyof typeof N8N_FOUNDATIONS_WORKFLOW_RESOURCES] ?? null;\n}\n\nexport function getN8nFoundationsCorrectionBlockIdByKey(key: string) {\n  return Object.entries(N8N_FOUNDATIONS_WORKFLOW_RESOURCES).find(([, resource]) => resource.correction.key === key)?.[0] ?? null;\n}\n`;
fs.writeFileSync(outputPath, registry);
console.log(`Generated ${outputPath} with ${mappings.length} TP mappings.`);
