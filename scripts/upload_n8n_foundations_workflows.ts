import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { storagePut } from "../server/storage";

const root = path.resolve(import.meta.dirname, "..");
const sourceDir = path.join(
  root,
  ".work",
  "datacamp-tp-remediation-2026-09-18",
  "package",
  "n8n-resources",
  "audits",
  "n8n_live_2026-09-18",
  "correction_package",
  "n8n_workflows",
);
const outputPath = path.join(root, ".work", "datacamp-tp-remediation-2026-09-18", "n8n-foundations-workflow-assets.json");

type UploadedAsset = {
  sourcePath: string;
  key: string;
  url: string;
  sha256: string;
  size: number;
  filename: string;
  role: "starter" | "correction";
};

async function listJsonFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return listJsonFiles(absolute);
    return entry.isFile() && entry.name.endsWith(".json") ? [absolute] : [];
  }));
  return files.flat().sort();
}

async function main() {
  const files = await listJsonFiles(sourceDir);
  const uploaded: UploadedAsset[] = [];
  for (const absolute of files) {
    const sourcePath = path.relative(sourceDir, absolute).replaceAll(path.sep, "/");
    if (sourcePath === "manifest.json") continue;
    const content = await fs.readFile(absolute);
    JSON.parse(content.toString("utf8"));
    const role = sourcePath.startsWith("solutions/") ? "correction" : "starter";
    const filename = path.basename(absolute);
    const upload = await storagePut(
      `n8n-foundations/${role === "correction" ? "corrections" : "starters"}/${filename}`,
      content,
      "application/json; charset=utf-8",
    );
    uploaded.push({
      sourcePath,
      key: upload.key,
      url: `${upload.url}?download=${encodeURIComponent(filename)}`,
      sha256: crypto.createHash("sha256").update(content).digest("hex"),
      size: content.length,
      filename,
      role,
    });
  }
  if (uploaded.length !== 19) throw new Error(`Expected 19 n8n JSON assets, uploaded ${uploaded.length}.`);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), assets: uploaded }, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ outputPath, uploaded: uploaded.length, starters: uploaded.filter((asset) => asset.role === "starter").length, corrections: uploaded.filter((asset) => asset.role === "correction").length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
