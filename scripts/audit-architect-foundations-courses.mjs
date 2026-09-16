import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const prefix = "claude_certified_architect_foundations__";
const courseIds = ["01", "02", "03", "04", "05", "06", "07"].map((suffix) => `${prefix}${suffix}`);
const courseTargets = {
  [`${prefix}01`]: { expectedChapters: 34, expectedOfficialVideos: 11, expectedDownloads: 14 },
  [`${prefix}02`]: { expectedChapters: 95, expectedExercises: 16, expectedDownloads: 35, expectedOfficialVideos: 1 },
  [`${prefix}03`]: { expectedChapters: 99, expectedExercises: 26, expectedDownloads: 40 },
  [`${prefix}04`]: { expectedChapters: 23, expectedExercises: 9, expectedOfficialVideos: 9, expectedVideos: 15 },
  [`${prefix}05`]: { expectedChapters: 24, expectedExercises: 7, expectedOfficialVideos: 6, expectedVideos: 10 },
  [`${prefix}06`]: { expectedChapters: 80, expectedExercises: 12, expectedDownloads: 48 },
  [`${prefix}07`]: { expectedChapters: 26, expectedExercises: 4, expectedDownloads: 2 },
};
const signals = [
  { key: "best_practices", pattern: /\bbest practices\b/i },
  { key: "key_takeaways", pattern: /\bkey takeaways\b/i },
  { key: "human_in_the_loop", pattern: /\bhuman-in-the-loop\b/i },
  { key: "guardrail", pattern: /\bguardrails?\b/i },
  { key: "rollout_plan", pattern: /\brollout plan\b/i },
  { key: "model_card", pattern: /\bmodel card\b/i },
];

