import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "client/src/data/trainingIndex.json");
const coursesDir = path.join(root, "client/public/data/courses");
const outputPath = path.join(root, "docs/anthropic_paths_audit_2026-08-20.json");

const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const certifications = Array.isArray(index)
  ? index
  : Array.isArray(index.certifications)
    ? index.certifications
    : [];

const officialCertifications = certifications.filter((certification) =>
  String(certification.id ?? "").startsWith("claude_certified_"),
);
const courseMetadataById = new Map((index.courses || []).map((course) => [course.id, course]));

const interactiveTypes = new Set([
  "exercise",
  "quiz",
  "single_choice_exercise",
  "multi_choice_exercise",
  "bucket_sort",
  "matching",
  "fill_blank",
  "terminal_sim",
  "code_repl",
  "ordering",
  "ai_evaluation",
  "cloud_exercise",
]);

function valueForLocale(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value.fr || value.en || "";
}

function getCourseId(course) {
  return course.courseId || course.id || course.slug || "";
}

function getCourses(certification) {
  const courses = Array.isArray(certification.courses)
    ? certification.courses
    : Array.isArray(certification.modules)
      ? certification.modules
      : [];
  return courses.map((course) => typeof course === "string" ? { courseId: course } : course);
}

function isSupplementaryChapter(chapter) {
  return (chapter.blocks || []).some((block) => {
    if (block.type !== "callout") return false;
    return /complement\s+neopolis|neopolis\s+supplement/i.test(
      JSON.stringify(block).normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
    );
  });
}

