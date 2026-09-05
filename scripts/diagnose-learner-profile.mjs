import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.LEARNER_PROFILE_QA_URL || "https://akademy.neodev.click").replace(/\/$/, "");
const learnerId = Number(process.env.LEARNER_PROFILE_QA_ID || "90930002");
const email = process.env.QA_ADMIN_EMAIL;
const password = process.env.QA_ADMIN_PASSWORD;
if (!email || !password || !Number.isInteger(learnerId)) throw new Error("Paramètres QA administrateur requis.");

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"] });
try {
  const consoleErrors = [];
  const pageErrors = [];
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers: { "x-neopolis-qa-probe": "1" } });
  if (!login.ok()) throw new Error(`Connexion QA refusée (${login.status()}).`);
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!cookie) throw new Error("Cookie de session QA absent.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);

  const page = await context.newPage();
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text().slice(0, 500)); });
  page.on("pageerror", (error) => pageErrors.push(String(error.message).slice(0, 500)));
  await page.goto(`${baseUrl}/admin/training?tab=learners&learner=${learnerId}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(10_000);

  const state = await page.evaluate(() => {
    const text = document.body.innerText;
    const has = (value) => text.includes(value);
    return {
      contentLoaded: text.length > 100,
      accessDenied: has("Accès refusé"),
      learnerKpisVisible: has("Leçons terminées"),
      learnerDetailVisible: has("Synthèse") || has("Profil candidat"),
      errorBoundaryVisible: has("Une erreur inattendue") || has("Réessayer"),
      loadingVisible: has("Chargement"),
      tabCount: document.querySelectorAll('[role="tab"]').length,
    };
  });
  await page.screenshot({ path: "/tmp/neopolis-learner-profile-diagnostic.png", fullPage: false });
  console.log(JSON.stringify({ ...state, consoleErrors: [...new Set(consoleErrors)].slice(0, 8), pageErrors: [...new Set(pageErrors)].slice(0, 8) }));
  await context.close();
} finally {
  await browser.close();
}
