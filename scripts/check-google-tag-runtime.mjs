import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-zygote"],
});

try {
  const publicResponse = await fetch("https://akademy.neodev.click/");
  const publicCsp = publicResponse.headers.get("content-security-policy") || "";
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests = [];
  page.on("request", (request) => {
    try {
      const host = new URL(request.url()).hostname;
      if (host.includes("google")) requests.push(host);
    } catch { /* URL non exploitable */ }
  });

  const html = `<!doctype html><html><head><script src="https://csp-test.local/setup.js"></script></head><body></body></html>`;
  const setupScript = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied' });
    gtag('js', new Date());
    gtag('config', 'G-ZPHNKHDHS6', { send_page_view: false });
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
    await route.fulfill({ status: 200, contentType: "text/html", headers: { "content-security-policy": publicCsp }, body: html });
  });
  await page.goto("https://csp-test.local/", { waitUntil: "load" });
  await page.waitForTimeout(8_000);

  const result = await page.evaluate(() => ({
    dataLayerPushPatched: typeof window.dataLayer?.push === "function" && !String(window.dataLayer.push).includes("[native code]"),
    googleTagManagerObject: Boolean(window.google_tag_manager),
    googleTagDataObject: Boolean(window.google_tag_data),
  }));
  console.log(JSON.stringify({ ...result, publicCspPresent: Boolean(publicCsp), googleRequestHosts: [...new Set(requests)].sort() }));
  await context.close();
} finally {
  await browser.close();
}
