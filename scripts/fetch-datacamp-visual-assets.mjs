import fs from "node:fs/promises";
import path from "node:path";

function valueFor(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : "";
}

const manifestPath = valueFor("--manifest");
const packageRoot = valueFor("--package-root");
const outputManifestPath = valueFor("--output-manifest") || manifestPath;

if (!manifestPath || !packageRoot) {
  console.error("Usage: node scripts/fetch-datacamp-visual-assets.mjs --manifest <COURSE_MANIFEST.json> --package-root <course-root>");
  process.exit(1);
}

const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const outputDir = path.join(packageRoot, "downloads", "visual_exercises");
await fs.mkdir(outputDir, { recursive: true });

const assets = [];
for (const chapter of manifest.chapters || []) {
  for (const activity of chapter.activities || []) {
    const sourceUrl = activity.type === "VisualExercise" ? activity.asset?.assetUrl : "";
    if (!sourceUrl) continue;
    const extension = path.extname(new URL(sourceUrl).pathname) || ".png";
    const filename = `ch${String(activity.chapter_number).padStart(2, "0")}_ex${String(activity.exercise_number).padStart(2, "0")}_visual${extension}`;
    const destination = path.join(outputDir, filename);
    const response = await fetch(sourceUrl);
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.startsWith("image/")) {
      throw new Error(`Support visuel non récupérable pour ${activity.title}: HTTP ${response.status} (${contentType || "type inconnu"})`);
    }
    await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
    const local = path.posix.join("downloads", "visual_exercises", filename);
    activity.asset = { ...activity.asset, local };
    assets.push({ exerciseId: activity.exercise_id, title: activity.title, sourceUrl, local, bytes: (await fs.stat(destination)).size, contentType });
  }
}

await fs.writeFile(outputManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ count: assets.length, assets }, null, 2));
