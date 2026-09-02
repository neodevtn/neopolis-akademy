import { describe, expect, it } from "vitest";
import { resolveProjectorMediaSource } from "./projectorMediaSource";

describe("resolveProjectorMediaSource", () => {
  it("prefers the audio track used to synchronize Projector slides", () => {
    expect(resolveProjectorMediaSource("/media/video.mp4", "/media/audio.mp3")).toEqual({
      url: "/media/audio.mp3",
      mimeType: "audio/mpeg",
      kind: "audio",
    });
  });

  it("keeps the video as a fallback when no audio track exists", () => {
    expect(resolveProjectorMediaSource("/media/video.mp4")).toEqual({
      url: "/media/video.mp4",
      mimeType: "video/mp4",
      kind: "video",
    });
  });

  it("reports an absent source without attempting playback", () => {
    expect(resolveProjectorMediaSource()).toMatchObject({ url: "", kind: "none" });
  });
});
