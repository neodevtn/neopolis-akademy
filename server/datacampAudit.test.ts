import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const auditScript = join(process.cwd(), "scripts", "audit-datacamp-course.mjs");
const temporaryDirectories: string[] = [];

function createCanonicalFixture() {
  const directory = mkdtempSync(join(tmpdir(), "neopolis-datacamp-audit-"));
  temporaryDirectories.push(directory);
  const coursePath = join(directory, "course.json");
  const manifestPath = join(directory, "COURSE_MANIFEST.json");

  writeFileSync(coursePath, JSON.stringify({
    courseId: "fixture-course",
    lessons: [{
      id: "lesson_1",
      competencyTags: ["ai_development"],
      chapters: [{
        id: "activity_1",
        requiredBeforeAdvance: true,
        blocks: [{ type: "video", id: "video_1", mp4Url: "/api/assets/video.mp4" }],
      }],
    }],
  }));
  writeFileSync(manifestPath, JSON.stringify({
    completeness: { activities_extracted: 1, videos_extracted: 1 },
  }));
  writeFileSync(join(directory, "COMPLETENESS_REPORT.md"), "# Canonical completeness report\n");
  writeFileSync(join(directory, "download_assets_manifest.json"), JSON.stringify([{ ok: true }]));
  writeFileSync(join(directory, "MEDIA_VALIDATION_REPORT.json"), JSON.stringify([{ ok: true }]));

  return { coursePath, manifestPath };
}

afterEach(() => {
  while (temporaryDirectories.length) {
    const directory = temporaryDirectories.pop();
    if (directory) rmSync(directory, { recursive: true, force: true });
  }
});

describe("audit DataCamp canonique", () => {
  it("lit les rapports canoniques disponibles sans dépendre de pages brutes", () => {
    const { coursePath, manifestPath } = createCanonicalFixture();
    const output = execFileSync("node", [auditScript, "--course", coursePath, "--manifest", manifestPath], {
      encoding: "utf8",
    });
    const report = JSON.parse(output);

    expect(report.errors).toEqual([]);
    expect(report.canonicalSources.courseManifest).toBe(manifestPath);
    expect(report.canonicalSources.completenessReport.characters).toBeGreaterThan(0);
    expect(report.canonicalSources.downloadAssetsManifest).toMatchObject({ entries: 1, successfulEntries: 1, failedEntries: 0 });
    expect(report.canonicalSources.mediaValidationReport).toMatchObject({ entries: 1, successfulEntries: 1, failedEntries: 0 });
    expect(report.expected).toEqual({ activities: 1, videos: 1 });
  });
});
