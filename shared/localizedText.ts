/** Convertit une valeur multilingue en texte sûr pour JSX, sans jamais renvoyer l’objet brut. */
export function resolveLocalizedText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const localized = value as { fr?: unknown; en?: unknown };
    if (typeof localized.fr === "string" && localized.fr.trim()) return localized.fr;
    if (typeof localized.en === "string" && localized.en.trim()) return localized.en;
  }
  return fallback;
}
