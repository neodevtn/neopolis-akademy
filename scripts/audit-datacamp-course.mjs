#!/usr/bin/env node
import fs from "node:fs/promises";

const ALLOWED_BLOCK_TYPES = new Set([
  "content", "video", "transcript", "download", "flip_cards", "single_choice_exercise",
  "multi_choice_exercise", "bucket_sort", "matching", "fill_blank", "ordering", "code_repl",
  "terminal_sim", "cloud_exercise", "exercise", "checkpoint", "ai_evaluation", "callout", "resource_review",
  "tabbed_content", "comparison",
]);
const MEDIA_KEYS = new Set(["mp4Url", "audioUrl", "hlsUrl", "subtitleUrlFr", "subtitleUrlEn", "slidesPdf", "download_url", "url"]);
const EVALUATION_BLOCK_TYPES = new Set([
  "single_choice_exercise", "multi_choice_exercise", "bucket_sort", "matching", "fill_blank", "ordering",
  "cloud_exercise", "code_repl", "terminal_sim", "ai_evaluation", "exercise", "checkpoint",
]);

function valueFor(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : "";
}

function collectMedia(value, entries = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectMedia(item, entries));
    return entries;
  }
  if (!value || typeof value !== "object") return entries;
  for (const [key, item] of Object.entries(value)) {
    if (MEDIA_KEYS.has(key) && typeof item === "string" && item) entries.push({ key, url: item });
    else collectMedia(item, entries);
  }
  return entries;
}

const coursePath = valueFor("--course");
const manifestPath = valueFor("--manifest");
const productionBaseUrl = valueFor("--production-base-url").replace(/\/$/, "");
if (!coursePath) {
  console.error("Usage: node scripts/audit-datacamp-course.mjs --course <course.json> [--manifest <COURSE_MANIFEST.json>] [--production-base-url <https://domain>]");
  process.exit(1);
}

const course = JSON.parse(await fs.readFile(coursePath, "utf8"));
const lessons = Array.isArray(course.lessons) ? course.lessons : [];
const chapters = lessons.flatMap((lesson) => lesson.chapters || []);
const blocks = chapters.flatMap((chapter) => chapter.blocks || []);
const media = collectMedia(course);
const unexpectedBlocks = blocks.filter((block) => !ALLOWED_BLOCK_TYPES.has(block.type)).map((block) => block.type);
const invalidMedia = media.filter(({ url }) => !url.startsWith("/api/assets/"));
const lessonsWithEvaluations = lessons.filter((lesson) => (lesson.chapters || [])
  .some((chapter) => (chapter.blocks || []).some((block) => EVALUATION_BLOCK_TYPES.has(block.type))));
const untaggedEvaluationLessons = lessonsWithEvaluations
  .filter((lesson) => !Array.isArray(lesson.competencyTags) || lesson.competencyTags.length === 0)
  .map((lesson) => lesson.id || "leçon sans identifiant");
const underpreparedLabs = blocks
  .filter((block) => block.type === "cloud_exercise")
  .filter((block) => !block.environmentGuide || !Array.isArray(block.resources) || !block.resources.some((resource) => typeof resource?.url === "string" && resource.url.startsWith("/api/assets/")))
  .map((block) => block.id || "TP sans identifiant");
const report = {
  courseId: course.courseId,
  lessons: lessons.length,
  activities: chapters.length,
  blockTypes: Object.fromEntries([...new Set(blocks.map((block) => block.type))].sort().map((type) => [type, blocks.filter((block) => block.type === type).length])),
  videos: blocks.filter((block) => block.type === "video").length,
  interactiveExercises: blocks.filter((block) => ["single_choice_exercise", "multi_choice_exercise", "bucket_sort", "matching", "fill_blank", "ordering", "cloud_exercise", "code_repl", "terminal_sim", "ai_evaluation", "resource_review"].includes(block.type)).length,
  media: media.length,
  localMedia: media.filter(({ url }) => url.startsWith("/api/assets/")).length,
  sequentiallyLocked: chapters.every((chapter) => chapter.requiredBeforeAdvance !== false),
  competencyTags: Object.fromEntries(lessons.map((lesson) => [lesson.id || "leçon sans identifiant", lesson.competencyTags || []])),
  untaggedEvaluationLessons,
  underpreparedLabs,
  unexpectedBlocks,
  invalidMedia,
  errors: [],
};

if (unexpectedBlocks.length) report.errors.push(`Blocs non autorisés : ${[...new Set(unexpectedBlocks)].join(", ")}`);
if (invalidMedia.length) report.errors.push(`${invalidMedia.length} référence(s) média non locale(s) détectée(s)`);
if (!report.sequentiallyLocked) report.errors.push("Au moins une activité désactive le verrouillage séquentiel.");
if (untaggedEvaluationLessons.length) report.errors.push(`Activités évaluées sans tags de compétences : ${untaggedEvaluationLessons.join(", ")}`);
if (underpreparedLabs.length) report.errors.push(`TP sans préparation d’environnement ou ressource locale téléchargeable : ${underpreparedLabs.join(", ")}`);

if (manifestPath) {
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const expected = manifest.completeness || manifest.counts || {};
  const expectedActivities = expected.activities_extracted ?? expected.exercises;
  const expectedVideos = expected.videos_extracted ?? expected.videos;
  report.expected = { activities: expectedActivities, videos: expectedVideos };
  if (Number.isFinite(expectedActivities) && report.activities !== expectedActivities) report.errors.push(`Activités : ${report.activities} générées, ${expectedActivities} attendues.`);
  if (Number.isFinite(expectedVideos) && report.videos !== expectedVideos) report.errors.push(`Vidéos : ${report.videos} générées, ${expectedVideos} attendues.`);
}

if (productionBaseUrl && media.length) {
  const checks = await Promise.all(media.map(async ({ url }) => {
    try {
      const response = await fetch(`${productionBaseUrl}${url}`, { method: "HEAD", redirect: "follow" });
      return { url, status: response.status, contentType: response.headers.get("content-type") || "", ok: response.ok };
    } catch (error) {
      return { url, status: 0, contentType: "", ok: false, error: String(error) };
    }
  }));
  report.productionMedia = checks;
  if (checks.some((check) => !check.ok)) report.errors.push("Au moins un média ne répond pas avec un statut HTTP de succès en production.");
}

console.log(JSON.stringify(report, null, 2));
process.exit(report.errors.length ? 1 : 0);
