import { describe, expect, it } from "vitest";
import { getPublicTrainingTheme, getPublicTrainingThemes } from "@shared/publicTrainingThemes";
import {
  renderPublicTrainingIndex,
  renderPublicTrainingNotFound,
  renderPublicTrainingSitemap,
  renderPublicTrainingTheme,
} from "./publicTrainingPages";

describe("pages publiques de formations IA", () => {
  it("rend l’index avec contenu, SEO et données structurées", () => {
    const html = renderPublicTrainingIndex();

    expect(html).toContain("<h1>Formations IA gratuites par métier</h1>");
    expect(html).toContain("<link rel=\"canonical\" href=\"https://akademy.neodev.click/formations-ia\"");
    expect(html).toContain("application/ld+json");
    expect(html).toContain("Choisir une formation IA par grand domaine métier");
    expect(html).toContain('meta name="keywords" content="formations IA gratuites, formation IA par métier, compétences IA, formation professionnelle, zone MENA"');
  });

  it("expose le même menu principal et le même footer public dans le HTML des formations", () => {
    const html = renderPublicTrainingIndex();

    expect(html).toContain('href="/#formule">La Formule</a>');
    expect(html).toContain('href="/ai-news">AI News</a>');
    expect(html).toContain('href="/login">Se connecter</a>');
    expect(html).toContain('class="apply-link" href="/apply">Postuler</a>');
    expect(html).toContain('<details class="mobile-nav"><summary>Menu</summary>');
    expect(html).toContain('<footer class="site-footer">');
    expect(html).toContain('href="/mentions-legales">Mentions légales</a>');
  });

  it("rend une page de grand domaine avec cas d’usage, formations, indicateurs et métadonnées propres", () => {
    const theme = getPublicTrainingTheme("comptabilite-finance");
    expect(theme).not.toBeNull();

    const html = renderPublicTrainingTheme(theme!);
    expect(html).toContain("Formations disponibles dans ce thème");
    expect(html).toContain("Répartition des activités par formation");
    expect(html).toContain("Cas d’usage professionnels dans les formations associées");
    expect(html).toContain("Construire un agent de tenue comptable");
    expect(html).toContain(`<title>${theme!.seo.title}</title>`);
    expect(html).toContain(`meta name="keywords" content="${theme!.seo.keywords}"`);
    expect(html).toContain(`https://akademy.neodev.click/formations-ia/${theme!.slug}`);
  });

  it("rend une vraie page introuvable non indexable et un sitemap avec les routes publiques", () => {
    expect(renderPublicTrainingNotFound()).toContain('name="robots" content="noindex, follow"');
    const sitemap = renderPublicTrainingSitemap();
    expect(sitemap).toContain("https://akademy.neodev.click/formations-ia");
    expect(sitemap).toContain("comptabilite-finance");
  });

  it("rend l’index anglais avec canonical, hreflang et contenu éditorial localisé", () => {
    const html = renderPublicTrainingIndex("en");

    expect(html).toContain('<html lang="en" dir="ltr">');
    expect(html).toContain("<h1>Free AI training by profession</h1>");
    expect(html).toContain('<link rel="canonical" href="https://akademy.neodev.click/en/ai-training"');
    expect(html).toContain('hreflang="fr-FR" href="https://akademy.neodev.click/formations-ia"');
    expect(html).toContain('hreflang="ar" href="https://akademy.neodev.click/ar/ai-training"');
    expect(html).toContain('"inLanguage":"en"');
  });

  it("rend une page thème arabe RTL avec les cartes catalogue localisées et ses alternatives SEO", () => {
    const theme = getPublicTrainingTheme("comptabilite-finance", "ar");
    expect(theme).not.toBeNull();

    const html = renderPublicTrainingTheme(theme!, "ar");
    expect(html).toContain('<html lang="ar" dir="rtl">');
    expect(html).toContain("الدورات المتاحة ضمن هذا الموضوع");
    expect(html).toContain("أتمتة المحاسبة بالذكاء الاصطناعي");
    expect(html).toContain("حالات استخدام مهنية في الدورات المرتبطة");
    expect(html).toContain(`meta name="keywords" content="${theme!.seo.keywords}"`);
    expect(html).toContain('hreflang="en" href="https://akademy.neodev.click/en/ai-training/comptabilite-finance"');
    expect(html).toContain('"inLanguage":"ar"');
  });

  it("publie un titre, une description et trois à huit mots-clés sur chaque page de domaine dans les trois langues", () => {
    (["fr", "en", "ar"] as const).forEach((locale) => {
      getPublicTrainingThemes(locale).forEach((theme) => {
        const html = renderPublicTrainingTheme(theme, locale);
        const keywords = theme.seo.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean);

        expect(html).toContain(`<title>${theme.seo.title}</title>`);
        expect(html).toContain(`<meta name="description" content="${theme.seo.description}" />`);
        expect(html).toContain(`<meta name="keywords" content="${theme.seo.keywords}" />`);
        expect(keywords.length).toBeGreaterThanOrEqual(3);
        expect(keywords.length).toBeLessThanOrEqual(8);
      });
    });
  });

  it("publie toutes les variantes linguistiques dans le sitemap avec leurs liens alternatifs", () => {
    const sitemap = renderPublicTrainingSitemap();
    expect(sitemap).toContain("https://akademy.neodev.click/en/ai-training");
    expect(sitemap).toContain("https://akademy.neodev.click/ar/ai-training");
    expect(sitemap).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(sitemap).toContain('hreflang="x-default"');
  });
});
