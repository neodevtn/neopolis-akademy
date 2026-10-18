#!/usr/bin/env node
/**
 * Vérifie par requête Range que chaque asset /api/assets/ référencé depuis un
 * cours répond réellement. Le Range 0-0 évite de télécharger les vidéos et
 * archives complètes tout en validant le proxy, le type MIME et le support de
 * reprise de lecture.
 *
 * Usage:
 *   node scripts/verify-course-internal-assets.mjs
 *   COURSE_ASSET_BASE_URL=https://akademy.neodev.click node scripts/verify-course-internal-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const coursesDir = path.join(root, "client/public/data/courses");
const outputPath = path.join(root, "pedagogical-audit/internal-asset-http-verification.json");
const baseUrl = (process.env.COURSE_ASSET_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const concurrency = Number.parseInt(process.env.COURSE_ASSET_CONCURRENCY || "12", 10);
const assetPattern = /\/api\/assets\/[A-Za-z0-9_./-]+(?:\?[^\s)\]"<>`]*)?/g;

function extractAssets(value, sourceFile, trail = "$", result = new Map()) {
  if (typeof value === "string") {
    for (const match of value.matchAll(assetPattern)) {
      const url = match[0];
      const sources = result.get(url) || [];
      sources.push({ file: sourceFile, path: trail });
      result.set(url, sources);
    }
    return result;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => extractAssets(item, sourceFile, `${trail}[${index}]`, result));
    return result;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => extractAssets(item, sourceFile, `${trail}.${key}`, result));
  }
  return result;
}

const sourcesByUrl = new Map();
for (const filename of fs.readdirSync(coursesDir).filter((name) => name.endsWith(".json")).sort()) {
  extractAssets(JSON.parse(fs.readFileSync(path.join(coursesDir, filename), "utf8")), filename, "$", sourcesByUrl);
}

async function verify(url, sources) {
  const startedAt = Date.now();
  try {
    const response = await fetch(`${baseUrl}${url}`, { headers: { Range: "bytes=0-0" } });
    const contentType = response.headers.get("content-type") || "";
    const contentRange = response.headers.get("content-range") || "";
    const contentLength = response.headers.get("content-length") || "";
    await response.arrayBuffer();
    const ok = (response.status === 200 || response.status === 206) && !/text\/html/i.test(contentType) && (response.status !== 206 || Boolean(contentRange));
    return { url, sourceCount: sources.length, status: response.status, contentType, contentRange, contentLength, elapsedMs: Date.now() - startedAt, ok, sources: sources.slice(0, 3) };
  } catch (error) {
    return { url, sourceCount: sources.length, status: 0, contentType: "", contentRange: "", contentLength: "", elapsedMs: Date.now() - startedAt, ok: false, error: error instanceof Error ? error.message : String(error), sources: sources.slice(0, 3) };
  }
}

const entries = [...sourcesByUrl.entries()].map(([url, sources]) => ({ url, sources }));
const results = [];
for (let offset = 0; offset < entries.length; offset += concurrency) {
  const batch = await Promise.all(entries.slice(offset, offset + concurrency).map(({ url, sources }) => verify(url, sources)));
  results.push(...batch);
  console.log(`Verified ${Math.min(offset + concurrency, entries.length)}/${entries.length} internal course assets.`);
}
const failures = results.filter((result) => !result.ok);
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  uniqueAssetCount: results.length,
  referencesChecked: [...sourcesByUrl.values()].reduce((sum, sources) => sum + sources.length, 0),
  passed: results.length - failures.length,
  failed: failures.length,
  failures,
};
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ uniqueAssetCount: report.uniqueAssetCount, referencesChecked: report.referencesChecked, passed: report.passed, failed: report.failed, output: path.relative(root, outputPath) }, null, 2));
if (failures.length) process.exitCode = 1;
