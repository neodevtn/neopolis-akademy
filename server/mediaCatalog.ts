import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { collectMediaAssets, type MediaAsset, type MediaKind } from "../shared/contentStudio";

export type ManagedMediaAsset = MediaAsset & {
  managed: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type MediaMetadata = Record<string, Pick<ManagedMediaAsset, "id" | "kind" | "url" | "title" | "createdAt" | "updatedAt">>;

const catalogFile = "mediaLibrary.json";

function assetId(url: string) {
  return `media_${crypto.createHash("sha1").update(url).digest("hex").slice(0, 16)}`;
}

function labelFromUrl(url: string) {
  const clean = url.split("?")[0].replace(/\/+$/, "");
  return decodeURIComponent(clean.split("/").pop() || "Média").replace(/[_-]+/g, " ");
}

async function readJson(file: string) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function writeJson(file: string, value: unknown) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readMetadata(dataDirectory: string): Promise<MediaMetadata> {
  try {
    return await readJson(path.join(dataDirectory, catalogFile));
  } catch {
    return {};
  }
}

async function writeMetadata(dataDirectory: string, data: MediaMetadata) {
  await writeJson(path.join(dataDirectory, catalogFile), data);
}

export async function listGlobalMediaAssets(dataDirectory: string): Promise<ManagedMediaAsset[]> {
  const coursesDirectory = path.join(dataDirectory, "courses");
  const metadata = await readMetadata(dataDirectory);
  const byUrl = new Map<string, ManagedMediaAsset>();
  const files = (await fs.readdir(coursesDirectory)).filter((file) => file.endsWith(".json"));

  for (const filename of files) {
    try {
      const course = await readJson(path.join(coursesDirectory, filename));
      const courseId = course.courseId || filename.replace(/\.json$/, "");
      for (const asset of collectMediaAssets(course)) {
        const persisted = metadata[asset.url];
        const existing = byUrl.get(asset.url);
        const usage = asset.usedBy.map((entry) => `${courseId}: ${entry}`);
        if (existing) {
          existing.usedBy.push(...usage.filter((entry) => !existing.usedBy.includes(entry)));
        } else {
          byUrl.set(asset.url, {
            id: persisted?.id || assetId(asset.url),
            kind: persisted?.kind || asset.kind,
            url: asset.url,
            title: persisted?.title || asset.title || labelFromUrl(asset.url),
            usedBy: usage,
            managed: Boolean(persisted),
            createdAt: persisted?.createdAt,
            updatedAt: persisted?.updatedAt,
          });
        }
      }
    } catch {
      // Invalid legacy course files are ignored by the catalog and remain untouched.
    }
  }

  for (const persisted of Object.values(metadata)) {
    if (!byUrl.has(persisted.url)) {
      byUrl.set(persisted.url, { ...persisted, usedBy: [], managed: true });
    }
  }

  return Array.from(byUrl.values()).sort((a, b) => a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title));
}

export async function saveMediaMetadata(dataDirectory: string, input: { url: string; title: string; kind: MediaKind }) {
  const metadata = await readMetadata(dataDirectory);
  const now = new Date().toISOString();
  const previous = metadata[input.url];
  metadata[input.url] = {
    id: previous?.id || assetId(input.url),
    url: input.url,
    title: input.title.trim() || labelFromUrl(input.url),
    kind: input.kind,
    createdAt: previous?.createdAt || now,
    updatedAt: now,
  };
  await writeMetadata(dataDirectory, metadata);
  return metadata[input.url];
}

function replaceInValue(value: unknown, fromUrl: string, toUrl: string): [unknown, boolean] {
  if (typeof value === "string") return [value === fromUrl ? toUrl : value, value === fromUrl];
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((entry) => {
      const [replacement, entryChanged] = replaceInValue(entry, fromUrl, toUrl);
      changed ||= entryChanged;
      return replacement;
    });
    return [changed ? next : value, changed];
  }
  if (!value || typeof value !== "object") return [value, false];
  let changed = false;
  const next: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    const [replacement, entryChanged] = replaceInValue(entry, fromUrl, toUrl);
    next[key] = replacement;
    changed ||= entryChanged;
  }
  return [changed ? next : value, changed];
}

export async function replaceMediaEverywhere(dataDirectory: string, fromUrl: string, toUrl: string) {
  if (!fromUrl || !toUrl || fromUrl === toUrl) return { updatedCourses: 0 };
  const coursesDirectory = path.join(dataDirectory, "courses");
  const files = (await fs.readdir(coursesDirectory)).filter((file) => file.endsWith(".json"));
  let updatedCourses = 0;
  for (const filename of files) {
    const file = path.join(coursesDirectory, filename);
    const course = await readJson(file);
    const [updated, changed] = replaceInValue(course, fromUrl, toUrl);
    if (changed) {
      await writeJson(file, updated);
      updatedCourses += 1;
    }
  }

  const metadata = await readMetadata(dataDirectory);
  const prior = metadata[fromUrl];
  if (prior) {
    delete metadata[fromUrl];
    metadata[toUrl] = { ...prior, url: toUrl, id: assetId(toUrl), updatedAt: new Date().toISOString() };
    await writeMetadata(dataDirectory, metadata);
  }
  return { updatedCourses };
}

export async function removeUnusedMediaMetadata(dataDirectory: string, url: string) {
  const assets = await listGlobalMediaAssets(dataDirectory);
  const target = assets.find((asset) => asset.url === url);
  if (target && target.usedBy.length > 0) {
    return { success: false, usageCount: target.usedBy.length };
  }
  const metadata = await readMetadata(dataDirectory);
  delete metadata[url];
  await writeMetadata(dataDirectory, metadata);
  return { success: true, usageCount: 0 };
}
