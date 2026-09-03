import trainingIndex from "../client/src/data/trainingIndex.json";
import { getCourseCatalogMetrics } from "../client/src/lib/catalogMetrics";
import { extractTargetJobRoles, resolveTrainingFormat } from "../client/src/lib/trainingCatalogTaxonomy";
import { localizePublicTrainingText, type PublicTrainingLocale } from "./publicTrainingLocale";

export type LocalizedText = { fr: string; en: string; ar?: string };

type CatalogCourse = {
  id: string;
  certId: string;
  title?: LocalizedText;
  description?: LocalizedText;
  level?: LocalizedText;
  targetJob?: string;
  acquiredSkills?: string[];
  tags?: string[];
  subCategoryId?: string;
};

type CatalogCertification = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  level?: LocalizedText;
  icon?: string;
  group?: string;
  trainingFormat?: string;
  isStandaloneTP?: boolean;
};

type ThemeDefinition = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  introduction: string;
  groupIds?: string[];
  subcategoryIds?: string[];
  accent: "blue" | "violet" | "emerald" | "amber" | "rose";
};

export type PublicTrainingMetrics = {
  certificationCount: number;
  courseCount: number;
  lessonCount: number;
  chapterCount: number;
  activityCount: number;
  exerciseCount: number;
  videoCount: number;
  downloadCount: number;
};

export type PublicTrainingCard = {
  id: string;
  title: string;
  description: string;
  level: string;
  icon: string;
  trainingFormat: string;
  metrics: PublicTrainingMetrics;
};

export type PublicTrainingTheme = Omit<ThemeDefinition, "title" | "shortTitle" | "description" | "introduction"> & {
  title: string;
  shortTitle: string;
  description: string;
  introduction: string;
  metrics: PublicTrainingMetrics;
  roles: string[];
  skills: string[];
  certifications: PublicTrainingCard[];
};

const catalog = trainingIndex as unknown as { certifications: CatalogCertification[]; courses: CatalogCourse[] };

