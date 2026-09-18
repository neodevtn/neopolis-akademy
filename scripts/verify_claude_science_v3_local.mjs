import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
const courseIds = ["claude_science_01_fondamentaux", "claude_science_02_pratique", "claude_science_03_tp"];
const courseDir = path.join(root, "client", "public", "data", "courses");
const allBlocks = (course) => course.lessons.flatMap((lesson) => lesson.chapters).flatMap((chapter) => chapter.blocks || []);

const results = [];
for (const courseId of courseIds) {
  const api = await fetch(`${baseUrl}/api/trpc/course-data/${courseId}`);
  const body = await api.text();
  if (!api.ok) throw new Error(`${courseId} course response ${api.status}`);
  if (/correctAnswer|correction\s*:|solution_lab_|correct_option_index/.test(body)) throw new Error(`${courseId} leaks a protected answer or correction`);
  const course = JSON.parse(body);
  const assets = allBlocks(course)
    .flatMap((block) => [block.imageUrl, block.url, ...(block.resources || []).map((resource) => resource.url)])
    .filter((value) => typeof value === "string" && value.startsWith("/api/assets/"));
  for (const asset of [...new Set(assets)]) {
    const response = await fetch(`${baseUrl}${asset}`, { redirect: "manual" });
    results.push({ courseId, asset, status: response.status, contentType: response.headers.get("content-type") || "" });
    if (response.status !== 200) throw new Error(`${courseId} asset response ${response.status}: ${asset}`);
  }
  results.push({ courseId, asset: `/api/trpc/course-data/${courseId}`, status: api.status, contentType: api.headers.get("content-type") || "" });
}
for (const legacy of ["claude_science_01_initiation", "claude_science_03_travaux_pratiques"]) {
  const response = await fetch(`${baseUrl}/api/trpc/course-data/${legacy}`, { redirect: "manual" });
  results.push({ courseId: legacy, asset: `/api/trpc/course-data/${legacy}`, status: response.status, contentType: response.headers.get("content-type") || "" });
  if (response.status !== 404) throw new Error(`Legacy Claude Science payload remains available: ${legacy} (${response.status})`);
}
console.log(JSON.stringify({ baseUrl, checks: results.length, results }, null, 2));
