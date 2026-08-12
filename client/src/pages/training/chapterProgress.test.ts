import { describe, expect, it } from "vitest";
import { getDisplayedChapterProgress, normalizeChapterProgress } from "./chapterProgress";

describe("chapter progress display", () => {
  it("clamps an invalid zero-based index so a counter can never show 7/6", () => {
    expect(normalizeChapterProgress({ current: 6, total: 6 })).toEqual({ current: 5, total: 6 });
  });

  it("starts a newly selected lesson at chapter 1 of its own total", () => {
    expect(getDisplayedChapterProgress({ current: 6, total: 6 }, 0, 1, 6)).toEqual({ current: 0, total: 6 });
  });
});
