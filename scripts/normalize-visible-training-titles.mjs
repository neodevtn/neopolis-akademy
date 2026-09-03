import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "client/src/data/trainingIndex.json");
const overridesPath = path.join(root, "shared/trainingDisplayTitleOverrides.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const titles = JSON.parse(fs.readFileSync(overridesPath, "utf8"));

let updates = 0;
for (const collectionName of ["certifications", "courses"]) {
  for (const item of catalog[collectionName] || []) {
    const title = titles[item.id];
    if (!title) continue;
    item.title = title;
    updates += 1;
  }
}

fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

let courseFileUpdates = 0;
const coursesDirectory = path.join(root, "client/public/data/courses");
for (const [id, title] of Object.entries(titles)) {
  const coursePath = path.join(coursesDirectory, `${id}.json`);
  if (!fs.existsSync(coursePath)) continue;
  const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
  course.title = title;
  fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
  courseFileUpdates += 1;
}

console.log(`Normalized ${updates} catalogue titles and ${courseFileUpdates} rendered course titles while preserving IDs and provenance metadata.`);
