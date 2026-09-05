import { chromium } from "playwright-core";

const baseUrl = process.env.GA4_PUBLIC_URL || "https://akademy.neodev.click";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer", "--no-zygote"],
});

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const cspErrors = [];
  const googleRequests = [];

  page.on("console", (message) => {
    if (message.type() === "error" && /content security policy|googletagmanager|google-analytics/i.test(message.text())) {
      cspErrors.push(message.text().slice(0, 240));
    }
  });
  page.on("request", (request) => {
    const hostname = new URL(request.url()).hostname;
    if (["www.googletagmanager.com", "www.google-analytics.com", "region1.google-analytics.com"].includes(hostname)) {
      googleRequests.push(hostname);
    }
  });

  await page.goto(`${baseUrl}/?ga4-consent-qa=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2_000);
  const scriptsBeforeConsent = await page.locator('script[src*="www.googletagmanager.com"]').count();
  if (scriptsBeforeConsent !== 0) throw new Error("GA4 chargé avant consentement.");

  await page.getByRole("button", { name: "Accepter" }).click();
  await page.waitForFunction(() => {
    const layer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    return typeof window.gtag === "function" && layer.some((entry) => Array.isArray(entry) && entry[0] === "event" && entry[1] === "page_view");
  }, { timeout: 15_000 });
  await page.waitForTimeout(2_000);

  const scriptsAfterConsent = await page.locator('script[src*="www.googletagmanager.com"]').count();
  const result = {
    scriptsBeforeConsent,
    scriptsAfterConsent,
    gtagReady: await page.evaluate(() => typeof window.gtag === "function"),
    pageViewQueued: await page.evaluate(() => Array.isArray(window.dataLayer) && window.dataLayer.some((entry) => Array.isArray(entry) && entry[0] === "event" && entry[1] === "page_view")),
    googleScriptRequested: googleRequests.includes("www.googletagmanager.com"),
    googleCollectionRequested: googleRequests.some((hostname) => hostname === "www.google-analytics.com" || hostname === "region1.google-analytics.com"),
    cspErrorCount: cspErrors.length,
  };

  if (result.scriptsAfterConsent !== 1 || !result.gtagReady || !result.pageViewQueued || !result.googleScriptRequested || result.cspErrorCount !== 0) {
    throw new Error(`GA4 production consent QA failed: ${JSON.stringify(result)}`);
  }
  console.log(JSON.stringify(result));
  await context.close();
} finally {
  await browser.close();
}
