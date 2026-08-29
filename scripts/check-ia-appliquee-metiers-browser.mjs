import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const root = process.cwd();
const baseUrl = (process.env.BLOCK_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.QA_ADMIN_EMAIL;
const password = process.env.QA_ADMIN_PASSWORD;
const learnerEmail = process.env.QA_EMAIL;
const learnerPassword = process.env.QA_PASSWORD;
const mobile = process.argv.includes("--mobile");
const certificationId = "ia_appliquee_metiers_tp";
const samples = [1, 7, 11, 17, 22, 27, 32, 37];
const courseId = (order) => `${certificationId}__${String(order).padStart(2, "0")}`;
const standaloneCertificationId = (order) => `${certificationId}__formation_${String(order).padStart(2, "0")}`;
const source = JSON.parse(fs.readFileSync(path.resolve(root, "../ia_appliquee_metiers_tp_bundle/catalogue_ia_appliquee_metiers_tp.json"), "utf8"));
const byOrder = new Map(source.tutorials.map((tutorial) => [tutorial.order, tutorial]));
const output = path.join(root, "docs", `ia-appliquee-metiers-browser-${mobile ? "mobile" : "desktop"}.json`);
const screenshots = path.join(root, "docs", "ia-appliquee-metiers-screenshots");

if (!email || !password || !learnerEmail || !learnerPassword) throw new Error("Les identifiants QA administrateur et apprenant sont requis pour la QA des TP.");
fs.mkdirSync(screenshots, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer", "--no-zygote"],
});
const results = [];

try {
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers: { "x-neopolis-qa-probe": "1" } });
  if (!login.ok()) throw new Error(`Connexion administrateur QA refusée (${login.status()}).`);
  const session = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!session) throw new Error("La connexion administrateur QA n’a pas retourné de session.");
  await context.addCookies([{ name: "app_session_id", value: session, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  let page = await context.newPage();

  for (const order of samples) {
    const tutorial = byOrder.get(order);
    const url = `${baseUrl}/training/${standaloneCertificationId(order)}/${courseId(order)}?lesson=0&chapter=0`;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForFunction((title) => document.body.innerText.includes(title), tutorial.title, { timeout: 12000 });
    const dimensions = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
    const screenshot = path.join(screenshots, `${mobile ? "mobile" : "desktop"}-tp-${String(order).padStart(2, "0")}.png`);
    await page.screenshot({ path: screenshot, fullPage: false });
    results.push({ type: "representative_screen", order, url, titleVisible: (await page.locator("body").innerText()).includes(tutorial.title), overflow: dimensions.scrollWidth > dimensions.clientWidth + 2, screenshot });
  }

  await page.close();
  await context.close();
  const learnerContext = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const learnerLogin = await learnerContext.request.post(`${baseUrl}/api/auth/login`, { data: { email: learnerEmail, password: learnerPassword }, headers: { "x-neopolis-qa-probe": "1" } });
  if (!learnerLogin.ok()) throw new Error(`Connexion apprenant QA refusée (${learnerLogin.status()}).`);
  const learnerSession = learnerLogin.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!learnerSession) throw new Error("La connexion apprenant QA n’a pas retourné de session.");
  await learnerContext.addCookies([{ name: "app_session_id", value: learnerSession, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  page = await learnerContext.newPage();

  const pilotBase = `${baseUrl}/training/${standaloneCertificationId(1)}/${courseId(1)}?lesson=0`;
  await page.goto(`${pilotBase}&chapter=1`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-block-type="resource_review"]', { timeout: 12000 });
  const sourceAnchor = page.locator('[data-block-type="resource_review"] a[target="_blank"]');
  const nextButton = page.getByRole("button", { name: /Suivant|Next/ }).first();
  const beforeReviewLocked = await nextButton.isDisabled();
  await page.getByRole("button", { name: /J’ai consulté cette ressource|I have reviewed this resource/ }).click();
  const afterReviewUnlocked = !(await nextButton.isDisabled());
  results.push({ type: "resource_gate", order: 1, sourceUrl: await sourceAnchor.getAttribute("href"), sourceOpensNewTab: await sourceAnchor.getAttribute("target") === "_blank", gateTested: beforeReviewLocked, reviewModeNavigation: !beforeReviewLocked, afterReviewUnlocked });

  await page.goto(`${pilotBase}&chapter=3`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-block-type="knowledge_check"]', { timeout: 12000 });
  const checkpointNext = page.getByRole("button", { name: /Suivant|Next/ }).first();
  const checkpointLocked = await checkpointNext.isDisabled();
  await page.locator('[data-block-type="knowledge_check"] button').first().click();
  const checkpointFeedback = await page.locator('[data-block-type="knowledge_check"]').innerText();
  results.push({ type: "checkpoint_gate", order: 1, gateTested: checkpointLocked, reviewModeNavigation: !checkpointLocked, correctFeedbackVisible: /Bonne réponse|Correct answer/i.test(checkpointFeedback), afterAnswerUnlocked: !(await checkpointNext.isDisabled()) });

  await page.goto(`${pilotBase}&chapter=4`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("textarea", { timeout: 12000 });
  const proof = page.locator("textarea").first();
  const submit = page.getByRole("button", { name: /Valider|Submit/ }).first();
  const proofInitiallyBlocked = await submit.isDisabled();
  await proof.fill("Test fictif documenté : le résultat est contrôlé et l’action sensible reste à valider humainement.");
  await submit.click();
  const practicalText = await page.locator("body").innerText();
  results.push({ type: "mini_project", order: 1, proofInitiallyBlocked, correctionVisibleAfterSubmission: /Correction|Solution/i.test(practicalText) });

  await page.goto(`${pilotBase}&chapter=5`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-block-type="single_choice_exercise"]', { timeout: 12000 });
  await page.locator('[data-block-type="single_choice_exercise"] button').first().click();
  await page.getByRole("button", { name: /Vérifier la réponse|Check Answer/ }).first().click();
  const quizText = await page.locator('[data-block-type="single_choice_exercise"]').first().innerText();
  results.push({ type: "final_quiz", order: 1, questionCount: await page.locator('[data-block-type="single_choice_exercise"]').count(), sortingVisible: await page.locator('[data-block-type="bucket_sort"]').count() === 1, correctionVisibleAfterAnswer: /Correct\s*!/i.test(quizText) });

  await learnerContext.close();
} finally {
  await browser.close();
}

fs.writeFileSync(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), viewport: mobile ? "390x844" : "1440x1000", results }, null, 2)}\n`);
console.table(results.map((result) => ({ type: result.type, tp: result.order, overflow: result.overflow ?? false, success: Object.entries(result).filter(([key]) => /Visible|Unlocked|Feedback|correction|sorting/i.test(key)).every(([, value]) => value === true) })));
const failures = results.filter((result) => result.overflow || result.titleVisible === false || result.afterReviewUnlocked === false || result.sourceOpensNewTab === false || result.correctFeedbackVisible === false || result.afterAnswerUnlocked === false || result.proofInitiallyBlocked === false || result.correctionVisibleAfterSubmission === false || result.questionCount !== undefined && (result.questionCount < 4 || result.sortingVisible === false || result.correctionVisibleAfterAnswer === false));
if (failures.length) process.exitCode = 1;
