import crypto from "node:crypto";
import trainingIndex from "../client/src/data/trainingIndex.json";
import {
  getPublicCatalogueEditorial,
  getPublicCatalogueEditorialBuiltAt,
} from "@shared/publicCatalogueEditorial";
import {
  getPublicCatalogueTrainings,
  getPublicCatalogueTrainingSlug,
} from "@shared/publicTrainingCatalog";
import { getCoursesForTraining } from "@shared/courseTrainingMembership";
import type { PublicTrainingLocale } from "@shared/publicTrainingLocale";
import { PUBLIC_SOCIAL_ASSETS } from "@shared/publicSocialAssets";

export type CatalogueExchangeLocale = "fr" | "en-US";
export type CatalogueExchangeSnapshot = {
  schema_version: "1.0";
  snapshot_id: string;
  generated_at: string;
  complete: true;
  locale: CatalogueExchangeLocale;
  total_items: number;
  items: Record<string, unknown>[];
};

type Localized = string | { fr?: string; en?: string; ar?: string } | undefined;
const ORIGIN = "https://akademy.neodev.click";
const SOURCE_LOCALE: Record<CatalogueExchangeLocale, PublicTrainingLocale> = { fr: "fr", "en-US": "en" };
const FALLBACK_GENERATED_AT = "2026-10-20T00:00:00.000Z";
const source = trainingIndex as any;
const text = (value: Localized, locale: CatalogueExchangeLocale, fallback = "") => {
  if (typeof value === "string") return value || fallback;
  return value?.[locale === "fr" ? "fr" : "en"] || fallback;
};
const iso = () => getPublicCatalogueEditorialBuiltAt()?.toISOString() || FALLBACK_GENERATED_AT;
const absolute = (value: string) => value.startsWith("https://") ? value : `${ORIGIN}${value.replace(/^\/manus-storage\//, "/api/assets/")}`;
const html = (paragraphs: string[]) => paragraphs.filter(Boolean).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("") || "<p>Contenu public à compléter.</p>";
const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
const level = (value: string): "beginner" | "intermediate" | "advanced" | "all_levels" | "unknown" => {
  const normalized = value.toLowerCase();
  if (/début|beginner|initiat/.test(normalized)) return "beginner";
  if (/interm/.test(normalized)) return "intermediate";
  if (/avancé|advanced|profession/.test(normalized)) return "advanced";
  if (/tous|all/.test(normalized)) return "all_levels";
  return "unknown";
};
const imageFor = (training: any, locale: CatalogueExchangeLocale) => {
  const visual = training.visual;
  return {
    url: absolute(visual.cardPath),
    alt: visual.alt[locale === "fr" ? "fr" : "en"] || training.title,
    width: visual.cardWidth,
    height: visual.cardHeight,
    revision: visual.cardPath,
    rights: "owned" as const,
    rights_reference: "Neopolis Akademy visual registry",
  };
};
const publicUrl = (_locale: CatalogueExchangeLocale, path: string) => `${ORIGIN}${path}`;
const slugFor = (id: string, locale: CatalogueExchangeLocale) => {
  const slug = getPublicCatalogueTrainingSlug(id) || id;
  return locale === "fr" ? slug : slug;
};

