import { ensureSentryClient } from "@/lib/sentryClient";

export type TechnicalFeedbackInput = {
  message: string;
  url: string;
  name?: string | null;
  email?: string | null;
};

/** Creates the Sentry event used by the server-only User Feedback delivery. */
export async function captureTechnicalFeedbackEvent(input: TechnicalFeedbackInput) {
  const message = input.message.trim();
  if (message.length < 6) throw new Error("Le signalement doit contenir au moins six caractères.");
  const Sentry = await ensureSentryClient();
  const eventId = Sentry.captureMessage(message, {
    level: "info",
    tags: { channel: "technical_support", surface: "unified_support_hub", feedback_transport: "server_api" },
    contexts: { technical_support: { url: input.url } },
  });
  await Sentry.flush(5_000);
  if (!eventId) throw new Error("Sentry n’a pas confirmé la création de l’événement technique.");
  return eventId;
}
