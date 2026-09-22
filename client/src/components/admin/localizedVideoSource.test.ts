import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hydrateBlockForEditor, prepareBlockForSave } from "./blockEditorParity";

const COURSE_PATH = path.resolve(import.meta.dirname, "..", "..", "..", "public", "data", "courses", "ia_pour_les_nuls__01.json");

function videosWithLocalizedLegacySource(value: unknown, found: Array<Record<string, unknown>> = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => videosWithLocalizedLegacySource(item, found));
    return found;
  }
  if (!value || typeof value !== "object") return found;
  const candidate = value as Record<string, unknown>;
  if (candidate.type === "video" && typeof candidate.watchUrl === "object" && candidate.watchUrl !== null) found.push(candidate);
  Object.values(candidate).forEach((child) => videosWithLocalizedLegacySource(child, found));
  return found;
}

describe("localized legacy YouTube video sources", () => {
  it("shows a usable URL for English and French without losing either playback ID on save", () => {
    const course = JSON.parse(fs.readFileSync(COURSE_PATH, "utf8"));
    const videos = videosWithLocalizedLegacySource(course);
    expect(videos).toHaveLength(10);

    for (const video of videos) {
      const hydrated = hydrateBlockForEditor(video);
      expect(hydrated.sourceType).toBe("youtube");
      expect(hydrated.sourceUrl).toMatchObject({
        en: expect.stringMatching(/^https:\/\/www\.youtube\.com\/watch\?v=/),
        fr: expect.stringMatching(/^https:\/\/www\.youtube\.com\/watch\?v=/),
      });
      const saved = prepareBlockForSave(hydrated);
      expect(saved.videoId).toMatchObject({ en: expect.any(String), fr: expect.any(String) });
      expect(saved.watchUrl).toEqual(hydrated.sourceUrl);
    }
  });
});
