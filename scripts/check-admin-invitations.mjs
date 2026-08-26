import { chromium } from "playwright-core";

const baseUrl = (process.env.ADMIN_INVITATIONS_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.QA_ADMIN_EMAIL;
const password = process.env.QA_ADMIN_PASSWORD;
if (!email || !password) throw new Error("QA_ADMIN_EMAIL et QA_ADMIN_PASSWORD sont requis.");

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"] });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers: { "x-neopolis-qa-probe": "1" } });
  if (!login.ok()) throw new Error(`Connexion administrateur refusée (${login.status()}).`);
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!cookie) throw new Error("Cookie de session administrateur absent.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  const page = await context.newPage();
  await page.goto(`${baseUrl}/admin?tab=invitations`, { waitUntil: "commit", timeout: 45_000 });
  try {
    await page.getByRole("heading", { name: "Invitations directes" }).waitFor({ state: "visible", timeout: 45_000 });
  } catch {
    const body = (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 800);
    throw new Error(`Table d’invitations non rendue. URL finale=${page.url()} ; contenu=${body}`);
  }
  const search = page.getByPlaceholder("Rechercher un e-mail ou un nom…");
  await search.waitFor({ state: "visible", timeout: 8_000 });
  const pageLabel = page.getByText(/invitations? · page 1\//i);
  await pageLabel.waitFor({ state: "visible", timeout: 8_000 });
  const firstLabel = await pageLabel.innerText();
  const total = Number(firstLabel.match(/(\d+) invitations?/)?.[1] || 0);
  const next = page.locator("button").filter({ hasText: "Suivant" }).last();
  if (!(await next.count())) {
    const buttonLabels = await page.getByRole("button").allTextContents();
    throw new Error(`Bouton de pagination suivant absent. Boutons visibles : ${buttonLabels.join(" | ")}`);
  }
  const nextEnabled = await next.isEnabled();
  if (total <= 20 || !nextEnabled) throw new Error(`Pagination absente : ${firstLabel}`);
  await next.click();
  await page.getByText(/invitations? · page 2\//i).waitFor({ state: "visible", timeout: 10_000 });
  const pageTwoLabel = await page.getByText(/invitations? · page 2\//i).innerText();
  console.table({ total, firstLabel, pageTwoLabel, nextEnabled, searchVisible: await search.isVisible() });
  await context.close();
} finally {
  await browser.close();
}
