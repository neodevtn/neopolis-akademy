import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const courseIds = [
  "claude_science_01_initiation",
  "claude_science_02_pratique",
  "claude_science_03_travaux_pratiques",
];
const mentionedFilePattern = /\b[A-Za-z0-9][A-Za-z0-9_.-]*\.(?:csv|tsv|json|py|md|pdf|xlsx?)\b/g;

function textOf(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(textOf).join("\n");
  if (value && typeof value === "object") return Object.values(value).map(textOf).join("\n");
  return "";
}

function normalizedName(value) {
  return String(value || "")
    .replace(/^.*\//, "")
    .replace(/_[a-f0-9]{8,64}(?=\.[A-Za-z0-9]+$)/i, "")
    .toLowerCase();
}

const findings = [];
for (const courseId of courseIds) {
  const coursePath = path.join(root, "client", "public", "data", "courses", `${courseId}.json`);
  const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
  const courseResources = (course.downloadableResources || []).map((resource) => ({
    filename: normalizedName(resource.url || resource.title?.fr || resource.title),
    url: resource.url,
    scope: "course",
  }));

  for (const lesson of course.lessons || []) {
    for (const chapter of lesson.chapters || []) {
      const chapterText = textOf(chapter);
      const mentioned = [...new Set(chapterText.match(mentionedFilePattern) || [])];
      const chapterResources = (chapter.blocks || []).flatMap((block) => block.resources || []).map((resource) => ({
        filename: normalizedName(resource.url || resource.title?.fr || resource.title),
        url: resource.url,
        scope: "chapter",
      }));
      for (const filename of mentioned) {
        const normalized = normalizedName(filename);
        const delivered = [...chapterResources, ...courseResources].find((resource) => resource.filename === normalized);
        findings.push({
          courseId,
          lessonId: lesson.id,
          chapterId: chapter.id,
          filename,
          delivered: Boolean(delivered?.url),
          deliveryScope: delivered?.scope || null,
          url: delivered?.url || null,
        });
      }
    }
  }
}

const missing = findings.filter((finding) => !finding.delivered);
const output = {
  generatedAt: new Date().toISOString(),
  mentionedFiles: findings.length,
  delivered: findings.length - missing.length,
  missing,
  findings,
};
const outputPath = path.join(root, ".work", "claude-science-resource-link-audit.json");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ mentionedFiles: output.mentionedFiles, delivered: output.delivered, missing: output.missing }, null, 2));
if (missing.length) process.exitCode = 1;
