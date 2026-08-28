import { chromium } from "playwright-core";
import fs from "node:fs";

const baseUrl = (process.env.PROJECTOR_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.QA_EMAIL;
const password = process.env.QA_PASSWORD;
if (!email || !password) throw new Error("QA_EMAIL et QA_PASSWORD sont requis.");
const result = { generatedAt: new Date().toISOString(), rendered: false, audioVisible: false, slideVisible: false, providerReferenceVisible: false, providerMatches: [] };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"] });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers: { "x-neopolis-qa-probe": "1" } });
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!login.ok() || !cookie) throw new Error("Connexion QA refusée.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  const page = await context.newPage();
  await page.goto(`${baseUrl}/training/datacamp_ai_for_human_resources/ai_for_human_resources__01?lesson=0&chapter=0`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-block-type="video"]', { timeout: 10000 });
  result.rendered = true;
  const projector = page.locator('[data-block-type="video"]');
  result.audioVisible = await projector.locator('video').count() > 0;
  result.slideVisible = await projector.getByRole('button', { name: /Lire la leçon|Mettre en pause/ }).count() > 0;
  const projectorText = await projector.innerText();
  result.providerMatches = projectorText.match(/[^\n]{0,60}(?:DataCamp|Copilot)[^\n]{0,80}/gi) || [];
  result.providerReferenceVisible = result.providerMatches.length > 0;
  await page.screenshot({ path: "docs/block-qa-screenshots/ai_for_human_resources__01-projector-mobile.png", fullPage: true });
  await context.close();
} finally { await browser.close(); }
fs.writeFileSync("docs/ai_for_human_resources_projector_qa_2026-08-28.json", `${JSON.stringify(result, null, 2)}\n`);
console.table(result);
if (!result.rendered || !result.audioVisible || !result.slideVisible || result.providerReferenceVisible) process.exitCode = 1;
