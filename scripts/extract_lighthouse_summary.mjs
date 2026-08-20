import fs from "node:fs";

const reportPath = process.argv[2];

if (!reportPath) {
  throw new Error("Usage: node scripts/extract_lighthouse_summary.mjs <lighthouse-report.json>");
}

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const { categories, audits } = report.lhr ?? report;

const categoryIds = ["performance", "accessibility", "best-practices", "seo"];
const metricIds = [
  "first-contentful-paint",
  "largest-contentful-paint",
  "total-blocking-time",
  "cumulative-layout-shift",
  "speed-index",
  "interactive",
];

console.log("## Scores");
for (const categoryId of categoryIds) {
  const category = categories[categoryId];
  if (category) console.log(`${category.title}: ${Math.round((category.score ?? 0) * 100)}`);
}

console.log("\n## Métriques");
for (const metricId of metricIds) {
  const audit = audits[metricId];
  if (audit) console.log(`${audit.title}: ${audit.displayValue ?? "n/a"}`);
}

console.log("\n## Audits à corriger");
for (const categoryId of categoryIds) {
  const category = categories[categoryId];
  if (!category) continue;
  const failures = category.auditRefs
    .map(({ id, weight }) => ({ id, weight, audit: audits[id] }))
    .filter(({ audit, weight }) => audit && weight > 0 && audit.score !== 1)
    .sort((a, b) => (b.audit.scoreDisplayMode === "numeric" ? 1 : 0) - (a.audit.scoreDisplayMode === "numeric" ? 1 : 0));

  if (!failures.length) continue;
  console.log(`\n${category.title}:`);
  for (const { audit } of failures) {
    const score = audit.score === null ? "n/a" : Math.round(audit.score * 100);
    console.log(`- [${score}] ${audit.title}${audit.displayValue ? ` — ${audit.displayValue}` : ""}`);
  }
}

console.log("\n## Diagnostics techniques");
for (const auditId of [
  "render-blocking-resources",
  "uses-long-cache-ttl",
  "legacy-javascript",
  "unused-javascript",
  "uses-optimized-images",
  "uses-responsive-images",
  "image-aspect-ratio",
  "uses-text-compression",
  "third-party-summary",
  "mainthread-work-breakdown",
  "bootup-time",
  "long-tasks",
  "forced-reflow",
  "largest-contentful-paint-element",
  "errors-in-console",
  "meta-description",
  "robots-txt",
  "label",
  "color-contrast",
  "document-title",
  "html-has-lang",
]) {
  const audit = audits[auditId];
  if (!audit) continue;
  const score = audit.score === null ? "n/a" : Math.round(audit.score * 100);
  console.log(`- [${score}] ${audit.title}${audit.displayValue ? ` — ${audit.displayValue}` : ""}`);
}
