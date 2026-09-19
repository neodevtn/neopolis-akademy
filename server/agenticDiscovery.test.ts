import { describe, expect, it } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import {
  INDEXNOW_KEY_PATH,
  buildAgenticIndex,
  findForbiddenAgenticContent,
  getAgenticDiscoveryDocuments,
  getAgenticDiscoverySummary,
  getAgenticPublicUrls,
  getIndexNowPayload,
  renderLlmsTxt,
  renderRobotsTxt,
} from "@shared/agenticDiscovery";
import { getPublicCatalogueTrainings } from "@shared/publicTrainingCatalog";
import { getPublicTrainingSitemapFiles, registerPublicTrainingPages, renderPublicCatalogueTraining } from "./publicTrainingPages";
import { renderSeoHead } from "./seo";

describe("SEO and agentic-search discovery", () => {
  it("publishes a complete multilingual public catalogue without private payloads", () => {
    const index = buildAgenticIndex();
    const summary = getAgenticDiscoverySummary();

    expect(summary.programmes).toBe(index.metrics.certificationCount);
    expect(summary.courses).toBe(index.metrics.courseCount);
    expect(summary.programmes).toBeGreaterThan(100);
    expect(summary.courses).toBeGreaterThan(150);
    expect(summary.languages).toBe(3);
    expect(findForbiddenAgenticContent()).toEqual([]);
    expect(index.accessPolicy.aiCrawlers).toContain("no GPTBot, ClaudeBot");
  });

  it("keeps every AI crawler allowed on public URLs and excludes only private paths", () => {
    const robots = renderRobotsTxt();
    expect(robots).toContain("User-agent: *\nAllow: /");
    expect(robots).toContain("Allow: /api/assets/");
    expect(robots).toContain("Disallow: /training");
    expect(robots).toContain("Disallow: /admin/");
    expect(robots).toContain("Sitemap: https://akademy.neodev.click/sitemap-index.xml");
    expect(robots).not.toMatch(/User-agent:\s*(GPTBot|ClaudeBot|Google-Extended|OAI-SearchBot)/i);
  });

  it("publishes concise and extended LLM context plus machine-readable discovery", () => {
    const documents = getAgenticDiscoveryDocuments();
    expect(documents.map((document) => document.path)).toEqual([
      "/robots.txt",
      "/llms.txt",
      "/llms-full.txt",
      "/ai-index.json",
      INDEXNOW_KEY_PATH,
    ]);
    expect(renderLlmsTxt()).toContain("## Français");
    expect(renderLlmsTxt()).toContain("## English");
    expect(renderLlmsTxt()).toContain("## العربية");
    expect(documents.find((document) => document.path === "/llms-full.txt")!.body.length).toBeGreaterThan(100_000);
  });

  it("enriches public pages with site search, FAQ and Course knowledge graphs", () => {
    const homeHead = renderSeoHead("/");
    expect(homeHead).toContain('"@type":"SearchAction"');
    expect(homeHead).toContain('"@type":"FAQPage"');
    expect(homeHead).toContain('href="https://akademy.neodev.click/llms.txt"');
    expect(homeHead).toContain('href="https://akademy.neodev.click/ai-index.json"');

    const training = getPublicCatalogueTrainings("fr")[0];
    const html = renderPublicCatalogueTraining(training, "fr");
    expect(html).toContain('"@type":"WebSite"');
    expect(html).toContain('"@type":"Course"');
    expect(html).toContain('"dateModified":"2026-09-19"');
  });

  it("builds a canonical IndexNow payload without private URLs", () => {
    const payload = getIndexNowPayload();
    const sitemapUrlCount = getPublicTrainingSitemapFiles().reduce((count, file) => count + file.urlCount, 0);
    expect(payload.host).toBe("akademy.neodev.click");
    expect(payload.keyLocation).toMatch(/^https:\/\/akademy\.neodev\.click\/[a-f0-9]{64}\.txt$/);
    expect(payload.urlList).toEqual(getAgenticPublicUrls());
    expect(payload.urlList).toHaveLength(sitemapUrlCount);
    expect(payload.urlList.every((url) => url.startsWith("https://akademy.neodev.click/") && !/\/(?:training|admin|api)(?:\/|$)/.test(new URL(url).pathname))).toBe(true);
  });

  it("serves every discovery document to Google and AI crawlers without redirects or cookies", async () => {
    const app = express();
    registerPublicTrainingPages(app);
    const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
      const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });

    try {
      const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
      for (const userAgent of ["Googlebot/2.1", "ChatGPT-User/1.0", "ClaudeBot/1.0"]) {
        for (const document of getAgenticDiscoveryDocuments()) {
          const response = await fetch(`${baseUrl}${document.path}`, { redirect: "manual", headers: { "user-agent": userAgent } });
          const body = await response.text();
          expect(response.status).toBe(200);
          expect(response.headers.get("location")).toBeNull();
          expect(response.headers.get("set-cookie")).toBeNull();
          expect(response.headers.get("x-robots-tag")).toBeNull();
          expect(response.headers.get("content-type")).toBe(document.contentType);
          expect(body).toBe(document.body);
        }
      }
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });
});
