import { chromium } from "playwright-core";

const baseUrl = process.env.COOKIE_PUBLIC_URL || "https://akademy.neodev.click";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-zygote"],
});

try {
  // Un nouveau contexte Playwright équivaut à un profil privé temporaire :
  // aucun cookie, cache, localStorage ou sessionStorage n’est réutilisé.
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, locale: "fr-FR" });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequestHosts = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text().slice(0, 240));
  });
  page.on("pageerror", (error) => pageErrors.push(error.message.slice(0, 240)));
  page.on("requestfailed", (request) => {
    try { failedRequestHosts.push(new URL(request.url()).hostname); } catch { /* URL non exploitable */ }
  });

  await page.goto(`${baseUrl}/?cookie-consent-private-qa=1`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => (document.getElementById("root")?.childElementCount || 0) > 0, { timeout: 15_000 });
  const renderedAt = Date.now();
  const initialState = await page.evaluate(() => ({
    consent: localStorage.getItem("neopolis_cookie_consent"),
    localStorageSize: localStorage.length,
    sessionStorageSize: sessionStorage.length,
  }));

  const acceptButton = page.getByRole("button", { name: "Accepter", exact: true });
  let bannerVisible = false;
  try {
    await expectVisible(acceptButton, 2_500);
    bannerVisible = true;
  } catch {
    bannerVisible = false;
  }
  const buttonBox = bannerVisible ? await acceptButton.boundingBox() : null;
  const importantDialogCountBeforeChoice = await page.getByRole("dialog").count();
  await page.screenshot({ path: "/tmp/neopolis-cookie-consent-private.png", fullPage: false });

  const result = {
    unauthenticatedCookieCount: (await context.cookies()).length,
    initialConsentIsEmpty: initialState.consent === null,
    bannerVisible,
    bannerInsideViewport: Boolean(buttonBox && buttonBox.x >= 0 && buttonBox.y >= 0 && buttonBox.x + buttonBox.width <= 1280 && buttonBox.y + buttonBox.height <= 720),
    importantDialogCountBeforeChoice,
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    failedRequestHosts: [...new Set(failedRequestHosts)].sort(),
    rootHasContent: await page.locator("#root").evaluate((root) => root.childElementCount > 0).catch(() => false),
    bannerLatencyAfterRenderMs: bannerVisible ? Date.now() - renderedAt : null,
  };

  console.log(JSON.stringify(result));
  if (result.unauthenticatedCookieCount !== 0 || !result.initialConsentIsEmpty || !result.bannerVisible || !result.bannerInsideViewport || result.importantDialogCountBeforeChoice !== 0 || result.consoleErrorCount !== 0 || result.pageErrorCount !== 0) {
    throw new Error(`Cookie consent private Chrome QA failed: ${JSON.stringify(result)}`);
  }

  await context.close();
} finally {
  await browser.close();
}

async function expectVisible(locator, timeout) {
  await locator.waitFor({ state: "visible", timeout });
}
