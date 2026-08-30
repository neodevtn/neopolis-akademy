import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.KPI_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.QA_ADMIN_EMAIL;
const password = process.env.QA_ADMIN_PASSWORD;
const outputPath = resolve("docs/admin-catalog-kpis-browser-qa.json");
const screenshotPath = resolve("docs/admin-catalog-kpis-mobile-qa.png");

if (!email || !password) throw new Error("QA_ADMIN_EMAIL et QA_ADMIN_PASSWORD sont requis.");
mkdirSync(resolve("docs"), { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"],
});

let result = { hasKpiColumn: false, hasEmptyState: false, hasPopulatedKpi: false, populatedKpiInViewport: false, populatedKpiText: "", globalOverflow: false, clientWidth: 0, scrollWidth: 0, tableClientWidth: 0, tableScrollWidth: 0, screenshotPath };
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers: { "x-neopolis-qa-probe": "1" } });
  if (!login.ok()) throw new Error(`Connexion administrateur refusée (${login.status()}).`);
  const sessionCookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!sessionCookie) throw new Error("La connexion administrateur n’a pas renvoyé de cookie de session.");
  await context.addCookies([{ name: "app_session_id", value: sessionCookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);

  const page = await context.newPage();
  await page.goto(`${baseUrl}/admin/content?mode=catalog`, { waitUntil: "domcontentloaded" });
  await page.getByText("KPI apprenants", { exact: true }).waitFor({ state: "visible", timeout: 15_000 });
  await page.getByText("Pas encore de données", { exact: true }).first().waitFor({ state: "visible", timeout: 15_000 });
  const acceptCookies = page.getByRole("button", { name: "Accepter" });
  if (await acceptCookies.count()) await acceptCookies.first().click().catch(() => undefined);
  const tableScroller = page.locator("div.overflow-x-auto").first();
  const populatedRow = page.locator("tbody tr").filter({ hasText: "démarrages" }).first();
  await populatedRow.scrollIntoViewIfNeeded();
  const populatedKpiCell = populatedRow.locator("td").nth(4);
  await populatedKpiCell.evaluate((element) => element.scrollIntoView({ block: "center", inline: "center" }));
  const emptyState = page.getByText("Pas encore de données", { exact: true }).first();
  const populatedKpiText = await populatedRow.innerText();
  const populatedKpiBox = await populatedKpiCell.boundingBox();
  const dimensions = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  const tableDimensions = await tableScroller.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
  result = {
    hasKpiColumn: await page.getByText("KPI apprenants", { exact: true }).isVisible(),
    hasEmptyState: await emptyState.isVisible(),
    hasPopulatedKpi: /démarrages/.test(populatedKpiText) && /actifs/.test(populatedKpiText) && /abandons/.test(populatedKpiText),
    populatedKpiInViewport: Boolean(populatedKpiBox && populatedKpiBox.x >= 0 && populatedKpiBox.x + populatedKpiBox.width <= 390),
    populatedKpiText,
    globalOverflow: dimensions.scrollWidth > dimensions.clientWidth + 2,
    clientWidth: dimensions.clientWidth,
    scrollWidth: dimensions.scrollWidth,
    tableClientWidth: tableDimensions.clientWidth,
    tableScrollWidth: tableDimensions.scrollWidth,
    screenshotPath,
  };
  await page.screenshot({ path: screenshotPath, fullPage: false });
  await context.close();
} finally {
  await browser.close();
}

writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, viewport: "390x844", result }, null, 2)}\n`);
console.table([result]);
if (!result.hasKpiColumn || !result.hasEmptyState || !result.hasPopulatedKpi || !result.populatedKpiInViewport || result.globalOverflow) process.exitCode = 1;
