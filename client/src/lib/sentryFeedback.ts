export type TechnicalFeedbackInput = {
  message: string;
  url: string;
  name?: string | null;
  email?: string | null;
};

/** Validates the browser payload; Sentry event creation is intentionally server-only. */
export function validateTechnicalFeedbackInput(input: TechnicalFeedbackInput): void {
  if (input.message.trim().length < 6) {
    throw new Error("Le signalement doit contenir au moins six caractères.");
  }
}
