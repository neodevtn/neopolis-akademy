import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEOPOLIS_BASE_URL || "https://akademy.neodev.click";
const courseId = "claude_certified_architect_foundations__01";
const certificationId = "claude_certified_architect_foundations";
const course = JSON.parse(await readFile(resolve(process.cwd(), `client/public/data/courses/${courseId}.json`), "utf8"));
const outputDirectory = resolve(process.cwd(), ".work/anthropic-architect-lot1/published-navigation");
const reportPath = resolve(process.cwd(), "docs/architect-foundations-course1-published-navigation.json");
const lockedTarget = course.lessons
  .flatMap((lesson, lessonIndex) => (lesson.chapters || []).map((chapter, chapterIndex) => ({ lessonIndex, chapterIndex, chapter })))
  .find(({ lessonIndex, chapter }) => lessonIndex > 0 && chapter.completionRule?.requires?.includes("requiredExercisesPassed"));

if (!lockedTarget) throw new Error("Aucun écran requis ne peut être utilisé pour le contrôle de verrouillage.");
await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const report = { generatedAt: new Date().toISOString(), baseUrl, courseId, lockedTarget: { lessonIndex: lockedTarget.lessonIndex, chapterIndex: lockedTarget.chapterIndex }, assertions: {}, screenshots: {} };

try {
  const loginResponse = await page.request.post(`${baseUrl}/api/demo-login`, {
    data: {
      email: process.env.NEOPOLIS_DEMO_EMAIL || "apprenant@neopolis.demo",
      password: process.env.NEOPOLIS_DEMO_PASSWORD || "NeoDemo2026!",
    },
  });
  if (!loginResponse.ok()) throw new Error(`Connexion de démonstration : HTTP ${loginResponse.status()}`);

  await page.route("**/api/trpc/**", async (route) => {
    if (route.request().method() === "POST") return route.abort("blockedbyclient");
    return route.continue();
  });
  const startUrl = `${baseUrl}/training/${certificationId}/${courseId}?lesson=0&chapter=0`;
  await page.goto(startUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.locator("body").filter({ hasText: /Screen 1 of 3|Écran 1 sur 3/ }).waitFor({ state: "visible", timeout: 30_000 });
  report.screenshots.start = resolve(outputDirectory, "start.png");
  await page.screenshot({ path: report.screenshots.start, fullPage: false });

  const next = page.getByRole("button", { name: /Next|Suivant/ }).last();
  await next.click();
  await page.locator("body").filter({ hasText: /Screen 2 of 3|Écran 2 sur 3/ }).waitFor({ state: "visible", timeout: 10_000 });
  report.assertions.nextNavigates = true;
  report.screenshots.next = resolve(outputDirectory, "next.png");
  await page.screenshot({ path: report.screenshots.next, fullPage: false });

  const previous = page.getByRole("button", { name: /Previous|Précédent/ }).last();
  await previous.click();
  await page.locator("body").filter({ hasText: /Screen 1 of 3|Écran 1 sur 3/ }).waitFor({ state: "visible", timeout: 10_000 });
  report.assertions.previousNavigates = true;

  await page.goto(`${baseUrl}/training/${certificationId}/${courseId}?lesson=${lockedTarget.lessonIndex}&chapter=${lockedTarget.chapterIndex}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.locator("body").filter({ hasText: /Unit locked|Unité verrouillée|Pourquoi avons-nous besoin|Why do we need AI Fluency/ }).waitFor({ state: "visible", timeout: 30_000 });
  const blockedText = await page.locator("body").innerText();
  report.assertions.lockedPathIsNotOpened = /Unit locked|Unité verrouillée|Terminez l’unité actuellement disponible/.test(blockedText) || !page.url().includes(`lesson=${lockedTarget.lessonIndex}&chapter=${lockedTarget.chapterIndex}`);
  report.screenshots.locked = resolve(outputDirectory, "locked.png");
  await page.screenshot({ path: report.screenshots.locked, fullPage: false });
  report.passed = Object.values(report.assertions).every(Boolean);
} catch (error) {
  report.passed = false;
  report.error = error instanceof Error ? error.message : String(error);
  report.pageText = (await page.locator("body").innerText().catch(() => "")).slice(0, 1_200);
} finally {
  await context.close();
  await browser.close();
}

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ passed: report.passed, reportPath }, null, 2));
if (!report.passed) process.exitCode = 1;
