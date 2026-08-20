import { describe, expect, it } from "vitest";
import { getDisplayedChapterProgress, getPersistedCompletionProgress, hasOptionalSupplementaryVideos, normalizeChapterProgress } from "./chapterProgress";

describe("chapter progress display", () => {
  it("clamps an invalid zero-based index so a counter can never show 7/6", () => {
    expect(normalizeChapterProgress({ current: 6, total: 6 })).toEqual({ current: 5, total: 6 });
  });

  it("starts a newly selected lesson at chapter 1 of its own total", () => {
    expect(getDisplayedChapterProgress({ current: 6, total: 6 }, 0, 1, 6)).toEqual({ current: 0, total: 6 });
  });

  it("persists the terminal sentinel when the final chapter is completed", () => {
    expect(getPersistedCompletionProgress(3)).toEqual({ current: 3, total: 3 });
  });

  it("does not make Neopolis supplementary videos a terminal completion gate", () => {
    expect(hasOptionalSupplementaryVideos({
      blocks: [
        { type: "callout", title: { fr: "Complément Neopolis", en: "Neopolis supplement" } },
        { type: "video", title: "Tutoriel optionnel" },
      ],
    })).toBe(true);
  });

  it("recognizes a normalized nested supplemental callout title", () => {
    expect(hasOptionalSupplementaryVideos({
      blocks: [
        { type: "callout", title: { fr: "" }, data: { title: { fr: "Complément Neopolis" } } } as never,
        { type: "video", title: "Tutoriel optionnel" },
      ],
    })).toBe(true);
  });

  it("keeps official videos subject to their completion gate", () => {
    expect(hasOptionalSupplementaryVideos({
      blocks: [{ type: "video", title: "Official Anthropic video" }],
    })).toBe(false);
  });
});
