import { describe, expect, it } from "vitest";
import { getEditorFields, hydrateBlockForEditor, isMediaEditorField } from "./blockEditorParity";

describe("block editor parity", () => {
  const video = {
    type: "video",
    title: { en: "Bedrock", fr: "Bedrock" },
    videoId: "abc123",
    watchUrl: "https://www.youtube.com/watch?v=abc123",
    mp4Url: "/api/assets/video.mp4",
    audioUrl: "/api/assets/audio.mp3",
    slidesPdf: "/api/assets/slides.pdf",
    subtitleUrlFr: "/api/assets/fr.vtt",
    transcriptSegments: [{ text: "Bonjour" }],
  };

  it("exposes every rendered runtime video field to the editor", () => {
    const fields = getEditorFields(video, [
      { key: "title", label: { en: "Title", fr: "Titre" }, type: "i18n_text" },
      { key: "url", label: { en: "YouTube URL", fr: "URL YouTube" }, type: "text" },
      { key: "mp4Url", label: { en: "MP4 URL", fr: "URL MP4" }, type: "text" },
    ]);
    expect(fields.map((field) => field.key)).toEqual(expect.arrayContaining(["audioUrl", "slidesPdf", "subtitleUrlFr", "transcriptSegments", "watchUrl", "videoId"]));
  });

  it("hydrates the canonical editable URL from a runtime watch URL", () => {
    expect(hydrateBlockForEditor(video).url).toBe("https://www.youtube.com/watch?v=abc123");
  });

  it("identifies all media runtime fields for the media library", () => {
    expect(isMediaEditorField("audioUrl")).toBe(true);
    expect(isMediaEditorField("subtitleUrlFr")).toBe(true);
    expect(isMediaEditorField("projectorSlides")).toBe(true);
    expect(isMediaEditorField("transcript")).toBe(false);
  });
});
