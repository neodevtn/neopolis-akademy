import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { storagePut } from "../server/storage";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const packageRoot = path.join(
  repositoryRoot,
  ".work",
  "claude-science-medical-v2-2026-09-17",
  "package",
  "claude_science_medical_fr_v2_2026-09-17",
);
const outputPath = path.join(repositoryRoot, ".work", "claude-science-medical-v2-2026-09-17", "asset-map.json");

type AssetRecord = {
  url: string;
  key: string;
  sha256: string;
  bytes: number;
  contentType: string;
  kind: "image" | "download";
  title: string;
};

type AssetMap = Record<string, AssetRecord>;

const contentTypeFor = (filename: string): string => {
  const extension = path.extname(filename).toLowerCase();
  return ({
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".csv": "text/csv; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".py": "text/x-python; charset=utf-8",
  } as Record<string, string>)[extension] || "application/octet-stream";
};

const titleFor = (relativePath: string) => path.basename(relativePath)
  .replace(/[_-]+/g, " ")
  .replace(/\.[a-z0-9]+$/i, "")
  .replace(/\b\w/g, (character) => character.toUpperCase());

async function readPriorAssetMap(): Promise<AssetMap> {
  try {
    return JSON.parse(await fs.readFile(outputPath, "utf8")) as AssetMap;
  } catch {
    return {};
  }
}

async function listSourceAssets(): Promise<string[]> {
  const directories = [
    "courses/01_initiation_claude_et_claude_science/media/official",
    "courses/02_claude_science_installation_utilisation_optimisation/media/official",
    "courses/03_claude_science_travaux_pratiques/downloads",
  ];
  const assets: string[] = [];
  for (const directory of directories) {
    const absoluteDirectory = path.join(packageRoot, directory);
    const entries = await fs.readdir(absoluteDirectory, { recursive: true, withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const relativeFromDirectory = path.relative(absoluteDirectory, path.join(entry.parentPath, entry.name));
      const relativePath = path.join(directory, relativeFromDirectory).replace(/\\/g, "/");
      // Expected outputs and solution scripts are assessment keys. They remain
      // server-side and are never published through the learner media library.
      if (relativePath.includes("/downloads/expected/") || /\/downloads\/scripts\/solution_/i.test(relativePath)) continue;
      assets.push(relativePath);
    }
  }
  return assets.sort();
}

async function main() {
  const previous = await readPriorAssetMap();
  const next: AssetMap = {};
  const assets = await listSourceAssets();

  for (const relativePath of assets) {
    const absolutePath = path.join(packageRoot, relativePath);
    const contents = await fs.readFile(absolutePath);
    const sha256 = crypto.createHash("sha256").update(contents).digest("hex");
    const contentType = contentTypeFor(relativePath);
    const kind: AssetRecord["kind"] = relativePath.includes("/media/") ? "image" : "download";
    const prior = previous[relativePath];

    if (prior?.sha256 === sha256 && prior.url.startsWith("/api/assets/")) {
      next[relativePath] = { ...prior, bytes: contents.length, contentType, kind };
      continue;
    }

    const stableName = relativePath
      .replace(/^courses\//, "claude-science-v2/")
      .replace(/[^a-zA-Z0-9._/-]+/g, "-");
    const result = await storagePut(stableName, contents, contentType);
    next[relativePath] = {
      url: result.url,
      key: result.key,
      sha256,
      bytes: contents.length,
      contentType,
      kind,
      title: titleFor(relativePath),
    };
  }

  await fs.writeFile(outputPath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(JSON.stringify({ assets: Object.keys(next).length, outputPath }, null, 2));
}

void main();
