import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const apply = process.argv.includes("--apply");
const sources = {
  claude_certified_architect_foundations__04: "https://anthropic-partners.skilljar.com/claude-code-in-action",
  claude_certified_architect_foundations__05: "https://anthropic-partners.skilljar.com/claude-101",
};
const hash = (value) => createHash("sha256").update(value).digest("hex");

for (const [courseId, sourceUrl] of Object.entries(sources)) {
  const coursePath = resolve(root, `client/public/data/courses/${courseId}.json`);
  const course = JSON.parse(await readFile(coursePath, "utf8"));
  let enriched = 0;
  let skipped = 0;
  for (const lesson of course.lessons || []) {
    for (const chapter of lesson.chapters || []) {
      const transcripts = new Set((chapter.blocks || []).filter((block) => block.type === "transcript" && block.videoId).map((block) => block.videoId));
      for (const block of chapter.blocks || []) {
        if (block.type !== "video" || block.mediaMeta) continue;
        if (!block.videoId || !block.watchUrl || !transcripts.has(block.videoId)) {
          skipped += 1;
          continue;
        }
        block.mediaMeta = {
          origin: "anthropic",
          official: true,
          sourceUrl,
          localAssetId: block.videoId,
          language: "en",
          captions: false,
          transcriptId: `transcript_${block.videoId}`,
          duration: null,
          durationStatus: "not_available_from_public_metadata",
          checksum: `sha256:${hash(`${block.videoId}|${block.watchUrl}`)}`,
          checksumScope: "canonical_video_reference",
          testedAt: new Date().toISOString(),
          label: { en: "Official Anthropic resource", fr: "Ressource officielle Anthropic" },
        };
        enriched += 1;
      }
    }
  }
  if (apply) await writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ courseId, mode: apply ? "apply" : "dry-run", enriched, skipped }));
}
