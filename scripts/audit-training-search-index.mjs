import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "client/src/data/trainingIndex.json");
const coursesDir = path.join(root, "client/public/data/courses");
const searchIndexPath = path.join(root, "client/public/data/training-search-index.json");
const reportPath = path.join(root, "docs/training-search-index-audit.json");

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, "utf8"));
const courseIds = new Set(catalog.courses.map((course) => course.id));
const sourceIds = fs.readdirSync(coursesDir)
  .filter((name) => name.endsWith(".json"))
  .map((name) => path.basename(name, ".json"));
const entriesById = new Map();
for (const entry of searchIndex) entriesById.set(entry.id, [...(entriesById.get(entry.id) || []), entry]);

const missingCourseEntries = [];
const duplicateCourseEntries = [];
const missingSearchFields = [];
for (const course of catalog.courses) {
  const entries = entriesById.get(`course:${course.id}`) || [];
  if (entries.length === 0) missingCourseEntries.push(course.id);
  if (entries.length > 1) duplicateCourseEntries.push(course.id);
  const entry = entries[0];
  if (!entry?.title || !entry?.href || !Array.isArray(entry?.keywords) || entry.keywords.length === 0) missingSearchFields.push(course.id);
}

const missingSourceFiles = catalog.courses.filter((course) => !sourceIds.includes(course.id)).map((course) => course.id);
const orphanSourceFiles = sourceIds.filter((courseId) => !courseIds.has(courseId));
const orphanCourseEntries = searchIndex
  .filter((entry) => entry.kind === "course" && !courseIds.has(entry.id.replace(/^course:/, "")))
  .map((entry) => entry.id);
const expectedChapterIds = [];
for (const courseId of sourceIds.filter((id) => courseIds.has(id))) {
  const course = JSON.parse(fs.readFileSync(path.join(coursesDir, `${courseId}.json`), "utf8"));
  for (const [lessonIndex, lesson] of (course.lessons || []).entries()) {
    for (const [chapterIndex] of (lesson.chapters || []).entries()) {
      expectedChapterIds.push(`chapter:${courseId}:${lessonIndex}:${chapterIndex}`);
    }
  }
}
const indexedChapterIds = new Set(searchIndex.filter((entry) => entry.kind === "chapter").map((entry) => entry.id));
const missingChapterEntries = expectedChapterIds.filter((id) => !indexedChapterIds.has(id));
const invalidCourseLinks = searchIndex
  .filter((entry) => entry.kind === "course")
  .filter((entry) => !/^\/training\/[^/]+\/[^/?]+$/.test(entry.href))
  .map((entry) => entry.id);

const report = {
  generatedAt: new Date().toISOString(),
  catalogCourseCount: catalog.courses.length,
  courseFileCount: sourceIds.length,
  courseSearchEntryCount: searchIndex.filter((entry) => entry.kind === "course").length,
  expectedChapterCount: expectedChapterIds.length,
  indexedChapterCount: indexedChapterIds.size,
  totalSearchEntryCount: searchIndex.length,
  missingCourseEntries,
  duplicateCourseEntries,
  missingSearchFields,
  missingSourceFiles,
  orphanSourceFiles,
  orphanCourseEntries,
  missingChapterEntries,
  invalidCourseLinks,
};
report.complete = Object.entries(report)
  .filter(([key]) => key.startsWith("missing") || key.startsWith("duplicate") || key.startsWith("orphan") || key === "invalidCourseLinks")
  .every(([, value]) => Array.isArray(value) && value.length === 0);

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.complete) process.exitCode = 1;
