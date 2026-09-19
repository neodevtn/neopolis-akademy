import { createHash } from "node:crypto";
import { goldenJobs, getGoldenJobText } from "./goldenJobs";
import { getPublicCatalogueTrainings } from "./publicTrainingCatalog";
import {
  publicGoldenJobsPath,
  publicTrainingCataloguePath,
  publicTrainingPath,
  type PublicTrainingLocale,
} from "./publicTrainingLocale";
import { getPublicTrainingCatalogMetrics, getPublicTrainingThemes } from "./publicTrainingThemes";

export const AGENTIC_DISCOVERY_ORIGIN = "https://akademy.neodev.click";
export const AGENTIC_DISCOVERY_UPDATED_AT = "2026-09-19";
export const INDEXNOW_KEY = "0c74880479c29ce5486d1407718052659628ecfeb597909a185141b10b35c2f7";
export const INDEXNOW_KEY_PATH = `/${INDEXNOW_KEY}.txt`;

const absolute = (pathname: string) => `${AGENTIC_DISCOVERY_ORIGIN}${pathname === "/" ? "/" : pathname}`;
const inline = (value: string) => value.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
const localeLabels: Record<PublicTrainingLocale, string> = { fr: "Français", en: "English", ar: "العربية" };

export function renderRobotsTxt() {
  return [
    "# Public search and AI crawling is permitted. Only private application paths are excluded.",
    "User-agent: *",
    "Allow: /",
    "Allow: /api/assets/",
    "Disallow: /admin/",
    "Disallow: /api/",
    "Disallow: /training",
    "Disallow: /mock-exam/",
    "Disallow: /account",
    "Disallow: /settings",
    "Disallow: /login",
    "Disallow: /demo-login",
    "Disallow: /accept-invitation",
    "Disallow: /forgot-password",
    "Disallow: /reset-password",
    "Disallow: /apply",
    "Disallow: /diagnostic",
    "Disallow: /diagnostic-avance",
    "",
    `Sitemap: ${absolute("/sitemap-index.xml")}`,
    `Host: ${new URL(AGENTIC_DISCOVERY_ORIGIN).host}`,
    "",
  ].join("\n");
}

function languageOverview(locale: PublicTrainingLocale) {
  const metrics = getPublicTrainingCatalogMetrics();
  return [
    `## ${localeLabels[locale]}`,
    "",
    `- [Training by professional domain](${absolute(publicTrainingPath(locale))}): ${metrics.certificationCount} programmes, ${metrics.courseCount} courses and ${metrics.activityCount} learning activities.`,
    `- [Public training catalogue](${absolute(publicTrainingCataloguePath(locale))}): canonical public pages for every training programme and course.`,
    `- [Golden Jobs](${absolute(publicGoldenJobsPath(locale))}): AI career profiles linked to relevant learning paths.`,
    ...getPublicTrainingThemes(locale).map((theme) => `- [${inline(theme.shortTitle)}](${absolute(publicTrainingPath(locale, theme.slug))}): ${inline(theme.description)}`),
  ].join("\n");
}

export function renderLlmsTxt() {
  return [
    "# Neopolis Akademy",
    "",
    "> Multilingual practical AI training, professional use cases, career pathways and certification preparation for Tunisia, Africa and the MENA region. Public information is available in French, English and Arabic; learner progress, assessments, answers and administration remain private.",
    "",
    "## Canonical public resources",
    "",
    `- [Home](${absolute("/")}): programme overview and public FAQ.`,
    `- [AI News](${absolute("/ai-news")}): curated links to public AI news sources.`,
    `- [AI News RSS](${absolute("/ai-news/rss.xml")}): machine-readable feed of the latest curated source links.`,
    `- [Sitemap index](${absolute("/sitemap-index.xml")}): exhaustive public canonical URL inventory.`,
    `- [Machine-readable catalogue](${absolute("/ai-index.json")}): structured JSON summary of public programmes, courses, topics and career pathways.`,
    `- [Extended LLM context](${absolute("/llms-full.txt")}): detailed public catalogue in Markdown.`,
    "",
    ...(["fr", "en", "ar"] as const).map(languageOverview),
    "",
    "## Usage and boundaries",
    "",
    "- Public pages may be crawled and cited with their canonical URLs.",
    "- Training facts and links are generated from the published catalogue.",
    "- Do not infer access to private lessons, learner progress, assessment answers, corrections, credentials or personal data.",
    "- Career and salary references are learning guidance, not employment or compensation promises.",
    "- Prefer the same-language canonical page when answering in French, English or Arabic.",
    "",
  ].join("\n");
}

