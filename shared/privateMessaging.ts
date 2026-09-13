export const PRIVATE_CONVERSATION_SOURCES = ["learner", "admin", "integrity_review", "problem_report"] as const;
export const PRIVATE_CONVERSATION_STATUSES = ["open", "closed"] as const;
export const PRIVATE_MESSAGE_AUTHOR_ROLES = ["learner", "admin", "system"] as const;
export const PRIVATE_MESSAGE_ATTACHMENT_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"] as const;

export type PrivateConversationSource = (typeof PRIVATE_CONVERSATION_SOURCES)[number];
export type PrivateConversationStatus = (typeof PRIVATE_CONVERSATION_STATUSES)[number];
export type PrivateMessageAuthorRole = (typeof PRIVATE_MESSAGE_AUTHOR_ROLES)[number];
export type PrivateMessageAttachmentMimeType = (typeof PRIVATE_MESSAGE_ATTACHMENT_MIME_TYPES)[number];
export type PrivateMessagingLocale = "fr" | "en" | "ar";
export type PrivateMessageReceiptState = "sending" | "sent" | "delivered" | "read";
export type PrivateMessageAudience = "learner" | "admin";

export const PRIVATE_MESSAGE_LIMITS = {
  subjectMin: 3,
  subjectMax: 220,
  bodyMin: 1,
  bodyMax: 5_000,
  previewMax: 280,
} as const;

export const PRIVATE_MESSAGE_ATTACHMENT_LIMITS = {
  maxBytes: 10 * 1024 * 1024,
  maxBase64Chars: 14_000_000,
  maxFilesPerMessage: 3,
  filenameMax: 180,
} as const;

export const PRIVATE_INTEGRITY_REVIEW_TEMPLATE = {
  subject: "Activité suspecte détectée — vérification requise",
  body: "Bonjour,\n\nNos contrôles ont détecté une activité inhabituelle dans votre parcours, susceptible d’indiquer l’utilisation de robots, d’agents ou d’outils d’IA automatisés pour simuler une progression, valider des activités ou contourner des checkpoints. Cette pratique est interdite par les règles d’intégrité de Neopolis Akademy.\n\nUne revue de votre parcours est ouverte. Vous devez répondre à ce message en indiquant tout élément utile à l’examen de votre situation. L’équipe peut demander une vérification complémentaire et, si nécessaire, appliquer une mesure temporaire sur les validations ou examens en attente.\n\nCe message vous informe d’une suspicion en cours de vérification ; il ne constitue pas à lui seul une décision définitive.\n\nL’équipe Neopolis",
} as const;

export function normalizePrivateMessageText(value: string): string {
  return value.replace(/\r\n?/g, "\n").replace(/[\t\f\v ]+/g, " ").trim();
}

export function privateMessagePreview(value: string): string {
  const normalized = normalizePrivateMessageText(value).replace(/\n+/g, " ");
  return normalized.length > PRIVATE_MESSAGE_LIMITS.previewMax
    ? `${normalized.slice(0, PRIVATE_MESSAGE_LIMITS.previewMax - 1).trimEnd()}…`
    : normalized;
}

export function privateMessageAttachmentLabel(count: number, locale: PrivateMessagingLocale = "fr"): string {
  if (locale === "en") return count === 1 ? "Attachment" : `${count} attachments`;
  if (locale === "ar") return count === 1 ? "مرفق" : `${count} مرفقات`;
  return count === 1 ? "Pièce jointe" : `${count} pièces jointes`;
}

export function privateMessageReceiptState(input: { sending?: boolean; deliveredAt?: Date | string | null; readAt?: Date | string | null }): PrivateMessageReceiptState {
  if (input.sending) return "sending";
  if (input.readAt) return "read";
  if (input.deliveredAt) return "delivered";
  return "sent";
}

export function privateMessageReceiptLabel(input: { sending?: boolean; deliveredAt?: Date | string | null; readAt?: Date | string | null }, locale: PrivateMessagingLocale = "fr"): string {
  const receipt = privateMessageReceiptState(input);
  const labels = {
    fr: { sending: "Envoi en cours", sent: "Envoyé", delivered: "Distribué", read: "Vu" },
    en: { sending: "Sending", sent: "Sent", delivered: "Delivered", read: "Seen" },
    ar: { sending: "جارٍ الإرسال", sent: "تم الإرسال", delivered: "تم التسليم", read: "تمت المشاهدة" },
  } as const;
  return labels[locale][receipt];
}

export function privateMessageIsUnreadForAudience(input: {
  authorRole: PrivateMessageAuthorRole;
  learnerReadAt?: Date | string | null;
  adminReadAt?: Date | string | null;
}, audience: PrivateMessageAudience): boolean {
  return audience === "admin"
    ? input.authorRole !== "admin" && !input.adminReadAt
    : input.authorRole !== "learner" && !input.learnerReadAt;
}

export function privateConversationDisplayStatus(status: PrivateConversationStatus, locale: PrivateMessagingLocale = "fr"): string {
  if (locale === "en") return status === "open" ? "Open" : "Closed";
  if (locale === "ar") return status === "open" ? "مفتوحة" : "مغلقة";
  return status === "open" ? "Ouverte" : "Fermée";
}

export function privateConversationDisplaySource(source: PrivateConversationSource, locale: PrivateMessagingLocale = "fr"): string {
  if (locale === "en") {
    switch (source) {
      case "problem_report": return "Problem report";
      case "integrity_review": return "Integrity review";
      case "admin": return "Neopolis-initiated";
      default: return "Learner-initiated";
    }
  }
  if (locale === "ar") {
    switch (source) {
      case "problem_report": return "إبلاغ عن مشكلة";
      case "integrity_review": return "مراجعة النزاهة";
      case "admin": return "مبادرة نيوبوليس";
      default: return "مبادرة المتعلم";
    }
  }
  switch (source) {
    case "problem_report": return "Signalement";
    case "integrity_review": return "Revue d’intégrité";
    case "admin": return "Initiative Neopolis";
    default: return "Initiative apprenant";
  }
}
