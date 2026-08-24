#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

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

async function existingFile(filePath) {
  try {
    await fs.access(filePath);
    return filePath;
  } catch {
    return null;
  }
}

function manifestEntries(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  for (const key of ["assets", "downloads", "files", "items", "entries"]) {
    if (Array.isArray(value[key])) return value[key];
  }
  return [];
}

async function summarizeOptionalJson(filePath) {
  if (!filePath) return null;
  const value = JSON.parse(await fs.readFile(filePath, "utf8"));
  const entries = manifestEntries(value);
  return {
    path: filePath,
    entries: entries.length,
    successfulEntries: entries.filter((entry) => entry?.ok === true).length,
    failedEntries: entries.filter((entry) => entry?.ok === false).length,
  };
}

const coursePath = valueFor("--course");
const manifestPath = valueFor("--manifest");
const productionBaseUrl = valueFor("--production-base-url").replace(/\/$/, "");
if (!coursePath || !manifestPath) {
  console.error("Usage: node scripts/audit-datacamp-course.mjs --course <course.json> --manifest <COURSE_MANIFEST.json> [--production-base-url <https://domain>]");
  process.exit(1);
}

const course = JSON.parse(await fs.readFile(coursePath, "utf8"));
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const packageRoot = path.dirname(manifestPath);
const completenessReportPath = await existingFile(path.join(packageRoot, "COMPLETENESS_REPORT.md"));
const downloadAssetsManifestPath = await existingFile(path.join(packageRoot, "download_assets_manifest.json"));
const mediaValidationReportPath = await existingFile(path.join(packageRoot, "MEDIA_VALIDATION_REPORT.json"));
const completenessReport = completenessReportPath
  ? { path: completenessReportPath, characters: (await fs.readFile(completenessReportPath, "utf8")).length }
  : null;
const downloadAssetsManifest = await summarizeOptionalJson(downloadAssetsManifestPath);
const mediaValidationReport = await summarizeOptionalJson(mediaValidationReportPath);
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
  .filter((block) => !block.environmentGuide)
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
  canonicalSources: {
    courseManifest: manifestPath,
    completenessReport,
    downloadAssetsManifest,
    mediaValidationReport,
  },
  errors: [],
};

if (unexpectedBlocks.length) report.errors.push(`Blocs non autorisés : ${[...new Set(unexpectedBlocks)].join(", ")}`);
if (invalidMedia.length) report.errors.push(`${invalidMedia.length} référence(s) média non locale(s) détectée(s)`);
if (!report.sequentiallyLocked) report.errors.push("Au moins une activité désactive le verrouillage séquentiel.");
if (untaggedEvaluationLessons.length) report.errors.push(`Activités évaluées sans tags de compétences : ${untaggedEvaluationLessons.join(", ")}`);
if (underpreparedLabs.length) report.errors.push(`TP sans préparation d’environnement autonome : ${underpreparedLabs.join(", ")}`);

const expected = manifest.completeness || manifest.counts || {};
const expectedActivities = expected.activities_extracted ?? expected.exercises;
const expectedVideos = expected.videos_extracted ?? expected.videos;
report.expected = { activities: expectedActivities, videos: expectedVideos };
if (Number.isFinite(expectedActivities) && report.activities !== expectedActivities) report.errors.push(`Activités : ${report.activities} générées, ${expectedActivities} attendues.`);
if (Number.isFinite(expectedVideos) && report.videos !== expectedVideos) report.errors.push(`Vidéos : ${report.videos} générées, ${expectedVideos} attendues.`);

if (productionBaseUrl && media.length) {
  const checkMedia = async ({ url }) => {
    let lastResult = { url, status: 0, contentType: "", ok: false };
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetch(`${productionBaseUrl}${url}`, {
          method: "HEAD",
          redirect: "follow",
          signal: AbortSignal.timeout(8000),
        });
        lastResult = { url, status: response.status, contentType: response.headers.get("content-type") || "", ok: response.ok, attempt };
        if (response.ok) return lastResult;

        const rangeResponse = await fetch(`${productionBaseUrl}${url}`, {
          method: "GET",
          headers: { Range: "bytes=0-1023" },
          redirect: "follow",
          signal: AbortSignal.timeout(30000),
        });
        lastResult = {
          url,
          status: rangeResponse.status,
          contentType: rangeResponse.headers.get("content-type") || "",
          ok: rangeResponse.ok,
          attempt,
          checkedWith: "range_get",
        };
        if (rangeResponse.ok || rangeResponse.status === 404 || attempt === 3) return lastResult;
      } catch (error) {
        try {
          const rangeResponse = await fetch(`${productionBaseUrl}${url}`, {
            method: "GET",
            headers: { Range: "bytes=0-1023" },
            redirect: "follow",
            signal: AbortSignal.timeout(30000),
          });
          lastResult = {
            url,
            status: rangeResponse.status,
            contentType: rangeResponse.headers.get("content-type") || "",
            ok: rangeResponse.ok,
            attempt,
            checkedWith: "range_get",
          };
          if (rangeResponse.ok || attempt === 3) return lastResult;
        } catch (rangeError) {
          lastResult = { url, status: 0, contentType: "", ok: false, error: `${String(error)}; ${String(rangeError)}`, attempt };
          if (attempt === 3) return lastResult;
        }
      }
      const retryAfterSeconds = Number(lastResult.retryAfter || 0);
      await new Promise((resolve) => setTimeout(resolve, Math.max(attempt * 1000, retryAfterSeconds * 1000)));
    }
    return lastResult;
  };
  const checks = [];
  for (const [index, mediaEntry] of media.entries()) {
    checks.push(await checkMedia(mediaEntry));
    if (index < media.length - 1) await new Promise((resolve) => setTimeout(resolve, 600));
  }
  report.productionMedia = checks;
  if (checks.some((check) => !check.ok)) report.errors.push("Au moins un média ne répond pas avec un statut HTTP de succès en production.");
}

console.log(JSON.stringify(report, null, 2));
process.exit(report.errors.length ? 1 : 0);
