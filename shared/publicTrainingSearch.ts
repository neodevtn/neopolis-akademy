import { type PublicCatalogueTraining } from "./publicTrainingCatalog";

export type PublicTrainingSearchResult = PublicCatalogueTraining & { score: number };

/** Garde les lettres arabes et tous les alphabets indexables, en plus des accents latins. */
export function normalizePublicTrainingSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC")
    .toLocaleLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function scoreField(value: string, query: string, tokens: string[], weight: number) {
  const field = normalizePublicTrainingSearchText(value);
  if (!field) return 0;
  let score = field.includes(query) ? weight * 4 : 0;
  if (field.startsWith(query)) score += weight * 2;
  for (const token of tokens) {
    if (field.includes(token)) score += weight;
    if (field.split(" ").some((word) => word.startsWith(token))) score += weight / 2;
  }
  return score;
}

/** Recherche seulement les formations publiques disponibles, sans appel réseau ni donnée apprenant. */
export function searchPublicCatalogueTrainings(trainings: PublicCatalogueTraining[], rawQuery: string, limit = 12): PublicTrainingSearchResult[] {
  const query = normalizePublicTrainingSearchText(rawQuery);
  const tokens = Array.from(new Set(query.split(" ").filter((token) => token.length >= 2)));
  if (!tokens.length) return [];

  return trainings
    .map((training) => {
      const courseText = training.courses.flatMap((course) => [course.title, course.description, ...course.skills, ...course.tags]).join(" ");
      const context = [training.description, training.level, training.format, ...training.roles, ...training.skills, courseText].join(" ");
      const haystack = normalizePublicTrainingSearchText(`${training.title} ${context}`);
      if (!tokens.every((token) => haystack.includes(token))) return null;
      const score = scoreField(training.title, query, tokens, 12) + scoreField(context, query, tokens, 4);
      return { ...training, score };
    })
    .filter((training): training is PublicTrainingSearchResult => training !== null)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, limit);
}
