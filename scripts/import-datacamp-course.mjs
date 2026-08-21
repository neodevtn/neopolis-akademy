#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { convertDataCampV1, parseUploadLog } from "./datacamp-importer-core.mjs";

function valueFor(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : "";
}

const manifestPath = valueFor("--manifest");
const packageRoot = valueFor("--package-root");
const uploadLogPath = valueFor("--upload-log");
const outputPath = valueFor("--output");

if (!manifestPath || !packageRoot || !uploadLogPath || !outputPath) {
  console.error("Usage: node scripts/import-datacamp-course.mjs --manifest <COURSE_MANIFEST.json> --package-root <course-root> --upload-log <upload-log.txt> --output <course.json>");
  process.exit(1);
}

const [manifestRaw, uploadLog] = await Promise.all([
  fs.readFile(manifestPath, "utf8"),
  fs.readFile(uploadLogPath, "utf8"),
]);
const absoluteMap = parseUploadLog(uploadLog);
const relativeMap = new Map();
for (const [absolutePath, url] of absoluteMap.entries()) {
  relativeMap.set(path.relative(packageRoot, absolutePath), url);
}
if (process.argv.includes("--debug")) {
  console.log(JSON.stringify({ uploadedAssets: relativeMap.size, sampleRelativeAssets: [...relativeMap.keys()].slice(0, 5) }, null, 2));
}
const course = convertDataCampV1(JSON.parse(manifestRaw), relativeMap);
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ courseId: course.courseId, lessons: course.lessons.length, activities: course.lessons.reduce((total, lesson) => total + lesson.chapters.length, 0), output: outputPath }, null, 2));
