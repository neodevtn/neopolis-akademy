import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const root = process.cwd();
const baseUrl = (process.env.PUBLIC_TRAINING_THEMES_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputPath = path.join(root, "docs", "public-training-themes-browser-qa.json");
const routes = [
  { path: "/formations-ia", expectedTitle: "Formations IA gratuites par métier", expectedText: "Choisir une formation IA par métier" },
  { path: "/formations-ia/finance-comptabilite-controle-gestion", expectedTitle: "Formations IA gratuites pour la finance, la comptabilité et le contrôle de gestion", expectedText: "Répartition des activités par formation" },
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
      }));
      const rawHtml = await (await context.request.get(`${baseUrl}${route.path}`)).text();
      const overflow = layout.scrollWidth > layout.clientWidth + 2;
      results.push({
        path: route.path,
        viewport,
        status: response?.status() || 0,
        titleMatches: layout.title === `${route.expectedTitle} | Neopolis Akademy`,
        expectedTextVisible: layout.text.includes(route.expectedText),
        canonicalPresent: rawHtml.includes(`<link rel="canonical" href="https://akademy.neodev.click${route.path}"`),
        openGraphPresent: rawHtml.includes('<meta property="og:title"'),
        structuredDataPresent: rawHtml.includes('application/ld+json'),
        clientWidth: layout.clientWidth,
        scrollWidth: layout.scrollWidth,
        overflow,
      });
    }
    await context.close();
  }

  const notFound = await (await fetch(`${baseUrl}/formations-ia/theme-introuvable`)).text();
  const notFoundStatus = await fetch(`${baseUrl}/formations-ia/theme-introuvable`).then((response) => response.status);
  const sitemap = await (await fetch(`${baseUrl}/sitemap.xml`)).text();
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    results,
    notFound: { status: notFoundStatus, noindex: notFound.includes('name="robots" content="noindex, follow"') },
    sitemap: { hasIndex: sitemap.includes(`${"https://akademy.neodev.click"}/formations-ia`), hasFinanceTheme: sitemap.includes("finance-comptabilite-controle-gestion") },
    passed: results.every((result) => result.status === 200 && result.titleMatches && result.expectedTextVisible && result.canonicalPresent && result.openGraphPresent && result.structuredDataPresent && !result.overflow)
      && notFoundStatus === 404 && notFound.includes('name="robots" content="noindex, follow"')
      && sitemap.includes(`${"https://akademy.neodev.click"}/formations-ia`) && sitemap.includes("finance-comptabilite-controle-gestion"),
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
} finally {
  await browser.close();
}
