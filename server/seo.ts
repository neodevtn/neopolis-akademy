import fs from "node:fs";
import path from "node:path";

export const CANONICAL_ORIGIN = "https://akademy.neodev.click";
export const SITE_NAME = "Neopolis Akademy";
export const SHARE_IMAGE_URL = `${CANONICAL_ORIGIN}/api/assets/neopolis-akademy-social-share_7fc7d2a3.png`;

type SeoPage = {
  title: string;
  description: string;
  path: string;
  openGraphPath?: string;
  noindex?: boolean;
};

const DEFAULT_PAGE: SeoPage = {
  title: "Neopolis Akademy | Formation certifiante en Intelligence Artificielle",
  description:
    "Développez vos compétences en intelligence artificielle avec les parcours certifiants de Neopolis Akademy.",
  path: "/",
};

const ROUTE_PAGES: Record<string, Omit<SeoPage, "path">> = {
  "/apply": {
    title: "Candidature | Neopolis Akademy",
    description:
      "Candidatez au programme Neopolis Akademy et développez vos compétences en intelligence artificielle.",
  },
  "/ai-news": {
    title: "AI News | Veille intelligence artificielle | Neopolis Akademy",
    description:
      "Suivez les annonces, outils, analyses et prépublications qui comptent dans l’intelligence artificielle.",
  },
  "/mentions-legales": {
    title: "Mentions légales | Neopolis Akademy",
    description: "Consultez les mentions légales de la plateforme Neopolis Akademy.",
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

function referralOpenGraphPath(url: URL) {
  const params = new URLSearchParams();
  ["ref", "utm_content", "course", "certification", "achievement", "share_title"].forEach((key) => {
    const value = cleanedText(url.searchParams.get(key), key === "share_title" ? 140 : 80);
    if (value) params.set(key, value);
  });
  return `/refer${params.size ? `?${params.toString()}` : ""}`;
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
  return { title, description, path: "/refer", openGraphPath: referralOpenGraphPath(url) };
}

export function getSeoPage(requestUrl: string): SeoPage {
  const request = new URL(requestUrl, CANONICAL_ORIGIN);
  const path = normalizedPath(requestUrl);
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

export function renderSeoHead(requestUrl: string) {
  const page = getSeoPage(requestUrl);
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const canonicalUrl = `${CANONICAL_ORIGIN}${page.path}`;
  const openGraphUrl = `${CANONICAL_ORIGIN}${page.openGraphPath || page.path}`;
  const robots = page.noindex ? '<meta name="robots" content="noindex, nofollow" />' : "";

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    '<meta property="og:locale" content="fr_FR" />',
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${escapeHtml(openGraphUrl)}" />`,
    `<meta property="og:image" content="${SHARE_IMAGE_URL}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:image:alt" content="Logo Neopolis Akademy" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${SHARE_IMAGE_URL}" />`,
    '<meta name="twitter:image:alt" content="Logo Neopolis Akademy" />',
    robots,
  ].filter(Boolean).join("\n    ");
}

export function injectSeoHead(template: string, requestUrl: string) {
  return template.replace("<!--seo-head-->", () => renderSeoHead(requestUrl));
}
