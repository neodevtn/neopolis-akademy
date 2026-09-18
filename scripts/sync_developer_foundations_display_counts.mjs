import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "client/src/data/trainingIndex.json");
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const certificationId = "claude_certified_developer_foundations";
const totals = { totalLessons: 0, totalExercises: 0, totalVideos: 0, totalDownloads: 0, totalActivities: 0 };

for (const suffix of ["01", "02", "03", "04", "05"]) {
  const courseId = `${certificationId}__${suffix}`;
  const file = path.join(root, "client/public/data/courses", `${courseId}.json`);
  const course = JSON.parse(fs.readFileSync(file, "utf8"));
  const lessons = course.lessons || [];
  const chapters = lessons.flatMap((lesson) => lesson.chapters || []);
  const blocks = chapters.flatMap((chapter) => chapter.blocks || []);
  const videoCount = blocks.filter((block) => block.type === "video").length;
  const downloadCount = blocks.filter((block) => block.type === "download").length;
  const activityCount = blocks.filter((block) => ["checkpoint", "cloud_exercise"].includes(block.type)).length;
  for (const lesson of lessons) lesson.videoCount = videoCount;
  course.videoCount = videoCount;
  fs.writeFileSync(file, `${JSON.stringify(course, null, 2)}\n`);

  const entry = index.courses.find((item) => item.id === courseId);
  if (!entry) throw new Error(`Missing catalogue entry ${courseId}`);
  entry.lessonCount = lessons.length;
  entry.chapterCount = chapters.length;
  entry.exerciseCount = (course.exercises || []).length;
  entry.totalActivities = activityCount;
  entry.videoCount = videoCount;
  entry.videos = [];
  entry.downloadCount = downloadCount;
  totals.totalLessons += entry.lessonCount;
  totals.totalExercises += entry.exerciseCount;
  totals.totalVideos += entry.videoCount;
  totals.totalDownloads += entry.downloadCount;
  totals.totalActivities += entry.totalActivities;
}

const certification = index.certifications.find((item) => item.id === certificationId);
if (!certification) throw new Error(`Missing certification ${certificationId}`);
Object.assign(certification, { courseCount: 5, ...totals });
fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
console.log("Synchronized Developer Foundations learner and catalogue counts with published blocks.");
