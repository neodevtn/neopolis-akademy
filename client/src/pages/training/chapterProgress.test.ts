import { describe, expect, it } from "vitest";
import { getChapterMediaCompletionKeys, getDisplayedChapterProgress, getMediaCompletionKey, getPersistedCompletionProgress, hasOptionalSupplementaryVideos, isSequentialActivityNavigationLocked, normalizeChapterProgress } from "./chapterProgress";

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

  it("uses the same stable key for YouTube URLs and video IDs", () => {
    expect(getMediaCompletionKey({ type: "video", url: "https://www.youtube.com/watch?v=abc123XYZ" }, 0)).toBe("abc123XYZ");
    expect(getMediaCompletionKey({ type: "video", videoId: { fr: "fr-id", en: "en-id" } }, 0)).toBe("fr-id");
  });

  it("does not leave hosted MP4 or audio screens permanently locked", () => {
    expect(getChapterMediaCompletionKeys({ blocks: [
      { type: "video", id: "hosted-video", mp4Url: "/media/video.mp4" },
      { type: "video", id: "hosted-audio", audioUrl: "/media/audio.mp3" },
    ] })).toEqual(["hosted-video", "hosted-audio"]);
  });

  it("locks a numeric exercise until its stable completion key is recorded, except in review mode", () => {
    const input = {
      blocks: [{ type: "exercise", exercise_type: "numeric_answers", id: "numeric_exercise_02" }],
      completedExercises: new Set<string>(),
      completedCloudExercises: new Set<string>(),
      completedMatching: new Set<string>(),
      completedInlineInteractions: new Set<string>(),
    };
    expect(isSequentialActivityNavigationLocked(input)).toBe(true);
    expect(isSequentialActivityNavigationLocked({ ...input, completedExercises: new Set(["numeric_exercise_02"]) })).toBe(false);
    expect(isSequentialActivityNavigationLocked({ ...input, reviewMode: true })).toBe(false);
  });
});
