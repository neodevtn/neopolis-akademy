import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const courseDirectory = path.join(root, "client", "public", "data", "courses");
const localize = (value) => typeof value === "string" ? value : Object.values(value ?? {}).filter((item) => typeof item === "string").join("\n");
const findings = [];

for (const filename of fs.readdirSync(courseDirectory).filter((name) => name.endsWith(".json")).sort()) {
  const course = JSON.parse(fs.readFileSync(path.join(courseDirectory, filename), "utf8"));
  if (course.datacampImport?.sourceProvider !== "DataCamp") continue;
  for (const lesson of course.lessons ?? []) {
    for (const chapter of lesson.chapters ?? []) {
      for (const block of chapter.blocks ?? []) {
        if (block.type !== "cloud_exercise") continue;
        const assignment = localize(block.assignment).trim();
        const instructions = localize(block.instructions).trim();
        const likelyImportedShell = /(?:^|\n)Apprendre\s*\n\/?\s*\nCours\b/i.test(assignment) || /^Apprendre\s*\/\s*Cours/i.test(assignment);
        const incomplete = likelyImportedShell || (!instructions && (!Array.isArray(block.steps) || block.steps.length === 0));
        if (incomplete) {
          findings.push({
            courseId: course.courseId,
            chapterId: chapter.id,
            blockId: block.id,
            title: localize(block.title),
            likelyImportedShell,
            instructionsEmpty: !instructions,
            stepCount: Array.isArray(block.steps) ? block.steps.length : 0,
            resources: Array.isArray(block.resources) ? block.resources.length : 0,
            unavailableFiles: Array.isArray(block.nonDownloadableFiles) ? block.nonDownloadableFiles : [],
            status: block.practiceStatus || null,
          });
        }
      }
    }
  }
}
const report = { generatedAt: new Date().toISOString(), findingCount: findings.length, byCourse: Object.groupBy(findings, (finding) => finding.courseId), findings };
const target = path.join(root, ".work", "datacamp-audit-2026-09-17", "practical-content-audit.json");
fs.writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ target, findingCount: findings.length, courses: Object.keys(report.byCourse).length }, null, 2));
