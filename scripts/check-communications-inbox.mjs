import { resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { chromium } from "playwright-core";

const baseUrl = (process.env.COMMUNICATIONS_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const qaEmail = process.env.QA_EMAIL || process.env.DEMO_EMAIL;
const qaPassword = process.env.QA_PASSWORD || process.env.DEMO_PASSWORD;
const useDemoAuth = !process.env.QA_EMAIL && !process.env.QA_PASSWORD;
const mobile = process.argv.includes("--mobile");
const outputPath = resolve(`docs/communications-inbox-${mobile ? "mobile" : "desktop"}-qa.json`);
const screenshotPath = resolve(`docs/communications-inbox-${mobile ? "mobile" : "desktop"}-qa.png`);

if (!qaEmail || !qaPassword) throw new Error("Les identifiants QA ou démo sont requis pour vérifier la boîte de réception.");

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"],
});

let report;
try {
  const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 };
  const context = await browser.newContext({ viewport, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const loginPath = useDemoAuth ? "/api/demo-login" : "/api/auth/login";
  const login = await context.request.post(`${baseUrl}${loginPath}`, { data: { email: qaEmail, password: qaPassword } });
  if (!login.ok()) throw new Error(`Connexion QA refusée (${login.status()}).`);
  const sessionCookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!sessionCookie) throw new Error("La connexion QA n’a pas fourni de cookie de session.");
  await context.addCookies([{ name: "app_session_id", value: sessionCookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  const page = await context.newPage();
  await page.goto(`${baseUrl}/training?tab=communications`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Accepter" }).click().catch(() => undefined);
  const inboxList = page.getByRole("listbox", { name: "Liste des communiqués" });
  await inboxList.waitFor({ timeout: 15000 });
  const options = inboxList.getByRole("option");
  const optionsBefore = await options.count();
  const firstSubject = optionsBefore ? (await options.first().innerText()).split("\n")[0] : "";
  if (optionsBefore > 1) await options.nth(1).click();
  await page.waitForTimeout(250);
  const visibleDetail = await page.locator("article[aria-live='polite']").innerText();
  const geometry = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  const controls = {
    search: await page.getByPlaceholder("Rechercher un communiqué").count(),
    all: await page.getByRole("button", { name: "Tous" }).count(),
    unread: await page.getByRole("button", { name: "Non lus" }).count(),
    priority: await page.locator("select").count(),
  };
  await page.screenshot({ path: screenshotPath, fullPage: false });
  report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    viewport,
    optionsBefore,
    firstSubject,
    selectionWorks: optionsBefore < 2 || Boolean(visibleDetail.trim()),
    controls,
    ...geometry,
    overflow: geometry.scrollWidth > geometry.clientWidth + 2,
    screenshotPath,
  };
  await context.close();
} finally {
  await browser.close();
}

writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.table([report]);
if (report.overflow || report.optionsBefore < 1 || !report.selectionWorks || Object.values(report.controls).some((count) => count < 1)) process.exitCode = 1;
