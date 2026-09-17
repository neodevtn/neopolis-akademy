import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const reviewDirectory = path.join(root, ".work", "datacamp-audit-2026-09-17", "reviews");
const outputPath = path.join(root, ".work", "datacamp-audit-2026-09-17", "review-summary.json");

const severity = (text) => {
  if (/sévérité\s*:\s*élevée|gravité\s*:\s*élevée|severity\s*:\s*high/i.test(text)) return "high";
  if (/sévérité\s*:\s*moyenne|gravité\s*:\s*moyenne|severity\s*:\s*medium/i.test(text)) return "medium";
  if (/sévérité\s*:\s*faible|gravité\s*:\s*faible|severity\s*:\s*low/i.test(text)) return "low";
  return "none";
};

const rows = fs.readdirSync(reviewDirectory).filter((file) => file.endsWith(".md")).sort().map((file) => {
  const content = fs.readFileSync(path.join(reviewDirectory, file), "utf8");
  const courseId = file.replace(/^\d+-/, "").replace(/\.md$/, "");
  return {
    file,
    courseId,
    severity: severity(content),
    ambiguous: /statut de preuve\s*:\s*partiel|preuve.*partielle|aucune preuve locale|impossible.*vérifier/i.test(content),
    needsEnvironmentGuidance: /environnement apprenant|installation|préparer votre environnement|pré-requis|préparation explicite/i.test(content),
    sourceScreenComparisonRecommended: /aucune preuve locale|statut de preuve\s*:\s*partiel|source.*absent|ambigu/i.test(content),
    excerpt: content.replace(/\s+/g, " ").slice(0, 500),
  };
});

const priority = { high: 0, medium: 1, low: 2, none: 3 };
rows.sort((a, b) => priority[a.severity] - priority[b.severity] || Number(b.needsEnvironmentGuidance) - Number(a.needsEnvironmentGuidance) || a.courseId.localeCompare(b.courseId));
const summary = {
  count: rows.length,
  high: rows.filter((row) => row.severity === "high").map((row) => row.courseId),
  medium: rows.filter((row) => row.severity === "medium").map((row) => row.courseId),
  needsEnvironmentGuidance: rows.filter((row) => row.needsEnvironmentGuidance).map((row) => row.courseId),
  sourceScreenComparisonRecommended: rows.filter((row) => row.sourceScreenComparisonRecommended).map((row) => row.courseId),
  rows,
};
fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, count: summary.count, high: summary.high, medium: summary.medium, needsEnvironmentGuidance: summary.needsEnvironmentGuidance, sourceScreenComparisonRecommended: summary.sourceScreenComparisonRecommended }, null, 2));
