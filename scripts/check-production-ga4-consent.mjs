import { chromium } from "playwright-core";

const baseUrl = process.env.GA4_PUBLIC_URL || "https://akademy.neodev.click";
const cacheBuster = Date.now();
const googleTagHostnames = new Set(["www.googletagmanager.com"]);
const isGoogleCollectionHostname = (hostname) =>
  hostname === "analytics.google.com" || hostname.endsWith(".google-analytics.com") || hostname.endsWith(".analytics.google.com");
const isGtagEvent = (entry, eventName) => Array.from(entry || []).slice(0, 2).every((value, index) => ["event", eventName][index] === value);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer", "--no-zygote"],
});

try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: "fr-FR",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  });
  // La sonde vérifie la collecte du site, pas la politique de filtrage des
  // navigateurs de test par Google. Présenter le contexte comme un navigateur
  // standard évite un faux négatif propre au runtime automatisé.
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { configurable: true, get: () => undefined });
  });
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
    if (googleTagHostnames.has(hostname) || isGoogleCollectionHostname(hostname)) {
      googleRequests.push({ hostname, resourceType: request.resourceType() });
    }
  });
  page.on("response", (response) => {
    const hostname = new URL(response.url()).hostname;
    if (googleTagHostnames.has(hostname)) {
      googleTagResponses.push(response.status());
    }
    if (isGoogleCollectionHostname(hostname)) {
      googleResponses.push({ hostname, status: response.status() });
    }
  });
  page.on("requestfailed", (request) => {
    const hostname = new URL(request.url()).hostname;
    if (isGoogleCollectionHostname(hostname)) {
      googleRequestFailures.push({ hostname, error: request.failure()?.errorText || "unknown" });
    }
  });

  await page.goto(`${baseUrl}/?ga4-consent-qa=${cacheBuster}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2_000);
  const scriptsBeforeConsent = await page.locator('script[src*="www.googletagmanager.com"]').count();
  const deniedByDefault = await page.evaluate(() => Array.isArray(window.dataLayer) && window.dataLayer.some((entry) => {
    const values = Array.from(entry || []);
    return values[0] === "consent" && values[1] === "default" && values[2]?.analytics_storage === "denied";
  }));
  if (scriptsBeforeConsent !== 1 || !deniedByDefault) throw new Error("Consent Mode avancé non initialisé avec stockage refusé par défaut.");

  await page.getByRole("button", { name: "Accepter" }).click();
  await page.waitForFunction(() => {
    const layer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    return typeof window.gtag === "function" && layer.some((entry) => Array.from(entry || []).slice(0, 2).join("|") === "event|page_view");
  }, { timeout: 15_000 });
  await page.waitForTimeout(5_000);

  // Une navigation distincte, toujours avec le consentement conservé, vérifie que
  // la collecte ne dépend pas seulement de l'initialisation de l'accueil.
  await page.goto(`${baseUrl}/ai-news?ga4-consent-qa=${cacheBuster}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5_000);

  const destinationState = await page.evaluate(async () => await new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    if (!Array.isArray(window.dataLayer)) return finish({ callbackInvoked: false, valuePresent: false });
    (function pushGtagGet() { window.dataLayer.push(arguments); })("get", "G-ZPHNKHDHS6", "client_id", (value) => finish({ callbackInvoked: true, valuePresent: Boolean(value) }));
    setTimeout(() => finish({ callbackInvoked: false, valuePresent: false }), 5_000);
  }));

  const scriptsAfterConsent = await page.locator('script[src*="www.googletagmanager.com"]').count();
  const result = {
    scriptsBeforeConsent,
    scriptsAfterConsent,
    deniedByDefault,
    grantedAfterChoice: await page.evaluate(() => Array.isArray(window.dataLayer) && window.dataLayer.some((entry) => {
      const values = Array.from(entry || []);
      return values[0] === "consent" && values[1] === "update" && values[2]?.analytics_storage === "granted";
    })),
    gtagReady: await page.evaluate(() => typeof window.gtag === "function"),
    pageViewQueued: await page.evaluate(() => Array.isArray(window.dataLayer) && window.dataLayer.some((entry) => Array.from(entry || []).slice(0, 2).join("|") === "event|page_view")),
    googleScriptRequested: googleRequests.some((request) => googleTagHostnames.has(request.hostname)),
    googleCollectionRequested: googleRequests.some((request) => isGoogleCollectionHostname(request.hostname)),
    googleCollectionResponseSuccess: googleResponses.some((response) => response.status >= 200 && response.status < 400),
    googleCollectionFailureCount: googleRequestFailures.length,
    googleTagResponseSuccess: googleTagResponses.some((status) => status >= 200 && status < 400),
    googleRuntimeLoaded: await page.evaluate(() => Boolean(window.google_tag_manager)),
    dataLayerUsesArguments: await page.evaluate(() => Array.isArray(window.dataLayer) && window.dataLayer.every((entry) => !Array.isArray(entry))),
    dataLayerPushPatched: await page.evaluate(() => typeof window.dataLayer?.push === "function" && !String(window.dataLayer.push).includes("[native code]")),
    runtimeObjectsPresent: await page.evaluate(() => Boolean(window.google_tag_manager) && Boolean(window.google_tag_data)),
    expectedDestinationPresent: await page.evaluate(() => Boolean(window.google_tag_manager && Object.prototype.hasOwnProperty.call(window.google_tag_manager, "G-ZPHNKHDHS6"))),
    destinationCallbackInvoked: destinationState.callbackInvoked,
    destinationValuePresent: destinationState.valuePresent,
    queuedCommandOrder: await page.evaluate(() => Array.isArray(window.dataLayer) ? window.dataLayer.slice(0, 8).map((entry) => {
      const values = Array.from(entry || []);
      return [typeof values[0] === "string" ? values[0] : "unknown", typeof values[1] === "string" ? values[1] : (values[1] instanceof Date ? "date" : "value")];
    }) : []),
    googleRelatedRequestTypes: [...new Set(googleRelatedRequests.map((request) => `${request.hostname}:${request.resourceType}`))].sort(),
    cspErrorCount: cspErrors.length,
  };

  console.log(JSON.stringify(result));
  if (result.scriptsBeforeConsent !== 1 || result.scriptsAfterConsent !== 1 || !result.deniedByDefault || !result.grantedAfterChoice || !result.gtagReady || !result.pageViewQueued || !result.googleScriptRequested || !result.dataLayerPushPatched || !result.runtimeObjectsPresent || !result.expectedDestinationPresent || !result.destinationCallbackInvoked || !result.destinationValuePresent || !result.googleCollectionRequested || !result.googleCollectionResponseSuccess || result.googleCollectionFailureCount !== 0 || result.cspErrorCount !== 0) {
    throw new Error(`GA4 production consent QA failed: ${JSON.stringify(result)}`);
  }
  await context.close();
} finally {
  await browser.close();
}
