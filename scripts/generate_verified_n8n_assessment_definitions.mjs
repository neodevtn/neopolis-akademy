import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const workPath = path.join(root, ".work", "datacamp-audit-2026-09-17", "verified-n8n-practical-guides.json");
const outputPath = path.join(root, "server", "intermediateN8nAssessmentDefinitions.ts");
const source = JSON.parse(fs.readFileSync(workPath, "utf8"));
const definitions = Object.fromEntries(source.guides.map((guide) => [guide.blockId, {
  id: guide.blockId,
  correction: `Ce TP est validé lorsqu’une preuve décrit concrètement : ${guide.proofFr.join(" ; ")}.`,
  criteria: guide.proofFr.map((label, index) => ({
    id: `criterion_${index + 1}`,
    label,
    terms: guide.assessmentTerms.slice(index === 0 ? 0 : Math.max(0, index), Math.min(guide.assessmentTerms.length, index + 2)),
  })),
}]));
const contents = `/**\n * Regenerated from source-verified, Claude Sonnet-reformulated n8n guides.\n * This server-only registry intentionally contains assessment terms and post-submission corrections only.\n */\nexport const VERIFIED_N8N_PRACTICAL_ASSESSMENTS = ${JSON.stringify(definitions, null, 2)} as const;\n`;
fs.writeFileSync(outputPath, contents);
console.log(JSON.stringify({ outputPath, assessmentCount: Object.keys(definitions).length }, null, 2));
