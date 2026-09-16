import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const courseDir = path.join(root, "client/public/data/courses");
const outputPath = path.join(root, "docs/anthropic-root-exercises-audit.json");
const files = (await fs.readdir(courseDir)).filter((file) => /^claude_certified_.*\.json$/.test(file)).sort();
const courses = [];

for (const file of files) {
  const course = JSON.parse(await fs.readFile(path.join(courseDir, file), "utf8"));
  const references = new Map();
  for (const lesson of course.lessons || []) for (const chapter of lesson.chapters || []) for (const block of chapter.blocks || []) {
    if (typeof block.exerciseId === "string") references.set(block.exerciseId, { lessonId: lesson.id || null, chapterId: chapter.id || null, chapterTitle: chapter.title?.en || chapter.title?.fr || chapter.title || null, blockType: block.type });
  }
  const rootExercises = (course.exercises || []).filter((exercise) => String(exercise.interactionType || exercise.type || "").toLowerCase().includes("free_text"));
  courses.push({
    courseId: course.courseId || file.replace(/\.json$/, ""),
    freeTextCount: rootExercises.length,
    candidates: rootExercises.map((exercise) => ({
      id: exercise.id,
      title: exercise.title?.en || exercise.title?.fr || exercise.title || "",
      chapterId: exercise.chapterId || null,
      required: exercise.required === true,
      referencedBy: references.get(exercise.id) || null,
      promptPreview: String(exercise.prompt?.en || exercise.prompt?.fr || exercise.prompt || "").slice(0, 500),
    })),
  });
}
const report = {
  generatedAt: new Date().toISOString(),
  courseCount: courses.length,
  freeTextCount: courses.reduce((total, course) => total + course.freeTextCount, 0),
  explicitlyReferenced: courses.flatMap((course) => course.candidates.filter((candidate) => candidate.referencedBy).map((candidate) => ({ courseId: course.courseId, ...candidate }))),
  unreferenced: courses.flatMap((course) => course.candidates.filter((candidate) => !candidate.referencedBy).map((candidate) => ({ courseId: course.courseId, ...candidate }))),
  courses,
};
await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ courseCount: report.courseCount, freeTextCount: report.freeTextCount, explicitlyReferenced: report.explicitlyReferenced.length, unreferenced: report.unreferenced.length }, null, 2));
