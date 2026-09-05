import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const baseUrl = (process.env.PUBLIC_SITEMAP_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const canonicalOrigin = "https://akademy.neodev.click";
const reportPath = resolve(process.cwd(), "docs", "public_sitemap_qa.json");

const fail = (message) => {
  throw new Error(message);
};

const text = async (url, headers = {}) => {
  const response = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
    headers: { "x-neopolis-qa-probe": "1", ...headers },
  });
  return { response, body: await response.text() };
};

const googleUserAgents = {
  desktop: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  smartphone: "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
};

const assertXmlResponse = (response, body, label, rootElement) => {
  if (response.status !== 200) fail(`${label}: HTTP ${response.status}`);
  if (response.headers.get("location")) fail(`${label}: redirection inattendue`);
  if (response.headers.get("set-cookie")) fail(`${label}: cookie inattendu`);
  if ((response.headers.get("content-type") || "").toLowerCase() !== "application/xml; charset=utf-8") fail(`${label}: Content-Type XML invalide`);
  if (!body.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) fail(`${label}: déclaration XML UTF-8 absente`);
  if (!new RegExp(`<${rootElement}(?:\\s|>)`).test(body) || !body.endsWith(`</${rootElement}>`)) fail(`${label}: racine XML ${rootElement} invalide`);
  if (/<html(?:\s|>)/i.test(body)) fail(`${label}: repli HTML détecté`);
};

const locations = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());

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
  if (parsed.search || /^\/(admin|training|login|apply|forgot-password|reset-password|accept-invitation|mock-exam)(?:\/|$)/.test(parsed.pathname)) {
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
  const { response: sitemapResponse, body: sitemapIndex } = await text(sitemapUrl);
  assertXmlResponse(sitemapResponse, sitemapIndex, "Index sitemap", "sitemapindex");
  const sitemapFiles = locations(sitemapIndex);
  if (!sitemapFiles.length) fail("L’index sitemap ne contient aucun fichier.");
  if (new Set(sitemapFiles).size !== sitemapFiles.length) fail("L’index sitemap contient des fichiers dupliqués.");
  if (sitemapFiles.some((url) => !url.startsWith(`${canonicalOrigin}/sitemaps/`) || !url.endsWith(".xml"))) fail("L’index contient une URL de fichier non canonique.");

  const userAgentChecks = [];
  for (const [agent, userAgent] of Object.entries(googleUserAgents)) {
    const { response, body } = await text(sitemapUrl, { "user-agent": userAgent });
    assertXmlResponse(response, body, `Index sitemap (${agent})`, "sitemapindex");
    if (locations(body).join("\n") !== sitemapFiles.join("\n")) fail(`Index sitemap différent pour Googlebot ${agent}.`);
    for (const sitemapFile of sitemapFiles) {
      const sitemapPath = new URL(sitemapFile).pathname;
      const result = await text(`${baseUrl}${sitemapPath}`, { "user-agent": userAgent });
      assertXmlResponse(result.response, result.body, `${sitemapPath} (${agent})`, "urlset");
      userAgentChecks.push({ agent, path: sitemapPath, status: result.response.status, contentType: result.response.headers.get("content-type") });
    }
  }

  const files = [];
  const urls = [];
  for (const sitemapFile of sitemapFiles) {
    const sitemapPath = new URL(sitemapFile).pathname;
    const { response, body } = await text(`${baseUrl}${sitemapPath}`);
    assertXmlResponse(response, body, sitemapPath, "urlset");
    const fileUrls = locations(body);
    if (!fileUrls.length || fileUrls.length > 200) fail(`${sitemapPath}: ${fileUrls.length} URL(s), limite 1–200 non respectée.`);
    if ((body.match(/<url>/g) || []).length !== fileUrls.length) fail(`${sitemapPath}: structure <url>/<loc> incohérente.`);
    files.push({ path: sitemapPath, urlCount: fileUrls.length, status: response.status, contentType: response.headers.get("content-type") });
    urls.push(...fileUrls);
  }
  if (!urls.length) fail("Le sitemap ne contient aucune URL.");
  if (new Set(urls).size !== urls.length) fail("Le sitemap contient des URL dupliquées.");

  const checks = await inBatches(urls, 12, inspectUrl);
  const distribution = checks.reduce((totals, check) => {
    totals.byType[check.type] = (totals.byType[check.type] || 0) + 1;
    totals.byLanguage[check.language] = (totals.byLanguage[check.language] || 0) + 1;
    return totals;
  }, { byType: {}, byLanguage: {} });

  mkdirSync(resolve(process.cwd(), "docs"), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify({ baseUrl, sitemapUrl, checkedAt: new Date().toISOString(), fileCount: files.length, urlCount: urls.length, files, userAgentChecks, distribution, checks }, null, 2)}\n`);
  console.log(`Index sitemap public validé : ${files.length} fichier(s), ${urls.length} URL(s) indexable(s). ${JSON.stringify({ files, distribution })}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
