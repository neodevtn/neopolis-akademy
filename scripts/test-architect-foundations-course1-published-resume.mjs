import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEOPOLIS_BASE_URL || "https://akademy.neodev.click";
const certificationId = "claude_certified_architect_foundations";
const courseId = "claude_certified_architect_foundations__01";
const courseUrl = `${baseUrl}/training/${certificationId}/${courseId}`;
const outputDirectory = resolve(process.cwd(), ".work/anthropic-architect-lot1/published-resume");
const reportPath = resolve(process.cwd(), "docs/architect-foundations-course1-published-resume.json");
const answer = "Dans mon travail, je vérifie toujours les objectifs, les contraintes et les sources avant d’utiliser une réponse d’intelligence artificielle. Je souhaite apprendre à déléguer les tâches répétitives, à décrire un besoin de façon claire, à évaluer les résultats avec discernement et à documenter les décisions humaines. Cette méthode m’aidera à collaborer avec l’IA de manière responsable, efficace, vérifiable et adaptée à mon contexte professionnel quotidien.";

await mkdir(outputDirectory, { recursive: true });
const report = { generatedAt: new Date().toISOString(), testStartedAt: new Date().toISOString(), baseUrl, courseId, assertions: {}, screenshots: {} };
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
let page;

try {
  page = await context.newPage();
  const persistenceResponses = [];
  page.on("response", (response) => {
    if (response.url().includes("training.saveChapterProgress")) persistenceResponses.push({ status: response.status(), url: response.url() });
  });
  const loginResponse = await page.request.post(`${baseUrl}/api/demo-login`, {
    data: {
      email: process.env.NEOPOLIS_DEMO_EMAIL || "apprenant@neopolis.demo",
      password: process.env.NEOPOLIS_DEMO_PASSWORD || "NeoDemo2026!",
    },
  });
  if (!loginResponse.ok()) throw new Error(`Connexion de démonstration : HTTP ${loginResponse.status()}`);

  await page.goto(`${courseUrl}?lesson=0&chapter=1`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.locator("textarea").waitFor({ state: "visible", timeout: 30_000 });
  const rejectConsent = page.getByRole("button", { name: /Refuser|Reject/ });
  if (await rejectConsent.isVisible().catch(() => false)) await rejectConsent.click();
  if (!new URL(baseUrl).hostname.endsWith("neodev.click")) {
    await page.locator("#manus-previewer-root").evaluate((element) => element.remove()).catch(() => undefined);
  }
  const nextBefore = page.getByRole("button", { name: /Next|Suivant/ }).last();
  report.assertions.nextLockedBeforeSubmission = await nextBefore.isDisabled();
  report.screenshots.locked = resolve(outputDirectory, "checkpoint-locked.png");
  await page.screenshot({ path: report.screenshots.locked, fullPage: false });

  await page.locator("textarea").fill(answer);
  const submit = page.getByRole("button", { name: /Submit|Soumettre/ });
  await submit.click();
  await page.getByText(/✓ Submitted|✓ Soumis/).waitFor({ state: "visible", timeout: 10_000 });
  const nextAfter = page.getByRole("button", { name: /Next|Suivant/ }).last();
  report.assertions.nextUnlocksAfterSubmission = !(await nextAfter.isDisabled());
  report.screenshots.unlocked = resolve(outputDirectory, "checkpoint-unlocked.png");
  await page.screenshot({ path: report.screenshots.unlocked, fullPage: false });

  await nextAfter.click();
  await page.locator("body").filter({ hasText: /Screen 3 of 3|Écran 3 sur 3/ }).waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForTimeout(5_000);
  report.assertions.nextNavigatesAfterSubmission = true;
  report.assertions.chapterProgressPersisted = persistenceResponses.some((response) => response.status >= 200 && response.status < 300);
  report.persistenceResponses = persistenceResponses;
  await page.close();

  page = await context.newPage();
  await page.goto(courseUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.locator("body").filter({ hasText: /Screen 3 of 3|Écran 3 sur 3/ }).waitFor({ state: "visible", timeout: 30_000 });
  report.assertions.resumeRestoresChapter = true;
  report.screenshots.resumed = resolve(outputDirectory, "resume-screen-3.png");
  await page.screenshot({ path: report.screenshots.resumed, fullPage: false });
  await page.close();

  report.passed = Object.values(report.assertions).every(Boolean);
} catch (error) {
  report.passed = false;
  report.error = error instanceof Error ? error.message : String(error);
  report.pageUrl = page?.url?.() || null;
  report.pageText = (await page?.locator?.("body")?.innerText?.().catch(() => "") || "").slice(0, 1_200);
  report.screenshots.failure = resolve(outputDirectory, "resume-failure.png");
  await page?.screenshot?.({ path: report.screenshots.failure, fullPage: false }).catch(() => undefined);
} finally {
  await context.close();
  await browser.close();
}

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ passed: report.passed, testStartedAt: report.testStartedAt, reportPath }, null, 2));
if (!report.passed) process.exitCode = 1;
