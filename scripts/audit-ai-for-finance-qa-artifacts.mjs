import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docs = path.join(root, "docs");
const screenshotsDir = path.join(docs, "block-qa-screenshots");
const reportPath = path.join(docs, "ai_for_finance_qa_artifact_inventory_2026-08-28.json");

const requiredReports = [
  "ai_for_finance_card_sort_qa_2026-08-28.json",
  "ai_for_finance_tp_readiness_2026-08-28.json",
  "datacamp_ai_for_finance_alignment_2026-08-28.json",
  "datacamp_ai_for_finance_source_notes_2026-08-28.md",
  "publication_qa_report.json",
  "block_qa_browser_results_2026-08-25.json",
  "interaction-source-audit.json",
  "interaction-source-audit.md",
];

const dedicatedCaptures = [
  "ai-evaluation-datacamp-mobile.png",
  "ai-evaluation-datacamp-competencies-mobile.png",
  "ai-for-finance-card-sort-mobile.png",
];

function inspectFile(filePath, kind) {
  if (!fs.existsSync(filePath)) {
    return { path: path.relative(root, filePath), kind, exists: false, valid: false };
  }
  const stat = fs.statSync(filePath);
  const output = { path: path.relative(root, filePath), kind, exists: true, bytes: stat.size, valid: stat.size > 0 };
  if (filePath.endsWith(".json")) {
    try {
      JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
      output.valid = false;
      output.reason = "invalid_json";
    }
  }
  if (filePath.endsWith(".png")) {
    const signature = fs.readFileSync(filePath).subarray(0, 8).toString("hex");
    if (signature !== "89504e470d0a1a0a") {
      output.valid = false;
      output.reason = "invalid_png_signature";
    }
  }
  return output;
}

const reports = requiredReports.map((name) => inspectFile(path.join(docs, name), "report"));
const dedicated = dedicatedCaptures.map((name) => inspectFile(path.join(screenshotsDir, name), "dedicated_capture"));
const matrixCaptures = fs
  .readdirSync(screenshotsDir)
  .filter((name) => /^(desktop|mobile)-.+\.png$/u.test(name))
  .sort()
  .map((name) => inspectFile(path.join(screenshotsDir, name), "matrix_capture"));
const obsoleteCandidates = fs
  .readdirSync(screenshotsDir)
  .filter((name) => /(?:obsolete|backup|before|temp|tmp)/iu.test(name))
  .sort();

const allArtifacts = [...reports, ...dedicated, ...matrixCaptures];
const result = {
  generatedAt: new Date().toISOString(),
  retainedReports: reports,
  retainedDedicatedCaptures: dedicated,
  retainedMatrixCaptures: matrixCaptures,
  obsoleteCandidates,
  deletedObsoleteArtifacts: [],
  totals: {
    reports: reports.length,
    dedicatedCaptures: dedicated.length,
    matrixCaptures: matrixCaptures.length,
    validArtifacts: allArtifacts.filter((artifact) => artifact.valid).length,
    invalidArtifacts: allArtifacts.filter((artifact) => !artifact.valid).length,
  },
  valid: allArtifacts.every((artifact) => artifact.valid) && obsoleteCandidates.length === 0,
};

fs.writeFileSync(reportPath, `${JSON.stringify(result, null, 2)}\n`);
console.table(result.totals);
if (!result.valid) process.exit(1);
