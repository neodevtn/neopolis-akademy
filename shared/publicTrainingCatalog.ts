import trainingIndex from "../client/src/data/trainingIndex.json";
import { getCertificationCatalogMetrics, getCourseCatalogMetrics } from "../client/src/lib/catalogMetrics";
import { extractTargetJobRoles, resolveTrainingFormat } from "../client/src/lib/trainingCatalogTaxonomy";
import { getPublicTrainingThemes } from "./publicTrainingThemes";
import { localizePublicTrainingText, type PublicTrainingLocale } from "./publicTrainingLocale";

type LocalizedText = { fr?: string; en?: string; ar?: string };
type CatalogCourse = {
  id: string;
  certId: string;
  targetJob?: unknown;
  title?: string | LocalizedText;
  description?: string | LocalizedText;
  level?: string | LocalizedText;
  acquiredSkills?: string[];
  tags?: string[];
  lessonCount?: number;
  chapterCount?: number;
  totalActivities?: number;
  exerciseCount?: number;
  videoCount?: number;
  downloadCount?: number;
};
type CatalogCertification = {
  id: string;
  title: string | LocalizedText;
  description: string | LocalizedText;
  level?: string | LocalizedText;
  icon?: string;
  group?: string;
  trainingFormat?: string;
  isStandaloneTP?: boolean;
};

const source = trainingIndex as unknown as { certifications: CatalogCertification[]; courses: CatalogCourse[] };

const slugify = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "") || "formation-ia";

function uniqueSlugs<T extends { id: string }>(items: T[], label: (item: T) => string) {
  const counts = new Map<string, number>();
  return new Map(items.map((item) => {
    const base = slugify(label(item));
    const ordinal = (counts.get(base) || 0) + 1;
    counts.set(base, ordinal);
    return [item.id, ordinal === 1 ? base : `${base}-${ordinal}`] as const;
  }));
}

const certificationSlugs = uniqueSlugs(source.certifications, (certification) => localizePublicTrainingText(certification.title, "fr", "formation-ia"));
const courseSlugs = uniqueSlugs(source.courses, (course) => `${certificationSlugs.get(course.certId) || "formation-ia"}-${localizePublicTrainingText(course.title, "fr", "cours-ia")}`);
const localizedCatalogueCache = new Map<PublicTrainingLocale, PublicCatalogueTraining[]>();

const localize = (value: string | LocalizedText | undefined, locale: PublicTrainingLocale, fallback = "") => localizePublicTrainingText(value, locale, fallback);

