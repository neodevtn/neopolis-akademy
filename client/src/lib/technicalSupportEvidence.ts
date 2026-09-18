import { ensureSentryClient } from "@/lib/sentryClient";

export const TECHNICAL_SUPPORT_EVIDENCE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/webm",
  "video/mp4",
] as const;

export const TECHNICAL_SUPPORT_EVIDENCE_LIMITS = {
  maxFiles: 3,
  maxFileBytes: 15 * 1024 * 1024,
  maxTotalBytes: 20 * 1024 * 1024,
  maxRecordingDurationMs: 60_000,
} as const;

export type TechnicalSupportEvidence = Pick<File, "name" | "type" | "size" | "arrayBuffer">;

export type TechnicalSupportFeedbackInput = {
  message: string;
  url: string;
  name?: string;
  email?: string;
  evidence: TechnicalSupportEvidence[];
};

const allowedTypes = new Set<string>(TECHNICAL_SUPPORT_EVIDENCE_MIME_TYPES);

export function validateTechnicalSupportEvidence(evidence: TechnicalSupportEvidence[]): void {
  if (evidence.length > TECHNICAL_SUPPORT_EVIDENCE_LIMITS.maxFiles) {
    throw new Error(`Vous pouvez joindre au maximum ${TECHNICAL_SUPPORT_EVIDENCE_LIMITS.maxFiles} preuves.`);
  }

  const totalBytes = evidence.reduce((sum, item) => sum + item.size, 0);
  if (totalBytes > TECHNICAL_SUPPORT_EVIDENCE_LIMITS.maxTotalBytes) {
    throw new Error("La taille totale des preuves ne doit pas dépasser 20 Mo.");
  }

  for (const item of evidence) {
    if (!allowedTypes.has(item.type)) {
      throw new Error("Seules les images JPEG, PNG, WebP et les vidéos WebM ou MP4 sont acceptées.");
    }
    if (item.size <= 0 || item.size > TECHNICAL_SUPPORT_EVIDENCE_LIMITS.maxFileBytes) {
      throw new Error("Chaque preuve doit peser entre 1 octet et 15 Mo.");
    }
  }
}

/**
 * Sends evidence directly in Sentry's feedback envelope. This preserves image
 * and video attachments in the event rather than exposing them through a
 * public link or reducing them to a textual reference.
 */
export async function submitTechnicalSupportFeedbackToSentry(input: TechnicalSupportFeedbackInput): Promise<{ eventId: string }> {
  validateTechnicalSupportEvidence(input.evidence);
  const Sentry = await ensureSentryClient();
  const attachments = await Promise.all(input.evidence.map(async (item) => ({
    filename: item.name.slice(0, 180),
    data: new Uint8Array(await item.arrayBuffer()),
    contentType: item.type,
  })));

  const eventId = await Sentry.captureFeedback(
    {
      message: input.message,
      url: input.url,
      name: input.name,
      email: input.email,
      source: "neopolis-support-hub",
      tags: {
        surface: "unified_support_hub",
        attachment_count: input.evidence.length,
      },
    },
    {
      attachments,
      includeReplay: true,
      captureContext: {
        tags: {
          channel: "technical_support",
          surface: "unified_support_hub",
        },
      },
    },
  );

  const delivered = await Sentry.flush(8_000);
  if (!delivered) {
    throw new Error("Sentry n’a pas confirmé la réception du signalement.");
  }

  return { eventId };
}
