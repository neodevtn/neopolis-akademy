const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type InvitationEmailParseResult = {
  emails: string[];
  invalid: string[];
  duplicates: string[];
};

/** Analyse les adresses séparées uniquement par point-virgule ou retour à la ligne. */
export function parseInvitationEmails(value: string): InvitationEmailParseResult {
  const seen = new Set<string>();
  const emails: string[] = [];
  const invalid: string[] = [];
  const duplicates: string[] = [];

  for (const candidate of value.split(/[;\r\n]+/).map((entry) => entry.trim()).filter(Boolean)) {
    const email = candidate.toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      invalid.push(candidate);
    } else if (seen.has(email)) {
      duplicates.push(email);
    } else {
      seen.add(email);
      emails.push(email);
    }
  }
  return { emails, invalid, duplicates };
}
