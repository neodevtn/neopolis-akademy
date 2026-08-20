export const CANONICAL_ORIGIN = "https://akademy.neodev.click";
export const SITE_NAME = "Neopolis Akademy";
export const SHARE_IMAGE_URL = `${CANONICAL_ORIGIN}/api/assets/neopolis-akademy-social-share_7fc7d2a3.png`;

type SeoPage = {
  title: string;
  description: string;
  path: string;
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
  "/mentions-legales": {
    title: "Mentions légales | Neopolis Akademy",
    description: "Consultez les mentions légales de la plateforme Neopolis Akademy.",
  },
  "/training": {
    title: "Formations en intelligence artificielle | Neopolis Akademy",
    description:
      "Découvrez les parcours de formation et de certification Neopolis Akademy en intelligence artificielle.",
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

export function getSeoPage(requestUrl: string): SeoPage {
  const path = normalizedPath(requestUrl);
  const exact = ROUTE_PAGES[path];
  if (exact) return { ...exact, path };

  if (path.startsWith("/training/")) {
    return {
      title: "Parcours de formation | Neopolis Akademy",
      description:
        "Suivez un parcours Neopolis Akademy pour développer vos compétences et préparer vos certifications en intelligence artificielle.",
      path,
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
    `<meta property="og:url" content="${canonicalUrl}" />`,
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
