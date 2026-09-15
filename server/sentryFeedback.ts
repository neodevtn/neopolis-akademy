import { randomUUID } from "node:crypto";

const SENTRY_BASE_URL = "https://sentry.neopolis-dev.com";
const SENTRY_ORGANIZATION = "neopolis-development";
const SENTRY_PROJECT = "neopolis-akademy";
const SENTRY_PROJECT_ID = "102";
// Public DSN key already exposed by the browser DSN; it is not an integration secret.
const SENTRY_INGEST_PUBLIC_KEY = "f1beaf088d01628e72b6cc5b96511906";

export type SentryTechnicalFeedback = {
  message: string;
  url: string;
  name: string;
  email: string;
};

export type SentryFeedbackDelivery =
  | { accepted: true; feedbackId: string | null }
  | { accepted: false; reason: "not_configured" | "event_rejected" | "rejected" | "unavailable" };

async function createServerSentryEvent(feedback: SentryTechnicalFeedback): Promise<string | null> {
  const eventId = randomUUID().replaceAll("-", "");
  const response = await fetch(
    `${SENTRY_BASE_URL}/api/${SENTRY_PROJECT_ID}/store/?sentry_version=7&sentry_key=${SENTRY_INGEST_PUBLIC_KEY}&sentry_client=neopolis-akademy-server%2F1.0`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        event_id: eventId,
        timestamp: new Date().toISOString(),
        platform: "javascript",
        level: "info",
        environment: process.env.NODE_ENV === "production" ? "production" : "development",
        message: { formatted: `Technical support: ${feedback.message}` },
        tags: { channel: "technical_support", surface: "unified_support_hub", feedback_transport: "server_api" },
        user: { username: feedback.name, email: feedback.email },
        request: { url: feedback.url },
      }),
      signal: AbortSignal.timeout(8_000),
    },
  );

  return response.ok ? eventId : null;
}

/**
 * Creates the linked technical event on the server, then submits its User Feedback.
 * The integration token remains server-only and is never serialized to an learner or logged.
 */
export async function submitSentryTechnicalFeedback(
  feedback: SentryTechnicalFeedback,
): Promise<SentryFeedbackDelivery> {
  const token = process.env.SENTRY_FEEDBACK_INTEGRATION_TOKEN;
  if (!token) return { accepted: false, reason: "not_configured" };

  try {
    const eventId = await createServerSentryEvent(feedback);
    if (!eventId) {
      console.warn("[SentryFeedback] Technical event ingestion rejected before User Feedback delivery.");
      return { accepted: false, reason: "event_rejected" };
    }

    const response = await fetch(
      `${SENTRY_BASE_URL}/api/0/projects/${SENTRY_ORGANIZATION}/${SENTRY_PROJECT}/user-feedback/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          event_id: eventId,
          name: feedback.name,
          email: feedback.email,
          comments: feedback.message,
        }),
        signal: AbortSignal.timeout(8_000),
      },
    );

    if (!response.ok) {
      console.warn(`[SentryFeedback] User Feedback rejected with HTTP ${response.status}.`);
      return { accepted: false, reason: "rejected" };
    }

    const result = (await response.json().catch(() => null)) as { id?: string } | null;
    return { accepted: true, feedbackId: result?.id ?? null };
  } catch (error) {
    const detail = error instanceof Error ? error.name : "unknown";
    console.warn(`[SentryFeedback] User Feedback delivery unavailable (${detail}).`);
    return { accepted: false, reason: "unavailable" };
  }
}
