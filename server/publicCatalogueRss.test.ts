import { describe, expect, it } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import { getPublicCatalogueTrainings } from "@shared/publicTrainingCatalog";
import { renderPublicCatalogueRss } from "./publicCatalogueRss";
import { registerPublicTrainingPages } from "./publicTrainingPages";

const host = "https://akademy.neodev.click";
const itemBodies = (rss: string) => Array.from(rss.matchAll(/<item>([\s\S]*?)<\/item>/g), (match) => match[1]!);

describe("RSS des formations compatible avec les lecteurs WordPress", () => {
  it.each(["fr", "en"] as const)("publie les programmes et cours %s avec description, image et URL stable", (locale) => {
    const rss = renderPublicCatalogueRss(locale);
    const trainings = getPublicCatalogueTrainings(locale);
    const items = itemBodies(rss);
    expect(rss).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>\n<rss version="2.0"/);
    expect(rss).toContain('xmlns:media="http://search.yahoo.com/mrss/"');
    expect(rss).toContain('xmlns:content="http://purl.org/rss/1.0/modules/content/"');
    expect(items).toHaveLength(trainings.length + trainings.reduce((n, training) => n + training.courses.length, 0));
    expect(items).toHaveLength(296);
    const guids = items.map((item) => item.match(/<guid isPermaLink="true">([^<]+)<\/guid>/)?.[1]);
    expect(new Set(guids).size).toBe(items.length);
    for (const item of items) {
      expect(item).toMatch(/<description>[^<]+<\/description>/);
      expect(item).toMatch(/<content:encoded>[^<]*&lt;p&gt;[\s\S]*?<\/content:encoded>/);
      expect(item).toMatch(/<media:content url="https:\/\/akademy\.neodev\.click\/api\/assets\/[^"]+\.png" medium="image" type="image\/png"/);
      expect(item).toMatch(/<media:thumbnail url="https:\/\/akademy\.neodev\.click\/api\/assets\/[^"]+\.png"/);
      expect(item).toMatch(/<enclosure url="https:\/\/akademy\.neodev\.click\/api\/assets\/[^"]+\.png" length="[1-9]\d+" type="image\/png"/);
      expect(item).not.toContain("/manus-storage/");
      expect(item).not.toMatch(/\/training\/|\/admin\/|[?&](?:signature|token)=/i);
      const visibleText = [item.match(/<title>([^<]*)<\/title>/)?.[1], item.match(/<description>([^<]*)<\/description>/)?.[1], item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/)?.[1]?.replace(/src=&quot;[^&]*?&quot;/g, "")].join(" ");
      expect(visibleText).not.toMatch(/\b(?:DataCamp|Skilljar|CertSafari|cours partenaire)\b/i);
    }
    expect(guids.every((url) => url?.startsWith(`${host}${locale === "fr" ? "/formations-ia/" : "/en/ai-training/"}`))).toBe(true);
    expect(rss).toContain(`<atom:link href="${host}${locale === "fr" ? "/formations-ia/rss.xml" : "/en/ai-training/rss.xml"}" rel="self" type="application/rss+xml" />`);
  });

  it("sert les deux flux sans session ni redirection, même avec les robots publics", async () => {
    const app = express();
    registerPublicTrainingPages(app);
    const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
      const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    try {
      const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
      for (const path of ["/formations-ia/rss.xml", "/en/ai-training/rss.xml"]) {
        const response = await fetch(`${baseUrl}${path}`, { redirect: "manual", headers: { "user-agent": "WordPress/6.8; https://example.com" } });
        const body = await response.text();
        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("application/rss+xml; charset=utf-8");
        expect(response.headers.get("location")).toBeNull();
        expect(response.headers.get("set-cookie")).toBeNull();
        expect(response.headers.get("x-content-type-options")).toBe("nosniff");
        expect(Number(response.headers.get("content-length"))).toBe(Buffer.byteLength(body, "utf8"));
        expect(itemBodies(body)).toHaveLength(296);
      }
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });
});
