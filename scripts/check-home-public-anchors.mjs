import { chromium } from "playwright-core";

const baseUrl = (process.env.HOME_ANCHOR_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const anchors = ["formule", "pourquoi", "partenaires", "faq"];
const mobile = process.argv.includes("--mobile");
const viewport = mobile ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"],
});

const results = [];
try {
  const context = await browser.newContext({ viewport, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  const dismissConsent = async () => {
    const reject = page.getByRole("button", { name: /Refuser|Reject|رفض/i });
    if (await reject.count()) await reject.first().click();
  };
  const dismissCommunication = async () => {
    const close = page.getByRole("button", { name: /Close|Fermer|إغلاق/i });
    if (await close.count()) await close.first().click();
  };
  const clickAnchor = async (href) => {
    if (mobile) {
      const panel = page.locator("#public-mobile-navigation");
      if (!await panel.count()) {
        const reactTrigger = page.locator(".public-chrome-mobile-trigger");
        if (await reactTrigger.count()) await reactTrigger.click();
        else {
          await page.locator("details.public-chrome-mobile summary").click();
          await page.locator(`details.public-chrome-mobile[open] a[href="${href}"]`).first().click();
          return;
        }
      }
      const scopedLink = page.locator(`#public-mobile-navigation a[href="${href}"]`);
      if (await scopedLink.count()) await scopedLink.first().click();
      else await page.locator(`header a[href="${href}"]`).first().click();
      return;
    }
    await page.locator(`header a[href="${href}"]`).first().click();
  };
  const inspect = async (anchor, scenario) => {
    await page.waitForFunction((id) => Boolean(document.getElementById(id)), anchor);
    await page.waitForTimeout(900);
    const state = await page.evaluate((id) => {
      const target = document.getElementById(id);
      const top = target?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      return { hash: window.location.hash, scrollY: window.scrollY, targetTop: Math.round(top), visible: top >= 0 && top < window.innerHeight };
    }, anchor);
    results.push({ viewport: `${viewport.width}x${viewport.height}`, scenario, anchor, ...state });
  };

  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(document.getElementById("formule")));
  await dismissConsent();
  await dismissCommunication();
  for (const anchor of anchors) {
    await clickAnchor(`#${anchor}`);
    await inspect(anchor, "home-click");
  }

  for (const anchor of anchors) {
    await page.goto(`${baseUrl}/#${anchor}`, { waitUntil: "domcontentloaded" });
    await inspect(anchor, "direct-url");
  }

  await page.goto(`${baseUrl}/formations-ia`, { waitUntil: "domcontentloaded" });
  for (const anchor of anchors) {
    await clickAnchor(`/#${anchor}`);
    await inspect(anchor, "other-page-click");
    await page.goto(`${baseUrl}/formations-ia`, { waitUntil: "domcontentloaded" });
  }
  await context.close();
} finally {
  await browser.close();
}

console.table(results);
const failures = results.filter((result) => result.hash !== `#${result.anchor}` || !result.visible);
if (failures.length) {
  console.error(`Ancres publiques en échec: ${failures.map((failure) => `${failure.scenario}:${failure.anchor}`).join(", ")}`);
  process.exitCode = 1;
}
