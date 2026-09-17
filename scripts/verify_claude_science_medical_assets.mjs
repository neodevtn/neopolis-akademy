import fs from "node:fs";
import path from "node:path";

const baseUrl = (process.env.COURSE_ASSET_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const course = JSON.parse(fs.readFileSync(path.join(process.cwd(), "client/public/data/courses/claude_science_recherche_medicale__01.json"), "utf8"));
const screenshots = course.lessons.flatMap((lesson) => lesson.chapters).flatMap((chapter) => chapter.blocks || []).filter((block) => block.type === "annotated_screenshot").map((block) => block.imageUrl);
const resources = course.downloadableResources.map((resource) => resource.url);
const urls = [...new Set([...screenshots, ...resources])];

const failures = [];
for (const url of urls) {
  const response = await fetch(`${baseUrl}${url}`, { redirect: "manual" });
  const contentType = response.headers.get("content-type") || "";
  const location = response.headers.get("location");
  if (response.status !== 200 || !contentType || location) failures.push({ url, status: response.status, contentType, location });
}
if (failures.length) {
  console.error(JSON.stringify({ baseUrl, checked: urls.length, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ baseUrl, downloads: resources.length, screenshots: screenshots.length, uniqueUrls: urls.length, status: "PASS" }, null, 2));
