import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const courseId = "claude_certified_architect_foundations__01";
const coursePath = resolve(process.cwd(), `client/public/data/courses/${courseId}.json`);
const outputPath = resolve(process.cwd(), "docs/architect-foundations-course1-inventory.json");
const course = JSON.parse(await readFile(coursePath, "utf8"));

const asText = (value) => typeof value === "string" ? value : value && typeof value === "object" ? value.fr || value.en || "" : "";
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const hasNonEmpty = (value) => typeof value === "string" && value.trim().length > 0;

const lessons = (course.lessons || []).map((lesson, lessonIndex) => {
  const chapters = (lesson.chapters || []).map((chapter, chapterIndex) => {
    const blocks = Array.isArray(chapter.blocks) ? chapter.blocks : [];
    const videos = blocks.filter((block) => block.type === "video").map((block) => ({
      videoId: block.videoId || null,
      title: asText(block.title),
      watchUrl: block.watchUrl || null,
      embedUrl: block.embedUrl || null,
      hasTranscript: blocks.some((candidate) => candidate.type === "transcript" && candidate.videoId === block.videoId),
    }));
    const downloads = blocks.filter((block) => block.type === "download").map((block) => ({
      title: asText(block.title),
      filename: block.filename || null,
      url: block.download_url || block.url || null,
      sourcePage: block.source_page || null,
      assetPath: block.asset_path || null,
    }));
    const activities = blocks.filter((block) => ["checkpoint", "quiz", "multi_choice_exercise", "drag_and_drop", "ai_evaluation", "sorting"].includes(block.type));
    return {
      lessonIndex,
      chapterIndex,
      id: chapter.id || null,
      title: { en: chapter.title?.en || "", fr: chapter.title?.fr || "" },
      type: chapter.type || null,
      completionRule: chapter.completionRule || null,
      blockTypes: blocks.map((block) => block.type || "unknown"),
      videos,
      transcripts: blocks.filter((block) => block.type === "transcript").map((block) => ({ videoId: block.videoId || null, hasEn: hasNonEmpty(block.body?.en), hasFr: hasNonEmpty(block.body?.fr) })),
      downloads,
      activities: activities.map((block) => ({ type: block.type, id: block.id || null, exerciseId: block.exerciseId || null })),
      checksum: hash(chapter),
    };
  });
  return {
    lessonIndex,
    id: lesson.id || null,
    title: { en: lesson.title?.en || "", fr: lesson.title?.fr || "" },
    completionRule: lesson.completionRule || null,
    competencyTags: lesson.competencyTags || [],
    chapterCount: chapters.length,
    chapters,
  };
});

const chapters = lessons.flatMap((lesson) => lesson.chapters);
const chapterKeys = new Set(chapters.map((chapter) => `${course.lessons[chapter.lessonIndex]?.id || ""}:${chapter.id || ""}`));
const exercises = (course.exercises || []).map((exercise) => ({
  id: exercise.id || null,
  lessonId: exercise.lessonId || null,
  chapterId: exercise.chapterId || null,
  required: exercise.required === true,
  interactionType: exercise.interactionType || null,
  title: { en: exercise.title?.en || "", fr: exercise.title?.fr || "" },
  isAttachedToCurrentChapter: chapterKeys.has(`${exercise.lessonId || ""}:${exercise.chapterId || ""}`),
  checksum: hash(exercise),
}));
const checkpointExerciseIds = chapters.flatMap((chapter) => chapter.activities)
  .filter((activity) => activity.type === "checkpoint")
  .map((activity) => activity.exerciseId || activity.id)
  .filter(Boolean);
const exerciseIds = new Set(exercises.map((exercise) => exercise.id).filter(Boolean));
const orphanExerciseIds = exercises.filter((exercise) => !checkpointExerciseIds.includes(exercise.id)).map((exercise) => exercise.id);
const inventory = {
  generatedAt: new Date().toISOString(),
  courseId,
  sourceCourseTitle: course.sourceCourseTitle,
  courseChecksum: hash(course),
  totals: {
    lessons: lessons.length,
    chapters: chapters.length,
    videos: chapters.reduce((total, chapter) => total + chapter.videos.length, 0),
    videoBlocksWithTranscript: chapters.reduce((total, chapter) => total + chapter.videos.filter((video) => video.hasTranscript).length, 0),
    transcriptBlocks: chapters.reduce((total, chapter) => total + chapter.transcripts.length, 0),
    downloads: chapters.reduce((total, chapter) => total + chapter.downloads.length, 0),
    interactiveBlocks: chapters.reduce((total, chapter) => total + chapter.activities.length, 0),
    exercises: exercises.length,
    requiredExercises: exercises.filter((exercise) => exercise.required).length,
    detachedExercises: exercises.filter((exercise) => !exercise.isAttachedToCurrentChapter).length,
    checkpointBlocks: checkpointExerciseIds.length,
    checkpointReferencesMissingExercise: checkpointExerciseIds.filter((id) => !exerciseIds.has(id)),
    exercisesNotRenderedByCheckpoint: orphanExerciseIds,
  },
  lessons,
  exercises,
};

await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
console.table(lessons.map(({ lessonIndex, title, chapterCount, chapters }) => ({
  lesson: lessonIndex + 1,
  id: title.en,
  chapterCount,
  videos: chapters.reduce((total, chapter) => total + chapter.videos.length, 0),
  downloads: chapters.reduce((total, chapter) => total + chapter.downloads.length, 0),
  activities: chapters.reduce((total, chapter) => total + chapter.activities.length, 0),
})));
console.log(JSON.stringify(inventory.totals));
