import fs from "node:fs";
import path from "node:path";
import { PUBLIC_SOCIAL_ASSETS } from "@shared/publicSocialAssets";

export const CANONICAL_ORIGIN = "https://akademy.neodev.click";
export const SITE_NAME = "Neopolis Akademy";
export const SHARE_IMAGE_URL = `${CANONICAL_ORIGIN}${PUBLIC_SOCIAL_ASSETS.openGraph.path}`;
export const X_SHARE_IMAGE_URL = `${CANONICAL_ORIGIN}${PUBLIC_SOCIAL_ASSETS.x.path}`;
export const SHARE_IMAGE_ALT = "Neopolis Akademy — Formation certifiante en intelligence artificielle";
export const ORGANIZATION_SOCIAL_PROFILES = [
  "https://fr-fr.facebook.com/neopolisdev/",
  "https://fr.linkedin.com/company/neopolis-development",
] as const;

type SeoPage = {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  openGraphPath?: string;
  locale?: "fr" | "en" | "ar";
  noindex?: boolean;
};

const DEFAULT_PAGE: SeoPage = {
  title: "Formations IA gratuites par métier | Neopolis Akademy",
  description:
    "Découvrez des formations IA gratuites par métier, des parcours pratiques et des certifications pour développer vos compétences avec Neopolis Akademy.",
  keywords: "formations IA gratuites par métier, formation IA gratuite, intelligence artificielle, compétences IA, certification IA, formation professionnelle",
  path: "/",
  locale: "fr",
};

const LOCALIZED_HOME_PAGES: Record<"fr" | "en" | "ar", SeoPage> = {
  fr: DEFAULT_PAGE,
  en: {
    title: "Free AI training by profession | Neopolis Akademy",
    description:
      "Explore free AI training by profession, practical learning paths and certifications to build job-ready skills with Neopolis Akademy.",
    keywords: "free AI training by profession, free AI courses, artificial intelligence training, AI skills, AI certification, professional training",
    path: "/en",
    locale: "en",
  },
  ar: {
    title: "تدريب مجاني في الذكاء الاصطناعي حسب المهنة | نيوبوليس أكاديمي",
    description:
      "اكتشف تدريبات مجانية في الذكاء الاصطناعي حسب المهنة، ومسارات عملية وشهادات لتطوير مهاراتك المهنية مع نيوبوليس أكاديمي الآن.",
    keywords: "تدريب مجاني ذكاء اصطناعي, دورات ذكاء اصطناعي للمهن, مهارات الذكاء الاصطناعي, شهادات ذكاء اصطناعي, تدريب مهني, نيوبوليس أكاديمي",
    path: "/ar",
    locale: "ar",
  },
};

const LOCALE_METADATA = {
  fr: { hreflang: "fr", ogLocale: "fr_FR", inLanguage: "fr-FR", dir: "ltr" },
  en: { hreflang: "en", ogLocale: "en_US", inLanguage: "en", dir: "ltr" },
  ar: { hreflang: "ar", ogLocale: "ar_AR", inLanguage: "ar", dir: "rtl" },
} as const;

const ROUTE_PAGES: Record<string, Omit<SeoPage, "path">> = {
  "/apply": {
    title: "Candidature | Neopolis Akademy",
    description:
      "Candidatez au programme Neopolis Akademy et développez vos compétences en intelligence artificielle.",
    keywords: "candidature formation IA, programme IA, compétences IA, formation professionnelle, Neopolis Akademy",
  },
  "/ai-news": {
    title: "AI News | Veille intelligence artificielle | Neopolis Akademy",
    description:
      "Suivez les annonces, outils, analyses et prépublications qui comptent dans l’intelligence artificielle.",
    keywords: "actualités intelligence artificielle, veille IA, outils IA, analyses IA, Neopolis Akademy",
  },
  "/mentions-legales": {
    title: "Mentions légales | Neopolis Akademy",
    description: "Consultez les mentions légales de la plateforme Neopolis Akademy.",
    keywords: "mentions légales, Neopolis Akademy, plateforme formation IA, protection des données, conditions d’utilisation",
  },
  "/refer": {
    title: "Parrainage | Neopolis Akademy",
    description: "Partagez les parcours pratiques Neopolis Akademy avec votre réseau professionnel.",
    keywords: "parrainage formation IA, recommander formation IA, réseau professionnel, parcours IA, Neopolis Akademy",
  },
  "/training": {
    title: "Formations en intelligence artificielle | Neopolis Akademy",
    description:
      "Découvrez les parcours de formation et de certification Neopolis Akademy en intelligence artificielle.",
    noindex: true,
  },
};

