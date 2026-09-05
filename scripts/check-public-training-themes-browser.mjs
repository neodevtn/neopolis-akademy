import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const root = process.cwd();
const baseUrl = (process.env.PUBLIC_TRAINING_THEMES_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputPath = path.join(root, "docs", "public-training-themes-browser-qa.json");
const openGraphImage = "https://akademy.neodev.click/manus-storage/og-neopolis-akademy-1200x630_eef162a5.png";
const xImage = "https://akademy.neodev.click/manus-storage/x-neopolis-akademy-1200x675_28f812f5.png";
const routes = [
  { path: "/formations-ia", locale: "fr-FR", direction: "ltr", expectedTitle: "Formations IA gratuites par métier | Neopolis Akademy", expectedText: "Choisir une formation IA par grand domaine métier" },
  { path: "/formations-ia/comptabilite-finance", locale: "fr-FR", direction: "ltr", expectedTitle: "Formation IA comptabilité et finance | Neopolis", expectedText: "Cas d’usage professionnels dans les formations associées" },
  { path: "/en/ai-training", locale: "en", direction: "ltr", expectedTitle: "Free AI training by profession | Neopolis Akademy", expectedText: "Choose AI training by broad professional domain" },
  { path: "/en/ai-training/comptabilite-finance", locale: "en", direction: "ltr", expectedTitle: "AI training for accounting and finance | Neopolis", expectedText: "Professional use cases in associated training" },
  { path: "/ar/ai-training", locale: "ar", direction: "rtl", expectedTitle: "تدريب مجاني في الذكاء الاصطناعي حسب المهنة | Neopolis Akademy", expectedText: "اختر تدريب الذكاء الاصطناعي حسب المجال المهني الرئيسي" },
  { path: "/ar/ai-training/comptabilite-finance", locale: "ar", direction: "rtl", expectedTitle: "تدريب الذكاء الاصطناعي للمحاسبة والمالية | نيوبوليس", expectedText: "حالات استخدام مهنية في الدورات المرتبطة" },
];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer", "--no-zygote"],
});

const results = [];
try {
  for (const viewport of [{ width: 1280, height: 720 }, { width: 390, height: 844 }, { width: 375, height: 667 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    page.setDefaultTimeout(20_000);
    for (const route of routes) {
      const response = await page.goto(`${baseUrl}${route.path}`, { waitUntil: "domcontentloaded" });
      const layout = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        title: document.title,
        text: document.body.innerText,
        lang: document.documentElement.lang,
        direction: document.documentElement.dir,
      }));
      const rawHtml = await (await context.request.get(`${baseUrl}${route.path}`)).text();
      const keywordMatch = rawHtml.match(/<meta name="keywords" content="([^"]+)"/);
      const keywordCount = keywordMatch?.[1].split(",").map((keyword) => keyword.trim()).filter(Boolean).length || 0;
      const overflow = layout.scrollWidth > layout.clientWidth + 2;
      results.push({
        path: route.path,
        viewport,
        status: response?.status() || 0,
        titleMatches: layout.title === route.expectedTitle,
        expectedTextVisible: layout.text.includes(route.expectedText),
        languageMatches: layout.lang === route.locale,
        directionMatches: layout.direction === route.direction,
        canonicalPresent: rawHtml.includes(`<link rel="canonical" href="https://akademy.neodev.click${route.path}"`),
        hreflangPresent: rawHtml.includes('hreflang="fr-FR"') && rawHtml.includes('hreflang="en"') && rawHtml.includes('hreflang="ar"') && rawHtml.includes('hreflang="x-default"'),
        openGraphPresent: rawHtml.includes('<meta property="og:title"'),
        openGraphImagePresent: rawHtml.includes(`<meta property="og:image" content="${openGraphImage}"`) && rawHtml.includes(`<meta property="og:image:secure_url" content="${openGraphImage}"`) && rawHtml.includes('<meta property="og:image:type" content="image/png"') && rawHtml.includes('<meta property="og:image:width" content="1200"') && rawHtml.includes('<meta property="og:image:height" content="630"'),
        xImagePresent: rawHtml.includes('<meta name="twitter:card" content="summary_large_image"') && rawHtml.includes(`<meta name="twitter:image" content="${xImage}"`),
        structuredDataPresent: rawHtml.includes('application/ld+json'),
        keywordCount,
        keywordsPresent: keywordCount >= 3 && keywordCount <= 8,
        clientWidth: layout.clientWidth,
        scrollWidth: layout.scrollWidth,
        overflow,
      });
    }
    await context.close();
  }

  const notFoundChecks = await Promise.all(["/formations-ia/theme-introuvable", "/en/ai-training/theme-introuvable", "/ar/ai-training/theme-introuvable"].map(async (path) => {
    const response = await fetch(`${baseUrl}${path}`);
    const html = await response.text();
    return { path, status: response.status, noindex: html.includes('name="robots" content="noindex, follow"') };
  }));
  const legacyRedirects = await Promise.all(["fr", "en", "ar"].map(async (locale) => {
    const root = locale === "fr" ? "/formations-ia" : `/${locale}/ai-training`;
    const response = await fetch(`${baseUrl}${root}/finance-comptabilite-controle-gestion`, { redirect: "manual" });
    return { locale, status: response.status, location: response.headers.get("location") };
  }));
  const sitemapIndex = await (await fetch(`${baseUrl}/sitemap.xml`)).text();
  const sitemapPaths = [...sitemapIndex.matchAll(/<loc>https:\/\/akademy\.neodev\.click([^<]+)<\/loc>/g)].map((match) => match[1]);
  const sitemap = (await Promise.all(sitemapPaths.map(async (sitemapPath) => (await fetch(`${baseUrl}${sitemapPath}`)).text()))).join("\n");
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    results,
    notFound: notFoundChecks,
    legacyRedirects,
    sitemap: { fileCount: sitemapPaths.length, hasFrenchIndex: sitemap.includes(`${"https://akademy.neodev.click"}/formations-ia`), hasEnglishIndex: sitemap.includes(`${"https://akademy.neodev.click"}/en/ai-training`), hasArabicIndex: sitemap.includes(`${"https://akademy.neodev.click"}/ar/ai-training`), hasFinanceDomain: sitemap.includes("comptabilite-finance"), hasAlternates: sitemap.includes("xhtml:link") && sitemap.includes('hreflang="ar"') },
    passed: results.every((result) => result.status === 200 && result.titleMatches && result.expectedTextVisible && result.languageMatches && result.directionMatches && result.canonicalPresent && result.hreflangPresent && result.openGraphPresent && result.openGraphImagePresent && result.xImagePresent && result.structuredDataPresent && result.keywordsPresent && !result.overflow)
      && notFoundChecks.every((result) => result.status === 404 && result.noindex)
      && legacyRedirects.every((result) => result.status === 301 && result.location?.endsWith("/comptabilite-finance"))
      && sitemapPaths.length > 1 && sitemap.includes(`${"https://akademy.neodev.click"}/formations-ia`) && sitemap.includes(`${"https://akademy.neodev.click"}/en/ai-training`) && sitemap.includes(`${"https://akademy.neodev.click"}/ar/ai-training`) && sitemap.includes("comptabilite-finance") && sitemap.includes("xhtml:link") && sitemap.includes('hreflang="ar"'),
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
} finally {
  await browser.close();
}
