import { describe, expect, it } from "vitest";
import { applySpaDocumentNoCacheHeaders, SPA_DOCUMENT_NO_CACHE_HEADERS } from "./vite";

describe("SPA document cache headers", () => {
  it("prevents a shared cache from serving an HTML document that references an old bundle", () => {
    let appliedHeaders: Record<string, string> | undefined;
    applySpaDocumentNoCacheHeaders({
      set: (headers) => {
        appliedHeaders = headers;
      },
    });

    expect(appliedHeaders).toEqual(SPA_DOCUMENT_NO_CACHE_HEADERS);
    expect(appliedHeaders?.["Cache-Control"]).toContain("no-store");
  });
});