function renderTrainingDetails(locale: PublicTrainingLocale) {
  return getPublicCatalogueTrainings(locale).map((training) => {
    const courses = training.courses.map((course) => `  - [${inline(course.title)}](${absolute(publicTrainingCataloguePath(locale, training.slug, course.slug))}): ${course.metrics.totalActivities} activities; ${course.metrics.exerciseCount} exercises; ${course.metrics.videoCount} videos.`).join("\n");
    return [
      `### [${inline(training.title)}](${absolute(publicTrainingCataloguePath(locale, training.slug))})`,
      "",
      inline(training.description),
      "",
      `- Format: ${inline(training.format)}`,
      `- Level: ${inline(training.level || "Not specified")}`,
      `- Catalogue: ${training.metrics.courseCount} courses; ${training.metrics.totalActivities} activities; ${training.metrics.exerciseCount} exercises; ${training.metrics.videoCount} videos.`,
      training.roles.length ? `- Roles: ${training.roles.map(inline).join("; ")}` : "",
      training.skills.length ? `- Skills: ${training.skills.map(inline).join("; ")}` : "",
      courses ? `- Courses:\n${courses}` : "",
    ].filter(Boolean).join("\n");
  }).join("\n\n");
}

export function renderLlmsFullTxt() {
  const metrics = getPublicTrainingCatalogMetrics();
  return [
    "# Neopolis Akademy — Full public catalogue context",
    "",
    "> Public, canonical context for search engines and AI assistants. Authenticated course payloads, learner records, assessment keys, corrections, credentials and administration are intentionally excluded.",
    "",
    "## Platform facts",
    "",
    `- Canonical origin: ${AGENTIC_DISCOVERY_ORIGIN}`,
    `- Public catalogue updated: ${AGENTIC_DISCOVERY_UPDATED_AT}`,
    `- Published scope: ${metrics.certificationCount} training programmes, ${metrics.courseCount} courses, ${metrics.lessonCount} lessons and ${metrics.activityCount} learning activities.`,
    "- Languages: French, English and Arabic.",
    "- Public catalogue pages describe the offer; learning progress and assessments require authentication.",
    "",
    "## Career pathways",
    "",
    ...goldenJobs.map((job) => `- [${inline(getGoldenJobText(job.title, "fr"))}](${absolute(publicGoldenJobsPath("fr", job.slug))}): ${inline(getGoldenJobText(job.summary, "fr"))} Skills: ${job.skills.map((skill) => inline(getGoldenJobText(skill, "fr"))).join("; ")}.`),
    "",
    ...(["fr", "en", "ar"] as const).flatMap((locale) => [
      `## Public training catalogue — ${localeLabels[locale]}`,
      "",
      renderTrainingDetails(locale),
      "",
    ]),
    "## Citation guidance",
    "",
    "Use canonical public catalogue URLs rather than authenticated /training routes. Counts may change when the catalogue is updated. Career information is educational guidance rather than a guarantee of employment, admission, certification or salary.",
    "",
  ].join("\n");
}

export function buildAgenticIndex() {
  const programmes = getPublicCatalogueTrainings("fr").map((training) => ({
    id: training.slug,
    name: inline(training.title),
    description: inline(training.description),
    level: inline(training.level),
    format: inline(training.format),
    canonicalUrl: absolute(publicTrainingCataloguePath("fr", training.slug)),
    translations: {
      en: absolute(publicTrainingCataloguePath("en", training.slug)),
      ar: absolute(publicTrainingCataloguePath("ar", training.slug)),
    },
    topics: [...training.skills, ...training.roles].map(inline).filter(Boolean),
    metrics: training.metrics,
    courses: training.courses.map((course) => ({
      id: course.slug,
      name: inline(course.title),
      description: inline(course.description),
      canonicalUrl: absolute(publicTrainingCataloguePath("fr", training.slug, course.slug)),
      translations: {
        en: absolute(publicTrainingCataloguePath("en", training.slug, course.slug)),
        ar: absolute(publicTrainingCataloguePath("ar", training.slug, course.slug)),
      },
      topics: [...course.skills, ...course.tags].map(inline).filter(Boolean),
      metrics: course.metrics,
    })),
  }));
  return {
    schemaVersion: "1.0",
    name: "Neopolis Akademy public AI training catalogue",
    canonicalOrigin: AGENTIC_DISCOVERY_ORIGIN,
    dateModified: AGENTIC_DISCOVERY_UPDATED_AT,
    languages: (["fr", "en", "ar"] as const).map((locale) => ({
      code: locale,
      label: localeLabels[locale],
      trainingIndex: absolute(publicTrainingPath(locale)),
      catalogue: absolute(publicTrainingCataloguePath(locale)),
      goldenJobs: absolute(publicGoldenJobsPath(locale)),
    })),
    discovery: {
      sitemap: absolute("/sitemap-index.xml"),
      llms: absolute("/llms.txt"),
      llmsFull: absolute("/llms-full.txt"),
      self: absolute("/ai-index.json"),
    },
    accessPolicy: {
      public: "Only canonical public pages listed in the sitemap and this index.",
      private: "Authenticated learning, progress, assessments, corrections, learner data, APIs and administration are excluded.",
      aiCrawlers: "Public crawling is permitted; no GPTBot, ClaudeBot or other AI crawler is blocked by name.",
    },
    metrics: getPublicTrainingCatalogMetrics(),
    careerPathways: goldenJobs.map((job) => ({
      id: job.slug,
      name: getGoldenJobText(job.title, "fr"),
      canonicalUrl: absolute(publicGoldenJobsPath("fr", job.slug)),
      skills: job.skills.map((skill) => getGoldenJobText(skill, "fr")),
      recommendedProgrammeIds: job.recommendedCertificationIds,
    })),
    programmes,
  };
}