const PRIVATE_ROUTE_PREFIXES = [
  "/admin",
  "/login",
  "/demo-login",
  "/accept-invitation",
  "/forgot-password",
  "/reset-password",
  "/diagnostic",
  "/diagnostic-avance",
  "/mock-exam",
];

function normalizedPath(requestUrl: string) {
  const url = new URL(requestUrl, CANONICAL_ORIGIN);
  const pathname = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
  return pathname || "/";
}

function cleanedText(value: string | null, maximum: number) {
  return value?.replace(/\s+/g, " ").trim().slice(0, maximum) || "";
}

function titleFromIdentifier(value: string | null) {
  const id = cleanedText(value, 140);
  if (/^[a-z0-9_-]+$/i.test(id)) {
    for (const directory of [
      path.resolve(process.cwd(), "client/public/data/courses"),
      path.resolve(process.cwd(), "dist/public/data/courses"),
    ]) {
	      try {
	        const course = JSON.parse(fs.readFileSync(path.join(directory, `${id}.json`), "utf8"));
	        const title = course?.title;
	        if (typeof title === "string" && title.trim()) return title.trim();
	        if (title && typeof title === "object") return cleanedText(title.fr || title.en || "", 140) || "Neopolis Akademy";
	        if (typeof course?.sourceCourseTitle === "string" && course.sourceCourseTitle.trim()) return course.sourceCourseTitle.trim();
      } catch {
        // A missing or malformed public course file must not prevent a share preview.
      }
    }
  }
  const normalized = cleanedText(value, 140)
    .replace(/^(datacamp|neopolis)[_-]/i, "")
    .replace(/__\d+$/, "")
    .replace(/[_-]+/g, " ")
    .trim();
  return normalized ? normalized.replace(/\bai\b/gi, "IA").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Neopolis Akademy";
}

function referralSeoPage(url: URL): SeoPage {
  const content = cleanedText(url.searchParams.get("utm_content"), 32);
  const courseTitle = cleanedText(url.searchParams.get("share_title"), 140) || titleFromIdentifier(url.searchParams.get("course") || url.searchParams.get("certification"));
  const sharedCourse = content === "course" && courseTitle !== "Neopolis Akademy";
  const achievement = content === "achievement";
  const title = sharedCourse
    ? `${courseTitle} | Formation recommandée par votre réseau`
    : achievement
      ? "Une réussite Neopolis Akademy vous est partagée"
      : "Découvrez Neopolis Akademy avec votre réseau";
  const description = sharedCourse
    ? `Vous avez reçu une recommandation pour « ${courseTitle} ». Découvrez le parcours Neopolis Akademy avant de commencer votre candidature.`
    : achievement
      ? "Un membre de votre réseau partage sa réussite et vous invite à découvrir les parcours pratiques de Neopolis Akademy."
      : "Un membre de votre réseau vous invite à découvrir les parcours pratiques de Neopolis Akademy avant de candidater.";
  // La cible réelle garde ses paramètres de recommandation, mais la carte sociale
  // utilise une URL neutre : aucun identifiant ni libellé fourni par l’utilisateur
  // n’est alors exposé aux robots de prévisualisation.
  return {
    title,
    description,
    keywords: "formation IA recommandée, parrainage formation, compétences IA, parcours professionnel, Neopolis Akademy",
    path: "/refer",
    openGraphPath: "/refer",
  };
}

