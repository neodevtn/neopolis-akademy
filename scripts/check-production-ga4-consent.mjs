import { chromium } from "playwright-core";

const baseUrl = process.env.GA4_PUBLIC_URL || "https://akademy.neodev.click";
const googleTagHostnames = new Set(["www.googletagmanager.com"]);
const googleCollectionHostnames = new Set(["www.google-analytics.com", "region1.google-analytics.com", "analytics.google.com"]);
const googleTelemetryHostnames = new Set([...googleTagHostnames, ...googleCollectionHostnames]);
const isGtagEvent = (entry, eventName) => Array.from(entry || []).slice(0, 2).every((value, index) => ["event", eventName][index] === value);
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
  const googleResponses = [];
  const googleRequestFailures = [];
  const googleRelatedRequests = [];
  const googleTagResponses = [];

  page.on("console", (message) => {
    if (message.type() === "error" && /content security policy|googletagmanager|google-analytics/i.test(message.text())) {
      cspErrors.push(message.text().slice(0, 240));
    }
  });
  page.on("request", (request) => {
    const hostname = new URL(request.url()).hostname;
    if (hostname.includes("google")) {
      googleRelatedRequests.push({ hostname, resourceType: request.resourceType() });
    }
    if (googleTelemetryHostnames.has(hostname)) {
      googleRequests.push({ hostname, resourceType: request.resourceType() });
    }
  });
  page.on("response", (response) => {
    const hostname = new URL(response.url()).hostname;
    if (googleTagHostnames.has(hostname)) {
      googleTagResponses.push(response.status());
    }
    if (googleCollectionHostnames.has(hostname)) {
      googleResponses.push({ hostname, status: response.status() });
    }
  });
  page.on("requestfailed", (request) => {
    const hostname = new URL(request.url()).hostname;
    if (googleCollectionHostnames.has(hostname)) {
      googleRequestFailures.push({ hostname, error: request.failure()?.errorText || "unknown" });
    }
  });

  await page.goto(`${baseUrl}/?ga4-consent-qa=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2_000);
  const scriptsBeforeConsent = await page.locator('script[src*="www.googletagmanager.com"]').count();
  if (scriptsBeforeConsent !== 0) throw new Error("GA4 chargé avant consentement.");

  await page.getByRole("button", { name: "Accepter" }).click();
  await page.waitForFunction(() => {
    const layer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    return typeof window.gtag === "function" && layer.some((entry) => Array.from(entry || []).slice(0, 2).join("|") === "event|page_view");
  }, { timeout: 15_000 });
  await page.waitForTimeout(5_000);

  // Une navigation distincte, toujours avec le consentement conservé, vérifie que
  // la collecte ne dépend pas seulement de l'initialisation de l'accueil.
  await page.goto(`${baseUrl}/ai-news?ga4-consent-qa=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5_000);

  const scriptsAfterConsent = await page.locator('script[src*="www.googletagmanager.com"]').count();
  const result = {
    scriptsBeforeConsent,
    scriptsAfterConsent,
    gtagReady: await page.evaluate(() => typeof window.gtag === "function"),
    pageViewQueued: await page.evaluate(() => Array.isArray(window.dataLayer) && window.dataLayer.some((entry) => Array.from(entry || []).slice(0, 2).join("|") === "event|page_view")),
    googleScriptRequested: googleRequests.some((request) => googleTagHostnames.has(request.hostname)),
    googleCollectionRequested: googleRequests.some((request) => googleCollectionHostnames.has(request.hostname)),
    googleCollectionResponseSuccess: googleResponses.some((response) => response.status >= 200 && response.status < 400),
    googleCollectionFailureCount: googleRequestFailures.length,
    googleTagResponseSuccess: googleTagResponses.some((status) => status >= 200 && status < 400),
    googleRuntimeLoaded: await page.evaluate(() => Boolean(window.google_tag_manager)),
    dataLayerUsesArguments: await page.evaluate(() => Array.isArray(window.dataLayer) && window.dataLayer.every((entry) => !Array.isArray(entry))),
    googleRelatedRequestTypes: [...new Set(googleRelatedRequests.map((request) => `${request.hostname}:${request.resourceType}`))].sort(),
    cspErrorCount: cspErrors.length,
  };

  console.log(JSON.stringify(result));
  if (result.scriptsAfterConsent !== 1 || !result.gtagReady || !result.pageViewQueued || !result.googleScriptRequested || !result.googleCollectionRequested || !result.googleCollectionResponseSuccess || result.googleCollectionFailureCount !== 0 || result.cspErrorCount !== 0) {
    throw new Error(`GA4 production consent QA failed: ${JSON.stringify(result)}`);
  }
  await context.close();
} finally {
  await browser.close();
}
