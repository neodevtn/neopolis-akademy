import {
  CAREER_FAMILY_DEFINITIONS,
  inferCareerFamilyIds,
  normalizeCareerText,
  type CareerFamilyId,
} from "@shared/careerPathways";

export { CAREER_FAMILY_DEFINITIONS } from "@shared/careerPathways";

export type LocalizedLabel = { fr: string; en: string };

export type TrainingFormatDefinition = {
  id: string;
  title: LocalizedLabel;
  order: number;
};

type TrainingFormatReference = {
  group?: string;
  trainingFormat?: string;
  isStandaloneTP?: boolean;
};

type TargetJobReference = {
  targetJob?: unknown;
};

const normalize = normalizeCareerText;

/** Tokenizes free text so it can be intersected with all chosen catalogue filters. */
export function normalizeCatalogueSearchTokens(query: string): string[] {
  return normalize(query).split(/\s+/).filter((token) => token.length >= 2);
}

export function matchesCatalogueSearchText(searchText: string, query: string): boolean {
  const tokens = normalizeCatalogueSearchTokens(query);
  const normalizedText = normalize(searchText);
  return tokens.length === 0 || tokens.every((token) => normalizedText.includes(token));
}

export const DEFAULT_TRAINING_FORMATS: TrainingFormatDefinition[] = [
  { id: "certification_preparation", title: { fr: "Préparation aux certifications", en: "Certification preparation" }, order: 1 },
  { id: "formation", title: { fr: "Formation", en: "Course" }, order: 2 },
  { id: "tutorial_tp", title: { fr: "Tutoriel / TP", en: "Tutorial / practical exercise" }, order: 3 },
];

export function getTrainingFormatDefinitions(value: unknown): TrainingFormatDefinition[] {
  if (!Array.isArray(value)) return DEFAULT_TRAINING_FORMATS;
  const formats = value.filter((item): item is TrainingFormatDefinition => Boolean(
    item
      && typeof item === "object"
      && typeof (item as TrainingFormatDefinition).id === "string"
      && typeof (item as TrainingFormatDefinition).title?.fr === "string"
      && typeof (item as TrainingFormatDefinition).title?.en === "string"
      && typeof (item as TrainingFormatDefinition).order === "number",
  ));
  return formats.length ? formats.slice().sort((a, b) => a.order - b.order) : DEFAULT_TRAINING_FORMATS;
}

export function resolveTrainingFormat(certification: TrainingFormatReference): string {
  if (certification.trainingFormat) return certification.trainingFormat;
  if (certification.isStandaloneTP) return "tutorial_tp";
  if (certification.group === "anthropic_certification_preparation") return "certification_preparation";
  return "formation";
}

export function getCareerFamilyTitle(id: CareerFamilyId, locale: "fr" | "en" = "fr") {
  return CAREER_FAMILY_DEFINITIONS.find((definition) => definition.id === id)?.title[locale] || id;
}

/**
 * Collapses raw `targetJob` strings to a stable, de-duplicated set of broad
 * career families. The raw value remains in the source catalogue; this helper
 * is only for learner-facing discovery and public SEO pages.
 */
export function extractTargetJobRoles(courses: TargetJobReference[]): string[] {
  const families = new Set<CareerFamilyId>();
  for (const course of courses) {
    if (typeof course.targetJob !== "string") continue;
    for (const id of inferCareerFamilyIds(course.targetJob)) families.add(id);
  }
  return CAREER_FAMILY_DEFINITIONS
    .filter((definition) => families.has(definition.id))
    .map((definition) => definition.title.fr);
}

/** Maps compact public family labels back to stable ids for application filters. */
export function getCareerFamilyIds(courses: TargetJobReference[]): CareerFamilyId[] {
  const labels = new Set(extractTargetJobRoles(courses));
  return CAREER_FAMILY_DEFINITIONS.filter((definition) => labels.has(definition.title.fr)).map((definition) => definition.id);
}

export function getCertificationCareerFamilyIds(input: {
  certificationId: string;
  searchText: string;
  courses: TargetJobReference[];
}): CareerFamilyId[] {
  const ids = new Set<CareerFamilyId>(getCareerFamilyIds(input.courses));
  for (const id of inferCareerFamilyIds(input.searchText)) ids.add(id);
  for (const family of CAREER_FAMILY_DEFINITIONS) {
    if (family.foundationCertificationIds.includes(input.certificationId) || family.recommendedCertificationIds.includes(input.certificationId)) ids.add(family.id);
  }
  return CAREER_FAMILY_DEFINITIONS.filter((family) => ids.has(family.id)).map((family) => family.id);
}
