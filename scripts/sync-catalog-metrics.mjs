import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "client", "src", "data", "trainingIndex.json");
const coursesDir = path.join(root, "client", "public", "data", "courses");
const interactive = new Set(["exercise", "checkpoint", "quiz", "multi_choice", "matching", "bucket_sort", "fill_blank", "code_repl", "terminal_sim", "ai_evaluation", "ordering"]);
const index = JSON.parse(await fs.readFile(indexPath, "utf8"));
const courseFiles = await fs.readdir(coursesDir);
const byId = {};
for (const file of courseFiles.filter((entry) => entry.endsWith(".json"))) {
  const data = JSON.parse(await fs.readFile(path.join(coursesDir, file), "utf8"));
  byId[data.courseId || file.replace(/\.json$/, "")] = data;
}
const metric = (course) => {
  const lessons = course?.lessons || [];
  const blocks = lessons.flatMap((lesson) => (lesson.chapters || []).flatMap((chapter) => chapter.blocks || []));
  const chapters = lessons.reduce((sum, lesson) => sum + (lesson.chapters?.length || 0), 0);
  const referenced = new Set(blocks.map((block) => block.exerciseId ?? block.exerciseIndex).filter((item) => item !== undefined && item !== null)).size;
  return { lessonCount: lessons.length, chapterCount: chapters, exerciseCount: blocks.filter((block) => interactive.has(block.type)).length + referenced, videoCount: blocks.filter((block) => block.type === "video").length, downloadCount: blocks.filter((block) => block.type === "download" || block.type === "file_download").length, totalActivities: chapters };
};
index.courses = index.courses.map((course) => ({ ...course, ...metric(byId[course.id]) }));
index.certifications = index.certifications.map((certification) => {
  const courses = index.courses.filter((course) => course.certId === certification.id);
  return { ...certification, courseCount: courses.length, totalLessons: courses.reduce((sum, course) => sum + course.lessonCount, 0), totalExercises: courses.reduce((sum, course) => sum + course.exerciseCount, 0), totalVideos: courses.reduce((sum, course) => sum + course.videoCount, 0), totalDownloads: courses.reduce((sum, course) => sum + course.downloadCount, 0) };
});
await fs.writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Synced metrics for ${index.courses.length} courses and ${index.certifications.length} certifications.`);
