import * as React from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PublicSiteHeader } from "./PublicSiteChrome";
import { PUBLIC_CHROME_STYLES } from "@shared/publicChromeStyles";

describe("chrome public et recherche de formations", () => {
  it("rend un formulaire de recherche accessible qui mène au catalogue public", () => {
    vi.stubGlobal("React", React);
    vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => undefined });
    vi.stubGlobal("location", { pathname: "/ai-news", search: "", hash: "" });
    const html = renderToStaticMarkup(createElement(LanguageProvider, null, createElement(PublicSiteHeader, { active: "news" })));

    expect(html).toContain('role="search"');
    expect(html).toContain('action="/formations-ia/catalogue"');
    expect(html).toContain('name="q"');
    expect(html).toContain('placeholder="Métier, compétence ou formation…"');
    expect(html).toContain('id="public-training-search"');
    expect(html).toContain('href="/formations-ia/golden-jobs"');
    expect(html).toContain('>Golden Jobs<');
    expect(html).toContain('src="/api/assets/neopolis-akademy-header-user-supplied-240x84_61aeceeb.png"');
    expect(html).toContain('width="120"');
    expect(html).toContain('height="42"');
  });

  it("uses the compact navigation before a desktop header can overflow", () => {
    expect(PUBLIC_CHROME_STYLES).toContain("@media (min-width: 1537px)");
    expect(PUBLIC_CHROME_STYLES).toContain("@media (max-width: 1536px) and (min-width: 640px)");
    expect(PUBLIC_CHROME_STYLES).toContain(".public-chrome-mobile { display: block; }");
    expect(PUBLIC_CHROME_STYLES).toContain("flex-wrap: nowrap");
  });
});
