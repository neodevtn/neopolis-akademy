import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const certificationId = "claude_certified_developer_foundations";
const courseIds = ["01", "02", "03", "04", "05"].map((suffix) => `${certificationId}__${suffix}`);
const indexPath = path.join(root, "client/src/data/trainingIndex.json");

// These entries are demonstrated by the current audit as either truncated or
// attached to a chapter that teaches a different subject. There is no complete
// authorised source payload available for restoration, so they are removed
// together with their dependent checkpoint rather than fabricated.
const explicitlyInvalidExerciseIds = new Set([
  "ex_claude_certified_developer_foundations__03_003",
  "ex_claude_certified_developer_foundations__03_005",
  "ex_claude_certified_developer_foundations__03_007",
  "ex_claude_certified_developer_foundations__03_008",
  "ex_claude_certified_developer_foundations__03_010",
  "ex_claude_certified_developer_foundations__04_005",
  "ex_claude_certified_developer_foundations__04_007",
  "ex_claude_certified_developer_foundations__04_011",
]);

const titleOf = (value) => value?.fr || value?.en || value || "";
const courseStats = [];

for (const courseId of courseIds) {
  const coursePath = path.join(root, "client/public/data/courses", `${courseId}.json`);
  const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
  const chapters = (course.lessons || []).flatMap((lesson) => lesson.chapters || []);
  const referenced = new Set(chapters.flatMap((chapter) => (chapter.blocks || [])
    .filter((block) => block.type === "checkpoint" && typeof block.exerciseId === "string")
    .map((block) => block.exerciseId)));
  const removed = new Set((course.exercises || [])
    .filter((exercise) => !referenced.has(exercise.id) || explicitlyInvalidExerciseIds.has(exercise.id))
    .map((exercise) => exercise.id));

  course.exercises = (course.exercises || []).filter((exercise) => !removed.has(exercise.id));
  for (const chapter of chapters) {
    const previous = chapter.blocks || [];
    chapter.blocks = previous.filter((block) => !(block.type === "checkpoint" && removed.has(block.exerciseId)));
    const removedCheckpoint = previous.length !== chapter.blocks.length;
    const hasRootCheckpoint = chapter.blocks.some((block) => block.type === "checkpoint");
    if (removedCheckpoint && !hasRootCheckpoint) {
      // The screen remains part of the sequential course. Learners must still
      // view it before the next screen, but are not blocked by a deleted,
      // source-incomplete activity.
      chapter.completionRule = { requires: ["contentViewed"] };
    }
  }

  if (courseId.startsWith("claude_certified_developer_foundations__")) {
    for (const lesson of course.lessons || []) {
      lesson.recommendedVideosManaged = false;
      delete lesson.recommendedVideos;
    }
    course.videoRecommendationStatus = "none";
  }

  const checkpointCount = chapters.reduce((sum, chapter) => sum + (chapter.blocks || []).filter((block) => block.type === "checkpoint").length, 0);
  const cloudExerciseCount = chapters.reduce((sum, chapter) => sum + (chapter.blocks || []).filter((block) => block.type === "cloud_exercise").length, 0);
  courseStats.push({
    courseId,
    coursePath,
    removed: [...removed].sort(),
    chapterCount: chapters.length,
    exerciseCount: course.exercises.length,
    checkpointCount,
    cloudExerciseCount,
    videoCount: (course.lessons || []).flatMap((lesson) => lesson.chapters || []).flatMap((chapter) => chapter.blocks || []).filter((block) => block.type === "video").length,
    downloadCount: (course.lessons || []).flatMap((lesson) => lesson.chapters || []).flatMap((chapter) => chapter.blocks || []).filter((block) => block.type === "download").length,
  });
  fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
}

const catalog = JSON.parse(fs.readFileSync(indexPath, "utf8"));
for (const stat of courseStats) {
  const entry = catalog.courses?.find((course) => course.id === stat.courseId);
  if (!entry) throw new Error(`Catalogue entry missing: ${stat.courseId}`);
  entry.chapterCount = stat.chapterCount;
  entry.exerciseCount = stat.exerciseCount;
  entry.totalActivities = stat.checkpointCount + stat.cloudExerciseCount;
  entry.videoCount = stat.videoCount;
  entry.downloadCount = stat.downloadCount;
}
const certification = catalog.certifications?.find((item) => item.id === certificationId);
if (!certification) throw new Error(`Certification missing: ${certificationId}`);
const catalogCourses = catalog.courses.filter((course) => course.certId === certificationId);
certification.totalLessons = catalogCourses.reduce((sum, course) => sum + (course.lessonCount || 0), 0);
certification.totalExercises = catalogCourses.reduce((sum, course) => sum + (course.exerciseCount || 0), 0);
certification.totalVideos = catalogCourses.reduce((sum, course) => sum + (course.videoCount || 0), 0);
certification.totalDownloads = catalogCourses.reduce((sum, course) => sum + (course.downloadCount || 0), 0);
fs.writeFileSync(indexPath, `${JSON.stringify(catalog, null, 2)}\n`);

console.log(JSON.stringify({ certificationId, courses: courseStats }, null, 2));
