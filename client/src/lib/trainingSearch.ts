export type TrainingSearchKind = "certification" | "course" | "chapter";

export type TrainingSearchEntry = {
  id: string;
  kind: TrainingSearchKind;
  title: string;
  subtitle?: string;
  snippet?: string;
  keywords?: string[];
  group?: string;
  certId: string;
  href: string;
};

export type TrainingSearchFilters = {
  kind?: TrainingSearchKind | "all";
  group?: string;
  limit?: number;
};

/** Normalise accents, ponctuation et espaces pour une recherche bilingue prévisible. */
export function normalizeTrainingSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function scoreField(field: string, query: string, tokens: string[], weight: number) {
  if (!field) return 0;
  let score = field.includes(query) ? weight * 4 : 0;
  if (field.startsWith(query)) score += weight * 2;
  for (const token of tokens) {
    if (field.includes(token)) score += weight;
    if (field.split(" ").some((word) => word.startsWith(token))) score += weight * 0.5;
  }
  return score;
}

/**
 * Classe les correspondances sans appel réseau : titre exact, mots du titre,
 * puis contexte pédagogique et mots-clés. Toutes les termes saisis doivent
 * être présents dans l’entrée pour éviter les résultats trompeurs.
 */
export function searchTrainingContent(entries: TrainingSearchEntry[], rawQuery: string, filters: TrainingSearchFilters = {}) {
  const query = normalizeTrainingSearchText(rawQuery);
  if (!query) return [];
  const tokens = Array.from(new Set(query.split(" ").filter((token) => token.length >= 2)));
  const limit = filters.limit ?? 12;

  return entries
    .filter((entry) => (filters.kind ?? "all") === "all" || entry.kind === filters.kind)
    .filter((entry) => !filters.group || entry.group === filters.group)
    .map((entry) => {
      const title = normalizeTrainingSearchText(entry.title);
      const subtitle = normalizeTrainingSearchText(`${entry.subtitle || ""} ${entry.snippet || ""}`);
      const keywords = normalizeTrainingSearchText((entry.keywords || []).join(" "));
      const haystack = `${title} ${subtitle} ${keywords}`;
      const allTokensMatch = tokens.every((token) => haystack.includes(token));
      if (!allTokensMatch) return null;

      const score =
        scoreField(title, query, tokens, 12) +
        scoreField(keywords, query, tokens, 6) +
        scoreField(subtitle, query, tokens, 3) +
        (entry.kind === "chapter" ? 0 : 2);
      return { ...entry, score };
    })
    .filter((entry): entry is TrainingSearchEntry & { score: number } => entry !== null)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "fr"))
    .slice(0, limit);
}
