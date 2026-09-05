import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-zygote"],
});

try {
  const publicResponse = await fetch("https://akademy.neodev.click/");
  const publicCsp = publicResponse.headers.get("content-security-policy") || "";
  const replicatedSecurityHeaders = Object.fromEntries([...publicResponse.headers.entries()].filter(([name]) =>
    name === "content-security-policy" || name.startsWith("cross-origin-") || name === "origin-agent-cluster" || name === "permissions-policy" || name === "referrer-policy"
  ));
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests = [];
  page.on("request", (request) => {
    try {
      const url = new URL(request.url());
      if (url.hostname.includes("google")) requests.push(`${url.hostname}${url.pathname}`);
    } catch { /* URL non exploitable */ }
  });

  const html = `<!doctype html><html><head><script src="https://csp-test.local/setup.js"></script></head><body></body></html>`;
  const setupScript = `
    'use strict';
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(command, target, params){
      const activeDataLayer = window.dataLayer;
      activeDataLayer.push(arguments);
    };
    const gtag = window.gtag;
    gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('js', new Date());
    gtag('config', 'G-ZPHNKHDHS6', { send_page_view: false, anonymize_ip: true });
    gtag('event', 'page_view', { page_title: 'Consent QA', page_location: 'https://csp-test.local/', page_path: '/' });
    const googleScript = document.createElement('script');
    googleScript.async = true;
    googleScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-ZPHNKHDHS6';
    document.head.appendChild(googleScript);
  `;
  await page.route("https://csp-test.local/**", async (route) => {
    if (route.request().url().endsWith("/setup.js")) {
      await route.fulfill({ status: 200, contentType: "application/javascript", body: setupScript });
      return;
    }
    await route.fulfill({ status: 200, contentType: "text/html", headers: replicatedSecurityHeaders, body: html });
  });
  await page.goto("https://csp-test.local/", { waitUntil: "load" });
  await page.waitForTimeout(8_000);

  const destinationState = await page.evaluate(async () => await new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    (function pushGtagGet() { window.dataLayer.push(arguments); })("get", "G-ZPHNKHDHS6", "client_id", (value) => finish({ callbackInvoked: true, valuePresent: Boolean(value) }));
    setTimeout(() => finish({ callbackInvoked: false, valuePresent: false }), 5_000);
  }));

  const result = await page.evaluate(() => ({
    dataLayerPushPatched: typeof window.dataLayer?.push === "function" && !String(window.dataLayer.push).includes("[native code]"),
    googleTagManagerObject: Boolean(window.google_tag_manager),
    googleTagDataObject: Boolean(window.google_tag_data),
    expectedDestinationPresent: Boolean(window.google_tag_manager && Object.prototype.hasOwnProperty.call(window.google_tag_manager, "G-ZPHNKHDHS6")),
  }));
  console.log(JSON.stringify({ ...result, ...destinationState, publicCspPresent: Boolean(publicCsp), replicatedSecurityHeaderCount: Object.keys(replicatedSecurityHeaders).length, googleRequestPaths: [...new Set(requests)].sort() }));
  await context.close();
} finally {
  await browser.close();
}
