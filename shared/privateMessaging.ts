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
