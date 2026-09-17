import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const courseDirectory = path.join(root, "client", "public", "data", "courses");
const outputPath = path.join(root, ".work", "datacamp-audit-2026-09-17", "practical-resource-coverage.json");
const filePattern = /(?:Desktop\s*>\s*Resources|Resources\s*[/:]|(?:ouvrez|open|importez|import|téléchargez|download)\s+(?:le\s+fichier\s+)?)([A-Za-z0-9][A-Za-z0-9_.-]+\.(?:json|csv|txt|pdf|png|jpg|jpeg|md|py|js|yaml|yml|zip))/gi;

const localized = (value) => typeof value === "string" ? value : Object.values(value ?? {}).filter((entry) => typeof entry === "string").join("\n");
const allCourseFiles = fs.readdirSync(courseDirectory).filter((name) => name.endsWith(".json")).sort();
const findings = [];

for (const fileName of allCourseFiles) {
  const course = JSON.parse(fs.readFileSync(path.join(courseDirectory, fileName), "utf8"));
  if (course.datacampImport?.sourceProvider !== "DataCamp") continue;
  for (const lesson of course.lessons ?? []) {
    for (const chapter of lesson.chapters ?? []) {
      for (const block of chapter.blocks ?? []) {
        if (block.type !== "cloud_exercise") continue;
        const text = [block.assignment, block.instructions, block.hint, block.solution, ...(block.steps ?? [])]
          .map(localized).join("\n");
        const referenced = new Set([...(block.nonDownloadableFiles ?? []), ...((block.referencedFiles ?? []).map((file) => file?.filename).filter(Boolean))]);
        for (const match of text.matchAll(filePattern)) referenced.add(match[1]);
        const linked = new Set((block.resources ?? []).map((resource) => resource?.url).filter(Boolean));
        if (referenced.size > 0 || linked.size > 0) {
          findings.push({
            courseId: course.courseId,
            chapterId: chapter.id,
            blockId: block.id,
            title: localized(block.title),
            referencedFiles: [...referenced].sort(),
            managedResourceUrls: [...linked].sort(),
            hasAllResources: referenced.size === 0 || linked.size > 0,
            nonDownloadableFiles: [...(block.nonDownloadableFiles ?? [])].sort(),
          });
        }
      }
    }
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  findingCount: findings.length,
  missingManagedResources: findings.filter((finding) => finding.referencedFiles.length > 0 && finding.managedResourceUrls.length === 0),
  findings,
};
fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, findingCount: summary.findingCount, missingManagedResources: summary.missingManagedResources.length }, null, 2));