function hash(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function localized(value, locale = "en") {
  if (typeof value === "string") return value;
  return value?.[locale] || value?.en || value?.fr || "";
}

function recursivelyCollectStrings(value, locale, output = []) {
  if (typeof value === "string") output.push(value);
  else if (Array.isArray(value)) value.forEach((entry) => recursivelyCollectStrings(entry, locale, output));
  else if (value && typeof value === "object") {
    if (("fr" in value || "en" in value) && typeof value[locale] === "string") output.push(value[locale]);
    else Object.values(value).forEach((entry) => recursivelyCollectStrings(entry, locale, output));
  }
  return output;
}

function missingMediaFields(meta, fields) {
  return fields.filter((field) => meta?.[field] === undefined || meta?.[field] === null || meta?.[field] === "");
}

async function inspectCourse(courseId) {
  const course = JSON.parse(await readFile(resolve(root, `client/public/data/courses/${courseId}.json`), "utf8"));
  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  const chapters = lessons.flatMap((lesson) => lesson.chapters || []);
  const blocks = chapters.flatMap((chapter) => chapter.blocks || []);
  const videos = blocks.filter((block) => block.type === "video");
  const downloads = blocks.filter((block) => block.type === "download");
  const transcripts = blocks.filter((block) => block.type === "transcript");
  const checkpoints = blocks.filter((block) => block.type === "checkpoint");
  const checkpointIds = checkpoints.map((block) => block.exerciseId).filter(Boolean);
  const renderedExerciseIds = new Set(checkpointIds);
  const exercises = Array.isArray(course.exercises) ? course.exercises : [];
  const unrenderedExercises = exercises.filter((exercise) => !renderedExerciseIds.has(exercise.id));
  const officialVideos = videos.filter((block) => block.mediaMeta?.official === true);
  const supplementaryVideos = videos.filter((block) => block.mediaMeta?.official === false);
  const stringsFr = recursivelyCollectStrings(course, "fr");
  const localeSignals = Object.fromEntries(signals.map(({ key, pattern }) => [key, stringsFr.filter((value) => pattern.test(value)).length]));
  const requiredVideoFields = ["origin", "official", "sourceUrl", "localAssetId", "language", "captions", "transcriptId", "duration", "checksum"];
  const requiredDownloadFields = ["origin", "official", "mimeType", "bytes", "checksum"];
  const videoIssues = videos.map((video) => ({
    id: video.videoId || null,
    title: localized(video.title),
    missingMediaMeta: missingMediaFields(video.mediaMeta, requiredVideoFields),
    hasTranscript: transcripts.some((transcript) => transcript.videoId === video.videoId),
  })).filter((video) => video.missingMediaMeta.length > 0);
  const downloadIssues = downloads.map((download) => ({
    title: localized(download.title),
    url: download.download_url || download.url || null,
    missingAssetMeta: missingMediaFields(download.assetMeta, requiredDownloadFields),
  })).filter((download) => !download.url || download.missingAssetMeta.length > 0);
  const duplicateCheckpointIds = checkpointIds.filter((id, index) => checkpointIds.indexOf(id) !== index);
  const target = courseTargets[courseId] || {};
  const observed = {
    lessons: lessons.length,
    chapters: chapters.length,
    exercises: exercises.length,
    checkpointBlocks: checkpoints.length,
    videos: videos.length,
    officialVideos: officialVideos.length,
    supplementaryVideos: supplementaryVideos.length,
    transcriptBlocks: transcripts.length,
    downloads: downloads.length,
  };
  const targetGaps = Object.fromEntries(Object.entries(target).map(([key, expected]) => {
    const observedKey = key.replace(/^expected/, "").replace(/^./, (character) => character.toLowerCase());
    return [key, { expected, observed: observed[observedKey] ?? null, delta: observed[observedKey] === undefined ? null : observed[observedKey] - expected }];
  }));
  return {
    courseId,
    title: localized(course.sourceCourseTitle),
    checksum: hash(course),
    observed,
    targetGaps,
    integrity: {
      duplicateCheckpointIds: [...new Set(duplicateCheckpointIds)],
      checkpointBlocksMissingExerciseId: checkpoints.filter((block) => !block.exerciseId).map((block) => block.id || null),
      unrenderedExercises: unrenderedExercises.map((exercise) => ({ id: exercise.id || null, interactionType: exercise.interactionType || null, required: exercise.required === true })),
      videosMissingRequiredMetadata: videoIssues,
      downloadsMissingRequiredMetadata: downloadIssues,
      frenchTerminologySignals: localeSignals,
    },
  };
}

const courses = await Promise.all(courseIds.map(inspectCourse));
const summary = {
  generatedAt: new Date().toISOString(),
  scope: "Claude Certified Architect Foundations only",
  courseCount: courses.length,
  totalChapters: courses.reduce((sum, course) => sum + course.observed.chapters, 0),
  totalVideos: courses.reduce((sum, course) => sum + course.observed.videos, 0),
  totalDownloads: courses.reduce((sum, course) => sum + course.observed.downloads, 0),
  totalExercises: courses.reduce((sum, course) => sum + course.observed.exercises, 0),
  coursesWithDuplicateCheckpoints: courses.filter((course) => course.integrity.duplicateCheckpointIds.length > 0).map((course) => course.courseId),
  coursesWithUnrenderedExercises: courses.filter((course) => course.integrity.unrenderedExercises.length > 0).map((course) => course.courseId),
  coursesWithMissingMediaMetadata: courses.filter((course) => course.integrity.videosMissingRequiredMetadata.length > 0 || course.integrity.downloadsMissingRequiredMetadata.length > 0).map((course) => course.courseId),
};
const report = { summary, courses };
const outputPath = resolve(root, "docs/architect-foundations-current-audit.json");
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.table(courses.map((course) => ({
  course: course.courseId.slice(-2),
  chapters: course.observed.chapters,
  videos: `${course.observed.officialVideos}+${course.observed.supplementaryVideos}`,
  downloads: course.observed.downloads,
  exercises: course.observed.exercises,
  unrendered: course.integrity.unrenderedExercises.length,
  duplicateCheckpoints: course.integrity.duplicateCheckpointIds.length,
  mediaMetadataIssues: course.integrity.videosMissingRequiredMetadata.length + course.integrity.downloadsMissingRequiredMetadata.length,
})));
console.log(JSON.stringify(summary, null, 2));
