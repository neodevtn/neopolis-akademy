import fs from "node:fs";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IMPORTANT_OVERLAY_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const learnerEmail = process.env.QA_EMAIL;
const learnerPassword = process.env.QA_PASSWORD;

if (!learnerEmail || !learnerPassword) {
  throw new Error("QA_EMAIL et QA_PASSWORD sont requis pour le contrôle de superposition.");
}

const result = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  desktop: null,
  mobile: null,
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"],
});

async function checkViewport(viewport, name) {
  const context = await browser.newContext({ viewport, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  try {
    const login = await context.request.post(`${baseUrl}/api/auth/login`, {
      data: { email: learnerEmail, password: learnerPassword },
      headers: { "x-neopolis-qa-probe": "1" },
    });
    if (!login.ok()) throw new Error(`Connexion QA refusée (${login.status()}).`);
    const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
    if (!cookie) throw new Error("Cookie de session QA absent.");
    await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);

    const page = await context.newPage();
    const relevantConsoleWarnings = [];
    page.on("console", (message) => {
      const text = message.text();
      if (/Missing `Description`|container has a non-static position/.test(text)) {
        relevantConsoleWarnings.push(text);
      }
    });
    await page.addInitScript(() => localStorage.removeItem("neopolis_cookie_consent"));
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded", timeout: 60_000 });

    const dialog = page.getByRole("dialog");
    await dialog.getByText("Communication importante", { exact: true }).waitFor({ state: "visible", timeout: 20_000 });
    const acknowledgement = page.getByText("J’accuse réception de ce communiqué.", { exact: true });
    const confirm = page.getByRole("button", { name: "Confirmer la réception" });
    const cookieHeading = page.getByText("Nous respectons votre vie privée", { exact: true });
    const cookieActions = page.locator("[class*='fixed'][class*='z-40'] button");
    await cookieHeading.waitFor({ state: "visible", timeout: 12_000 });
    await cookieActions.first().waitFor({ state: "attached", timeout: 12_000 });
    const dialogDiagnostics = await page.locator('[role="dialog"]').evaluateAll((dialogs) => dialogs.map((dialog) => ({
      title: dialog.querySelector('[data-slot="dialog-title"]')?.textContent?.trim() || null,
      describedBy: dialog.getAttribute("aria-describedby"),
      descriptionPresent: Boolean(dialog.querySelector('[data-slot="dialog-description"]')),
    })));

    const visible = {
      dialog: await dialog.isVisible(),
      acknowledgement: await acknowledgement.isVisible(),
      confirm: await confirm.isVisible(),
      cookieBanner: await cookieHeading.isVisible(),
      cookieActionsPresent: await cookieActions.count() === 2 && await cookieActions.first().isVisible() && await cookieActions.nth(1).isVisible(),
    };
    await acknowledgement.scrollIntoViewIfNeeded();
    const acknowledgementInViewport = await acknowledgement.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return box.top >= 0 && box.left >= 0 && box.bottom <= window.innerHeight && box.right <= window.innerWidth;
    });
    await confirm.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, Math.max(1000, document.documentElement.scrollHeight)));
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, 0));
    const topmost = await confirm.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const topElement = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return Boolean(topElement?.closest('[role="dialog"]'));
    });
    const inViewport = await confirm.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return box.top >= 0 && box.left >= 0 && box.bottom <= window.innerHeight && box.right <= window.innerWidth;
    });
    const cookieActionsBlockedByDialog = await cookieActions.first().evaluate((element) => {
      const box = element.getBoundingClientRect();
      const topElement = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return Boolean(topElement && topElement !== element && !element.contains(topElement));
    });
    await page.evaluate(() => window.dispatchEvent(new Event("pointerdown")));
    await page.waitForTimeout(4_000);
    const feedbackTrigger = page.getByRole("button", { name: /signaler un problème|ouvrir le formulaire de feedback/i });
    const feedbackTriggerRendered = await feedbackTrigger.count() > 0 && await feedbackTrigger.first().isVisible();
    let feedbackTriggerOverlapsRequiredActions = false;
    if (feedbackTriggerRendered) {
      feedbackTriggerOverlapsRequiredActions = await feedbackTrigger.first().evaluate((trigger) => {
        const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        const acknowledgement = [...document.querySelectorAll("label")].find((element) => element.textContent?.includes("J’accuse réception"));
        const confirm = [...document.querySelectorAll("button")].find((element) => element.textContent?.includes("Confirmer la réception"));
        const triggerBox = trigger.getBoundingClientRect();
        return Boolean((acknowledgement && overlaps(triggerBox, acknowledgement.getBoundingClientRect())) || (confirm && overlaps(triggerBox, confirm.getBoundingClientRect())));
      });
    }
    await page.screenshot({ path: `docs/block-qa-screenshots/important-communication-overlay-${name}.png`, fullPage: false });
    return { viewport, ...visible, confirmTopmost: topmost, confirmInViewport: inViewport, acknowledgementInViewport, cookieActionsBlockedByDialog, feedbackTriggerRendered, feedbackTriggerOverlapsRequiredActions, relevantConsoleWarnings, dialogDiagnostics };
  } finally {
    await context.close();
  }
}

try {
  result.desktop = await checkViewport({ width: 1280, height: 720 }, "desktop");
  result.mobile = await checkViewport({ width: 390, height: 844 }, "mobile");
} finally {
  await browser.close();
}

fs.writeFileSync("docs/important_communication_overlay_qa_2026-08-29.json", `${JSON.stringify(result, null, 2)}\n`);

const checks = [result.desktop, result.mobile].flatMap((entry) => [
  entry.dialog,
  entry.acknowledgement,
  entry.confirm,
  entry.cookieBanner,
  entry.cookieActionsPresent,
  entry.confirmTopmost,
  entry.confirmInViewport,
  entry.acknowledgementInViewport,
  entry.cookieActionsBlockedByDialog,
  !entry.feedbackTriggerOverlapsRequiredActions,
  entry.relevantConsoleWarnings.length === 0,
]);
if (!checks.every(Boolean)) process.exitCode = 1;
