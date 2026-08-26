import { chromium } from "playwright-core";
import { getUserByEmail } from "../server/db";
import { sdk } from "../server/_core/sdk";
import { COOKIE_NAME } from "../shared/const";

const baseUrl = (process.env.WEFA_ACCESS_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = "wafa.nawech@gmail.com";
const user = await getUserByEmail(email);
if (!user) throw new Error("Compte Wafa Nawech introuvable.");
const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || email, expiresInMs: 10 * 60_000 });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"] });
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  await context.addCookies([{ name: COOKIE_NAME, value: sessionToken, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  const page = await context.newPage();
  await page.goto(`${baseUrl}/training/novasavo_automatisation_comptable_ia/automatisation_comptable_ia__01?lesson=0&chapter=0`, { waitUntil: "commit", timeout: 60_000 });
  await page.getByText(/Fondamentaux et objectifs/i).first().waitFor({ state: "visible", timeout: 45_000 });
  if (await page.getByText(/accès non attribué/i).count()) throw new Error("Le message d’accès non attribué est encore affiché.");
  console.log(JSON.stringify({ email, routeOpened: true, accessDeniedMessage: false }, null, 2));
  await context.close();
} finally {
  await browser.close();
}
