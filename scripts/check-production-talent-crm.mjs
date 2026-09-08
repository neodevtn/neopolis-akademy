import { chromium } from "playwright-core";

const baseUrl = (process.env.TALENT_CRM_QA_URL || "https://akademy.neodev.click").replace(/\/$/, "");
const email = process.env.QA_ADMIN_EMAIL;
const password = process.env.QA_ADMIN_PASSWORD;
if (!email || !password) throw new Error("QA_ADMIN_EMAIL et QA_ADMIN_PASSWORD sont requis.");

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"],
});

try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    extraHTTPHeaders: { "x-neopolis-qa-probe": "1" },
  });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, {
    data: { email, password },
    headers: { "x-neopolis-qa-probe": "1" },
    timeout: 60_000,
  });
  if (!login.ok()) throw new Error(`Connexion administrateur refusée (${login.status()}).`);
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!cookie) throw new Error("Cookie de session administrateur absent.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);

  const page = await context.newPage();
  await page.goto(`${baseUrl}/admin/talents`, { waitUntil: "commit", timeout: 60_000 });
  await page.getByRole("heading", { name: "Talents & réseau" }).waitFor({ state: "visible", timeout: 45_000 });
  const closeNotice = page.getByRole("button", { name: "Close" });
  if (await closeNotice.isVisible().catch(() => false)) await closeNotice.click();
  await page.getByText("Portefeuille", { exact: true }).waitFor({ state: "visible", timeout: 30_000 });
  await page.getByRole("button", { name: "Ouvrir" }).first().click();
  for (const tab of ["Synthèse", "Formation", "Rendez-vous", "Affectations", "Évaluations", "Tâches"]) {
    await page.getByRole("tab", { name: tab, exact: true }).waitFor({ state: "visible", timeout: 30_000 });
  }

  await page.goto(`${baseUrl}/training?tab=evolution`, { waitUntil: "commit", timeout: 60_000 });
  const closeLearnerNotice = page.getByRole("button", { name: "Close" });
  if (await closeLearnerNotice.isVisible().catch(() => false)) await closeLearnerNotice.click();
  await page.getByText(/^(Mon évolution|My Journey)$/).first().waitFor({ state: "visible", timeout: 45_000 });
  const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  if (/404 Page Not Found|Unexpected error occurred/i.test(body)) throw new Error("Le parcours Évolution ne s’est pas rendu correctement.");

  console.table({
    adminPortfolio: "visible",
    memberRecordTabs: 6,
    learnerEvolution: "visible",
    personalDataLogged: false,
  });
  await context.close();
} finally {
  await browser.close();
}
