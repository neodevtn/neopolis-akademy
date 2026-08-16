import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const courseDirectory = path.join(root, "client/public/data/courses");
const baseUrl = process.env.MEDIA_AUDIT_BASE_URL || "http://127.0.0.1:3000";

function kindFor(key, value) {
  const normalizedKey = key.toLowerCase();
  const normalizedUrl = value.toLowerCase();
  if (normalizedKey.includes("youtube") || /youtube\.com|youtu\.be/.test(normalizedUrl)) return "youtube";
  if ((normalizedKey === "videoid" || normalizedKey === "video_id") && /^[a-z0-9_-]{6,}$/i.test(value)) return "youtube";
  if (["filename", "file_name", "title", "body", "content", "text", "alt", "caption", "description"].includes(normalizedKey)) return null;
  const isReferenceKey = /(?:url|uri|path|href|src|download|file|pdf|audio|video|image|slide)/.test(normalizedKey);
  const hasMediaExtension = /\.(mp4|webm|mov|mp3|wav|m4a|ogg|pdf|png|jpe?g|gif|webp|svg|zip|csv|xlsx?|ipynb)(\?|$)/.test(normalizedUrl);
  if (!isReferenceKey && !hasMediaExtension) return null;
  if (/\.pdf(?:\?|$)/.test(normalizedUrl) || normalizedKey.includes("pdf")) return "pdf";
  if (/\.(png|jpe?g|gif|webp|svg)(?:\?|$)/.test(normalizedUrl) || normalizedKey.includes("image")) return "image";
  if (/\.(mp4|webm|mov)(?:\?|$)/.test(normalizedUrl) || normalizedKey.includes("video")) return "video";
  if (/\.(mp3|wav|m4a|ogg)(?:\?|$)/.test(normalizedUrl) || normalizedKey.includes("audio")) return "audio";
  if (normalizedKey.includes("download") || normalizedKey.includes("file")) return "download";
  return null;
}

function previewPath(value, kind) {
  if (kind === "youtube" || /^https?:\/\//i.test(value)) return null;
  if (value.startsWith("/api/assets/")) return value;
  if (value.startsWith("/manus-storage/")) return `/api/assets/${value.slice("/manus-storage/".length)}`;
  if (value.startsWith("/")) return null;
  return `/api/assets/${value.split("/").map(encodeURIComponent).join("/")}`;
}

function collect(value, trail = "", assets = []) {
  if (Array.isArray(value)) value.forEach((entry, index) => collect(entry, `${trail}[${index}]`, assets));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, entry]) => {
    if (typeof entry === "string") {
      const kind = kindFor(key, entry);
      const url = kind && previewPath(entry, kind);
      if (url) assets.push({ url, source: entry, kind, trail: `${trail}.${key}` });
    }
    collect(entry, `${trail}.${key}`, assets);
  });
  return assets;
}

async function runPool(items, handler, limit = 12) {
  const results = [];
  const queue = [...items];
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (queue.length) results.push(await handler(queue.shift()));
  }));
  return results;
}

const files = (await fs.readdir(courseDirectory)).filter((file) => file.endsWith(".json"));
const refs = [];
for (const filename of files) {
  const course = JSON.parse(await fs.readFile(path.join(courseDirectory, filename), "utf8"));
  for (const asset of collect(course)) refs.push({ ...asset, filename });
}
const unique = [...new Map(refs.map((item) => [item.url, item])).values()];
const checked = await runPool(unique, async (asset) => {
  try {
    const response = await fetch(`${baseUrl}${asset.url}`, { method: "HEAD" });
    return { ...asset, status: response.status, contentType: response.headers.get("content-type") || "" };
  } catch (error) {
    return { ...asset, status: 0, contentType: "", error: String(error) };
  }
});
const failed = checked.filter((asset) => asset.status < 200 || asset.status >= 400);
const byKind = Object.fromEntries(Object.entries(Object.groupBy(checked, (asset) => asset.kind)).map(([kind, values]) => [kind, values.length]));
console.log(JSON.stringify({ baseUrl, checked: checked.length, working: checked.length - failed.length, failed, byKind }, null, 2));
process.exitCode = failed.length ? 1 : 0;