export function getSeoPage(requestUrl: string): SeoPage {
  const request = new URL(requestUrl, CANONICAL_ORIGIN);
  const path = normalizedPath(requestUrl);
  const localizedHome = Object.values(LOCALIZED_HOME_PAGES).find((page) => page.path === path);
  if (localizedHome) return localizedHome;
  if ((path === "/refer" || path === "/apply") && request.searchParams.get("ref")) return referralSeoPage(request);
  const exact = ROUTE_PAGES[path];
  if (exact) return { ...exact, path };

  if (path.startsWith("/training/")) {
    return {
      title: "Parcours de formation | Neopolis Akademy",
      description:
        "Suivez un parcours Neopolis Akademy pour développer vos compétences et préparer vos certifications en intelligence artificielle.",
      path,
      noindex: true,
    };
  }

  if (PRIVATE_ROUTE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return {
      title: `${SITE_NAME} | Espace sécurisé`,
      description: "Accédez à votre espace sécurisé Neopolis Akademy.",
      path,
      noindex: true,
    };
  }

  return { ...DEFAULT_PAGE, path };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

function toJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function publicPageSchema(page: SeoPage, canonicalUrl: string) {
  const locale = LOCALE_METADATA[page.locale || "fr"];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: CANONICAL_ORIGIN,
        logo: `${CANONICAL_ORIGIN}${PUBLIC_SOCIAL_ASSETS.square.path}`,
        sameAs: ORGANIZATION_SOCIAL_PROFILES,
      },
      {
        "@type": "WebPage",
        name: page.title,
        description: page.description,
        url: canonicalUrl,
        inLanguage: locale.inLanguage,
        isPartOf: {
          "@type": "WebSite",
          name: SITE_NAME,
          url: CANONICAL_ORIGIN,
        },
      },
    ],
  };
}

type PublicFallback = {
  heading: string;
  description: string;
  links: Array<{ href: string; label: string }>;
};

const PUBLIC_CRAWLER_FALLBACKS: Record<string, PublicFallback> = {
  "/": {
    heading: "Formations IA gratuites par métier",
    description: "Neopolis Akademy propose des parcours pratiques en intelligence artificielle pour développer des compétences adaptées aux métiers.",
    links: [
      { href: "/formations-ia", label: "Explorer les formations IA par métier" },
      { href: "/apply", label: "Déposer une candidature" },
      { href: "/ai-news", label: "Consulter AI News" },
    ],
  },
  "/en": {
    heading: "Free AI training by profession",
    description: "Neopolis Akademy offers practical artificial intelligence learning paths designed to develop professional skills.",
    links: [
      { href: "/en/ai-training", label: "Explore AI training by profession" },
      { href: "/apply", label: "Submit an application" },
      { href: "/ai-news", label: "Read AI News" },
    ],
  },
  "/ar": {
    heading: "تدريب مجاني في الذكاء الاصطناعي حسب المهنة",
    description: "تقدم نيوبوليس أكاديمي مسارات عملية في الذكاء الاصطناعي لتنمية مهارات مهنية مرتبطة بالمهن.",
    links: [
      { href: "/ar/ai-training", label: "استكشف تدريبات الذكاء الاصطناعي حسب المهنة" },
      { href: "/apply", label: "قدّم طلبك" },
      { href: "/ai-news", label: "اقرأ أخبار الذكاء الاصطناعي" },
    ],
  },
  "/ai-news": {
    heading: "AI News",
    description: "Retrouvez une veille éditoriale sur les annonces, analyses et outils liés à l’intelligence artificielle.",
    links: [
      { href: "/formations-ia", label: "Explorer les formations IA" },
      { href: "/apply", label: "Découvrir les modalités d’accès" },
    ],
  },
  "/apply": {
    heading: "Candidature à Neopolis Akademy",
    description: "Déposez votre candidature pour accéder aux parcours de formation Neopolis Akademy en intelligence artificielle.",
    links: [
      { href: "/formations-ia", label: "Voir les formations disponibles" },
      { href: "/", label: "Découvrir le programme" },
    ],
  },
  "/refer": {
    heading: "Parrainage Neopolis Akademy",
    description: "Découvrez les parcours pratiques Neopolis Akademy recommandés par votre réseau professionnel.",
    links: [
      { href: "/formations-ia", label: "Explorer les formations IA" },
      { href: "/apply", label: "Déposer une candidature" },
    ],
  },
  "/mentions-legales": {
    heading: "Mentions légales",
    description: "Consultez les informations légales et les conditions d’utilisation de Neopolis Akademy.",
    links: [
      { href: "/", label: "Retour à l’accueil" },
      { href: "/formations-ia", label: "Explorer les formations IA" },
    ],
  },
};

