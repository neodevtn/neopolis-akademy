import { chromium } from "playwright-core";

const baseUrl = (process.env.ADMIN_OPERATIONAL_LOGS_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.QA_ADMIN_EMAIL;
const password = process.env.QA_ADMIN_PASSWORD;
if (!email || !password) throw new Error("QA_ADMIN_EMAIL et QA_ADMIN_PASSWORD sont requis.");

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"] });
try {
  const context = await browser.newContext({ viewport: { width: Number(process.env.QA_VIEWPORT_WIDTH || 1440), height: Number(process.env.QA_VIEWPORT_HEIGHT || 1000) }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers: { "x-neopolis-qa-probe": "1" } });
  if (!login.ok()) throw new Error(`Connexion administrateur refusée (${login.status()}).`);
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!cookie) throw new Error("Cookie de session administrateur absent.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  const page = await context.newPage();
  let operationalRpc = "aucune requête tRPC observée";
  page.on("response", async (response) => {
    if (!response.url().includes("system.getOperationalLogs")) return;
    try {
      operationalRpc = `${response.status()} ${await response.text()}`.slice(0, 1_000);
    } catch {
      operationalRpc = `${response.status()} réponse illisible`;
    }
  });
  await page.goto(`${baseUrl}/admin/errors`, { waitUntil: "commit", timeout: 45_000 });
  const search = page.getByRole("textbox", { name: "Rechercher dans le journal opérationnel" });
  try {
    await search.waitFor({ state: "visible", timeout: 45_000 });
  } catch {
    const body = (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 1_500);
    throw new Error(`Journal opérationnel non rendu. URL=${page.url()} ; contenu=${body} ; tRPC=${operationalRpc}`);
  }
  const summary = page.getByText(/Événements 1–25 sur \d+ · Page 1 sur \d+/i);
  try {
    await summary.waitFor({ state: "visible", timeout: 20_000 });
  } catch {
    const body = (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 1_500);
    throw new Error(`Résumé de pagination absent. Contenu rendu : ${body}`);
  }
  const firstSummary = await summary.innerText();
  const next = page.getByRole("button", { name: "Page suivante du journal opérationnel" });
  if (!(await next.isEnabled())) throw new Error(`Pagination inactive : ${firstSummary}`);
  await next.click();
  const secondSummary = page.getByText(/Événements 26–50 sur \d+ · Page 2 sur \d+/i);
  try {
    await secondSummary.waitFor({ state: "visible", timeout: 15_000 });
  } catch {
    const body = (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 1_500);
    throw new Error(`Seconde page absente après clic. Contenu rendu : ${body}`);
  }
  const secondSummaryText = await secondSummary.innerText();
  await search.fill("learning time");
  const filteredSummaryLocator = page.getByText(/Événements 1–\d+ sur \d+ · Page 1 sur \d+/i);
  try {
    await filteredSummaryLocator.waitFor({ state: "visible", timeout: 15_000 });
  } catch {
    const body = (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 1_500);
    throw new Error(`Résumé filtré absent. Contenu rendu : ${body}`);
  }
  const filteredSummary = await filteredSummaryLocator.innerText();
  console.table({ firstSummary, secondSummary: secondSummaryText, filteredSummary, searchVisible: await search.isVisible() });
  await context.close();
} finally {
  await browser.close();
}
