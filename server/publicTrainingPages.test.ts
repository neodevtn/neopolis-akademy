import { describe, expect, it } from "vitest";
import { getPublicTrainingTheme } from "@shared/publicTrainingThemes";
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
    expect(html).toContain("Choisir une formation IA par métier");
  });

  it("rend une page métier avec les formations et indicateurs réellement associés", () => {
    const theme = getPublicTrainingTheme("finance-comptabilite-controle-gestion");
    expect(theme).not.toBeNull();

    const html = renderPublicTrainingTheme(theme!);
    expect(html).toContain("Formations disponibles dans ce thème");
    expect(html).toContain("Répartition des activités par formation");
    expect(html).toContain(`https://akademy.neodev.click/formations-ia/${theme!.slug}`);
  });

  it("rend une vraie page introuvable non indexable et un sitemap avec les routes publiques", () => {
    expect(renderPublicTrainingNotFound()).toContain('name="robots" content="noindex, follow"');
    const sitemap = renderPublicTrainingSitemap();
    expect(sitemap).toContain("https://akademy.neodev.click/formations-ia");
    expect(sitemap).toContain("finance-comptabilite-controle-gestion");
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
    const theme = getPublicTrainingTheme("finance-comptabilite-controle-gestion", "ar");
    expect(theme).not.toBeNull();

    const html = renderPublicTrainingTheme(theme!, "ar");
    expect(html).toContain('<html lang="ar" dir="rtl">');
    expect(html).toContain("الدورات المتاحة ضمن هذا الموضوع");
    expect(html).toContain("أتمتة المحاسبة بالذكاء الاصطناعي");
    expect(html).toContain('hreflang="en" href="https://akademy.neodev.click/en/ai-training/finance-comptabilite-controle-gestion"');
    expect(html).toContain('"inLanguage":"ar"');
  });

  it("publie toutes les variantes linguistiques dans le sitemap avec leurs liens alternatifs", () => {
    const sitemap = renderPublicTrainingSitemap();
    expect(sitemap).toContain("https://akademy.neodev.click/en/ai-training");
    expect(sitemap).toContain("https://akademy.neodev.click/ar/ai-training");
    expect(sitemap).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(sitemap).toContain('hreflang="x-default"');
  });
});
