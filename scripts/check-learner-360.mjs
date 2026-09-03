import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const baseUrl = (process.env.LEARNER_360_QA_URL || "https://akademy.neodev.click").replace(/\/$/, "");
const learnerId = Number(process.env.LEARNER_360_LEARNER_ID || "125340006");
const email = process.env.QA_ADMIN_EMAIL;
const password = process.env.QA_ADMIN_PASSWORD;

if (!email || !password || !Number.isInteger(learnerId) || learnerId <= 0) {
  throw new Error("LEARNER_360_LEARNER_ID, QA_ADMIN_EMAIL et QA_ADMIN_PASSWORD sont requis.");
}

const screenshotsDir = process.env.LEARNER_360_QA_ARTIFACT_DIR || path.join("/tmp", "neopolis-learner-360-qa");
fs.mkdirSync(screenshotsDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"],
});

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers: { "x-neopolis-qa-probe": "1" }, timeout: 60_000 });
  if (!login.ok()) throw new Error(`Connexion administrateur refusée (${login.status()}).`);
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!cookie) throw new Error("Cookie de session administrateur absent.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);

  const page = await context.newPage();
  await page.goto(`${baseUrl}/admin/training?tab=learners&learner=${learnerId}`, { waitUntil: "commit", timeout: 60_000 });
  await page.getByText("Leçons terminées", { exact: true }).waitFor({ state: "visible", timeout: 45_000 });
  await page.getByText("Admin-apprenant", { exact: true }).waitFor({ state: "visible", timeout: 20_000 });
  for (const label of ["Chapitres validés", "Vidéos vues", "Examens passés", "Temps actif", "Réussite 1er examen"]) {
    await page.getByText(label, { exact: true }).waitFor({ state: "visible", timeout: 20_000 });
  }

  const tabs = [
    ["Synthèse", "Dates clés"],
    ["Profil", "Profil candidat et accès"],
    ["Parcours", "Progression par certification"],
    ["Évaluations", "Tentatives d'examen"],
    ["Compétences", "Orientation et objectifs"],
    ["Activité", "Journal d’activité détaillé"],
    ["Intégrité", "Intégrité pédagogique"],
  ];
  for (const [tab, expectedHeading] of tabs) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
    await page.getByText(expectedHeading, { exact: false }).first().waitFor({ state: "visible", timeout: 20_000 });
  }

  await page.getByRole("tab", { name: "Activité", exact: true }).click();
  const search = page.getByRole("textbox", { name: "Rechercher dans le journal d’activité" });
  await search.fill("__aucun_resultat_360__");
  await page.getByText("Aucune action ne correspond à cette recherche.", { exact: true }).waitFor({ state: "visible", timeout: 20_000 });
  await search.fill("");
  await page.getByText("Journal d’activité détaillé", { exact: true }).waitFor({ state: "visible", timeout: 20_000 });
  await page.screenshot({ path: path.join(screenshotsDir, "learner-360-desktop.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("tab", { name: "Profil", exact: true }).click();
  await page.getByText("Profil candidat et accès", { exact: false }).first().waitFor({ state: "visible", timeout: 20_000 });
  const dimensions = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  if (dimensions.scrollWidth > dimensions.clientWidth + 2) throw new Error(`Débordement mobile détecté (${dimensions.scrollWidth}/${dimensions.clientWidth}).`);
  await page.screenshot({ path: path.join(screenshotsDir, "learner-360-mobile.png"), fullPage: true });

  await page.setViewportSize({ width: 1280, height: 850 });
  await page.goto(`${baseUrl}/admin?tab=kanban`, { waitUntil: "commit", timeout: 60_000 });
  await page.getByRole("heading", { name: "Tableau de bord — Candidatures", exact: true }).waitFor({ state: "visible", timeout: 45_000 });
  const kanbanVisible = await page.getByText("Vue Kanban — Candidatures", { exact: true }).count();
  const kanbanNavigation = await page.getByText("Kanban candidatures", { exact: true }).count();
  if (kanbanVisible || kanbanNavigation) throw new Error("La vue Kanban ou son lien reste visible.");

  const report = {
    status: "passed",
    learnerIdChecked: true,
    kpis: 6,
    tabs: tabs.map(([tab]) => tab),
    adminLearnerBadge: true,
    legacyKanbanRedirect: true,
    activityEmptyState: true,
    mobileOverflow: false,
    mobileWidth: dimensions.clientWidth,
    mobileScrollWidth: dimensions.scrollWidth,
  };
  fs.writeFileSync(path.resolve("docs", "learner-360-browser-qa.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report));
  await context.close();
} finally {
  await browser.close();
}
