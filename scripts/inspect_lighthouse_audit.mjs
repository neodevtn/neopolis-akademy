import fs from "node:fs";

const [reportPath, auditId] = process.argv.slice(2);

if (!reportPath || !auditId) {
  throw new Error("Usage: node scripts/inspect_lighthouse_audit.mjs <report.json> <audit-id>");
}

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const audits = (report.lhr ?? report).audits;
const audit = audits[auditId];

if (!audit) throw new Error(`Unknown audit: ${auditId}`);

console.log(JSON.stringify({
  id: auditId,
  title: audit.title,
  score: audit.score,
  scoreDisplayMode: audit.scoreDisplayMode,
  displayValue: audit.displayValue,
  description: audit.description,
  details: audit.details,
}, null, 2));
