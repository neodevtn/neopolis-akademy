import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const courseId = process.argv[2];
const baseUrl = process.env.NEOPOLIS_BASE_URL || "http://127.0.0.1:3000";
if (!/^claude_certified_architect_foundations__0[1-7]$/.test(courseId || "")) {
  throw new Error("Usage: node scripts/verify-architect-foundations-course-assets.mjs claude_certified_architect_foundations__0N");
}

const course = JSON.parse(await readFile(resolve(process.cwd(), `client/public/data/courses/${courseId}.json`), "utf8"));
const asText = (value) => typeof value === "string" ? value : value?.en || value?.fr || "";
const hash = (value) => createHash("sha256").update(value).digest("hex");
const rows = (course.lessons || []).flatMap((lesson, lessonIndex) => (lesson.chapters || []).flatMap((chapter, chapterIndex) => (chapter.blocks || [])
  .filter((block) => block.type === "download")
  .map((block) => ({
    lessonIndex: lessonIndex + 1,
    lessonTitle: asText(lesson.title),
    chapterIndex: chapterIndex + 1,
    chapterTitle: asText(chapter.title),
    title: asText(block.title),
    url: block.download_url || block.url || null,
    sourcePage: block.source_page || block.assetMeta?.sourceUrl || null,
    metadataPresent: Boolean(block.assetMeta),
  }))));

async function mapWithLimit(items, limit, work) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const current = cursor++;
      results[current] = await work(items[current]);
    }
  }));
  return results;
}

async function verify(row) {
  if (!row.url?.startsWith("/api/assets/")) return { ...row, passed: false, status: "invalid_url", bytes: 0, checksum: null, testedAt: new Date().toISOString() };
  try {
    const response = await fetch(new URL(row.url, baseUrl), { redirect: "manual", signal: AbortSignal.timeout(30_000) });
    const data = Buffer.from(await response.arrayBuffer());
    return {
      ...row,
      passed: response.status === 200 && data.byteLength > 0,
      status: response.status,
      contentType: response.headers.get("content-type"),
      bytes: data.byteLength,
      checksum: data.byteLength > 0 ? `sha256:${hash(data)}` : null,
      testedAt: new Date().toISOString(),
    };
  } catch (error) {
    return { ...row, passed: false, status: "network_error", error: error instanceof Error ? error.message : "unknown_error", bytes: 0, checksum: null, testedAt: new Date().toISOString() };
  }
}

const downloads = await mapWithLimit(rows, 4, verify);
const urls = downloads.map((row) => row.url).filter(Boolean);
const report = {
  generatedAt: new Date().toISOString(),
  courseId,
  sourceCourseTitle: course.sourceCourseTitle,
  baseUrl,
  summary: {
    displayedDownloads: downloads.length,
    uniqueDownloadUrls: new Set(urls).size,
    repeatedOccurrences: urls.length - new Set(urls).size,
    passed: downloads.filter((row) => row.passed).length,
    failed: downloads.filter((row) => !row.passed).length,
    rowsWithoutAssetMetadata: downloads.filter((row) => !row.metadataPresent).length,
  },
  downloads,
};
const outputPath = resolve(process.cwd(), `docs/${courseId}-assets-audit.json`);
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.table([report.summary]);
console.table(downloads.filter((row) => !row.passed).map(({ title, url, status, error }) => ({ title, url, status, error })));
