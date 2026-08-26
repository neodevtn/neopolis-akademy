import { describe, expect, it } from "vitest";
import { shouldSkipLoginRateLimit } from "./auth";

describe("shouldSkipLoginRateLimit", () => {
  const previewProbe = { get: (header: string) => header === "x-neopolis-qa-probe" ? "1" : undefined };
  const regularRequest = { get: () => undefined };

  it("exempte exclusivement la sonde QA identifiée en prévisualisation", () => {
    expect(shouldSkipLoginRateLimit(previewProbe as never, false)).toBe(true);
    expect(shouldSkipLoginRateLimit(regularRequest as never, false)).toBe(false);
  });

  it("ne permet jamais cette exemption en production", () => {
    expect(shouldSkipLoginRateLimit(previewProbe as never, true)).toBe(false);
  });
});
