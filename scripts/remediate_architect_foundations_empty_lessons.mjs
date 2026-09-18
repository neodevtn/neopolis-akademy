import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const courseDirectory = path.join(root, "client", "public", "data", "courses");
const indexPath = path.join(root, "client", "src", "data", "trainingIndex.json");
const certificationId = "claude_certified_architect_foundations";

const removals = {
  claude_certified_architect_foundations__03: new Set([
    "Making a Request",
    "Prompts in the Client",
  ]),
  claude_certified_architect_foundations__06: new Set([
    "Temperature",
    "Prompts in the Client",
  ]),
};

const interactiveBlockTypes = new Set([
  "checkpoint",
  "cloud_exercise",
  "single_choice_exercise",
  "multi_choice_exercise",
  "bucket_sort",
  "knowledge_check",
  "inline_myth_reality",
  "inline_multiple_choice_feedback",
  "inline_scenario_question_feedback",
  "course_final_quiz",
]);

const text = (value) => typeof value === "string" ? value : value?.en || value?.fr || "";
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const writeJson = (filePath, value) => fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");

function collectMetrics(course) {
  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  const chapters = lessons.flatMap((lesson) => lesson.chapters || []);
  const blocks = chapters.flatMap((chapter) => chapter.blocks || []);
  return {
    lessonCount: lessons.length,
    chapterCount: chapters.length,
    totalActivities: chapters.length,
    exerciseCount: blocks.filter((block) => interactiveBlockTypes.has(block.type)).length,
    videoCount: blocks.filter((block) => block.type === "video").length,
    downloadCount: blocks.filter((block) => block.type === "download").length,
    emptyChapters: chapters.filter((chapter) => (chapter.blocks || []).length === 0).length,
  };
}

const index = readJson(indexPath);
const coursePayloads = new Map();
const removalReport = [];

for (const [courseId, titlesToRemove] of Object.entries(removals)) {
  const coursePath = path.join(courseDirectory, `${courseId}.json`);
  const course = readJson(coursePath);
  const beforeMetrics = collectMetrics(course);
  const removedLessons = course.lessons.filter((lesson) => {
    const title = text(lesson.title);
    const isEmpty = (lesson.chapters || []).every((chapter) => (chapter.blocks || []).length === 0);
    return titlesToRemove.has(title) && isEmpty;
  });

  const stillPresent = course.lessons.filter((lesson) => titlesToRemove.has(text(lesson.title)));
  if (stillPresent.length > 0 && removedLessons.length !== titlesToRemove.size) {
    throw new Error(`${courseId}: an identified empty lesson contains unexpected data and cannot be removed automatically`);
  }

  course.lessons = course.lessons.filter((lesson) => !removedLessons.includes(lesson));
  for (const section of course.sections || []) {
    if (Array.isArray(section.lessons)) {
      section.lessons = section.lessons.filter((title) => !titlesToRemove.has(text(title)));
    }
  }

  const afterMetrics = collectMetrics(course);
  if (afterMetrics.emptyChapters !== 0) {
    throw new Error(`${courseId}: remediation left ${afterMetrics.emptyChapters} empty chapter(s)`);
  }

  writeJson(coursePath, course);
  coursePayloads.set(courseId, { course, metrics: afterMetrics });
  removalReport.push({
    courseId,
    removedLessonTitles: removedLessons.map((lesson) => text(lesson.title)),
    before: beforeMetrics,
    after: afterMetrics,
  });
}

const architectCourseEntries = index.courses.filter((entry) => entry.certId === certificationId);
for (const entry of architectCourseEntries) {
  const payload = coursePayloads.get(entry.id) || {
    course: readJson(path.join(courseDirectory, `${entry.id}.json`)),
  };
  const metrics = payload.metrics || collectMetrics(payload.course);
  const { emptyChapters: _emptyChapters, ...catalogMetrics } = metrics;
  Object.assign(entry, catalogMetrics);
  delete entry.emptyChapters;
}

const certification = index.certifications.find((entry) => entry.id === certificationId);
if (!certification) throw new Error(`Missing certification ${certificationId}`);
const certificationMetrics = architectCourseEntries.reduce((sum, entry) => ({
  totalLessons: sum.totalLessons + entry.lessonCount,
  totalExercises: sum.totalExercises + entry.exerciseCount,
  totalVideos: sum.totalVideos + entry.videoCount,
  totalDownloads: sum.totalDownloads + entry.downloadCount,
  totalActivities: sum.totalActivities + entry.totalActivities,
}), { totalLessons: 0, totalExercises: 0, totalVideos: 0, totalDownloads: 0, totalActivities: 0 });
Object.assign(certification, certificationMetrics, { courseCount: architectCourseEntries.length });

writeJson(indexPath, index);
console.log(JSON.stringify({ certificationId, removals: removalReport, certificationMetrics }, null, 2));
