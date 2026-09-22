import { describe, expect, it } from "vitest";
import { BLOCK_REGISTRY, getEditableBlockTypes } from "@shared/blockRegistry";
import { getEditorFields, hydrateBlockForEditor, isMediaEditorField, prepareBlockForSave } from "./blockEditorParity";

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

  it("exposes associated media fields while hiding redundant legacy source aliases", () => {
    const fields = getEditorFields(video, [
      { key: "title", label: { en: "Title", fr: "Titre" }, type: "i18n_text" },
      { key: "sourceType", label: { en: "Source type", fr: "Type de source" }, type: "select" },
      { key: "sourceUrl", label: { en: "Source URL", fr: "URL de la source" }, type: "text" },
    ]);
    expect(fields.map((field) => field.key)).toEqual(expect.arrayContaining(["slidesPdf", "subtitleUrlFr", "transcriptSegments"]));
    for (const legacyAlias of ["audioUrl", "mp4Url", "watchUrl", "videoId"]) expect(fields.map((field) => field.key)).not.toContain(legacyAlias);
  });

  it("hydrates one canonical video source from runtime aliases", () => {
    const hydrated = hydrateBlockForEditor(video);
    expect(hydrated.sourceType).toBe("video");
    expect(hydrated.sourceUrl).toBe("/api/assets/video.mp4");
  });

  it("serializes the canonical source back to the learner renderer fields", () => {
    expect(prepareBlockForSave({ type: "video", sourceType: "youtube", sourceUrl: "https://www.youtube.com/watch?v=AbC123_XyZ" })).toMatchObject({ url: "https://www.youtube.com/watch?v=AbC123_XyZ", watchUrl: "https://www.youtube.com/watch?v=AbC123_XyZ", videoId: "AbC123_XyZ", mp4Url: "", audioUrl: "" });
    expect(prepareBlockForSave({ type: "video", sourceType: "hls", sourceUrl: "https://media.example.test/stream.m3u8" })).toMatchObject({ mp4Url: "", hlsUrl: "https://media.example.test/stream.m3u8", videoId: "" });
    expect(prepareBlockForSave({ type: "video", sourceType: "video", sourceUrl: "/api/assets/video.mp4", audioUrl: "/api/assets/narration.mp3", projectorSlides: [{ id: 1 }] })).toMatchObject({ mp4Url: "/api/assets/video.mp4", audioUrl: "/api/assets/narration.mp3" });
  });

  it("gives every editable block a declared, non-empty form and preserves runtime attributes", () => {
    const editable = getEditableBlockTypes();
    expect(editable.length).toBeGreaterThan(10);
    for (const definition of editable) {
      expect(definition.schema.length, definition.type).toBeGreaterThan(0);
      expect(definition.defaultData.type, definition.type).toBe(definition.type);
      expect(getEditorFields({ ...definition.defaultData, runtimeAttribute: "preserve" }, definition.schema).some((field) => field.key === "runtimeAttribute"), definition.type).toBe(true);
    }
    expect(BLOCK_REGISTRY.some((definition) => definition.type === "video")).toBe(true);
  });

  it("hydrate les valeurs par défaut des réglages avancés lorsqu’un bloc existant ne les possède pas", () => {
    const hydrated = hydrateBlockForEditor(
      { type: "learning_section", title: { fr: "Titre" } },
      [{ key: "styleTone", label: { en: "Tone", fr: "Ton" }, type: "select", defaultValue: "brand" }],
    );
    expect(hydrated.styleTone).toBe("brand");
  });

  it("identifies all media runtime fields for the media library", () => {
    expect(isMediaEditorField("audioUrl")).toBe(true);
    expect(isMediaEditorField("subtitleUrlFr")).toBe(true);
    expect(isMediaEditorField("projectorSlides")).toBe(true);
    expect(isMediaEditorField("transcript")).toBe(false);
  });
});