export function renderPublicCrawlerFallback(requestUrl: string) {
  const page = getSeoPage(requestUrl);
  if (page.noindex) return "";
  const fallback = PUBLIC_CRAWLER_FALLBACKS[page.path];
  if (!fallback) return "";

  const locale = LOCALE_METADATA[page.locale || "fr"];
  return `<main style="max-width:78rem;margin:0 auto;padding:2rem 1.25rem;font-family:Inter,Arial,sans-serif;color:#172033;background:#fff" dir="${locale.dir}"><h2>${escapeHtml(fallback.heading)}</h2><p>${escapeHtml(fallback.description)}</p><nav aria-label="Navigation publique"><ul>${fallback.links.map((link) => `<li><a href="${link.href}">${escapeHtml(link.label)}</a></li>`).join("")}</ul></nav></main>`;
}

export function renderSeoHead(requestUrl: string) {
  const page = getSeoPage(requestUrl);
  const locale = LOCALE_METADATA[page.locale || "fr"];
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const keywords = page.keywords ? `<meta name="keywords" content="${escapeHtml(page.keywords)}" />` : "";
  const canonicalUrl = `${CANONICAL_ORIGIN}${page.path}`;
  const openGraphUrl = `${CANONICAL_ORIGIN}${page.openGraphPath || page.path}`;
  const robots = page.noindex
    ? '<meta name="robots" content="noindex, nofollow" />'
    : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />';
  const structuredData = page.noindex
    ? ""
    : `<script type="application/ld+json">${toJsonLd(publicPageSchema(page, canonicalUrl))}</script>`;
  const homeAlternates = Object.values(LOCALIZED_HOME_PAGES).some((home) => home.path === page.path)
    ? [
        ...Object.values(LOCALIZED_HOME_PAGES).map((home) => `<link rel="alternate" hreflang="${LOCALE_METADATA[home.locale || "fr"].hreflang}" href="${CANONICAL_ORIGIN}${home.path}" />`),
        `<link rel="alternate" hreflang="x-default" href="${CANONICAL_ORIGIN}/" />`,
      ]
    : [];

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    keywords,
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="${locale.ogLocale}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${escapeHtml(openGraphUrl)}" />`,
    `<meta property="og:image" content="${SHARE_IMAGE_URL}" />`,
    `<meta property="og:image:url" content="${SHARE_IMAGE_URL}" />`,
    `<meta property="og:image:secure_url" content="${SHARE_IMAGE_URL}" />`,
    `<meta property="og:image:type" content="${PUBLIC_SOCIAL_ASSETS.openGraph.type}" />`,
    `<meta property="og:image:width" content="${PUBLIC_SOCIAL_ASSETS.openGraph.width}" />`,
    `<meta property="og:image:height" content="${PUBLIC_SOCIAL_ASSETS.openGraph.height}" />`,
    `<meta property="og:image:alt" content="${SHARE_IMAGE_ALT}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${X_SHARE_IMAGE_URL}" />`,
    `<meta name="twitter:image:alt" content="${SHARE_IMAGE_ALT}" />`,
    robots,
    structuredData,
    ...homeAlternates,
  ].filter(Boolean).join("\n    ");
}

export function injectSeoHead(template: string, requestUrl: string) {
  const page = getSeoPage(requestUrl);
  const locale = LOCALE_METADATA[page.locale || "fr"];
  return template
    .replace(/<html\s+lang="[^"]+"(?:\s+dir="[^"]+")?>/, `<html lang="${locale.hreflang}" dir="${locale.dir}">`)
    .replace("<!--seo-head-->", () => renderSeoHead(requestUrl))
    .replace("<!--seo-content-->", () => renderPublicCrawlerFallback(requestUrl));
}