/** Les fiches SEO décrivent le contenu et non son historique d’import. */
function publicDescription(value: string | LocalizedText | undefined, locale: PublicTrainingLocale) {
  return localize(value, locale)
    .replace(/\b(?:un(?:e)?\s+)?cours\s+partenaire(?:\s+(?:de\s+)?formation)?(?:\s+autorisée?)?/gi, "Formation pratique")
    .replace(/\bcours\s+Hugging\s+Face(?:\s+Learn)?\s+autorisée?/gi, "Formation pratique")
    .replace(/\b(?:an?\s+)?authorized\s+partner\s+course\b/gi, "Practical training")
    .replace(/\bcours\s+partenaire\b/gi, "Formation pratique")
    .replace(/\bformation\s+pratique\s+(?:de\s+)?formation\s+autorisée?/gi, "Formation pratique")
    .replace(/\bformation\s+pratique\s+autorisée?/gi, "Formation pratique")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export type PublicCatalogueMetrics = ReturnType<typeof getCertificationCatalogMetrics>;

export type PublicCatalogueCourse = {
  slug: string;
  title: string;
  description: string;
  level: string;
  metrics: ReturnType<typeof getCourseCatalogMetrics>;
  skills: string[];
  tags: string[];
};

export type PublicCatalogueTraining = {
  slug: string;
  title: string;
  description: string;
  level: string;
  icon: string;
  format: string;
  metrics: PublicCatalogueMetrics;
  roles: string[];
  skills: string[];
  relatedDomains: { slug: string; title: string }[];
  courses: PublicCatalogueCourse[];
};

function formatLabel(certification: CatalogCertification, locale: PublicTrainingLocale) {
  const labels = {
    fr: { certification_preparation: "Préparation aux certifications", tutorial_tp: "Tutoriel / TP", training: "Formation" },
    en: { certification_preparation: "Certification preparation", tutorial_tp: "Tutorial / practical work", training: "Training" },
    ar: { certification_preparation: "التحضير للشهادات", tutorial_tp: "دليل تعليمي / عمل تطبيقي", training: "تدريب" },
  } as const;
  const resolved = resolveTrainingFormat(certification);
  const format = resolved === "certification_preparation" || resolved === "tutorial_tp" || resolved === "training"
    ? resolved
    : "training";
  return labels[locale][format];
}

function relatedDomains(certificationId: string, locale: PublicTrainingLocale) {
  return getPublicTrainingThemes(locale)
    .filter((theme) => theme.certifications.some((certification) => certification.id === certificationId))
    .map((theme) => ({ slug: theme.slug, title: theme.shortTitle }));
}

function trainingFromCertification(certification: CatalogCertification, locale: PublicTrainingLocale): PublicCatalogueTraining {
  const certificationCourses = source.courses.filter((course) => course.certId === certification.id);
  const skills = Array.from(new Set(certificationCourses.flatMap((course) => course.acquiredSkills || []).map((skill) => localize(skill, locale)).filter(Boolean))).slice(0, 16);
  const roles = extractTargetJobRoles(certificationCourses).map((role) => localize(role, locale, role)).filter(Boolean).slice(0, 14);
  return {
    slug: certificationSlugs.get(certification.id) || "formation-ia",
    title: localize(certification.title, locale, "Formation IA"),
    description: publicDescription(certification.description, locale),
    level: localize(certification.level, locale),
    icon: certification.icon || "◈",
    format: formatLabel(certification, locale),
    metrics: getCertificationCatalogMetrics(certification.id, certificationCourses),
    roles,
    skills,
    relatedDomains: relatedDomains(certification.id, locale),
    courses: certificationCourses.map((course) => ({
      slug: courseSlugs.get(course.id) || "cours-ia",
      title: localize(course.title, locale, "Cours IA"),
      description: publicDescription(course.description, locale),
      level: localize(course.level, locale),
      metrics: getCourseCatalogMetrics(course),
      skills: (course.acquiredSkills || []).map((skill) => localize(skill, locale, skill)).filter(Boolean).slice(0, 10),
      tags: (course.tags || []).map((tag) => localize(tag, locale, tag)).filter(Boolean).slice(0, 10),
    })),
  };
}

export function getPublicCatalogueTrainings(locale: PublicTrainingLocale = "fr") {
  const cached = localizedCatalogueCache.get(locale);
  if (cached) return cached;
  const trainings = source.certifications.map((certification) => trainingFromCertification(certification, locale));
  localizedCatalogueCache.set(locale, trainings);
  return trainings;
}

export function getPublicCatalogueTraining(trainingSlug: string, locale: PublicTrainingLocale = "fr") {
  return getPublicCatalogueTrainings(locale).find((training) => training.slug === trainingSlug) || null;
}

export function getPublicCatalogueTrainingSlug(certificationId: string) {
  return certificationSlugs.get(certificationId) || null;
}

export function getPublicCatalogueCourse(trainingSlug: string, courseSlug: string, locale: PublicTrainingLocale = "fr") {
  const training = getPublicCatalogueTraining(trainingSlug, locale);
  if (!training) return null;
  const course = training.courses.find((item) => item.slug === courseSlug);
  return course ? { training, course } : null;
}

export function getPublicCatalogueSitemapEntries() {
  return source.certifications.flatMap((certification) => {
    const trainingSlug = certificationSlugs.get(certification.id) || "formation-ia";
    return [{ trainingSlug }, ...source.courses.filter((course) => course.certId === certification.id).map((course) => ({ trainingSlug, courseSlug: courseSlugs.get(course.id) || "cours-ia" }))];
  });
}
