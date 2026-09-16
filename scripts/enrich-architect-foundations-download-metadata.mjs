import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const apply = process.argv.includes("--apply");
const courseIds = ["02", "03", "06", "07"].map((suffix) => `claude_certified_architect_foundations__${suffix}`);

for (const courseId of courseIds) {
  const coursePath = resolve(root, `client/public/data/courses/${courseId}.json`);
  const reportPath = resolve(root, `docs/${courseId}-assets-audit.json`);
  const course = JSON.parse(await readFile(coursePath, "utf8"));
  const report = JSON.parse(await readFile(reportPath, "utf8"));
  const verificationByUrl = new Map((report.downloads || []).filter((entry) => entry.passed && entry.url).map((entry) => [entry.url, entry]));
  let enriched = 0;
  let preserved = 0;
  let skipped = 0;
  for (const lesson of course.lessons || []) {
    for (const chapter of lesson.chapters || []) {
      for (const block of chapter.blocks || []) {
        if (block.type !== "download") continue;
        if (block.assetMeta) {
          preserved += 1;
          continue;
        }
        const url = block.download_url || block.url;
        const verified = verificationByUrl.get(url);
        const sourceUrl = block.source_page;
        if (!verified || !sourceUrl?.startsWith("https://anthropic-partners.skilljar.com/")) {
          skipped += 1;
          continue;
        }
        block.assetMeta = {
          origin: "anthropic",
          official: true,
          sourceUrl,
          localAssetId: block.asset_path || block.filename || url,
          mimeType: verified.contentType || "application/octet-stream",
          bytes: verified.bytes,
          checksum: verified.checksum,
          testedAt: verified.testedAt,
        };
        enriched += 1;
      }
    }
  }
  if (apply) await writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ courseId, mode: apply ? "apply" : "dry-run", enriched, preserved, skipped }));
}
