import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  ensureSentryClient: vi.fn(),
  captureMessage: vi.fn(),
  flush: vi.fn(),
}));

vi.mock("@/lib/sentryClient", () => ({
  ensureSentryClient: mocks.ensureSentryClient,
  sentryDsn: "https://public@sentry.neopolis-dev.com//102",
  sentryProject: { organization: "neopolis-development", slug: "neopolis-akademy" },
}));

import { captureTechnicalFeedbackEvent } from "./sentryFeedback";

describe("captureTechnicalFeedbackEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("crée un événement Sentry associé au canal technique avant le dépôt serveur", async () => {
    mocks.captureMessage.mockReturnValue("1234567890abcdef1234567890abcdef");
    mocks.flush.mockResolvedValue(true);
    mocks.ensureSentryClient.mockResolvedValue({ captureMessage: mocks.captureMessage, flush: mocks.flush });

    await expect(captureTechnicalFeedbackEvent({
      message: "Le bouton reste bloqué après la validation.",
      url: "https://akademy.neodev.click/training/demo",
      name: "Apprenant Démo",
      email: "apprenant@neopolis.demo",
    })).resolves.toBe("1234567890abcdef1234567890abcdef");

    expect(mocks.captureMessage).toHaveBeenCalledWith("Le bouton reste bloqué après la validation.", expect.objectContaining({
      tags: expect.objectContaining({ channel: "technical_support", feedback_transport: "server_api" }),
    }));
  });

  it("refuse un message trop court avant tout appel Sentry", async () => {
    await expect(captureTechnicalFeedbackEvent({ message: "court", url: "https://akademy.neodev.click" })).rejects.toThrow("six caractères");
    expect(mocks.ensureSentryClient).not.toHaveBeenCalled();
  });
});
