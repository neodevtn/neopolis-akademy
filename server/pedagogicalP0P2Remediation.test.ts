import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const auditPath = resolve(root, "pedagogical-audit/static-audit-data.json");
const manifestPath = resolve(root, "pedagogical-audit/p0-p2-remediation-manifest.json");
const coursesDir = resolve(root, "client/public/data/courses");
const courseAssetCount = readdirSync(coursesDir).filter((filename) => filename.endsWith(".json")).length;

describe("remédiation pédagogique P0/P1/P2", () => {
  it("ne laisse aucun constat P0, P1 ou P2 après le contrôle structurel", () => {
    execFileSync(process.execPath, ["scripts/audit-pedagogical-static.mjs"], { cwd: root, stdio: "pipe" });
    const audit = JSON.parse(readFileSync(auditPath, "utf8"));
    expect(audit.coverage.course_count).toBe(courseAssetCount);
    expect(audit.severity_counts).toMatchObject({ P0: 0, P1: 0, P2: 0 });
  }, 30_000);

  it("remplace chaque activité irréalisable par le contenu existant de son écran, sans verrou bloquant", () => {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    expect(manifest.convertedActivities.length).toBeGreaterThan(0);

    for (const entry of manifest.convertedActivities) {
      const course = JSON.parse(readFileSync(resolve(coursesDir, `${entry.courseId}.json`), "utf8"));
      const chapter = course.lessons.flatMap((lesson: any) => lesson.chapters || [])
        .find((candidate: any) => candidate.id === entry.chapterId);
      expect(chapter).toBeDefined();
      expect(chapter.requiredBeforeAdvance).toBe(false);
      expect(chapter.blocks.some((block: any) => block.type === "cloud_exercise")).toBe(false);
      expect(chapter.blocks).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: "content", remediation: expect.objectContaining({ sourcePreserved: true }) }),
      ]));
    }
  });

  it("reste idempotente afin qu’une nouvelle correction ne modifie pas de contenus déjà conformes", () => {
    const result = execFileSync(process.execPath, ["scripts/remediate-pedagogical-p0-p2.mjs", "--check"], { cwd: root, encoding: "utf8" });
    const summary = JSON.parse(result);
    expect(summary.changes).toBe(0);
  }, 30_000);
});
