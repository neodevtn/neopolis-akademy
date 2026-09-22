import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const courseDirectory = path.join(root, "client/public/data/courses");
const outputPath = path.join(root, "docs/bilingual-markdown-structure-audit.json");
const writeReport = process.argv.includes("--write-report");
const strict = process.argv.includes("--strict");
const ignoredPathParts = new Set([
  "videoId", "watchUrl", "embedUrl", "url", "sourceUrl", "mp4Url", "hlsUrl", "audioUrl",
  "subtitleUrlEn", "subtitleUrlFr", "download_url", "asset_path", "sha256", "id", "courseId",
]);

function signature(text) {
  const value = String(text).replace(/\\`/g, "`");
  const prose = value.replace(/```[\s\S]*?```/g, "");
  const inlineProse = prose.replace(/```/g, "");
  const inlineDelimiterCount = (inlineProse.match(/`/g) || []).length;
  const inlineCodePairs = [...inlineProse.matchAll(/`([^`\n]{1,80})`/g)].filter((match) => !/(?:\.\.\.|…)/u.test(match[1])).length;
  return {
    headings: (prose.match(/(?:^|\n)#{1,6}\s/g) || []).length,
    bullets: (prose.match(/(?:^|\n)\s*(?:[-*•]|\d+\.)\s+/g) || []).length,
    boldPairs: Math.floor((prose.match(/\*\*/g) || []).length / 2),
    inlineCodePairs,
    unmatchedInlineBackticks: inlineDelimiterCount % 2,
    codeFences: (value.match(/```/g) || []).length / 2,
    tableRows: (value.match(/(?:^|\n)\|.*\|/g) || []).length,
  };
}

function visit(value, context, trace = [], findings = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => visit(item, context, [...trace, String(index)], findings));
    return findings;
  }
  if (!value || typeof value !== "object") return findings;
  const record = value;
  if (typeof record.en === "string" && typeof record.fr === "string" && !trace.some((part) => ignoredPathParts.has(part))) {
    const en = record.en;
    const fr = record.fr;
    if (Math.max(en.length, fr.length) >= 120) {
      const enSignature = signature(en);
      const frSignature = signature(fr);
      const differences = Object.keys(enSignature).filter((key) => enSignature[key] !== frSignature[key]);
      if (enSignature.unmatchedInlineBackticks) differences.push("invalidEnglishInlineBacktick");
      if (frSignature.unmatchedInlineBackticks) differences.push("invalidFrenchInlineBacktick");
      if (differences.length) findings.push({ ...context, trace: trace.join("."), enSignature, frSignature, differences });
    }
  }
  for (const [key, child] of Object.entries(record)) visit(child, context, [...trace, key], findings);
  return findings;
}

const files = fs.readdirSync(courseDirectory).filter((file) => file.endsWith(".json")).sort();
const findings = [];
for (const file of files) {
  const course = JSON.parse(fs.readFileSync(path.join(courseDirectory, file), "utf8"));
  visit(course, { file, courseId: course.courseId || file.replace(/\.json$/, "") }, [], findings);
}
const report = { generatedAt: new Date().toISOString(), totalCourses: files.length, findings };
console.log(JSON.stringify({ totalCourses: files.length, markdownParityFindings: findings.length, topCourses: Object.values(Object.groupBy(findings, (item) => item.courseId)).map((items) => ({ courseId: items[0].courseId, count: items.length })).sort((a, b) => b.count - a.count).slice(0, 20) }, null, 2));
if (writeReport) {
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}
if (strict && findings.length) process.exitCode = 1;
