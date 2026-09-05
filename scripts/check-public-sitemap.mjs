import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const baseUrl = (process.env.PUBLIC_SITEMAP_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const canonicalOrigin = "https://akademy.neodev.click";
const reportPath = resolve(process.cwd(), "docs", "public_sitemap_qa.json");

const fail = (message) => {
  throw new Error(message);
};

const text = async (url) => {
  const response = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
    headers: { "x-neopolis-qa-probe": "1" },
  });
  return { response, body: await response.text() };
};

const classify = (pathname) => {
  if (/^\/(en\/ai-training|ar\/ai-training|formations-ia)\/catalogue\/[^/]+\/[^/]+$/.test(pathname)) return "cours";
  if (/^\/(en\/ai-training|ar\/ai-training|formations-ia)\/catalogue\/[^/]+$/.test(pathname)) return "formations";
  if (/^\/(en\/ai-training|ar\/ai-training|formations-ia)\/catalogue$/.test(pathname)) return "catalogues";
  if (/^\/(en\/ai-training|ar\/ai-training|formations-ia)\/[^/]+$/.test(pathname)) return "categories";
  if (/^\/(en\/ai-training|ar\/ai-training|formations-ia)$/.test(pathname)) return "pages";
  if (pathname === "/ai-news") return "actualites";
  return "pages";
};

const language = (pathname) => pathname.startsWith("/en/") || pathname === "/en" ? "en" : pathname.startsWith("/ar/") || pathname === "/ar" ? "ar" : "fr";

const inspectUrl = async (url) => {
  const parsed = new URL(url);
  if (parsed.origin !== canonicalOrigin) fail(`Origine non canonique dans le sitemap: ${url}`);
  if (parsed.search || /^\/(admin|training|login|forgot-password|reset-password|accept-invitation|mock-exam)(?:\/|$)/.test(parsed.pathname)) {
    fail(`Route protégée, transactionnelle ou paramétrée présente dans le sitemap: ${parsed.pathname}${parsed.search}`);
  }

  const { response, body } = await text(`${baseUrl}${parsed.pathname}`);
  const canonical = body.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const robots = body.match(/<meta name="robots" content="([^"]+)"/i)?.[1] || "";
  const title = body.match(/<title>([^<]+)<\/title>/i)?.[1] || "";
  const description = body.match(/<meta name="description" content="([^"]+)"/i)?.[1] || "";
  const keywords = body.match(/<meta name="keywords" content="([^"]+)"/i)?.[1] || "";
  const h1Count = (body.match(/<h1(?:\s|>)/gi) || []).length;
  const h2Count = (body.match(/<h2(?:\s|>)/gi) || []).length;
  const passed = response.status === 200
    && /text\/html/i.test(response.headers.get("content-type") || "")
    && canonical === url
    && /index, follow/i.test(robots)
    && !/noindex/i.test(robots)
    && Boolean(title && description && keywords)
    && h1Count === 1
    && h2Count >= 1;
  const result = { url, type: classify(parsed.pathname), language: language(parsed.pathname), status: response.status, canonical, robots, title, description, keywords, h1Count, h2Count, passed };
  if (!passed) fail(`URL sitemap invalide: ${url} (HTTP ${response.status}, canonical=${canonical}, robots=${robots}, title=${Boolean(title)}, description=${Boolean(description)}, keywords=${Boolean(keywords)}, h1=${h1Count}, h2=${h2Count})`);
  return result;
};

const inBatches = async (items, size, worker) => {
  const results = [];
  for (let index = 0; index < items.length; index += size) {
    results.push(...await Promise.all(items.slice(index, index + size).map(worker)));
  }
  return results;
};

try {
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const { response: sitemapResponse, body: sitemap } = await text(sitemapUrl);
  if (!sitemapResponse.ok) fail(`Sitemap indisponible: HTTP ${sitemapResponse.status}`);
  if (!/application\/xml|text\/xml/i.test(sitemapResponse.headers.get("content-type") || "")) fail("Le sitemap n’est pas servi en XML.");

  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
  if (!urls.length) fail("Le sitemap ne contient aucune URL.");
  if (new Set(urls).size !== urls.length) fail("Le sitemap contient des URL dupliquées.");

  const checks = await inBatches(urls, 12, inspectUrl);
  const distribution = checks.reduce((totals, check) => {
    totals.byType[check.type] = (totals.byType[check.type] || 0) + 1;
    totals.byLanguage[check.language] = (totals.byLanguage[check.language] || 0) + 1;
    return totals;
  }, { byType: {}, byLanguage: {} });

  mkdirSync(resolve(process.cwd(), "docs"), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify({ baseUrl, sitemapUrl, checkedAt: new Date().toISOString(), urlCount: urls.length, distribution, checks }, null, 2)}\n`);
  console.log(`Sitemap public validé : ${urls.length} URL(s) indexable(s) contrôlée(s). ${JSON.stringify(distribution)}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
