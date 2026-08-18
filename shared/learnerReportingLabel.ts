/**
 * Produces a privacy-respecting, human-readable reporting label.
 * The e-mail is the most reliable identifier when account profile names are incomplete.
 */
export function learnerReportingLabel(input?: { email?: string | null; name?: string | null }) {
  const email = input?.email?.trim();
  if (email) return email;

  const name = input?.name?.trim();
  if (name) return name;

  return "Apprenant sans e-mail";
}
