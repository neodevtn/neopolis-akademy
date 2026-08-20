import { describe, expect, it } from "vitest";
import { isRecoverableClientRenderError, isStaleClientBundleError } from "./chunkRecovery";

describe("isStaleClientBundleError", () => {
  it("recognizes the browser MIME error caused by a stale lazy chunk", () => {
    expect(isStaleClientBundleError(new Error("'text/html' is not a valid JavaScript MIME type."))).toBe(true);
  });

  it("recognizes Safari’s generic lazy-chunk load failure", () => {
    expect(isStaleClientBundleError(new TypeError("Load failed"))).toBe(true);
  });

  it("recognizes Vite preload errors raised outside the React error boundary", () => {
    expect(isStaleClientBundleError(new Error("vite:preloadError: failed to fetch dynamically imported module"))).toBe(true);
  });

  it("does not mistake ordinary application errors for a stale bundle", () => {
    expect(isStaleClientBundleError(new Error("t.filter is not a function"))).toBe(false);
  });

  it("recovers the insertBefore DOM failure that can occur in an outdated React tree", () => {
    expect(
      isRecoverableClientRenderError(
        new DOMException(
          "Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.",
          "NotFoundError",
        ),
      ),
    ).toBe(true);
  });

  it("does not reload for an unrelated React rendering failure", () => {
    expect(isRecoverableClientRenderError(new Error("Objects are not valid as a React child"))).toBe(false);
  });
});
