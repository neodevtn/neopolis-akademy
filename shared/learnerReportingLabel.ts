/**
 * Produces a privacy-respecting, human-readable reporting label.
 * A profile name is preferred for readability; the e-mail remains a reliable fallback.
 */
export function learnerReportingLabel(input?: { email?: string | null; name?: string | null }) {
  const name = input?.name?.trim();
  if (name) return name;

  const email = input?.email?.trim();
  if (email) return email;

  return "Profil apprenant incomplet";
}
