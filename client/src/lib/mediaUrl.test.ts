import { describe, expect, it } from "vitest";
import { toBlockMediaUrl, toPreviewMediaUrl } from "./mediaUrl";

describe("media URL normalization", () => {
  it("converts legacy manuscript storage links to the application asset proxy", () => {
    expect(toPreviewMediaUrl("/manus-storage/guide.pdf", "pdf")).toBe("/api/assets/guide.pdf");
  });
  it("converts a relative media filename into an asset proxy URL", () => {
    expect(toPreviewMediaUrl("files/guide fr.pdf", "pdf")).toBe("/api/assets/files/guide%20fr.pdf");
  });
  it("keeps a bare YouTube identifier when a video block expects youtubeId", () => {
    expect(toBlockMediaUrl("dQw4w9WgXcQ", "youtube", "youtubeId")).toBe("dQw4w9WgXcQ");
  });
});
