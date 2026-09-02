import { afterEach, describe, expect, it, vi } from "vitest";
import { getClientBundleRecoveryScope, isRecoverableClientRenderError, isStaleClientBundleError, retryStaleClientBundle } from "./chunkRecovery";

afterEach(() => {
  vi.unstubAllGlobals();
});

function installRecoveryWindow() {
  const values = new Map<string, string>();
  const replace = vi.fn();
  vi.stubGlobal("window", {
    location: {
      pathname: "/training/exemple/module",
      href: "https://akademy.neodev.click/training/exemple/module?chapter=1",
      replace,
    },
    sessionStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      get length() { return values.size; },
      key: (index: number) => [...values.keys()][index] ?? null,
    },
  });
  return { replace };
}

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

  it("recognizes Chromium’s undefined default export signature from an obsolete lazy chunk", () => {
    expect(isStaleClientBundleError(new TypeError("Cannot read properties of undefined (reading 'default')"))).toBe(true);
  });

  it("recognizes Firefox’s undefined lazy result signature from an obsolete lazy chunk", () => {
    expect(isStaleClientBundleError(new TypeError('can\'t access property "default", S._result is undefined'))).toBe(true);
  });

  it("uses a separate recovery scope for an obsolete lazy default after another refresh", () => {
    expect(getClientBundleRecoveryScope(new TypeError("Cannot read properties of undefined (reading 'default')"))).toBe("lazy-default");
    expect(getClientBundleRecoveryScope(new Error("vite:preloadError"))).toBe("stale-chunk");
  });

  it("uses a separate recovery scope for a stale React DOM tree", () => {
    expect(getClientBundleRecoveryScope(new DOMException("Failed to execute 'insertBefore' on 'Node'", "NotFoundError"))).toBe("react-tree");
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

  it("recharges une seule fois une signature de module obsolète et conserve les paramètres du parcours", () => {
    const { replace } = installRecoveryWindow();
    const error = new TypeError("Cannot read properties of undefined (reading 'default')");

    expect(retryStaleClientBundle(error)).toBe(true);
    expect(replace).toHaveBeenCalledOnce();
    expect(replace.mock.calls[0]?.[0]).toMatch(/^https:\/\/akademy\.neodev\.click\/training\/exemple\/module\?chapter=1&client-recovery=\d+$/);
    expect(retryStaleClientBundle(error)).toBe(false);
    expect(replace).toHaveBeenCalledOnce();
  });

  it("autorise un seul rechargement distinct si la signature suivante est celle d’un arbre React obsolète", () => {
    const { replace } = installRecoveryWindow();
    expect(retryStaleClientBundle(new TypeError("Cannot read properties of undefined (reading 'default')"))).toBe(true);
    expect(retryStaleClientBundle(new DOMException("Failed to execute 'insertBefore' on 'Node'", "NotFoundError"))).toBe(true);
    expect(replace).toHaveBeenCalledTimes(2);
  });
});
