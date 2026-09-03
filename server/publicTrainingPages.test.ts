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
});
