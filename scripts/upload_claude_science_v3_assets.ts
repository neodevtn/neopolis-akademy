import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { storagePut } from "../server/storage";

type DeclaredAsset = {
  path: string;
  bytes: number;
  sha256: string;
  source_ref?: string;
  origin?: string;
  usage?: string;
  synthetic?: boolean;
};

type AssetRecord = DeclaredAsset & {
  url: string;
  key: string;
  contentType: string;
  kind: "image" | "download";
  visibility: "public" | "after_submission";
};

type AssetMap = Record<string, AssetRecord>;

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const packageRoot = path.join(
  repositoryRoot,
  ".work",
  "claude-science-v3-2026-09-18",
  "unpacked",
  "claude_science_recherche_sante_fr_v3_2026-09-18",
);
const outputPath = path.join(repositoryRoot, ".work", "claude-science-v3-2026-09-18", "asset-map.json");

function contentTypeFor(filename: string): string {
  const extension = path.extname(filename).toLowerCase();
  return ({
    ".webp": "image/webp",
    ".png": "image/png",
    ".csv": "text/csv; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".py": "text/x-python; charset=utf-8",
    ".r": "text/plain; charset=utf-8",
  } as Record<string, string>)[extension] || "application/octet-stream";
}

function isAfterSubmissionAsset(relativePath: string): boolean {
  return relativePath.includes("/downloads/expected/") || /\/downloads\/scripts\/solution_/i.test(relativePath);
}

function canonicalSourcePath(relativePath: string): string {
  return relativePath.replace(/^courses\/03_travaux_pratiques\//, "");
}

function stableStoragePath(relativePath: string): string {
  return `claude-science-v3/${relativePath.replace(/[^a-zA-Z0-9._/-]+/g, "-")}`;
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf8")) as T;
}

async function readPriorAssetMap(): Promise<AssetMap> {
  try {
    return await readJson<AssetMap>(outputPath);
  } catch {
    return {};
  }
}

async function declaredAssets(): Promise<DeclaredAsset[]> {
  const mediaManifest = await readJson<Record<string, DeclaredAsset>>(path.join(packageRoot, "media", "media_manifest.json"));
  const downloadsManifest = await readJson<{ files: DeclaredAsset[] }>(path.join(packageRoot, "courses", "03_travaux_pratiques", "downloads", "downloads_manifest.json"));
  return [
    ...Object.values(mediaManifest),
    ...downloadsManifest.files.map((asset) => ({ ...asset, path: `courses/03_travaux_pratiques/${canonicalSourcePath(asset.path)}` })),
  ].sort((left, right) => left.path.localeCompare(right.path));
}

async function main() {
  const previous = await readPriorAssetMap();
  const next: AssetMap = {};

  for (const asset of await declaredAssets()) {
    const absolutePath = path.join(packageRoot, asset.path);
    const contents = await fs.readFile(absolutePath);
    const sha256 = crypto.createHash("sha256").update(contents).digest("hex");
    if (contents.length !== asset.bytes || sha256 !== asset.sha256) {
      throw new Error(`Declared checksum mismatch: ${asset.path}`);
    }

    const kind: AssetRecord["kind"] = asset.path.includes("/media/") ? "image" : "download";
    const visibility: AssetRecord["visibility"] = isAfterSubmissionAsset(asset.path) ? "after_submission" : "public";
    const contentType = contentTypeFor(asset.path);
    const prior = previous[asset.path];
    if (prior?.sha256 === sha256 && prior.url.startsWith("/api/assets/") && prior.visibility === visibility) {
      next[asset.path] = { ...prior, ...asset, bytes: contents.length, sha256, contentType, kind, visibility };
      continue;
    }

    const uploaded = await storagePut(stableStoragePath(asset.path), contents, contentType);
    next[asset.path] = {
      ...asset,
      bytes: contents.length,
      sha256,
      url: uploaded.url,
      key: uploaded.key,
      contentType,
      kind,
      visibility,
    };
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(JSON.stringify({ assets: Object.keys(next).length, public: Object.values(next).filter((asset) => asset.visibility === "public").length, afterSubmission: Object.values(next).filter((asset) => asset.visibility === "after_submission").length, outputPath }, null, 2));
}

void main();
