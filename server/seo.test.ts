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

  it("marks private routes as non-indexable while retaining a safe initial head", () => {
    const page = getSeoPage("/admin/training?tab=learners");
    expect(page.noindex).toBe(true);
    expect(renderSeoHead("/admin/training?tab=learners")).toContain('name="robots" content="noindex, nofollow"');
  });

  it("inserts a single escaped head block in the server HTML template", () => {
    const result = injectSeoHead("<head><!--seo-head--></head>", "/training");
    expect(result).toContain("<title>Formations en intelligence artificielle | Neopolis Akademy</title>");
    expect(result).not.toContain("<!--seo-head-->");
  });
});
