const SENTRY_BASE_URL = "https://sentry.neopolis-dev.com";
const SENTRY_ORGANIZATION = "neopolis-development";
const SENTRY_PROJECT = "neopolis-akademy";

export type SentryTechnicalFeedback = {
  eventId: string;
  message: string;
  name: string;
  email: string;
};

export type SentryFeedbackDelivery =
  | { accepted: true; feedbackId: string | null }
  | { accepted: false; reason: "not_configured" | "rejected" | "unavailable" };

/**
 * Delivers User Feedback through Sentry's server API. The integration token is
 * server-only and is never serialized to a learner or written to logs.
 */
export async function submitSentryTechnicalFeedback(
  feedback: SentryTechnicalFeedback,
): Promise<SentryFeedbackDelivery> {
  const token = process.env.SENTRY_FEEDBACK_INTEGRATION_TOKEN;
  if (!token) return { accepted: false, reason: "not_configured" };

  try {
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
          event_id: feedback.eventId,
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
