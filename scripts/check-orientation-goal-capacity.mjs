import { chromium } from "playwright-core";

const baseUrl = (process.env.ORIENTATION_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.QA_EMAIL;
const password = process.env.QA_PASSWORD;
if (!email || !password) throw new Error("QA_EMAIL et QA_PASSWORD sont requis.");

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"] });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers: { "x-neopolis-qa-probe": "1" } });
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!login.ok() || !cookie) throw new Error("Connexion QA refusée.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);

  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`${baseUrl}/training?tab=orientation`, { waitUntil: "domcontentloaded" });
  await page.locator("h3", { hasText: /Vos compétences prioritaires/i }).waitFor({ timeout: 30000 });

  // The important communication remains product-visible. It is only made inert in this
  // no-save probe so the test does not acknowledge or alter the learner's communication state.
  await page.locator('[role="dialog"], [data-slot="dialog-overlay"]').evaluateAll((elements) => elements.forEach((element) => { element.style.display = "none"; }));

  const goalsPanel = page.locator("h3", { hasText: /Vos compétences prioritaires/i }).locator("..").locator("..");
  const competencyGrid = goalsPanel.locator("div.grid").first();
  const goalCheckboxes = competencyGrid.locator("input[type='checkbox']");
  for (let index = 0; index < 5; index += 1) {
    await goalCheckboxes.nth(index).evaluate((input) => input.click());
    await page.waitForFunction(({ expected }) => {
      const text = document.querySelector("p[role='status']")?.textContent || "";
      return text.startsWith(`${expected} / 5`);
    }, { expected: index + 1 });
  }

  const result = {
    checkedGoals: await goalCheckboxes.evaluateAll((elements) => elements.slice(0, 9).filter((input) => input.checked).length),
    sixthGoalDisabled: await goalCheckboxes.nth(5).isDisabled(),
    capacityMessage: await goalsPanel.getByRole("status").innerText(),
    saved: false,
    pageErrors,
  };
  await page.close();
  await context.close();
  console.log(JSON.stringify(result));
  if (result.checkedGoals !== 5 || !result.sixthGoalDisabled || !/limite atteinte/i.test(result.capacityMessage) || result.pageErrors.length) process.exitCode = 1;
} finally {
  await browser.close();
}
