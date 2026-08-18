import { describe, expect, it } from "vitest";
import { isStaleClientBundleError } from "./chunkRecovery";

describe("isStaleClientBundleError", () => {
  it("recognizes the browser MIME error caused by a stale lazy chunk", () => {
    expect(isStaleClientBundleError(new Error("'text/html' is not a valid JavaScript MIME type."))).toBe(true);
  });

  it("recognizes Safari’s generic lazy-chunk load failure", () => {
    expect(isStaleClientBundleError(new TypeError("Load failed"))).toBe(true);
  });

  it("does not mistake ordinary application errors for a stale bundle", () => {
    expect(isStaleClientBundleError(new Error("t.filter is not a function"))).toBe(false);
  });
});
