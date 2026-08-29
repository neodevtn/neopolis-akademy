import fs from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.BRAND_CLEANUP_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const qaEmail = process.env.QA_EMAIL || process.env.DEMO_EMAIL;
const qaPassword = process.env.QA_PASSWORD || process.env.DEMO_PASSWORD;
const useDemoAuth = !process.env.QA_EMAIL && !process.env.QA_PASSWORD;
const outputPath = resolve("docs/visible-datacamp-mentions-browser-qa.json");
const screenshotsDir = resolve("docs/visible-datacamp-mentions-screenshots");
const samples = [
  { label: "finance", certId: "datacamp_ai_for_finance", courseId: "ai_for_finance__01" },
  { label: "ventes", certId: "datacamp_ai_for_sales", courseId: "ai_for_sales__01" },
  { label: "n8n", certId: "initiation_automatisation_workflows_n8n", courseId: "initiation_automatisation_workflows_n8n__01" },
  { label: "claude", certId: "claude_certified_associate_foundations", courseId: "claude_certified_associate_foundations__01" },
];

if (!qaEmail || !qaPassword) throw new Error("Des identifiants QA ou démo sont requis pour le contrôle des parcours.");

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"],
});
const results = [];

try {
  await mkdir(screenshotsDir, { recursive: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const loginPath = useDemoAuth ? "/api/demo-login" : "/api/auth/login";
  const login = await context.request.post(`${baseUrl}${loginPath}`, { data: { email: qaEmail, password: qaPassword } });
  if (!login.ok()) throw new Error(`Connexion QA refusée (${login.status()}).`);
  const sessionCookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!sessionCookie) throw new Error("La connexion QA n’a pas créé de session.");
  await context.addCookies([{ name: "app_session_id", value: sessionCookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);

  for (const sample of samples) {
    const page = await context.newPage();
    const url = `${baseUrl}/training/${sample.certId}/${sample.courseId}?lesson=0&chapter=0`;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.innerText.trim().length > 250, { timeout: 15_000 });
    const acceptCookies = page.getByRole("button", { name: "Accepter" });
    if (await acceptCookies.count()) await acceptCookies.first().click().catch(() => undefined);
    const bodyText = await page.locator("body").innerText();
    const screenshot = resolve(screenshotsDir, `${sample.label}.png`);
    await page.screenshot({ path: screenshot, fullPage: false });
    results.push({
      ...sample,
      url,
      titleVisible: bodyText.includes(sample.courseId) ? false : true,
      brandMentionVisible: /datacamp/i.test(bodyText),
      breadcrumbVisible: /Formation/.test(bodyText),
      hasResourceOrTranscript: /Transcription|Sous-titres|Slides PDF|Téléchargements/.test(bodyText),
      screenshot,
    });
    await page.close();
  }
  await context.close();
} finally {
  await browser.close();
}

const complete = results.every((result) => !result.brandMentionVisible && result.breadcrumbVisible);
await writeFile(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, results, complete }, null, 2)}\n`);
console.table(results.map(({ label, brandMentionVisible, breadcrumbVisible, hasResourceOrTranscript }) => ({ label, brandMentionVisible, breadcrumbVisible, hasResourceOrTranscript })));
if (!complete) process.exitCode = 1;
