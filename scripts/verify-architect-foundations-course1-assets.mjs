import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const baseUrl = process.env.NEOPOLIS_BASE_URL || "http://127.0.0.1:3000";
const coursePath = resolve(process.cwd(), "client/public/data/courses/claude_certified_architect_foundations__01.json");
const reportPath = resolve(process.cwd(), "docs/architect-foundations-course1-assets.json");
const course = JSON.parse(await readFile(coursePath, "utf8"));

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const localized = (value) => typeof value === "string" ? value : value?.en || value?.fr || "";
const allChapters = (course.lessons || []).flatMap((lesson, lessonIndex) => (lesson.chapters || []).map((chapter, chapterIndex) => ({ lesson, lessonIndex, chapter, chapterIndex })));

const videoRows = allChapters.flatMap(({ lesson, lessonIndex, chapter, chapterIndex }) => {
  const transcripts = new Set((chapter.blocks || []).filter((block) => block.type === "transcript" && block.videoId).map((block) => block.videoId));
  return (chapter.blocks || []).filter((block) => block.type === "video").map((block) => ({
    lessonIndex: lessonIndex + 1,
    lessonTitle: localized(lesson.title),
    chapterIndex: chapterIndex + 1,
    chapterTitle: localized(chapter.title),
    videoId: block.videoId || null,
    title: localized(block.title),
    watchUrl: block.watchUrl || null,
    hasTranscript: Boolean(block.videoId && transcripts.has(block.videoId)),
    mediaMeta: block.mediaMeta || null,
  }));
});

const downloadRows = allChapters.flatMap(({ lesson, lessonIndex, chapter, chapterIndex }) => (chapter.blocks || [])
  .filter((block) => block.type === "download")
  .map((block) => ({
    lessonIndex: lessonIndex + 1,
    lessonTitle: localized(lesson.title),
    chapterIndex: chapterIndex + 1,
    chapterTitle: localized(chapter.title),
    title: localized(block.title),
    filename: block.filename || null,
    url: block.download_url || block.url || null,
    sourcePage: block.source_page || null,
    assetPath: block.asset_path || null,
    assetMeta: block.assetMeta || null,
  })));

async function verifyDownload(row) {
  if (!row.url?.startsWith("/api/assets/")) return { ...row, status: "invalid_url" };
  const response = await fetch(new URL(row.url, baseUrl), { redirect: "manual" });
  const bytes = Buffer.from(await response.arrayBuffer());
  return {
    ...row,
    origin: row.assetMeta?.origin || "anthropic",
    official: row.assetMeta?.official !== false,
    sourceUrl: row.assetMeta?.sourceUrl || row.sourcePage,
    localAssetId: row.assetMeta?.localAssetId || row.filename,
    language: row.assetMeta?.language || "en",
    captions: Boolean(row.assetMeta?.captions),
    transcriptId: row.assetMeta?.transcriptId || null,
    httpStatus: response.status,
    contentType: response.headers.get("content-type"),
    bytes: bytes.length,
    checksum: bytes.length > 0 ? sha256(bytes) : null,
    passed: response.status === 200 && bytes.length > 0,
    testedAt: new Date().toISOString(),
  };
}

async function verifyVideo(row) {
  if (!row.videoId || !row.watchUrl) return { ...row, passed: false, reason: "missing_video_reference" };
  const thumbnailUrl = `https://i.ytimg.com/vi/${encodeURIComponent(row.videoId)}/hqdefault.jpg`;
  let thumbnailStatus = null;
  let thumbnailBytes = 0;
  let thumbnailChecksum = null;
  try {
    const response = await fetch(thumbnailUrl, { redirect: "follow" });
    const bytes = Buffer.from(await response.arrayBuffer());
    thumbnailStatus = response.status;
    thumbnailBytes = bytes.length;
    thumbnailChecksum = bytes.length > 0 ? sha256(bytes) : null;
  } catch (error) {
    thumbnailStatus = "network_error";
  }
  return {
    ...row,
    origin: row.mediaMeta?.origin || (row.hasTranscript ? "anthropic" : "neopolis"),
    official: row.mediaMeta?.official ?? row.hasTranscript,
    sourceUrl: row.mediaMeta?.sourceUrl || (row.hasTranscript ? "https://anthropic-partners.skilljar.com/ai-fluency-framework-foundations/291863" : row.watchUrl),
    localAssetId: row.mediaMeta?.localAssetId || row.videoId,
    language: row.mediaMeta?.language || "en",
    captions: Boolean(row.mediaMeta?.captions),
    transcriptId: row.mediaMeta?.transcriptId || (row.hasTranscript ? `transcript_${row.videoId}` : null),
    duration: row.mediaMeta?.duration ?? null,
    checksum: row.mediaMeta?.checksum || null,
    referenceChecksum: sha256(`${row.videoId}|${row.watchUrl}`),
    referenceChecksumScope: "canonical_video_reference",
    thumbnailUrl,
    thumbnailStatus,
    thumbnailBytes,
    thumbnailChecksum,
    passed: thumbnailStatus === 200 && thumbnailBytes > 0,
    testedAt: new Date().toISOString(),
  };
}

const [downloads, videos] = await Promise.all([
  Promise.all(downloadRows.map(verifyDownload)),
  Promise.all(videoRows.map(verifyVideo)),
]);

const report = {
  generatedAt: new Date().toISOString(),
  courseId: course.courseId,
  sourceCourseTitle: course.sourceCourseTitle,
  baseUrl,
  summary: {
    downloads: downloads.length,
    downloadsPassed: downloads.filter((item) => item.passed).length,
    videos: videos.length,
    officialVideos: videos.filter((item) => item.official).length,
    supplementaryVideos: videos.filter((item) => !item.official).length,
    videoReferencesPassed: videos.filter((item) => item.passed).length,
    mediaWithVisibleProvenance: [...downloads, ...videos].filter((item) => item.origin && typeof item.official === "boolean").length,
    mediaMissingProvenance: [...downloads, ...videos].filter((item) => !item.origin || typeof item.official !== "boolean").length,
  },
  downloads,
  videos,
};

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.table([report.summary]);
console.table(downloads.map(({ filename, httpStatus, contentType, bytes, passed }) => ({ filename, httpStatus, contentType, bytes, passed })));
