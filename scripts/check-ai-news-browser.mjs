import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const localBaseUrl = process.env.AI_NEWS_LOCAL_URL || "http://127.0.0.1:3000";
const publicBaseUrl = process.env.AI_NEWS_PUBLIC_URL || "https://akademy.neodev.click";
const outputFile = path.resolve("docs/ai-news-browser-qa.json");

const partialFeedPayload = [{
  result: {
    data: {
      json: {
        articles: [{
          id: "openai:partial-check",
          sourceId: "openai",
          sourceLabel: "OpenAI News",
          sourceCategory: "Annonces",
          title: "Article conservé malgré une source indisponible",
          excerpt: "La continuité de la lecture est vérifiée lorsque MarkTechPost ne répond pas.",
          url: "https://openai.com/news/",
          publishedAt: "2026-08-29T00:00:00.000Z",
          topics: ["Tests"],
        }],
        sources: [
          { id: "openai", label: "OpenAI News", feedUrl: "https://openai.com/news/rss.xml", category: "Annonces", description: "Annonces officielles.", status: "ok", articleCount: 1 },
          { id: "marktechpost", label: "MarkTechPost", feedUrl: "https://www.marktechpost.com/feed/", category: "Analyse", description: "Veille de publications.", status: "unavailable", articleCount: 0 },
        ],
        updatedAt: "2026-08-29T00:00:00.000Z",
        stale: false,
      },
    },
  },
}];

async function viewportMetrics(page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
  }));
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer", "--no-zygote"],
});
try {
  const partialContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const partialPage = await partialContext.newPage();
  const aiNewsRequests = [];
  partialPage.on("request", (request) => {
    if (request.url().includes("aiNews")) aiNewsRequests.push(request.url());
  });
  await partialPage.route("**/api/trpc/**", (route) => {
    if (!route.request().url().includes("aiNews.getFeed")) return route.continue();
    const procedures = route.request().url().split("/api/trpc/")[1]?.split("?")[0].split(",") || [];
    const body = procedures.map((procedure) => procedure === "aiNews.getFeed"
      ? partialFeedPayload[0]
      : { result: { data: { json: null } } });
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
  await partialPage.goto(`${localBaseUrl}/ai-news`, { waitUntil: "networkidle" });
  await partialPage.waitForTimeout(500);
  const partialBody = await partialPage.locator("body").innerText();
  if (!partialBody.includes("temporairement indisponible")) {
    throw new Error(`Le scénario de source partielle n’a pas été rendu. Requêtes: ${aiNewsRequests.join(", ") || "aucune"}. Contenu: ${partialBody.slice(0, 300)}`);
  }
  const partialArticleVisible = await partialPage.getByRole("link", { name: /Article conservé malgré une source indisponible/ }).first().isVisible();
  const partialWarningVisible = partialBody.includes("temporairement indisponible");
  await partialContext.close();

  const publicContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const publicPage = await publicContext.newPage();
  await publicPage.goto(`${publicBaseUrl}/ai-news?qa=mobile`, { waitUntil: "domcontentloaded" });
  await publicPage.getByRole("textbox", { name: "Rechercher dans AI News" }).waitFor();
  await publicPage.getByText(/résultat.*affiché/).waitFor({ timeout: 20_000 });
  await publicPage.getByRole("textbox", { name: "Rechercher dans AI News" }).fill("Cursor");
  await publicPage.locator("select").first().selectOption("openai");
  await publicPage.getByText("1 résultat affiché").waitFor({ timeout: 10_000 });
  const publicMetrics = await viewportMetrics(publicPage);
  const publicResultVisible = await publicPage.getByRole("link", { name: /Cursor following its acquisition/ }).first().isVisible();
  await publicPage.screenshot({ path: "docs/ai-news-public-mobile-qa.png", fullPage: true });
  await publicContext.close();

  const result = {
    generatedAt: new Date().toISOString(),
    partialFeed: { warningVisible: partialWarningVisible, articleVisible: partialArticleVisible },
    publicMobile: { resultVisible: publicResultVisible, ...publicMetrics },
  };
  if (!partialWarningVisible || !partialArticleVisible || !publicResultVisible || publicMetrics.overflow) {
    throw new Error(`AI News browser QA failed: ${JSON.stringify(result)}`);
  }
  await fs.writeFile(outputFile, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
