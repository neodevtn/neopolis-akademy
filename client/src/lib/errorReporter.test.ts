import { beforeEach, describe, expect, it, vi } from "vitest";

const { captureException } = vi.hoisted(() => ({
  captureException: vi.fn(),
}));

vi.mock("@sentry/react", () => ({
  captureException,
}));

import { reportBoundaryError } from "./errorReporter";

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
});
