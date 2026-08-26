import { chromium } from "playwright-core";

const baseUrl = (process.env.TRAINING_METRICS_QA_URL || "https://akademy.neodev.click").replace(/\/$/, "");
const email = process.env.QA_ADMIN_EMAIL;
const password = process.env.QA_ADMIN_PASSWORD;
if (!email || !password) throw new Error("QA_ADMIN_EMAIL et QA_ADMIN_PASSWORD sont requis.");

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"] });
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers: { "x-neopolis-qa-probe": "1" }, timeout: 60_000 });
  if (!login.ok()) throw new Error(`Connexion administrateur refusée (${login.status()}).`);
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!cookie) throw new Error("Cookie de session administrateur absent.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  const page = await context.newPage();
  const open = async (path, readyText) => {
    await page.goto(`${baseUrl}${path}`, { waitUntil: "commit", timeout: 60_000 });
    if (readyText) await page.getByText(readyText).first().waitFor({ state: "visible", timeout: 45_000 });
    return (await page.locator("body").innerText()).replace(/\s+/g, " ");
  };

  const n8nTitle = /Initiation.*automatisation.*workflows.*n8n/i;
  const certification = await open("/training/initiation_automatisation_workflows_n8n", n8nTitle);
  for (const expected of ["32 activités", "10 vidéos", "22 exercices interactifs", "3 téléchargements"]) {
    if (!certification.toLocaleLowerCase("fr-FR").includes(expected)) throw new Error(`La fiche de certification n8n ne présente pas la métrique calculée « ${expected} ».`);
  }

  const novasavo = await open("/training/novasavo_automatisation_comptable_ia/automatisation_comptable_ia__01?lesson=0&chapter=0", /Automatisation comptable par l’IA/i);
  if (!/1\s*\/\s*12/.test(novasavo) || /1\s*\/\s*13/.test(novasavo)) throw new Error(`La progression Novasavo publiée ne correspond pas à l’unité 1 sur 12. Contenu=${novasavo.slice(0, 1400)}`);
  console.table({ catalogActivities: 32, certificationActivities: 32, certificationVideos: 10, certificationInteractiveExercises: 22, certificationDownloads: 3, novasavoProgress: "1/12" });
  await context.close();
} finally {
  await browser.close();
}
