import { execFile, execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const auditScript = join(process.cwd(), "scripts", "audit-datacamp-course.mjs");
const temporaryDirectories: string[] = [];
const execFileAsync = promisify(execFile);

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

  it("valide la lecture Range quand un média refuse la requête HEAD", async () => {
    const { coursePath, manifestPath } = createCanonicalFixture();
    const server = createServer((request, response) => {
      if (request.method === "HEAD") {
        response.writeHead(405);
        response.end();
        return;
      }
      if (request.headers.range === "bytes=0-1023") {
        response.writeHead(206, { "content-type": "video/mp4", "content-range": "bytes 0-3/4" });
        response.end("data");
        return;
      }
      response.writeHead(404);
      response.end();
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Adresse de serveur de test introuvable");

    try {
      const { stdout } = await execFileAsync("node", [
        auditScript,
        "--course", coursePath,
        "--manifest", manifestPath,
        "--production-base-url", `http://127.0.0.1:${address.port}`,
      ]);
      const report = JSON.parse(stdout);

      expect(report.errors).toEqual([]);
      expect(report.productionMedia).toEqual([
        expect.objectContaining({ status: 206, ok: true, checkedWith: "range_get" }),
      ]);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });
});