export function renderAgenticIndexJson() {
  return `${JSON.stringify(buildAgenticIndex(), null, 2)}\n`;
}

export function getAgenticPublicUrls() {
  const index = buildAgenticIndex();
  return Array.from(new Set([
    absolute("/"),
    absolute("/en"),
    absolute("/ar"),
    absolute("/ai-news"),
    absolute("/refer"),
    absolute("/mentions-legales"),
    ...index.languages.flatMap((language) => [language.trainingIndex, language.catalogue, language.goldenJobs]),
    ...(["fr", "en", "ar"] as const).flatMap((locale) => getPublicTrainingThemes(locale).map((theme) => absolute(publicTrainingPath(locale, theme.slug)))),
    ...index.programmes.flatMap((programme) => [
      programme.canonicalUrl,
      programme.translations.en,
      programme.translations.ar,
      ...programme.courses.flatMap((course) => [course.canonicalUrl, course.translations.en, course.translations.ar]),
    ]),
    ...(["fr", "en", "ar"] as const).flatMap((locale) => goldenJobs.map((job) => absolute(publicGoldenJobsPath(locale, job.slug)))),
  ]));
}

export function renderIndexNowKey() {
  return `${INDEXNOW_KEY}\n`;
}

export function getIndexNowPayload(urlList = getAgenticPublicUrls()) {
  return {
    host: new URL(AGENTIC_DISCOVERY_ORIGIN).host,
    key: INDEXNOW_KEY,
    keyLocation: absolute(INDEXNOW_KEY_PATH),
    urlList: Array.from(new Set(urlList)).filter((url) => url.startsWith(`${AGENTIC_DISCOVERY_ORIGIN}/`)),
  };
}

/** Stable fingerprint of the public catalogue and every canonical URL submitted to IndexNow. */
export function getIndexNowContentRevision() {
  return createHash("sha256")
    .update(renderAgenticIndexJson())
    .update("\n")
    .update(getAgenticPublicUrls().sort().join("\n"))
    .digest("hex");
}

export function renderIndexNowManifest() {
  return `${JSON.stringify({
    schemaVersion: "1.0",
    revision: getIndexNowContentRevision(),
    dateModified: AGENTIC_DISCOVERY_UPDATED_AT,
    urlCount: getAgenticPublicUrls().length,
    keyLocation: absolute(INDEXNOW_KEY_PATH),
  }, null, 2)}\n`;
}

export function getAgenticDiscoverySummary() {
  const index = buildAgenticIndex();
  return {
    programmes: index.programmes.length,
    courses: index.programmes.reduce((count, programme) => count + programme.courses.length, 0),
    careers: index.careerPathways.length,
    languages: index.languages.length,
  };
}

export function findForbiddenAgenticContent() {
  const serialized = renderAgenticIndexJson();
  const forbidden = [
    { label: "private training route", pattern: /https:\/\/akademy\.neodev\.click\/training(?:\/|\")/i },
    { label: "admin route", pattern: /https:\/\/akademy\.neodev\.click\/admin(?:\/|\")/i },
    { label: "private API route", pattern: /https:\/\/akademy\.neodev\.click\/api\//i },
    { label: "password assignment", pattern: /password\s*[:=]/i },
    { label: "API key assignment", pattern: /api[_ -]?key\s*[:=]/i },
    { label: "bearer credential", pattern: /bearer\s+[a-z0-9._-]{12,}/i },
    { label: "authentication token", pattern: /(?:access|refresh|auth)[_ -]?token\s*[:=]/i },
    { label: "webhook secret", pattern: /whsec_[a-z0-9+/=_-]+/i },
    { label: "private answer key", pattern: /answer[_ -]?key\s*[:=]/i },
    { label: "signed asset URL", pattern: /[?&](?:x-amz-signature|signature|token)=[^&"\s]+/i },
  ];
  return forbidden.filter(({ pattern }) => pattern.test(serialized)).map(({ label }) => label);
}

export function getAgenticSearchTarget() {
  return absolute("/formations-ia/catalogue?q={search_term_string}");
}

export function getAgenticDiscoveryDocuments() {
  return [
    { path: "/robots.txt", body: renderRobotsTxt(), contentType: "text/plain; charset=utf-8" },
    { path: "/llms.txt", body: renderLlmsTxt(), contentType: "text/plain; charset=utf-8" },
    { path: "/llms-full.txt", body: renderLlmsFullTxt(), contentType: "text/plain; charset=utf-8" },
    { path: "/ai-index.json", body: renderAgenticIndexJson(), contentType: "application/json; charset=utf-8" },
    { path: "/indexnow-manifest.json", body: renderIndexNowManifest(), contentType: "application/json; charset=utf-8" },
    { path: INDEXNOW_KEY_PATH, body: renderIndexNowKey(), contentType: "text/plain; charset=utf-8" },
  ] as const;
}

export type AgenticIndex = ReturnType<typeof buildAgenticIndex>;
