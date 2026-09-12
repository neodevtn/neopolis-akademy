import * as React from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PublicSiteHeader } from "./PublicSiteChrome";

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
    expect(html).toContain('src="/api/assets/neopolis-akademy-header-120x42-rendered_e0ac12ce.png"');
    expect(html).toContain('width="120"');
    expect(html).toContain('height="42"');
  });
});
