import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const root = process.cwd();
const baseUrl = (process.env.PUBLIC_TRAINING_THEMES_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputPath = path.join(root, "docs", "public-training-themes-browser-qa.json");
const routes = [
  { path: "/formations-ia", locale: "fr-FR", direction: "ltr", expectedTitle: "Formations IA gratuites par métier", expectedText: "Choisir une formation IA par métier" },
  { path: "/formations-ia/finance-comptabilite-controle-gestion", locale: "fr-FR", direction: "ltr", expectedTitle: "Formations IA gratuites pour la finance, la comptabilité et le contrôle de gestion", expectedText: "Répartition des activités par formation" },
  { path: "/en/ai-training", locale: "en", direction: "ltr", expectedTitle: "Free AI training by profession", expectedText: "Choose AI training by profession" },
  { path: "/en/ai-training/finance-comptabilite-controle-gestion", locale: "en", direction: "ltr", expectedTitle: "Free AI trainings for finance, accounting, and management control", expectedText: "Activities by training programme" },
  { path: "/ar/ai-training", locale: "ar", direction: "rtl", expectedTitle: "تدريب مجاني في الذكاء الاصطناعي حسب المهنة", expectedText: "اختر تدريب الذكاء الاصطناعي حسب المهنة" },
  { path: "/ar/ai-training/finance-comptabilite-controle-gestion", locale: "ar", direction: "rtl", expectedTitle: "دورات مجانية في الذكاء الاصطناعي للمالية والمحاسبة ومراقبة التكاليف", expectedText: "توزيع الأنشطة حسب البرنامج التدريبي" },
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
      const overflow = layout.scrollWidth > layout.clientWidth + 2;
      results.push({
        path: route.path,
        viewport,
        status: response?.status() || 0,
        titleMatches: layout.title === `${route.expectedTitle} | Neopolis Akademy`,
        expectedTextVisible: layout.text.includes(route.expectedText),
        languageMatches: layout.lang === route.locale,
        directionMatches: layout.direction === route.direction,
        canonicalPresent: rawHtml.includes(`<link rel="canonical" href="https://akademy.neodev.click${route.path}"`),
        hreflangPresent: rawHtml.includes('hreflang="fr-FR"') && rawHtml.includes('hreflang="en"') && rawHtml.includes('hreflang="ar"') && rawHtml.includes('hreflang="x-default"'),
        openGraphPresent: rawHtml.includes('<meta property="og:title"'),
        structuredDataPresent: rawHtml.includes('application/ld+json'),
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
  const sitemap = await (await fetch(`${baseUrl}/sitemap.xml`)).text();
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    results,
    notFound: notFoundChecks,
    sitemap: { hasFrenchIndex: sitemap.includes(`${"https://akademy.neodev.click"}/formations-ia`), hasEnglishIndex: sitemap.includes(`${"https://akademy.neodev.click"}/en/ai-training`), hasArabicIndex: sitemap.includes(`${"https://akademy.neodev.click"}/ar/ai-training`), hasFinanceTheme: sitemap.includes("finance-comptabilite-controle-gestion"), hasAlternates: sitemap.includes("xhtml:link") && sitemap.includes('hreflang="ar"') },
    passed: results.every((result) => result.status === 200 && result.titleMatches && result.expectedTextVisible && result.languageMatches && result.directionMatches && result.canonicalPresent && result.hreflangPresent && result.openGraphPresent && result.structuredDataPresent && !result.overflow)
      && notFoundChecks.every((result) => result.status === 404 && result.noindex)
      && sitemap.includes(`${"https://akademy.neodev.click"}/formations-ia`) && sitemap.includes(`${"https://akademy.neodev.click"}/en/ai-training`) && sitemap.includes(`${"https://akademy.neodev.click"}/ar/ai-training`) && sitemap.includes("finance-comptabilite-controle-gestion") && sitemap.includes("xhtml:link") && sitemap.includes('hreflang="ar"'),
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
} finally {
  await browser.close();
}
