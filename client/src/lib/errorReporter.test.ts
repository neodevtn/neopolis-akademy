import { beforeEach, describe, expect, it, vi } from "vitest";

const { captureException } = vi.hoisted(() => ({
  captureException: vi.fn(),
}));

vi.mock("@sentry/react", () => ({
  captureException,
}));

import { reportBoundaryError, shouldIgnoreClientError } from "./errorReporter";

describe("reportBoundaryError", () => {
  beforeEach(() => {
    captureException.mockClear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    vi.stubGlobal("window", { location: { href: "https://akademy.neodev.click/training/test" } });
    vi.stubGlobal("navigator", { userAgent: "vitest" });
  });

  it("forwards a React ErrorBoundary crash to Sentry with diagnostic context", async () => {
    const error = new Error("Failed to execute insertBefore on Node");

    reportBoundaryError(error, "at LessonViewer");

    await vi.waitFor(() => expect(captureException).toHaveBeenCalledWith(error, expect.objectContaining({
      tags: expect.objectContaining({
        source: "ErrorBoundary",
        error_kind: "react_boundary",
      }),
      contexts: {
        react: { componentStack: "at LessonViewer" },
      },
    })));
  });

  it("filters obsolete lazy chunks and blob workers while preserving application errors", () => {
    expect(shouldIgnoreClientError(new TypeError("Cannot read properties of undefined (reading 'default')").message)).toBe(true);
    expect(shouldIgnoreClientError("Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'blob:https://example.invalid/id' failed to load.")).toBe(true);
    expect(shouldIgnoreClientError("Invalid count value: -2")).toBe(false);
    expect(shouldIgnoreClientError("Failed to execute 'removeChild' on 'Node'")).toBe(false);
  });

  it("does not forward an obsolete lazy chunk to Sentry or the internal monitor", async () => {
    const fetchSpy = vi.mocked(fetch);
    reportBoundaryError(new TypeError("Cannot read properties of undefined (reading 'default')"), "at Lazy");
    await Promise.resolve();
    expect(captureException).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
