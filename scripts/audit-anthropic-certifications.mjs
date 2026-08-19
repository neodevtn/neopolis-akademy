#!/usr/bin/env node
/**
 * Usage:
 * node scripts/audit-anthropic-certifications.mjs --base-url https://akademy.neodev.click --output docs/anthropic_audit_media_validation_2026-08-19.json
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const coursesDir = join(root, "client/public/data/courses");
const args = process.argv.slice(2);
const option = (name, fallback = "") => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] || fallback;
};
const baseUrl = option("--base-url", "http://127.0.0.1:3000").replace(/\/$/, "");
const output = option("--output", "");
const tracks = [
  "claude_certified_developer_foundations",
  "claude_certified_architect_foundations",
  "claude_certified_architect_professional",
];
const expectedSourceTitles = {
  claude_certified_developer_foundations__01: "MSO Foundations",
  claude_certified_developer_foundations__02: "Production-Grade Prompting, Agents & Tool Use",
  claude_certified_developer_foundations__03: "Claude Code, MCP & Integration",
  claude_certified_developer_foundations__04: "Production Engineering, Evals, and Security",
  claude_certified_developer_foundations__05: "Accelerators & IP Contribution",
  claude_certified_architect_professional__01: "Claude Platform & Solution Design",
  claude_certified_architect_professional__02: "Enterprise Integration & Production",
  claude_certified_architect_professional__03: "Responsible AI, Safety & Risk for Architects",
  claude_certified_architect_professional__04: "Stakeholder Engagement, Lifecycle & GTM",
  claude_certified_architect_professional__05: "Team Enablement & Operational Productivity",
};

function text(value) {
  return typeof value === "string" ? value : value?.en || value?.fr || "";
}

function visit(value, path, fn) {
  if (Array.isArray(value)) return value.forEach((entry, index) => visit(entry, `${path}[${index}]`, fn));
  if (!value || typeof value !== "object") return;
  fn(value, path);
  Object.entries(value).forEach(([key, entry]) => visit(entry, `${path}.${key}`, fn));
}

function analyseCourse(course, file) {
  const stats = { lessons: 0, chapters: 0, blocks: 0, exercises: 0, checkpoints: 0, videos: 0, downloads: 0, callouts: 0, invalidVideoBlocks: [] };
  for (const lesson of course.lessons || []) {
    stats.lessons += 1;
    for (const chapter of lesson.chapters || []) {
      stats.chapters += 1;
      for (const block of chapter.blocks || []) {
        stats.blocks += 1;
        if (block.type === "video") {
          stats.videos += 1;
          if (!block.videoId && !block.mp4Url && !block.audioUrl) stats.invalidVideoBlocks.push({ chapterId: chapter.id || "", title: text(block.title) });
        }
        if (block.type === "download") stats.downloads += 1;
        if (block.type === "checkpoint") stats.checkpoints += 1;
        if (block.type === "callout") stats.callouts += 1;
      }
    }
  }
  stats.exercises = Array.isArray(course.exercises) ? course.exercises.length : 0;
  const media = [];
  visit(course, "course", (node, path) => {
    for (const field of ["download_url", "mp4Url", "audioUrl", "slidesPdf", "imageUrl", "url"]) {
      if (typeof node[field] === "string" && /^\/api\/assets\//.test(node[field])) media.push({ courseFile: file, field, path: `${path}.${field}`, value: node[field] });
      if (typeof node[field] === "string" && /^\/manus-storage\//.test(node[field])) media.push({ courseFile: file, field, path: `${path}.${field}`, value: node[field], legacy: true });
    }
    if (typeof node.image?.src === "string" && /^\/(?:api\/assets|manus-storage)\//.test(node.image.src)) media.push({ courseFile: file, field: "image.src", path: `${path}.image.src`, value: node.image.src, legacy: node.image.src.startsWith("/manus-storage/") });
  });
  return { stats, media };
}

async function checkMedia(item) {
  const url = `${baseUrl}${item.value}`;
  try {
    let response = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (response.status === 405 || response.status === 501) response = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" }, redirect: "follow" });
    return { ...item, url, status: response.status, contentType: response.headers.get("content-type") || "", ok: response.ok || response.status === 206 };
  } catch (error) {
    return { ...item, url, status: 0, contentType: "", ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

const files = readdirSync(coursesDir).filter((file) => file.endsWith(".json") && tracks.some((track) => file.startsWith(`${track}__`))).sort();
const courses = [];
const mediaRefs = [];
const titleIssues = [];
for (const file of files) {
  const course = JSON.parse(readFileSync(join(coursesDir, file), "utf8"));
  const courseId = course.courseId || file.replace(/\.json$/, "");
  const sourceCourseTitle = course.sourceCourseTitle || "";
  const suffix = sourceCourseTitle.split(" / ").at(-1);
  if (expectedSourceTitles[courseId] && suffix !== expectedSourceTitles[courseId]) titleIssues.push({ courseId, expected: expectedSourceTitles[courseId], actual: suffix });
  const { stats, media } = analyseCourse(course, file);
  mediaRefs.push(...media);
  courses.push({ courseId, file, sourceCourseTitle, title: text(course.lessons?.[0]?.title), localMediaReferences: media.length, ...stats });
}

const media = [];
for (const ref of mediaRefs) media.push(await checkMedia(ref));
const summary = tracks.map((track) => {
  const selected = courses.filter((course) => course.courseId.startsWith(`${track}__`));
  const sum = (field) => selected.reduce((total, course) => total + course[field], 0);
  return { track, courses: selected.length, lessons: sum("lessons"), chapters: sum("chapters"), blocks: sum("blocks"), exercises: sum("exercises"), checkpoints: sum("checkpoints"), videos: sum("videos"), downloads: sum("downloads") };
});
const result = {
  generatedAt: new Date().toISOString(), baseUrl, tracks: summary, courses, titleIssues,
  invalidVideoBlocks: courses.flatMap((course) => course.invalidVideoBlocks.map((block) => ({ courseId: course.courseId, ...block }))),
  media: { total: media.length, passing: media.filter((item) => item.ok).length, failing: media.filter((item) => !item.ok).length, legacyReferences: media.filter((item) => item.legacy).length, items: media },
};
if (output) {
  const outputPath = join(root, output);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
}
console.log(`Anthropic audit: ${files.length} courses | titles: ${titleIssues.length} issue(s) | media: ${result.media.passing}/${result.media.total} reachable | legacy refs: ${result.media.legacyReferences} | empty video sources: ${result.invalidVideoBlocks.length}`);
if (output) console.log(`Report written to ${output}`);
process.exit(titleIssues.length || result.media.failing || result.media.legacyReferences || result.invalidVideoBlocks.length ? 1 : 0);
