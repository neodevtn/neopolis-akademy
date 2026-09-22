import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const courseDirectory = path.join(root, "client/public/data/courses");
const outputPath = path.join(root, "docs/bilingual-content-parity-audit.json");
const writeReport = process.argv.includes("--write-report");
const MIN_LONGEST_FIELD_WORDS = 40;
const MIN_SHORT_TO_LONG_RATIO = 0.58;
const ignoredPathParts = new Set([
  "videoId", "watchUrl", "embedUrl", "url", "sourceUrl", "mp4Url", "hlsUrl", "audioUrl",
  "subtitleUrlEn", "subtitleUrlFr", "download_url", "asset_path", "sha256", "id", "courseId",
]);

function wordCount(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

function compact(text) {
  return String(text).replace(/\s+/g, " ").trim();
}

function isContentPath(trace) {
  return !trace.some((part) => ignoredPathParts.has(part));
}

function visit(value, context, trace = [], findings = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => visit(item, context, [...trace, String(index)], findings));
    return findings;
  }
  if (!value || typeof value !== "object") return findings;

  if (typeof value.en === "string" && typeof value.fr === "string" && isContentPath(trace)) {
    const english = compact(value.en);
    const french = compact(value.fr);
    const englishWords = wordCount(english);
    const frenchWords = wordCount(french);
    const maxWords = Math.max(englishWords, frenchWords);
    const minWords = Math.min(englishWords, frenchWords);
    const ratio = maxWords === 0 ? 1 : minWords / maxWords;
    // Short labels, titles and card sides naturally vary in word count across French
    // and English. This audit targets meaningful learner-content omissions, not
    // legitimate terminology-length differences.
    if (maxWords >= MIN_LONGEST_FIELD_WORDS && ratio < MIN_SHORT_TO_LONG_RATIO) {
      findings.push({
        ...context,
        trace: trace.join("."),
        englishWords,
        frenchWords,
        ratio: Number(ratio.toFixed(3)),
        englishPreview: english.slice(0, 280),
        frenchPreview: french.slice(0, 280),
      });
    }
  }

  for (const [key, child] of Object.entries(value)) visit(child, context, [...trace, key], findings);
  return findings;
}

const files = fs.readdirSync(courseDirectory).filter((file) => file.endsWith(".json")).sort();
const findings = [];
for (const file of files) {
  const course = JSON.parse(fs.readFileSync(path.join(courseDirectory, file), "utf8"));
  visit(course, { file, courseId: course.courseId || file.replace(/\.json$/, "") }, [], findings);
}

const byCourse = Object.values(Object.groupBy(findings, (item) => item.courseId))
  .map((items) => ({
    courseId: items[0].courseId,
    file: items[0].file,
    divergentFields: items.length,
    worstRatio: Math.min(...items.map((item) => item.ratio)),
  }))
  .sort((a, b) => b.divergentFields - a.divergentFields || a.worstRatio - b.worstRatio);

const report = {
  generatedAt: new Date().toISOString(),
  thresholds: { minLongestFieldWords: MIN_LONGEST_FIELD_WORDS, minimumShortToLongRatio: MIN_SHORT_TO_LONG_RATIO },
  totalCourses: files.length,
  divergentFields: findings.length,
  divergentCourses: byCourse.length,
  byCourse,
  findings,
};
console.log(JSON.stringify({ totalCourses: report.totalCourses, divergentCourses: report.divergentCourses, divergentFields: report.divergentFields, topCourses: byCourse.slice(0, 20) }, null, 2));
if (writeReport) {
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}
