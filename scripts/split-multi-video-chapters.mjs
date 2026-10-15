#!/usr/bin/env node
/**
 * Sépare les écrans contenant plusieurs blocs vidéo.
 *
 * Règle : un chapitre pédagogique ne contient jamais plus d'une vidéo.
 * Le premier écran conserve les blocs non vidéo (introduction, consignes,
 * checkpoint, etc.) et la première vidéo ; chaque vidéo suivante devient un
 * nouvel écran contigu. Les IDs de chapitres ajoutés sont déterministes.
 *
 * Usage : node scripts/split-multi-video-chapters.mjs [--check]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const coursesDir = join(root, "client/public/data/courses");
const indexPath = join(root, "client/src/data/trainingIndex.json");
const targets = [
  "claude_certified_architect_foundations__01",
  "ia_pour_les_nuls__01",
];
const checkOnly = process.argv.includes("--check");

const clone = (value) => JSON.parse(JSON.stringify(value));
const label = (value, language) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value[language] || value.en || value.fr || "";
  return "";
};
const addSuffix = (value, suffix) => {
  if (typeof value === "string") return `${value} — ${suffix}`;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([language, text]) => [
      language,
      typeof text === "string" && text ? `${text} — ${suffix}` : text,
    ]));
  }
  return value;
};

function videoCount(chapter) {
  return (chapter.blocks || []).filter((block) => block?.type === "video").length;
}

function splitCourse(course) {
  let splitCount = 0;
  const nextLessons = (course.lessons || []).map((lesson, lessonIndex) => {
    const nextChapters = [];
    (lesson.chapters || []).forEach((chapter) => {
      const videos = (chapter.blocks || []).filter((block) => block?.type === "video");
      if (videos.length <= 1) {
        nextChapters.push(chapter);
        return;
      }

      splitCount += videos.length - 1;
      const nonVideoBlocks = (chapter.blocks || []).filter((block) => block?.type !== "video");
      const baseTitle = chapter.title;
      const chapterId = chapter.id || `chapter_${lessonIndex + 1}_${nextChapters.length + 1}`;
      const total = videos.length;

      videos.forEach((video, videoIndex) => {
        const suffix = `Vidéo ${videoIndex + 1}/${total}`;
        const splitChapter = clone(chapter);
        splitChapter.id = videoIndex === 0
          ? chapterId
          : `${chapterId}_video_${videoIndex + 1}`;
        splitChapter.title = addSuffix(baseTitle, suffix);
        splitChapter.blocks = [
          ...(videoIndex === 0 ? clone(nonVideoBlocks) : []),
          clone(video),
        ];
        splitChapter.sourceChapterId = chapterId;
        splitChapter.videoSequence = videoIndex + 1;
        splitChapter.videoSequenceTotal = total;
        nextChapters.push(splitChapter);
      });
    });
    return { ...lesson, chapters: nextChapters };
  });
  return { course: { ...course, lessons: nextLessons }, splitCount };
}

function recomputeCourseIndexEntry(entry, course) {
  const chapters = (course.lessons || []).flatMap((lesson) => lesson.chapters || []);
  const videos = chapters.flatMap((chapter) => (chapter.blocks || []).filter((block) => block?.type === "video"));
  const downloads = chapters.flatMap((chapter) => (chapter.blocks || []).filter((block) => ["download", "file", "pdf"].includes(block?.type)));
  return {
    ...entry,
    lessonCount: (course.lessons || []).length,
    chapterCount: chapters.length,
    totalActivities: chapters.length,
    videoCount: videos.length,
    downloadCount: downloads.length,
  };
}

function ensureUniqueChapterIds(course) {
  const used = new Set();
  let renamed = 0;
  (course.lessons || []).forEach((lesson, lessonIndex) => {
    (lesson.chapters || []).forEach((chapter, chapterIndex) => {
      const base = chapter.id || `chapter_${lessonIndex + 1}_${chapterIndex + 1}`;
      let candidate = base;
      if (used.has(candidate)) {
        let suffix = 2;
        do candidate = `${base}_lesson_${lessonIndex + 1}_${suffix++}`; while (used.has(candidate));
        chapter.id = candidate;
        renamed++;
      } else if (!chapter.id) {
        chapter.id = candidate;
        renamed++;
      }
      used.add(candidate);
    });
  });
  return renamed;
}

const changed = new Map();
for (const courseId of targets) {
  const path = join(coursesDir, `${courseId}.json`);
  const original = JSON.parse(readFileSync(path, "utf8"));
  const result = splitCourse(original);
  const renamedCount = ensureUniqueChapterIds(result.course);
  changed.set(courseId, result);
  console.log(`${courseId}: ${result.splitCount} écran(s) ajouté(s), ${renamedCount} ID(s) normalisé(s)`);
  if (!checkOnly && (result.splitCount > 0 || renamedCount > 0)) writeFileSync(path, `${JSON.stringify(result.course, null, 2)}\n`);
}

const index = JSON.parse(readFileSync(indexPath, "utf8"));
for (const courseId of targets) {
  const entryIndex = index.courses.findIndex((entry) => entry.id === courseId);
  if (entryIndex < 0) throw new Error(`Cours absent de trainingIndex.json : ${courseId}`);
  const source = changed.get(courseId);
  index.courses[entryIndex] = recomputeCourseIndexEntry(index.courses[entryIndex], source.course);
}
for (const certification of index.certifications || []) {
  if (!certification.courses?.some((courseId) => targets.includes(courseId))) continue;
  certification.totalActivities = certification.courses.reduce((sum, courseId) => {
    const course = index.courses.find((entry) => entry.id === courseId);
    return sum + Number(course?.totalActivities || 0);
  }, 0);
}
if (!checkOnly) writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);

// Failsafe: the script's post-condition is also useful in CI.
for (const { course } of changed.values()) {
  for (const lesson of course.lessons || []) {
    for (const chapter of lesson.chapters || []) {
      if (videoCount(chapter) > 1) throw new Error(`Écran multi-vidéos résiduel : ${chapter.id}`);
    }
  }
}
