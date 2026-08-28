import { chromium } from "playwright-core";

const baseUrl = (process.env.DATACAMP_COMPETENCY_ADMIN_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.QA_ADMIN_EMAIL;
const password = process.env.QA_ADMIN_PASSWORD;
const learnerId = process.env.DATACAMP_COMPETENCY_LEARNER_ID || "2250003";

if (!email || !password) throw new Error("QA_ADMIN_EMAIL et QA_ADMIN_PASSWORD sont requis.");

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer", "--no-zygote"],
});

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, {
    data: { email, password },
    headers: { "x-neopolis-qa-probe": "1" },
  });
  if (!login.ok()) throw new Error(`Connexion administrateur refusée (${login.status()}).`);
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!cookie) throw new Error("Cookie de session administrateur absent.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);

  const page = await context.newPage();
  await page.goto(`${baseUrl}/admin/training?tab=learners&learner=${learnerId}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /prompt engineering/i }).waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("button", { name: /prompt engineering/i }).click();
  await page.waitForFunction(() => /exercise passed|exercice réussi/i.test(document.body.innerText), { timeout: 10_000 });
  const text = await page.locator("body").innerText();
  const contributionVisible = /exercise passed|exercice réussi/i.test(text);
  const promptEngineeringSection = text.slice(text.search(/prompt engineering/i), text.search(/conception de solutions ia/i));
  const pointsMatch = promptEngineeringSection.match(/(\d+(?:[.,]\d+)?)\s*\/\s*100/);
  const pointsTotal = pointsMatch ? Number(pointsMatch[1].replace(",", ".")) : null;
  const exerciseDeltaVisible = /exercise passed[\s\S]{0,80}\+\s*1[.,]0/i.test(promptEngineeringSection);
  const xpVisible = /\bXP\b/i.test(text);
  await page.screenshot({ path: "docs/block-qa-screenshots/ai-evaluation-datacamp-competencies-admin-desktop.png", fullPage: true });
  console.table({ contributionVisible, exerciseDeltaVisible, pointsTotal, xpVisible, learnerId, url: page.url() });
  if (!contributionVisible || !exerciseDeltaVisible || pointsTotal == null || pointsTotal < 1 || xpVisible) process.exitCode = 1;
  await context.close();
} finally {
  await browser.close();
}
