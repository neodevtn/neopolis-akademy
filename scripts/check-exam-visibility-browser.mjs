import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const root = process.cwd();
const baseUrl = (process.env.EXAM_VISIBILITY_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const learnerEmail = process.env.QA_EMAIL;
const learnerPassword = process.env.QA_PASSWORD;
const adminEmail = process.env.QA_ADMIN_EMAIL || process.env.QA_EMAIL;
const adminPassword = process.env.QA_ADMIN_PASSWORD || process.env.QA_PASSWORD;
const output = path.join(root, "docs", "exam-visibility-browser-qa.json");
const screenshotDir = path.join(root, "docs", "exam-visibility-screenshots");

if (!learnerEmail || !learnerPassword) throw new Error("Les identifiants QA apprenant sont requis pour vérifier le catalogue et les examens.");
if (!adminEmail || !adminPassword) throw new Error("Les identifiants QA administrateur sont requis pour vérifier la hiérarchie catalogue admin.");
fs.mkdirSync(screenshotDir, { recursive: true });

async function login(context, email, password) {
  const response = await context.request.post(`${baseUrl}/api/auth/login`, {
    data: { email, password },
    headers: { "x-neopolis-qa-probe": "1" },
  });
  if (!response.ok()) throw new Error(`Connexion QA refusée (${response.status()}).`);
  const session = response.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!session) throw new Error("La connexion QA n’a pas retourné de session.");
  await context.addCookies([{ name: "app_session_id", value: session, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer", "--no-zygote"],
});

const results = [];
try {
  const learnerContext = await browser.newContext({ viewport: { width: 390, height: 844 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  await login(learnerContext, learnerEmail, learnerPassword);
  const learnerPage = await learnerContext.newPage();
  await learnerPage.goto(`${baseUrl}/training?tab=catalog&exam_visibility_qa=1`, { waitUntil: "domcontentloaded" });
  await learnerPage.waitForFunction(() => [...document.querySelectorAll("select option")].some((option) => option.textContent?.includes("Avec examen blanc")), { timeout: 15000 });
  const filters = learnerPage.locator("select");
  const examFilter = filters.nth(6);
  await examFilter.selectOption("with_exam");
  await learnerPage.waitForFunction(() => document.body.innerText.includes("Examen blanc de certification disponible"), { timeout: 10000 });
  const examCatalogText = await learnerPage.locator("body").innerText();
  const examCards = await learnerPage.locator('a[href^="/training/claude_certified_"]').count();
  results.push({
    type: "learner_catalog_exam_filter",
    selected: await examFilter.inputValue(),
    examCards,
    hasExamBadge: examCatalogText.includes("Examen blanc"),
    hasQuestionsAndDuration: /\b(53|60|63) questions\b/.test(examCatalogText) && examCatalogText.includes("120 min"),
  });
  await learnerPage.screenshot({ path: path.join(screenshotDir, "learner-catalog-exam-filter-mobile.png"), fullPage: false });

  await learnerPage.goto(`${baseUrl}/training/claude_certified_associate_foundations?exam_visibility_qa=1`, { waitUntil: "domcontentloaded" });
  await learnerPage.waitForFunction(() => document.body.innerText.includes("Examen blanc"), { timeout: 15000 });
  const certificationText = await learnerPage.locator("body").innerText();
  results.push({
    type: "learner_certification_exam_panel",
    hasExamCallout: certificationText.includes("Examen blanc"),
    hasExamDetails: certificationText.includes("60 questions") && certificationText.includes("120 min") && certificationText.includes("720/1000"),
    hasUnlockOrLockedMessage: certificationText.includes("débloqué") || certificationText.includes("verrouillé"),
  });
  await learnerPage.screenshot({ path: path.join(screenshotDir, "learner-certification-exam-panel-mobile.png"), fullPage: false });
  const learnerDimensions = await learnerPage.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const overflowing = [...document.querySelectorAll("body *")]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === "string" ? element.className.slice(0, 160) : "",
          text: (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 120),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter((item) => item.right > clientWidth + 2 || item.left < -2 || item.width > clientWidth + 2)
      .sort((a, b) => b.right - a.right)
      .slice(0, 12);
    return { clientWidth, scrollWidth, overflowing };
  });
  results.push({ type: "learner_mobile_layout", ...learnerDimensions, overflow: learnerDimensions.scrollWidth > learnerDimensions.clientWidth + 2 });
  await learnerContext.close();

  const adminContext = await browser.newContext({ viewport: { width: 1280, height: 720 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  await login(adminContext, adminEmail, adminPassword);
  const adminPage = await adminContext.newPage();
  await adminPage.goto(`${baseUrl}/admin/content?mode=catalog&exam_visibility_qa=1`, { waitUntil: "domcontentloaded" });
  await adminPage.waitForFunction(() => document.body.innerText.includes("Catalogue apprenant : catégories"), { timeout: 15000 });
  const adminText = await adminPage.locator("body").innerText();
  results.push({
    type: "admin_catalog_hierarchy",
    hasLearnerCatalogTitle: adminText.includes("Catalogue apprenant : catégories"),
    hasHierarchyLevels: ["Catégorie de formation", "Formation / certification", "Cours et activités"].every((text) => adminText.includes(text)),
    hasExamManagement: adminText.includes("Gérer l’examen de certification"),
    hasExamDetails: adminText.includes("60 questions") && adminText.includes("120 min"),
  });
  await adminPage.screenshot({ path: path.join(screenshotDir, "admin-catalog-hierarchy.png"), fullPage: false });
  await adminContext.close();
} finally {
  await browser.close();
}

fs.writeFileSync(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, results }, null, 2)}\n`);
console.table(results);
const failures = results.filter((result) =>
  result.type === "learner_catalog_exam_filter" && (result.selected !== "with_exam" || result.examCards < 4 || !result.hasExamBadge || !result.hasQuestionsAndDuration)
  || result.type === "learner_certification_exam_panel" && (!result.hasExamCallout || !result.hasExamDetails || !result.hasUnlockOrLockedMessage)
  || result.type === "learner_mobile_layout" && result.overflow
  || result.type === "admin_catalog_hierarchy" && (!result.hasLearnerCatalogTitle || !result.hasHierarchyLevels || !result.hasExamManagement || !result.hasExamDetails),
);
if (failures.length) {
  console.error(JSON.stringify({ failures }, null, 2));
  process.exitCode = 1;
}
