import { describe, expect, it } from "vitest";
import { canonicalNavigationLocation } from "./canonicalHost";
import { privateApiResponseHeaders } from "./sessionResponseHeaders";

describe("canonical navigation host", () => {
  it("redirects managed-domain browser navigation to the canonical public domain", () => {
    expect(canonicalNavigationLocation({
      method: "GET",
      host: "neopacademy-6qa7lvjq.manus.space",
      originalUrl: "/training?tab=journey",
    })).toBe("https://akademy.neodev.click/training?tab=journey");
  });

  it("keeps canonical and development hosts untouched and never redirects mutations", () => {
    expect(canonicalNavigationLocation({ method: "GET", host: "akademy.neodev.click", originalUrl: "/admin" })).toBeNull();
    expect(canonicalNavigationLocation({ method: "GET", host: "localhost:3000", originalUrl: "/training" })).toBeNull();
    expect(canonicalNavigationLocation({ method: "POST", host: "neopacademy-6qa7lvjq.manus.space", originalUrl: "/api/auth/login" })).toBeNull();
  });
});

describe("private API response headers", () => {
  it("marks session-aware API responses as private and non-cacheable", () => {
    const headers = new Map<string, string>();
    let continued = false;
    privateApiResponseHeaders({} as any, {
      setHeader: (name: string, value: string) => headers.set(name, value),
    } as any, () => { continued = true; });

    expect(headers.get("Cache-Control")).toBe("no-store, private, max-age=0");
    expect(headers.get("Pragma")).toBe("no-cache");
    expect(continued).toBe(true);
  });
});
