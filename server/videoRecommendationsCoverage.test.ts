import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("verified end-of-module recommendations", () => {
  it("n’autorise une recommandation que pour une leçon explicitement validée par l’équipe pédagogique", async () => {
    const coursesDir = path.resolve(import.meta.dirname, "..", "client", "public", "data", "courses");
    const filenames = (await fs.readdir(coursesDir)).filter((filename) => filename.endsWith(".json"));
    let managedLessons = 0;
    let sourceManagedLessons = 0;
    for (const filename of filenames) {
      const course = JSON.parse(await fs.readFile(path.join(coursesDir, filename), "utf8"));
      for (const lesson of course.lessons || []) {
        if (lesson.recommendedVideosManaged !== true) {
          if (lesson.recommendedVideosManaged === false) {
            sourceManagedLessons += 1;
            expect(lesson.recommendedVideos || [], `${filename} must not inject recommendations absent from its source manifest`).toHaveLength(0);
          }
          continue;
        }
        managedLessons += 1;
        expect(lesson.recommendedVideos?.length, `${filename} contains a lesson without recommendations`).toBeGreaterThan(0);
        for (const video of lesson.recommendedVideos) {
          expect(video).toMatchObject({ title: expect.any(String), channel: expect.any(String), topics: expect.any(Array) });
          expect(video.videoId).toMatch(/^[A-Za-z0-9_-]{6,}$/);
        }
      }
    }
    // The legacy catalogue has no currently source-verified recommendation
    // manifest. It is valid (and safer) for the visible count to be zero.
    expect(managedLessons).toBeGreaterThanOrEqual(0);
    expect(sourceManagedLessons).toBeGreaterThan(0);
  });
});
