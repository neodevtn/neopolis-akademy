import fs from "node:fs/promises";
import path from "node:path";
import { storagePut } from "../server/storage";

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, ".work", "claude-science-medical-2026-09-17", "package", "claude_science_medical_fr_2026-09-17");
const outputPath = path.join(projectRoot, ".work", "claude-science-medical-2026-09-17", "asset-map.json");

const mimeTypes: Record<string, string> = {
  ".png": "image/png",
  ".csv": "text/csv; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".sh": "text/x-shellscript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".py": "text/x-python; charset=utf-8",
  ".r": "text/plain; charset=utf-8",
};

async function walk(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  }));
  return nested.flat();
}

async function main() {
  const targets = [
    ...(await walk(path.join(sourceRoot, "media", "screenshots_sources"))),
    ...(await walk(path.join(sourceRoot, "downloads"))),
  ];
  const assets: Record<string, { url: string; title: string; kind: "image" | "download"; mimeType: string }> = {};

  for (const file of targets.sort()) {
    const relative = path.relative(sourceRoot, file).replaceAll(path.sep, "/");
    const bytes = await fs.readFile(file);
    const extension = path.extname(file).toLowerCase();
    const mimeType = mimeTypes[extension] || "application/octet-stream";
    const key = `media-library/claude-science-medical/${relative.replaceAll("/", "-").replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const uploaded = await storagePut(key, bytes, mimeType);
    assets[relative] = {
      url: uploaded.url,
      title: path.basename(file),
      kind: relative.startsWith("media/") ? "image" : "download",
      mimeType,
    };
    console.log(`${relative} -> ${uploaded.url}`);
  }

  await fs.writeFile(outputPath, `${JSON.stringify(assets, null, 2)}\n`, "utf8");
  console.log(`Uploaded ${Object.keys(assets).length} assets to the managed Neopolis media library.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