const themeDefinitions: ThemeDefinition[] = [
  { slug: "ia-au-travail-productivite", title: "Formations IA gratuites pour le travail et la productivité", shortTitle: "IA au travail & productivité", description: "Découvrez des formations IA gratuites dédiées aux fondamentaux, aux usages professionnels, à la stratégie et à la productivité.", introduction: "Développez des repères pratiques pour utiliser l’IA de façon utile, responsable et adaptée aux activités quotidiennes de votre métier.", groupIds: ["business_ai_literacy", "workplace_ai_productivity"], accent: "blue" },
  { slug: "ingenierie-ia-rag-mlops", title: "Formations IA gratuites en ingénierie, RAG et MLOps", shortTitle: "Ingénierie IA, RAG & MLOps", description: "Explorez les formations IA gratuites consacrées aux applications, aux systèmes RAG, aux agents et à l’exploitation de l’IA.", introduction: "Cette sélection s’adresse aux profils qui conçoivent, intègrent, évaluent ou exploitent des systèmes d’intelligence artificielle.", groupIds: ["fullstack_ai_engineering", "generative_ai_api_development", "claude_ai_agents"], accent: "violet" },
  { slug: "data-bi-analytique", title: "Formations IA gratuites en data, BI et analytique", shortTitle: "Data, BI & analytique", description: "Accédez aux formations IA gratuites pour l’analyse de données, le reporting, la BI et les décisions assistées par IA.", introduction: "Structurez les données, interprétez les résultats et préparez des livrables de pilotage adaptés aux besoins de votre organisation.", groupIds: ["bi_data_analytics"], subcategoryIds: ["data_bi_research"], accent: "emerald" },
  { slug: "ventes-crm-prospection", title: "Formations IA gratuites pour les ventes, le CRM et la prospection", shortTitle: "Ventes, CRM & prospection", description: "Découvrez des travaux pratiques IA gratuits pour la prospection, le CRM et les opérations commerciales.", introduction: "Explorez des cas de mise en œuvre guidés pour structurer les actions commerciales, enrichir les informations et soutenir le suivi client.", subcategoryIds: ["sales_crm_prospecting"], accent: "amber" },
  { slug: "marketing-contenu", title: "Formations IA gratuites pour le marketing et le contenu", shortTitle: "Marketing & contenu", description: "Parcourez des formations IA gratuites pour la création de contenu, l’acquisition et les opérations marketing.", introduction: "Mettez l’IA au service de la préparation, de l’organisation et de l’amélioration des activités marketing, avec des exercices par métier.", subcategoryIds: ["marketing_content"], accent: "rose" },
  { slug: "support-client-ecommerce", title: "Formations IA gratuites pour le support client et l’e-commerce", shortTitle: "Support client & e-commerce", description: "Découvrez des formations IA gratuites pour les équipes support, les opérations client et l’e-commerce.", introduction: "Travaillez des scénarios orientés expérience client, traitement d’information, support et opérations commerciales en ligne.", subcategoryIds: ["support_ecommerce"], accent: "blue" },
  { slug: "finance-comptabilite-controle-gestion", title: "Formations IA gratuites pour la finance, la comptabilité et le contrôle de gestion", shortTitle: "Finance, comptabilité & contrôle", description: "Consultez les formations IA gratuites dédiées à la comptabilité, la facturation, au contrôle de gestion et aux opérations financières.", introduction: "Découvrez des parcours et exercices pour organiser, vérifier et analyser des informations financières dans des cadres de travail professionnels.", groupIds: ["finance_accounting"], subcategoryIds: ["finance_accounting_control"], accent: "emerald" },
  { slug: "ressources-humaines-recrutement", title: "Formations IA gratuites pour les ressources humaines et le recrutement", shortTitle: "RH & recrutement", description: "Découvrez des formations IA gratuites pour le recrutement, les opérations RH et la gestion des talents.", introduction: "Explorez des exercices guidés dédiés à la structuration des activités RH, au recrutement et au suivi des opérations talent.", subcategoryIds: ["hr_recruitment"], accent: "violet" },
  { slug: "productivite-secretariat-operations", title: "Formations IA gratuites pour la productivité, le secrétariat et les opérations", shortTitle: "Productivité & opérations", description: "Accédez à des formations IA gratuites pour l’administration, la documentation, le secrétariat et les opérations.", introduction: "Mettez en pratique des méthodes pour fluidifier les tâches administratives, documentaires et de coordination.", subcategoryIds: ["productivity_operations"], accent: "amber" },
  { slug: "juridique-contrats-conformite", title: "Formations IA gratuites pour le juridique, les contrats et la conformité", shortTitle: "Juridique & conformité", description: "Découvrez des formations IA gratuites consacrées aux contrats, à la conformité et aux opérations juridiques.", introduction: "Explorez des travaux pratiques pour organiser les informations, structurer les contrôles et soutenir les opérations juridiques.", subcategoryIds: ["legal_contracts_compliance"], accent: "rose" },
];

const emptyMetrics = (): PublicTrainingMetrics => ({ certificationCount: 0, courseCount: 0, lessonCount: 0, chapterCount: 0, activityCount: 0, exerciseCount: 0, videoCount: 0, downloadCount: 0 });

function courseMatchesTheme(course: CatalogCourse, certification: CatalogCertification | undefined, definition: ThemeDefinition) {
  return Boolean((certification?.group && definition.groupIds?.includes(certification.group)) || (course.subCategoryId && definition.subcategoryIds?.includes(course.subCategoryId)));
}

