export const PRIVATE_CONVERSATION_SOURCES = ["learner", "admin", "integrity_review", "problem_report"] as const;
export const PRIVATE_CONVERSATION_STATUSES = ["open", "closed"] as const;
export const PRIVATE_MESSAGE_AUTHOR_ROLES = ["learner", "admin", "system"] as const;

export type PrivateConversationSource = (typeof PRIVATE_CONVERSATION_SOURCES)[number];
export type PrivateConversationStatus = (typeof PRIVATE_CONVERSATION_STATUSES)[number];
export type PrivateMessageAuthorRole = (typeof PRIVATE_MESSAGE_AUTHOR_ROLES)[number];

export const PRIVATE_MESSAGE_LIMITS = {
  subjectMin: 3,
  subjectMax: 220,
  bodyMin: 1,
  bodyMax: 5_000,
  previewMax: 280,
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

export function privateConversationDisplayStatus(status: PrivateConversationStatus): string {
  return status === "open" ? "Ouverte" : "Fermée";
}

export function privateConversationDisplaySource(source: PrivateConversationSource): string {
  switch (source) {
    case "problem_report": return "Signalement";
    case "integrity_review": return "Revue d’intégrité";
    case "admin": return "Initiative Neopolis";
    default: return "Initiative apprenant";
  }
}
