import { beforeEach, describe, expect, it, vi } from "vitest";

const { captureFeedback, flush, ensureSentryClient } = vi.hoisted(() => ({
  captureFeedback: vi.fn(),
  flush: vi.fn(),
  ensureSentryClient: vi.fn(),
}));

vi.mock("@/lib/sentryClient", () => ({ ensureSentryClient }));

import {
  TECHNICAL_SUPPORT_EVIDENCE_LIMITS,
  submitTechnicalSupportFeedbackToSentry,
  validateTechnicalSupportEvidence,
} from "./technicalSupportEvidence";

function evidence(name: string, type = "image/png", size = 7): File {
  return {
    name,
    type,
    size,
    arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
  } as unknown as File;
}

describe("technical support Sentry evidence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captureFeedback.mockReturnValue("feedback-event-1");
    flush.mockResolvedValue(true);
    ensureSentryClient.mockResolvedValue({ captureFeedback, flush });
  });

  it("accepts permitted images and videos within the cumulative limit", () => {
    expect(() => validateTechnicalSupportEvidence([evidence("screen.png"), evidence("recording.webm", "video/webm")])).not.toThrow();
  });

  it("rejects unsafe MIME types, individual oversize files and excessive attachments", () => {
    expect(() => validateTechnicalSupportEvidence([evidence("unsafe.pdf", "application/pdf")])).toThrow(/JPEG|PNG|WebP/i);
    expect(() => validateTechnicalSupportEvidence([evidence("large.png", "image/png", TECHNICAL_SUPPORT_EVIDENCE_LIMITS.maxFileBytes + 1)])).toThrow(/15 Mo/);
    expect(() => validateTechnicalSupportEvidence(Array.from({ length: TECHNICAL_SUPPORT_EVIDENCE_LIMITS.maxFiles + 1 }, (_, index) => evidence(`screen-${index}.png`)))).toThrow(/maximum/i);
  });

  it("sends selected evidence as Sentry feedback attachments and waits for delivery", async () => {
    const proof = evidence("screen.png");
    await expect(submitTechnicalSupportFeedbackToSentry({ message: "Le bouton reste bloqué", url: "https://akademy.neodev.click/training", evidence: [proof] })).resolves.toEqual({ eventId: "feedback-event-1" });
    expect(captureFeedback).toHaveBeenCalledWith(expect.objectContaining({ message: "Le bouton reste bloqué", source: "neopolis-support-hub" }), expect.objectContaining({ attachments: [expect.objectContaining({ filename: "screen.png", contentType: "image/png" })] }));
    expect(flush).toHaveBeenCalledWith(8_000);
  });

  it("fails clearly when Sentry does not confirm delivery", async () => {
    flush.mockResolvedValue(false);
    await expect(submitTechnicalSupportFeedbackToSentry({ message: "Le bouton reste bloqué", url: "https://akademy.neodev.click/training", evidence: [] })).rejects.toThrow(/confirmé/i);
  });
});