function buildItems(locale: CatalogueExchangeLocale) {
  const publicLocale = SOURCE_LOCALE[locale];
  const generatedAt = iso();
  const categories = (source.categories || []).map((category: any, position: number) => ({
    id: category.id,
    translation_group_id: category.id,
    locale,
    entity_type: "category",
    status: "published",
    updated_at: generatedAt,
    title: text(category.title, locale, category.id),
    summary: text(category.subtitle, locale, text(category.title, locale, category.id)),
    body_html: html([text(category.subtitle, locale, "")]),
    source_url: publicUrl(locale, locale === "fr" ? "/formations-ia" : "/ai-training"),
    legacy_urls: [],
    slug: category.id.replace(/_/g, "-"),
    parent_id: null,
    category_ids: [],
    position: category.order ?? position,
    image: {
      url: absolute(PUBLIC_SOCIAL_ASSETS.square.path),
      alt: text(category.title, locale, category.id),
      width: PUBLIC_SOCIAL_ASSETS.square.width,
      height: PUBLIC_SOCIAL_ASSETS.square.height,
      revision: PUBLIC_SOCIAL_ASSETS.square.path,
      rights: "owned" as const,
      rights_reference: "Neopolis Akademy visual registry",
    },
  }));
  const trainings = getPublicCatalogueTrainings(publicLocale);
  const trainingItems = trainings.map((training: any, position: number) => {
    const certification = source.certifications.find((item: any) => getPublicCatalogueTrainingSlug(item.id) === training.slug);
    const outcomes = training.skills.slice(0, 8);
    const item = {
      id: certification?.id || training.slug,
      translation_group_id: certification?.id || training.slug,
      locale,
      entity_type: "training",
      training_kind: certification?.trainingFormat === "certification_preparation" ? "certification_preparation" : certification?.isStandaloneTP ? "lab" : "course",
      status: "published",
      updated_at: generatedAt,
      title: training.title,
      summary: training.description || training.title,
      body_html: html([training.description, ...training.overview]),
      source_url: publicUrl(locale, locale === "fr" ? `/formations-ia/catalogue/${training.slug}` : `/ai-training/catalogue/${training.slug}`),
      legacy_urls: [],
      slug: slugFor(certification?.id || training.slug, locale),
      parent_id: null,
      category_ids: certification?.group ? [certification.group] : [],
      position,
      image: imageFor(training, locale),
      enrollment_url: publicUrl(locale, locale === "fr" ? `/formations-ia/catalogue/${training.slug}` : `/ai-training/catalogue/${training.slug}`),
      practical: {
        audience: training.roles,
        level: level(training.level),
        prerequisites: [],
        prerequisites_status: "unknown",
        outcomes,
        deliverables: [],
        exercises: [],
        duration_minutes: null,
        duration_note: null,
        delivery_modes: ["self_paced"],
        teaching_languages: [],
        pricing: { mode: "unknown", amount: null, currency: null, tax_note: null },
        instructors: [],
      },
      business_use_cases: [],
      review: { reviewer_name: "Neopolis Akademy editorial team", reviewed_at: generatedAt },
    };
    return item;
  });
  const moduleItems = trainings.flatMap((training: any) => {
    const certification = source.certifications.find((item: any) => getPublicCatalogueTrainingSlug(item.id) === training.slug);
    return training.courses.map((course: any, position: number) => {
      const editorial = certification ? getPublicCatalogueEditorial("courses", course.canonicalTrainingId === certification.id ? course.canonicalTrainingId : course.canonicalTrainingId, publicLocale) : null;
      const courseSource = source.courses.find((item: any) => item.id === course.id || item.title?.[publicLocale === "fr" ? "fr" : "en"] === course.title);
      return {
        id: courseSource?.id ? `${courseSource.id}__${certification?.id || training.slug}` : `${certification?.id || training.slug}-${course.slug}`,
        translation_group_id: courseSource?.id || `${certification?.id || training.slug}-${course.slug}`,
        locale,
        entity_type: "module",
        status: "published",
        updated_at: iso(),
        title: course.title,
        summary: course.description || course.title,
        body_html: html([course.description, ...(editorial?.overview || course.overview || [])]),
        source_url: publicUrl(locale, locale === "fr" ? `/formations-ia/catalogue/${training.slug}/${course.slug}` : `/ai-training/catalogue/${training.slug}/${course.slug}`),
        legacy_urls: [],
        slug: course.slug,
        parent_id: certification?.id || training.slug,
        category_ids: [],
        position,
        image: imageFor(training, locale),
      };
    });
  });
  return [...categories, ...trainingItems, ...moduleItems];
}

const cache = new Map<CatalogueExchangeLocale, { snapshot: CatalogueExchangeSnapshot; body: string; etag: string }>();
export function getCatalogueExchangeSnapshot(locale: CatalogueExchangeLocale) {
  const current = cache.get(locale);
  if (current) return current;
  const items = buildItems(locale);
  const generatedAt = iso();
  const fingerprint = crypto.createHash("sha256").update(JSON.stringify(items)).digest("hex");
  const snapshot: CatalogueExchangeSnapshot = {
    schema_version: "1.0",
    snapshot_id: `catalogue-v1-${fingerprint.slice(0, 16)}`,
    generated_at: generatedAt,
    complete: true,
    locale,
    total_items: items.length,
    items,
  };
  const body = JSON.stringify(snapshot);
  const result = { snapshot, body, etag: `"${crypto.createHash("sha256").update(body).digest("hex")}"` };
  cache.set(locale, result);
  return result;
}
export function clearCatalogueExchangeCache() {
  cache.clear();
}
export const CATALOGUE_EXCHANGE_PATHS: Record<CatalogueExchangeLocale, string> = {
  fr: "/api/catalogue/v1/fr.json",
  "en-US": "/api/catalogue/v1/en-US.json",
};
