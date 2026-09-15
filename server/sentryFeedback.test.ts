import { afterEach, describe, expect, it, vi } from "vitest";
import { submitSentryTechnicalFeedback } from "./sentryFeedback";

const originalToken = process.env.SENTRY_FEEDBACK_INTEGRATION_TOKEN;

describe("submitSentryTechnicalFeedback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalToken) process.env.SENTRY_FEEDBACK_INTEGRATION_TOKEN = originalToken;
    else delete process.env.SENTRY_FEEDBACK_INTEGRATION_TOKEN;
  });

  it("dépose un feedback via l’API serveur avec un Bearer token jamais sérialisé", async () => {
    process.env.SENTRY_FEEDBACK_INTEGRATION_TOKEN = "server-only-test-token";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "feedback-1" }), { status: 201 })));

    await expect(submitSentryTechnicalFeedback({
      eventId: "1234567890abcdef1234567890abcdef",
      message: "Le bouton de validation est bloqué.",
      name: "Apprenant Démo",
      email: "apprenant@neopolis.demo",
    })).resolves.toEqual({ accepted: true, feedbackId: "feedback-1" });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/0/projects/neopolis-development/neopolis-akademy/user-feedback/"),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer server-only-test-token" }) }),
    );
  });

  it("retourne un statut sûr quand Sentry refuse le dépôt", async () => {
    process.env.SENTRY_FEEDBACK_INTEGRATION_TOKEN = "server-only-test-token";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("forbidden", { status: 403 })));

    await expect(submitSentryTechnicalFeedback({
      eventId: "1234567890abcdef1234567890abcdef",
      message: "Le bouton de validation est bloqué.",
      name: "Apprenant Démo",
      email: "apprenant@neopolis.demo",
    })).resolves.toEqual({ accepted: false, reason: "rejected" });
  });
});
