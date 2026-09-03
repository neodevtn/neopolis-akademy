import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CANONICAL_ORIGIN, SHARE_IMAGE_URL, getSeoPage, injectSeoHead, renderSeoHead } from "./seo";

describe("server-rendered sharing metadata", () => {
  it("builds canonical social metadata without query parameters", () => {
    const metadata = renderSeoHead("/apply?utm_source=whatsapp");

    expect(metadata).toContain("<title>Candidature | Neopolis Akademy</title>");
    expect(metadata).toContain(`<link rel="canonical" href="${CANONICAL_ORIGIN}/apply" />`);
    expect(metadata).toContain(`<meta property="og:image" content="${SHARE_IMAGE_URL}" />`);
    expect(metadata).toContain('<meta name="twitter:card" content="summary_large_image" />');
  });

  it("publie des métadonnées publiques dédiées à la rubrique AI News", () => {
    const metadata = renderSeoHead("/ai-news");

    expect(metadata).toContain("<title>AI News | Veille intelligence artificielle | Neopolis Akademy</title>");
    expect(metadata).toContain(`<link rel="canonical" href="${CANONICAL_ORIGIN}/ai-news" />`);
  });

  it("contextualise l’aperçu social d’un lien de recommandation de cours", () => {
    const metadata = renderSeoHead("/refer?ref=NEO-AB12CD34&utm_content=course&course=ai_for_finance__01&share_title=L%E2%80%99IA%20pour%20la%20finance");

    expect(metadata).toContain("L’IA pour la finance | Formation recommandée par votre réseau");
    expect(metadata).toContain("Vous avez reçu une recommandation pour « L’IA pour la finance »");
    expect(metadata).toContain(`<link rel="canonical" href="${CANONICAL_ORIGIN}/refer" />`);
    expect(metadata).toContain("og:url\" content=\"https://akademy.neodev.click/refer?ref=NEO-AB12CD34");
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
    const result = injectSeoHead("<head><!--seo-head--></head>", "/training");
    expect(result).toContain("<title>Formations en intelligence artificielle | Neopolis Akademy</title>");
    expect(result).not.toContain("<!--seo-head-->");
  });

  it("publishes an agent-readable llms.txt with a Markdown H1 and canonical links", () => {
    const llms = readFileSync(resolve(process.cwd(), "client/public/llms.txt"), "utf8");

    expect(llms).toMatch(/^#\s+Neopolis Akademy/m);
    expect(llms).toContain("https://akademy.neodev.click/");
    expect(llms).toContain("https://akademy.neodev.click/training");
    expect(llms).toMatch(/\[[^\]]+\]\(https:\/\//);
  });
});
