import type { PublicTrainingLocale } from "./publicTrainingLocale";

export type PublicTrainingDomainNavigationItem = {
  slug: string;
  label: Record<PublicTrainingLocale, string>;
};

/**
 * Lightweight navigation data shared by the client header and server-rendered
 * catalogue pages. It deliberately contains no catalogue metrics so it can be
 * used in the public chrome without loading the full training index.
 */
export const PUBLIC_TRAINING_DOMAIN_NAVIGATION: readonly PublicTrainingDomainNavigationItem[] = [
  {
    slug: "comptabilite-finance",
    label: { fr: "Comptabilité & Finance", en: "Accounting & Finance", ar: "المحاسبة والمالية" },
  },
  {
    slug: "informatique-developpement",
    label: { fr: "Informatique & Développement", en: "IT & Development", ar: "تقنية المعلومات والتطوير" },
  },
  {
    slug: "data-bi-recherche",
    label: { fr: "Data, BI & Recherche", en: "Data, BI & Research", ar: "البيانات وذكاء الأعمال والبحث" },
  },
  {
    slug: "administratif-ressources-humaines",
    label: { fr: "Administratif & RH", en: "Administration & HR", ar: "الإدارة والموارد البشرية" },
  },
  {
    slug: "commerce-marketing-relation-client",
    label: { fr: "Commerce, Marketing & Client", en: "Sales, Marketing & Customer", ar: "المبيعات والتسويق والعملاء" },
  },
  {
    slug: "juridique-conformite",
    label: { fr: "Juridique & Conformité", en: "Legal & Compliance", ar: "القانون والامتثال" },
  },
  {
    slug: "strategie-transformation-ia",
    label: { fr: "Stratégie & Transformation", en: "Strategy & Transformation", ar: "الاستراتيجية والتحول" },
  },
] as const;
