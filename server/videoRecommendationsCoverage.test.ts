import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("managed end-of-module recommendations", () => {
  it("configures at least one complete video recommendation for every structured lesson", async () => {
    const coursesDir = path.resolve(import.meta.dirname, "..", "client", "public", "data", "courses");
    const filenames = (await fs.readdir(coursesDir)).filter((filename) => filename.endsWith(".json"));
    let lessons = 0;
    for (const filename of filenames) {
      const course = JSON.parse(await fs.readFile(path.join(coursesDir, filename), "utf8"));
      for (const lesson of course.lessons || []) {
        lessons += 1;
        expect(lesson.recommendedVideos?.length, `${filename} contains a lesson without recommendations`).toBeGreaterThan(0);
        for (const video of lesson.recommendedVideos) {
          expect(video).toMatchObject({ title: expect.any(String), channel: expect.any(String), topics: expect.any(Array) });
          expect(video.videoId).toMatch(/^[A-Za-z0-9_-]{6,}$/);
        }
      }
    }
    expect(lessons).toBeGreaterThan(500);
  });
});
