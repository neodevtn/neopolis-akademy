import { describe, expect, it } from "vitest";
import { applySpaDocumentNoCacheHeaders, SPA_DOCUMENT_NO_CACHE_HEADERS, VERSIONED_ASSET_CACHE_CONTROL } from "./vite";

describe("SPA document cache headers", () => {
  it("forces document revalidation before a shared cache can serve an HTML document that references a bundle", () => {
    let appliedHeaders: Record<string, string> | undefined;
    applySpaDocumentNoCacheHeaders({
      set: (headers) => {
        appliedHeaders = headers;
      },
    });

    expect(appliedHeaders).toEqual(SPA_DOCUMENT_NO_CACHE_HEADERS);
    expect(appliedHeaders?.["Cache-Control"]).toContain("no-cache");
    expect(appliedHeaders?.["Cache-Control"]).not.toContain("no-store");
  });

  it("distingue le cache long des bundles versionnés du document HTML systématiquement revalidé", () => {
    expect(VERSIONED_ASSET_CACHE_CONTROL).toContain("max-age=31536000");
    expect(VERSIONED_ASSET_CACHE_CONTROL).toContain("immutable");
    expect(SPA_DOCUMENT_NO_CACHE_HEADERS["Cache-Control"]).toContain("no-cache");
    expect(SPA_DOCUMENT_NO_CACHE_HEADERS["Cache-Control"]).not.toContain("no-store");
  });
});
