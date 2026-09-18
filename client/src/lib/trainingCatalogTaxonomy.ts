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

/**
 * Public-facing career families intentionally remain compact. Source course
 * labels can be granular or duplicated; filters and public pages must guide a
 * learner rather than expose an uncurated list of job-title fragments.
 */
export const CAREER_FAMILY_DEFINITIONS = [
  { id: "data_bi", title: { fr: "Data, analyse & BI", en: "Data, analytics & BI" } },
  { id: "ai_engineering", title: { fr: "Ingénierie IA & automatisation", en: "AI engineering & automation" } },
  { id: "ai_product_governance", title: { fr: "Produit, stratégie & gouvernance IA", en: "AI product, strategy & governance" } },
  { id: "business_customer", title: { fr: "Commerce, marketing & relation client", en: "Sales, marketing & customer experience" } },
  { id: "finance", title: { fr: "Finance & contrôle", en: "Finance & control" } },
  { id: "hr_operations", title: { fr: "RH & opérations", en: "HR & operations" } },
  { id: "legal_compliance", title: { fr: "Juridique & conformité", en: "Legal & compliance" } },
] as const;

export type CareerFamilyId = (typeof CAREER_FAMILY_DEFINITIONS)[number]["id"];

const normalize = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("fr");

/** Tokenizes free text so it can be intersected with all chosen catalogue filters. */
export function normalizeCatalogueSearchTokens(query: string): string[] {
  return normalize(query).split(/\s+/).filter((token) => token.length >= 2);
}

export function matchesCatalogueSearchText(searchText: string, query: string): boolean {
  const tokens = normalizeCatalogueSearchTokens(query);
  const normalizedText = normalize(searchText);
  return tokens.length === 0 || tokens.every((token) => normalizedText.includes(token));
}

const familyMatchers: Array<{ id: CareerFamilyId; pattern: RegExp }> = [
  { id: "data_bi", pattern: /\b(data|analyst|analytics|analyse|bi\b|business intelligence|reporting|database|sql|scientist)\b/i },
  { id: "ai_engineering", pattern: /\b(engineer|ingenieur|develop|developer|software|architect|cloud|devops|mlops|llmops|api|code|program|automation|agent|rag)\b/i },
  { id: "ai_product_governance", pattern: /\b(product|produit|project|projet|manager|management|consult|strategy|strategie|govern|responsible|ethique|transformation|direction)\b/i },
  { id: "business_customer", pattern: /\b(sales|vente|commercial|marketing|crm|customer|client|support|ecommerce|prospection)\b/i },
  { id: "finance", pattern: /\b(finance|financial|financier|account|comptab|audit|controle|budget|finops)\b/i },
  { id: "hr_operations", pattern: /\b(human resource|ressource humaine|rh\b|recruit|recrut|talent|administrat|operation|secretariat)\b/i },
  { id: "legal_compliance", pattern: /\b(legal|juridi|contract|contrat|compliance|conformite|regulat)\b/i },
];

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
    const source = normalize(course.targetJob);
    for (const { id, pattern } of familyMatchers) {
      if (pattern.test(source)) families.add(id);
    }
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