function auditCourse(course) {
  const courseId = getCourseId(course);
  const metadata = courseMetadataById.get(courseId) || course;
  const filePath = path.join(coursesDir, `${courseId}.json`);
  if (!courseId || !fs.existsSync(filePath)) {
    return {
      courseId,
      title: valueForLocale(course.title) || course.title || courseId,
      missingFile: true,
      lessons: 0,
      chapters: 0,
      videos: 0,
      interactiveExercises: 0,
      downloads: 0,
      discrepancies: [],
      warnings: ["Fichier JSON de cours absent du répertoire public."],
    };
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const lessons = Array.isArray(data.lessons) ? data.lessons : [];
  const warnings = [];
  let chapters = 0;
  let videos = 0;
  let interactiveExercises = 0;
  let downloads = 0;
  let gatedChapters = 0;
  let supplementaryChapters = 0;
  const courseCheckpointReferences = new Set();

  for (const lesson of lessons) {
    const lessonChapters = Array.isArray(lesson.chapters) ? lesson.chapters : [];
    if (lessonChapters.length === 0) {
      warnings.push(`Leçon sans chapitre : ${valueForLocale(lesson.title) || lesson.id || "sans titre"}.`);
    }
    for (const chapter of lessonChapters) {
      chapters += 1;
      const blocks = Array.isArray(chapter.blocks) ? chapter.blocks : [];
      const videoBlocks = blocks.filter((block) => block.type === "video");
      const exerciseBlocks = blocks.filter((block) => interactiveTypes.has(block.type));
      const checkpointReferences = new Set(blocks
        .filter((block) => block.type === "checkpoint")
        .map((block) => block.exerciseId ?? block.exerciseIndex)
        .filter((value) => value !== undefined && value !== null));
      const downloadBlocks = blocks.filter((block) => block.type === "download");
      videos += videoBlocks.length;
      interactiveExercises += exerciseBlocks.length;
      checkpointReferences.forEach((reference) => courseCheckpointReferences.add(reference));
      downloads += downloadBlocks.length;
      if (chapter.completionRule?.requires?.length) gatedChapters += 1;
      if (isSupplementaryChapter(chapter)) supplementaryChapters += 1;

      const requirements = chapter.completionRule?.requires || [];
      const needsExercise = requirements.includes("requiredExercisesPassed");
      if (needsExercise && exerciseBlocks.length + checkpointReferences.size === 0) {
        warnings.push(`Règle d’exercice sans activité détectée : ${valueForLocale(chapter.title) || chapter.id || "chapitre sans titre"}.`);
      }
      const needsVideo = requirements.includes("videosViewed");
      if (needsVideo && videoBlocks.length === 0) {
        warnings.push(`Règle vidéo sans vidéo détectée : ${valueForLocale(chapter.title) || chapter.id || "chapitre sans titre"}.`);
      }
    }
  }

  interactiveExercises += courseCheckpointReferences.size;

  const declared = {
    lessons: metadata.lessonCount ?? course.lessonCount ?? null,
    chapters: metadata.chapterCount ?? null,
    videos: Array.isArray(metadata.videos) ? metadata.videos.length : (metadata.videoCount ?? null),
    exercises: metadata.exerciseCount ?? null,
    downloads: metadata.downloadCount ?? null,
  };
  const discrepancies = [];
  if (Number.isFinite(declared.lessons) && declared.lessons !== lessons.length) discrepancies.push(`Leçons déclarées ${declared.lessons}, calculées ${lessons.length}.`);
  if (Number.isFinite(declared.chapters) && declared.chapters !== chapters) discrepancies.push(`Chapitres déclarés ${declared.chapters}, calculés ${chapters}.`);
  if (Number.isFinite(declared.videos) && declared.videos !== videos) discrepancies.push(`Vidéos déclarées ${declared.videos}, calculées ${videos}.`);
  if (Number.isFinite(declared.exercises) && declared.exercises !== interactiveExercises) discrepancies.push(`Exercices déclarés ${declared.exercises}, calculés ${interactiveExercises}.`);
  if (Number.isFinite(declared.downloads) && declared.downloads !== downloads) discrepancies.push(`Téléchargements déclarés ${declared.downloads}, calculés ${downloads}.`);

  return {
    courseId,
    title: valueForLocale(course.title) || course.title || data.sourceCourseTitle || courseId,
    missingFile: false,
    lessons: lessons.length,
    chapters,
    videos,
    interactiveExercises,
    downloads,
    gatedChapters,
    supplementaryChapters,
    declared,
    discrepancies,
    warnings,
  };
}

const report = officialCertifications.map((certification) => {
  const courses = getCourses(certification).map(auditCourse);
  const totals = courses.reduce((totals, course) => ({
    courses: totals.courses + 1,
    lessons: totals.lessons + course.lessons,
    chapters: totals.chapters + course.chapters,
    videos: totals.videos + course.videos,
    interactiveExercises: totals.interactiveExercises + course.interactiveExercises,
    downloads: totals.downloads + course.downloads,
    gatedChapters: totals.gatedChapters + course.gatedChapters,
    supplementaryChapters: totals.supplementaryChapters + course.supplementaryChapters,
    warnings: totals.warnings + course.warnings.length + course.discrepancies.length,
  }), { courses: 0, lessons: 0, chapters: 0, videos: 0, interactiveExercises: 0, downloads: 0, gatedChapters: 0, supplementaryChapters: 0, warnings: 0 });
  const declared = {
    courses: certification.courseCount ?? null,
    lessons: certification.totalLessons ?? null,
    videos: certification.totalVideos ?? null,
    exercises: certification.totalExercises ?? null,
    downloads: certification.totalDownloads ?? null,
  };
  const discrepancies = [];
  if (Number.isFinite(declared.courses) && declared.courses !== totals.courses) discrepancies.push(`Cours déclarés ${declared.courses}, calculés ${totals.courses}.`);
  if (Number.isFinite(declared.lessons) && declared.lessons !== totals.lessons) discrepancies.push(`Leçons déclarées ${declared.lessons}, calculées ${totals.lessons}.`);
  if (Number.isFinite(declared.videos) && declared.videos !== totals.videos) discrepancies.push(`Vidéos déclarées ${declared.videos}, calculées ${totals.videos}.`);
  if (Number.isFinite(declared.exercises) && declared.exercises !== totals.interactiveExercises) discrepancies.push(`Exercices déclarés ${declared.exercises}, calculés ${totals.interactiveExercises}.`);
  if (Number.isFinite(declared.downloads) && declared.downloads !== totals.downloads) discrepancies.push(`Téléchargements déclarés ${declared.downloads}, calculés ${totals.downloads}.`);
  return {
    certificationId: certification.id,
    title: valueForLocale(certification.title) || certification.title || certification.id,
    courses,
    declared,
    discrepancies,
    totals,
  };
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

for (const certification of report) {
  const { totals } = certification;
  console.log(`${certification.certificationId}: ${totals.courses} cours, ${totals.lessons} leçons, ${totals.chapters} chapitres, ${totals.videos} vidéos, ${totals.interactiveExercises} activités évaluées, ${totals.warnings} alertes structurelles.`);
}

if (process.argv.includes("--strict")) {
  const alertCount = report.reduce(
    (count, certification) => count + certification.discrepancies.length + certification.totals.warnings,
    0,
  );
  if (alertCount > 0) {
    console.error(`Audit Anthropic strict échoué : ${alertCount} incohérence(s) à corriger.`);
    process.exitCode = 1;
  }
}
