import { afterEach, describe, expect, it, vi } from "vitest";
import { submitSentryTechnicalFeedback } from "./sentryFeedback";

const originalToken = process.env.SENTRY_FEEDBACK_INTEGRATION_TOKEN;
const feedback = {
  message: "Le bouton de validation est bloqué.",
  url: "https://akademy.neodev.click/training/demo",
  name: "Apprenant Démo",
  email: "apprenant@neopolis.demo",
};

describe("submitSentryTechnicalFeedback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalToken) process.env.SENTRY_FEEDBACK_INTEGRATION_TOKEN = originalToken;
    else delete process.env.SENTRY_FEEDBACK_INTEGRATION_TOKEN;
  });

  it("crée l’événement côté serveur avant de déposer un feedback associé", async () => {
    process.env.SENTRY_FEEDBACK_INTEGRATION_TOKEN = "server-only-test-token";
    const mockedFetch = vi.fn()
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "feedback-1" }), { status: 201 }));
    vi.stubGlobal("fetch", mockedFetch);

    await expect(submitSentryTechnicalFeedback(feedback)).resolves.toEqual({ accepted: true, feedbackId: "feedback-1" });

    expect(mockedFetch).toHaveBeenCalledTimes(2);
    expect(mockedFetch.mock.calls[0]?.[0]).toContain("/api/102/store/");
    expect(mockedFetch.mock.calls[1]?.[0]).toContain("/api/0/projects/neopolis-development/neopolis-akademy/user-feedback/");
    expect(mockedFetch.mock.calls[1]?.[1]).toMatchObject({ headers: expect.objectContaining({ Authorization: "Bearer server-only-test-token" }) });
    const eventId = JSON.parse(String(mockedFetch.mock.calls[0]?.[1]?.body)).event_id;
    expect(JSON.parse(String(mockedFetch.mock.calls[1]?.[1]?.body)).event_id).toBe(eventId);
  });

  it("ne dépose aucun feedback si l’événement serveur est refusé", async () => {
    process.env.SENTRY_FEEDBACK_INTEGRATION_TOKEN = "server-only-test-token";
    const mockedFetch = vi.fn().mockResolvedValue(new Response("forbidden", { status: 403 }));
    vi.stubGlobal("fetch", mockedFetch);

    await expect(submitSentryTechnicalFeedback(feedback)).resolves.toEqual({ accepted: false, reason: "event_rejected" });
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });
});
