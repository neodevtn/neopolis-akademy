import fs from "node:fs";
import path from "node:path";

const courseDirectory = path.resolve("client/public/data/courses");
const output = path.resolve("docs/media-library-audit.json");
const assets = new Map();

function kindFor(key, value) {
  const field = key.toLowerCase();
  const url = value.toLowerCase();
  if (field.includes("youtube") || /youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (field.includes("audio") || /\.(mp3|wav|m4a|ogg)(?:\?|$)/.test(url)) return "audio";
  if (field.includes("pdf") || /\.pdf(?:\?|$)/.test(url)) return "pdf";
  if (field.includes("image") || field.includes("thumbnail") || /\.(png|jpe?g|gif|webp|svg)(?:\?|$)/.test(url)) return "image";
  if (field.includes("slides")) return "slides";
  if (field.includes("download") || field.includes("file")) return "download";
  if (field.includes("video") || /\.(mp4|webm|mov)(?:\?|$)/.test(url)) return "video";
  return null;
}

function add(kind, url, location, courseId) {
  const id = `${kind}:${url}`;
  const current = assets.get(id) ?? { id, kind, url, usages: [], courses: [] };
  current.usages.push(location);
  if (!current.courses.includes(courseId)) current.courses.push(courseId);
  assets.set(id, current);
}

function walk(value, trail, courseId, seen = new WeakSet()) {
  if (!value || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) return value.forEach((item, index) => walk(item, `${trail}[${index}]`, courseId, seen));
  for (const [key, child] of Object.entries(value)) {
    if (typeof child === "string") {
      const kind = kindFor(key, child);
      if (kind) add(kind, child, `${trail}.${key}`, courseId);
    }
    walk(child, `${trail}.${key}`, courseId, seen);
  }
}

for (const filename of fs.readdirSync(courseDirectory).filter((name) => name.endsWith(".json"))) {
  const course = JSON.parse(fs.readFileSync(path.join(courseDirectory, filename), "utf8"));
  walk(course, filename, course.courseId || filename.replace(/\.json$/, ""));
}

const list = Array.from(assets.values()).sort((a, b) => a.kind.localeCompare(b.kind) || a.url.localeCompare(b.url));
const totals = Object.fromEntries(["youtube", "video", "audio", "pdf", "image", "slides", "download"].map((kind) => [kind, list.filter((asset) => asset.kind === kind).length]));
const sources = {
  apiAssets: list.filter((asset) => asset.url.startsWith("/api/assets/")).length,
  manuscriptStorage: list.filter((asset) => asset.url.startsWith("/manus-storage/")).length,
  remote: list.filter((asset) => /^https?:\/\//.test(asset.url)).length,
};

const report = { generatedAt: new Date().toISOString(), totalUniqueAssets: list.length, totals, sources, assets: list };
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ totalUniqueAssets: list.length, totals, sources, output }, null, 2));
