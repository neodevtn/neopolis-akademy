import fs from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
const dir = path.join(root, "client/public/data/courses");
const manifest = { version: 1, generatedAt: new Date().toISOString(), removed: [], assignedChapterIds: [] };
for (const file of (await fs.readdir(dir)).filter((name) => name.endsWith(".json"))) {
  const filePath = path.join(dir, file);
  const course = JSON.parse(await fs.readFile(filePath, "utf8"));
  const exercises = new Set((course.exercises || []).map((entry) => entry?.id).filter(Boolean));
  let changed = false;
  for (let lessonIndex = 0; lessonIndex < (course.lessons || []).length; lessonIndex += 1) {
    const lesson = course.lessons[lessonIndex];
    const chapters = lesson.chapters || [];
    for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex += 1) {
      const chapter = chapters[chapterIndex];
      if (!chapter.id) {
        chapter.id = `lesson_${lessonIndex + 1}_chapter_${chapterIndex + 1}`;
        manifest.assignedChapterIds.push({ courseId: course.courseId, lessonIndex, chapterIndex, chapterId: chapter.id });
        changed = true;
      }
      const before = chapter.blocks || [];
      const after = before.filter((block) => {
        if (block.type !== "checkpoint") return true;
        const exerciseId = block.exerciseId;
        if (exerciseId && exercises.has(exerciseId)) return true;
        manifest.removed.push({ courseId: course.courseId, lessonIndex, chapterIndex, chapterId: chapter.id, blockId: block.id || null, exerciseId: exerciseId || null, reason: "Checkpoint sans exercice existant : aucun écran de réponse/correction fiable." });
        return false;
      });
      if (after.length !== before.length) { chapter.blocks = after; changed = true; }
    }
    lesson.chapters = chapters.filter((chapter) => (chapter.blocks || []).length > 0);
  }
  course.lessons = (course.lessons || []).filter((lesson) => (lesson.chapters || []).length > 0);
  if (changed) await fs.writeFile(filePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
}
await fs.writeFile(path.join(root, "pedagogical-audit", "orphan-checkpoint-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ removed: manifest.removed.length, assignedChapterIds: manifest.assignedChapterIds.length }, null, 2));
