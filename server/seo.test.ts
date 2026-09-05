import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CANONICAL_ORIGIN, ORGANIZATION_SOCIAL_PROFILES, SHARE_IMAGE_ALT, SHARE_IMAGE_URL, X_SHARE_IMAGE_URL, getSeoPage, injectSeoHead, renderPublicCrawlerFallback, renderSeoHead } from "./seo";

describe("server-rendered sharing metadata", () => {
  it("publie un titre d’accueil borné et exactement six mots-clés ciblés", () => {
    const metadata = renderSeoHead("/");
    const title = getSeoPage("/").title;
    const keywords = getSeoPage("/").keywords?.split(",").map((keyword) => keyword.trim()).filter(Boolean) || [];

    expect(title.length).toBeGreaterThanOrEqual(30);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title).toBe("Formations IA gratuites | Neopolis Akademy");
    expect(keywords).toHaveLength(6);
    expect(metadata).toContain('<meta name="keywords" content="formation IA gratuite, formations IA par métier, intelligence artificielle, compétences IA, formation professionnelle, MENA" />');
  });

  it("builds canonical social metadata without query parameters", () => {
    const metadata = renderSeoHead("/apply?utm_source=whatsapp");

    expect(metadata).toContain("<title>Candidature | Neopolis Akademy</title>");
    expect(metadata).toContain(`<link rel="canonical" href="${CANONICAL_ORIGIN}/apply" />`);
    expect(metadata).toContain(`<meta property="og:image" content="${SHARE_IMAGE_URL}" />`);
    expect(metadata).toContain(`<meta property="og:image:secure_url" content="${SHARE_IMAGE_URL}" />`);
    expect(metadata).toContain('<meta property="og:image:type" content="image/png" />');
    expect(metadata).toContain(`<meta property="og:image:alt" content="${SHARE_IMAGE_ALT}" />`);
    expect(metadata).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(metadata).toContain(`<meta name="twitter:image" content="${X_SHARE_IMAGE_URL}" />`);
    expect(metadata).toContain('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />');
    expect(metadata).toContain(`<meta property="og:image:url" content="${SHARE_IMAGE_URL}" />`);
  });

  it("généralise les données structurées de l’organisation et de la page sans inventer de profils sociaux", () => {
    const metadata = renderSeoHead("/");

    expect(metadata).toContain('"@type":"Organization"');
    expect(metadata).toContain('"@type":"WebPage"');
    expect(metadata).toContain(ORGANIZATION_SOCIAL_PROFILES[0]);
    expect(metadata).toContain(ORGANIZATION_SOCIAL_PROFILES[1]);
  });

  it("publie des métadonnées publiques dédiées à la rubrique AI News", () => {
    const metadata = renderSeoHead("/ai-news");

    expect(metadata).toContain("<title>AI News | Veille intelligence artificielle | Neopolis Akademy</title>");
    expect(metadata).toContain(`<link rel="canonical" href="${CANONICAL_ORIGIN}/ai-news" />`);
    expect(metadata).toContain('name="keywords" content="actualités intelligence artificielle, veille IA, outils IA, analyses IA, Neopolis Akademy"');
  });

  it("utilise entre trois et huit mots-clés ciblés sur chaque page publique non thématique", () => {
    ["/", "/apply", "/ai-news", "/refer", "/mentions-legales", "/refer?ref=NEO-AB12CD34&utm_content=course&course=ai_for_finance__01"].forEach((route) => {
      const keywords = getSeoPage(route).keywords?.split(",").map((keyword) => keyword.trim()).filter(Boolean) || [];

      expect(keywords.length).toBeGreaterThanOrEqual(3);
      expect(keywords.length).toBeLessThanOrEqual(8);
    });
  });

  it("contextualise l’aperçu social d’un lien de recommandation de cours", () => {
    const metadata = renderSeoHead("/refer?ref=NEO-AB12CD34&utm_content=course&course=ai_for_finance__01&share_title=L%E2%80%99IA%20pour%20la%20finance");

    expect(metadata).toContain("L’IA pour la finance | Formation recommandée par votre réseau");
    expect(metadata).toContain("Vous avez reçu une recommandation pour « L’IA pour la finance »");
    expect(metadata).toContain(`<link rel="canonical" href="${CANONICAL_ORIGIN}/refer" />`);
    expect(metadata).toContain("og:url\" content=\"https://akademy.neodev.click/refer\"");
    expect(metadata).not.toContain("og:url\" content=\"https://akademy.neodev.click/refer?ref=");
    expect(metadata).toContain(`<meta property="og:image" content="${SHARE_IMAGE_URL}" />`);
  });

  it("couvre les liens de candidature parrainée avec les mêmes images publiques sans exposer le code de parrainage dans l’URL sociale", () => {
    const metadata = renderSeoHead("/apply?ref=NEO-AB12CD34&utm_content=course&course=ai_for_finance__01");

    expect(metadata).toContain(`<meta property="og:image" content="${SHARE_IMAGE_URL}" />`);
    expect(metadata).toContain(`<meta name="twitter:image" content="${X_SHARE_IMAGE_URL}" />`);
    expect(metadata).toContain('og:url" content="https://akademy.neodev.click/refer"');
    expect(metadata).not.toContain('og:url" content="https://akademy.neodev.click/refer?ref=');
  });

  it("résout le titre français canonique pour les liens de cours publiés avant l’ajout du libellé de partage", () => {
    const metadata = renderSeoHead("/refer?ref=NEO-AB12CD34&utm_content=course&course=ai_for_finance__01");

    expect(metadata).toContain("L’IA pour la finance | Formation recommandée par votre réseau");
  });

  it("échappe les libellés de partage non fiables avant de les insérer dans les balises", () => {
    const metadata = renderSeoHead("/refer?ref=NEO-AB12CD34&utm_content=course&share_title=%3Cscript%3Ealert(1)%3C%2Fscript%3E");

    expect(metadata).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(metadata).not.toContain("<script>alert(1)</script>");
  });

  it("marks private routes as non-indexable while retaining a safe initial head", () => {
    const page = getSeoPage("/admin/training?tab=learners");
    expect(page.noindex).toBe(true);
    expect(renderSeoHead("/admin/training?tab=learners")).toContain('name="robots" content="noindex, nofollow"');
  });

  it("exclut les parcours authentifiés de l’indexation tout en laissant la découverte publique aux pages thématiques", () => {
    expect(getSeoPage("/training?tab=catalog").noindex).toBe(true);
    expect(getSeoPage("/training/formation-exemple").noindex).toBe(true);
    expect(renderSeoHead("/training/formation-exemple")).toContain('name="robots" content="noindex, nofollow"');
  });

  it("inserts a single escaped head block in the server HTML template", () => {
    const result = injectSeoHead("<head><!--seo-head--></head><noscript><!--seo-content--></noscript>", "/training");
    expect(result).toContain("<title>Formations en intelligence artificielle | Neopolis Akademy</title>");
    expect(result).not.toContain("<!--seo-head-->");
    expect(result).not.toContain("Formations IA gratuites par métier");
  });

  it("fournit un contenu de secours fidèle aux routes publiques, sans paramètre de recommandation ni contenu privé", () => {
    const home = renderPublicCrawlerFallback("/");
    const referral = renderPublicCrawlerFallback("/refer?ref=NEO-AB12CD34");

    expect(home).toContain("Formations IA gratuites par métier");
    expect(home).toContain('href="/formations-ia"');
    expect(referral).toContain("Parrainage Neopolis Akademy");
    expect(referral).not.toContain("NEO-AB12CD34");
    expect(renderPublicCrawlerFallback("/admin/training")).toBe("");
  });

  it("publishes an agent-readable llms.txt with a Markdown H1 and canonical links", () => {
    const llms = readFileSync(resolve(process.cwd(), "client/public/llms.txt"), "utf8");

    expect(llms).toMatch(/^#\s+Neopolis Akademy/m);
    expect(llms).toContain("https://akademy.neodev.click/");
    expect(llms).toContain("https://akademy.neodev.click/training");
    expect(llms).toMatch(/\[[^\]]+\]\(https:\/\//);
  });

  it("préserve le point d’injection du contenu de secours et le préchargement du logo dans le document public", () => {
    const template = readFileSync(resolve(process.cwd(), "client/index.html"), "utf8");

    expect(template).toContain("<noscript><!--seo-content--></noscript>");
    expect(template).toContain('rel="preload" as="image" type="image/svg+xml" href="/api/assets/neopolis-akademy-official-logo_40a16b6c.svg"');
  });
});