function summarizeCourses(courses: CatalogCourse[], certificationCount: number): PublicTrainingMetrics {
  return courses.reduce((metrics, course) => {
    const courseMetrics = getCourseCatalogMetrics(course);
    metrics.courseCount += 1;
    metrics.lessonCount += courseMetrics.lessonCount;
    metrics.chapterCount += courseMetrics.chapterCount;
    metrics.activityCount += courseMetrics.totalActivities;
    metrics.exerciseCount += courseMetrics.exerciseCount;
    metrics.videoCount += courseMetrics.videoCount;
    metrics.downloadCount += courseMetrics.downloadCount;
    return metrics;
  }, { ...emptyMetrics(), certificationCount });
}

function formatLabel(certification: CatalogCertification, locale: PublicTrainingLocale) {
  const format = resolveTrainingFormat(certification);
  const labels = {
    fr: { certification_preparation: "Préparation aux certifications", tutorial_tp: "Tutoriel / TP", training: "Formation" },
    en: { certification_preparation: "Certification preparation", tutorial_tp: "Tutorial / practical work", training: "Training" },
    ar: { certification_preparation: "التحضير للشهادات", tutorial_tp: "دليل تعليمي / عمل تطبيقي", training: "تدريب" },
  } as const;
  if (format === "certification_preparation") return labels[locale].certification_preparation;
  if (format === "tutorial_tp") return labels[locale].tutorial_tp;
  return labels[locale].training;
}

function createTheme(definition: ThemeDefinition, locale: PublicTrainingLocale): PublicTrainingTheme {
  const certificationById = new Map(catalog.certifications.map((certification) => [certification.id, certification]));
  const courses = catalog.courses.filter((course) => courseMatchesTheme(course, certificationById.get(course.certId), definition));
  const certificationIds = new Set(courses.map((course) => course.certId));
  const certifications = catalog.certifications
    .filter((certification) => certificationIds.has(certification.id))
    .map((certification) => {
      const certificationCourses = courses.filter((course) => course.certId === certification.id);
      return {
        id: certification.id,
        title: localizePublicTrainingText(certification.title, locale, "AI training"),
        description: localizePublicTrainingText(certification.description, locale, ""),
        level: localizePublicTrainingText(certification.level, locale, ""),
        icon: certification.icon || "◈",
        trainingFormat: formatLabel(certification, locale),
        metrics: summarizeCourses(certificationCourses, 1),
      };
    });
  const skills = Array.from(new Set(courses.flatMap((course) => [
    ...(course.acquiredSkills || []),
    ...(course.tags || []).filter((tag) => !/^(débutant|intermédiaire|avancé)$/i.test(tag)),
  ]).map((skill) => localizePublicTrainingText(skill.trim(), locale, skill.trim())).filter(Boolean))).sort((left, right) => left.localeCompare(right, locale));
  const roles = extractTargetJobRoles(courses).map((role) => localizePublicTrainingText(role, locale, role)).sort((left, right) => left.localeCompare(right, locale));

  return {
    ...definition,
    title: localizePublicTrainingText(definition.title, locale, definition.title),
    shortTitle: localizePublicTrainingText(definition.shortTitle, locale, definition.shortTitle),
    description: localizePublicTrainingText(definition.description, locale, definition.description),
    introduction: localizePublicTrainingText(definition.introduction, locale, definition.introduction),
    metrics: summarizeCourses(courses, certifications.length),
    roles,
    skills,
    certifications,
  };
}

export function getPublicTrainingThemes(locale: PublicTrainingLocale = "fr") {
  return themeDefinitions.map((definition) => createTheme(definition, locale)).filter((theme) => theme.metrics.courseCount > 0);
}

export function getPublicTrainingTheme(slug: string, locale: PublicTrainingLocale = "fr") {
  return getPublicTrainingThemes(locale).find((theme) => theme.slug === slug) || null;
}

export function getPublicTrainingCatalogMetrics() {
  return summarizeCourses(catalog.courses, catalog.certifications.length);
}

export function getPublicTrainingCatalogRevision() {
  return (trainingIndex as { catalogRevision?: string }).catalogRevision || "catalogue-actuel";
}
