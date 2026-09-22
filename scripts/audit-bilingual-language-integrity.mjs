import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const courseDirectory = path.join(root, "client/public/data/courses");
const outputPath = path.join(root, "docs/bilingual-language-integrity-audit.json");
const writeReport = process.argv.includes("--write-report");
const strict = process.argv.includes("--strict");
const ignoredPathParts = new Set([
  "videoId", "watchUrl", "embedUrl", "url", "sourceUrl", "mp4Url", "hlsUrl", "audioUrl",
  "subtitleUrlEn", "subtitleUrlFr", "download_url", "asset_path", "sha256", "id", "courseId",
]);
const frenchSignal = /\b(?:le|la|les|des|du|de|une|un|pour|avec|dans|sur|puis|votre|vous|ajoutez|chargez|conservez|reliez|créez|choisissez|exécutez|réponse|message|étape|utilisez|vérifiez|définissez|ouvrez|placez|traitez|sélectionnez|données|résultat|fichier|workflow|nœud|activité|consigne|objectif|évaluation|réalisation|synthétique|requis|attendu|configuration|apprenant|formation)\b/giu;
const englishSignal = /\b(?:the|and|with|for|your|then|add|load|keep|connect|create|choose|run|response|message|step|use|verify|set|open|place|process|select|data|result|file|workflow|node|activity|instruction|objective|assessment|completion|synthetic|required|expected|configuration|learner|training)\b/giu;

function countMatches(text, pattern) {
  return [...String(text).matchAll(pattern)].length;
}

function relevantText(trace, text) {
  return !trace.some((part) => ignoredPathParts.has(part)) && typeof text === "string" && text.trim().length >= 18 && !/^https?:\/\//iu.test(text.trim());
}

function languageMismatch(language, text) {
  const french = countMatches(text, frenchSignal);
  const english = countMatches(text, englishSignal);
  if (language === "en") return french >= 3 && french > english * 1.5 ? { expected: "en", french, english } : null;
  if (language === "fr") return english >= 5 && english > french * 1.8 ? { expected: "fr", french, english } : null;
  return null;
}

function isEllipsized(text) {
  return /(?:\.\.\.|…)(?:\s*)$/u.test(String(text));
}

function visit(value, context, trace = [], findings = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => visit(item, context, [...trace, String(index)], findings));
    return findings;
  }
  if (!value || typeof value !== "object") return findings;
  const record = value;
  for (const [key, child] of Object.entries(record)) {
    const currentTrace = [...trace, key];
    if ((key === "en" || key === "fr") && relevantText(currentTrace, child)) {
      const sibling = key === "en" ? record.fr : record.en;
      const score = languageMismatch(key, child);
      const truncated = isEllipsized(child) && typeof sibling === "string" && !isEllipsized(sibling) && sibling.trim().length > String(child).trim().length + 8;
      if (score || truncated) {
        findings.push({
          ...context,
          trace: currentTrace.join("."),
          targetLanguage: key,
          kind: truncated ? "truncated" : "wrong_language",
          score: score || { expected: key, french: 0, english: 0 },
          text: child,
          siblingValue: typeof sibling === "string" ? sibling : "",
        });
      }
    }
    visit(child, context, currentTrace, findings);
  }
  return findings;
}

const files = fs.readdirSync(courseDirectory).filter((file) => file.endsWith(".json")).sort();
const findings = [];
for (const file of files) {
  const course = JSON.parse(fs.readFileSync(path.join(courseDirectory, file), "utf8"));
  visit(course, { file, courseId: course.courseId || file.replace(/\.json$/, "") }, [], findings);
}
const report = { generatedAt: new Date().toISOString(), totalCourses: files.length, findings };
console.log(JSON.stringify({ totalCourses: report.totalCourses, integrityFindings: findings.length, byCourse: Object.values(Object.groupBy(findings, (item) => item.courseId)).map((items) => ({ courseId: items[0].courseId, count: items.length })).sort((a, b) => b.count - a.count) }, null, 2));
if (writeReport) {
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}
if (strict && findings.length) process.exitCode = 1;
