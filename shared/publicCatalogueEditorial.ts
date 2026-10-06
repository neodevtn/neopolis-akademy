import editorialData from "./publicCatalogueEditorial.generated.json";
import type { PublicTrainingLocale } from "./publicTrainingLocale";

export type PublicCatalogueEditorialEntry = { summary: string; overview: string[] };
export type PublicCatalogueEditorialKind = "programmes" | "courses";

const editorial = editorialData as {
  generatedAt?: string;
  programmes: Record<string, Partial<Record<PublicTrainingLocale, PublicCatalogueEditorialEntry>>>;
  courses: Record<string, Partial<Record<PublicTrainingLocale, PublicCatalogueEditorialEntry>>>;
};

export function getPublicCatalogueEditorial(kind: PublicCatalogueEditorialKind, id: string, locale: PublicTrainingLocale) {
  // Aucun contenu arabe n'est fabriqué depuis le français ou l'anglais : les
  // catalogues localisés restent la source de vérité dans cette langue.
  return editorial[kind][id]?.[locale] ?? null;
}

export function getPublicCatalogueEditorialBuiltAt() {
  const builtAt = editorial.generatedAt;
  return builtAt && Number.isFinite(Date.parse(builtAt)) ? new Date(builtAt) : null;
}
