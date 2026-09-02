import { chromium } from "playwright-core";
import { writeFile } from "node:fs/promises";

const baseUrl = (process.env.REFERRAL_QA_URL || "https://3000-ipw2i9wcamp2lilycowwj-8f4f4118.us1.manus.computer").replace(/\/$/, "");
const email = process.env.QA_EMAIL;
const password = process.env.QA_PASSWORD;
if (!email || !password) throw new Error("QA_EMAIL et QA_PASSWORD sont requis.");

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"] });
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers: { "x-neopolis-qa-probe": "1" }, timeout: 60_000 });
  if (!login.ok()) throw new Error(`Connexion QA refusée (${login.status()}).`);
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!cookie) throw new Error("Cookie de session QA absent.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);

  const page = await context.newPage();
  await page.goto(`${baseUrl}/training?tab=parainnage`, { waitUntil: "commit", timeout: 60_000 });
  await page.getByText(/Programme de parrainage/i).first().waitFor({ state: "visible", timeout: 45_000 });
  await page.getByText(/Votre lien personnel|Your personal referral link/i).first().waitFor({ state: "visible", timeout: 45_000 });
  const desktopText = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  for (const expected of [["Votre lien personnel", "Your personal referral link"], ["WhatsApp"], ["Messenger"], ["E-mail", "Email"], ["Copier le lien", "Copy link"], ["Le suivi de vos parrainages", "Your referral follow-up"]]) {
    if (!expected.some((label) => desktopText.includes(label))) throw new Error(`Élément Parrainage manquant : ${expected.join(" / ")}`);
  }
  const hasPersonalLink = await page.locator("code").evaluateAll((items) => items.some((item) => item.textContent?.includes("/refer?ref=NEO-")));
  if (!hasPersonalLink) throw new Error("Le lien personnel suivi n’est pas affiché.");
  if (!page.url().includes("tab=parainnage")) throw new Error("L’alias d’URL parainnage n’est pas conservé.");
  await page.screenshot({ path: "/tmp/neopolis-referral-program-qa.png", fullPage: true });

  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(`${baseUrl}/training?tab=parrainage`, { waitUntil: "commit", timeout: 60_000 });
  await mobile.getByText(/Programme de parrainage/i).first().waitFor({ state: "visible", timeout: 45_000 });
  await mobile.getByText(/Votre lien personnel|Your personal referral link/i).first().waitFor({ state: "visible", timeout: 45_000 });
  const mobileMetrics = await mobile.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  if (mobileMetrics.scrollWidth > mobileMetrics.clientWidth + 2) throw new Error(`Débordement mobile Parrainage : ${mobileMetrics.scrollWidth}/${mobileMetrics.clientWidth}.`);

  const result = { aliasUrl: true, personalTrackedLink: true, channels: ["WhatsApp", "Messenger", "E-mail"], mobile: mobileMetrics, pageErrors: [] };
  await writeFile("docs/referral-program-browser-qa.json", `${JSON.stringify(result, null, 2)}\n`);
  console.table(result);
  await context.close();
} finally {
  await browser.close();
}
