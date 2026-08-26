import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.CHECK_NOVASAVO_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const learnerEmail = process.env.QA_EMAIL;
const learnerPassword = process.env.QA_PASSWORD;
const adminEmail = process.env.QA_ADMIN_EMAIL;
const adminPassword = process.env.QA_ADMIN_PASSWORD;
const course = JSON.parse(readFileSync(resolve("client/public/data/courses/automatisation_comptable_ia__01.json"), "utf8"));
const reportPath = resolve("docs/novasavo_course_replay_2026-08-26.json");
const certId = "novasavo_automatisation_comptable_ia";
const maxScreens = Number(process.env.CHECK_NOVASAVO_MAX_SCREENS || 0);
const skipInteractions = process.env.CHECK_NOVASAVO_SKIP_INTERACTIONS === "1";
const skipScreens = process.env.CHECK_NOVASAVO_SKIP_SCREENS === "1";
const screensToCheck = skipScreens ? [] : screenEntries.slice(0, maxScreens || screenEntries.length);
const screenEntries = course.lessons.flatMap((lesson, lessonIndex) => lesson.chapters.map((chapter, chapterIndex) => ({ lessonIndex, chapterIndex, chapter })));

if (![learnerEmail, learnerPassword, adminEmail, adminPassword].every(Boolean)) {
  throw new Error("QA_EMAIL, QA_PASSWORD, QA_ADMIN_EMAIL et QA_ADMIN_PASSWORD sont requis.");
}

function courseUrl(lessonIndex, chapterIndex) {
  return `${baseUrl}/training/${certId}/${course.courseId}?lesson=${lessonIndex}&chapter=${chapterIndex}`;
}

async function login(context, email, password) {
  const headers = { "x-neopolis-qa-probe": "1" };
  const response = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers });
  if (!response.ok()) throw new Error(`Connexion QA refusée (${response.status()}).`);
  const sessionCookie = response.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!sessionCookie) throw new Error("La connexion QA n’a pas renvoyé de cookie de session.");
  await context.addCookies([{ name: "app_session_id", value: sessionCookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
}

async function openScreen(page, lessonIndex, chapterIndex) {
  await page.goto(courseUrl(lessonIndex, chapterIndex), { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.innerText.trim().length > 120, { timeout: 12_000 }).catch(() => undefined);
  const acceptCookies = page.getByRole("button", { name: "Accepter" });
  if (await acceptCookies.count()) await acceptCookies.first().click().catch(() => undefined);
  let bodyText = await page.locator("body").innerText().catch(() => "");
  if (!bodyText.trim()) {
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.innerText.trim().length > 120, { timeout: 12_000 }).catch(() => undefined);
    bodyText = await page.locator("body").innerText().catch(() => "");
  }
  return bodyText;
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer", "--no-zygote"],
});

const result = { generatedAt: new Date().toISOString(), screens: [], interactions: [], summary: {} };
try {
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  await login(adminContext, adminEmail, adminPassword);
  let adminPage = await adminContext.newPage();
  for (const [screenNumber, { lessonIndex, chapterIndex, chapter }] of screensToCheck.entries()) {
    let bodyText = "";
    let blockCount = 0;
    let replayError = "";
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        bodyText = await openScreen(adminPage, lessonIndex, chapterIndex);
        blockCount = await adminPage.locator("[data-block-type]").count();
        break;
      } catch (error) {
        replayError = error instanceof Error ? error.message : "Erreur de navigation inconnue";
        await adminPage.close().catch(() => undefined);
        adminPage = await adminContext.newPage();
      }
    }
    const expectedTitle = typeof chapter.title === "string" ? chapter.title : (chapter.title?.fr || chapter.title?.en || "");
    const locked = /(?:Cours|Unité) verrouillé(?:e)?/i.test(bodyText);
    const rendered = !locked && Boolean(expectedTitle) && bodyText.includes(expectedTitle) && blockCount > 0;
    result.screens.push({ lessonIndex, chapterIndex, expectedTitle, blockCount, locked, rendered, replayError, bodyPreview: bodyText.slice(0, 600) });
    if ((screenNumber + 1) % 12 === 0) {
      await adminPage.close().catch(() => undefined);
      adminPage = await adminContext.newPage();
    }
  }
  await adminContext.close();

  if (!skipInteractions) {
    const learnerContext = await browser.newContext({ viewport: { width: 390, height: 844 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
    await login(learnerContext, learnerEmail, learnerPassword);
    const learnerPage = await learnerContext.newPage();
    const interactionChecks = [
      { chapterIndex: 1, answer: /^Mythe$/i, label: "Mythe/Réalité" },
      { chapterIndex: 3, answer: /Vrai/i, label: "QCM partie double" },
      { chapterIndex: 8, answer: /Identifier et analyser les transactions/i, label: "QCM première étape" },
      { chapterIndex: 15, answer: /Débiter le compte Fournitures et créditer le compte Fournisseurs/i, label: "Scénario PME" },
    ];
    for (const check of interactionChecks) {
      const bodyText = await openScreen(learnerPage, 0, check.chapterIndex);
      const gate = learnerPage.getByRole("status").filter({ hasText: /activité intégrée obligatoire/i });
      const gatedBefore = await gate.count() > 0;
      const answerButtons = learnerPage.locator("button");
      const buttonTextsBefore = await answerButtons.allInnerTexts();
      const answerIndex = buttonTextsBefore.findLastIndex((text) => check.answer.test(text));
      const answerFound = answerIndex >= 0;
      if (answerFound) await answerButtons.nth(answerIndex).click();
      await learnerPage.waitForTimeout(250);
      const gatedAfter = await gate.count() > 0;
      const buttons = await answerButtons.allInnerTexts();
      result.interactions.push({ label: check.label, chapterIndex: check.chapterIndex, answerFound, locked: /(?:Cours|Unité) verrouillé(?:e)?/i.test(bodyText), gatedBefore, gatedAfter, buttons: buttons.slice(-12), bodyPreview: bodyText.slice(0, 600), passed: answerFound && gatedBefore && !gatedAfter });
    }
    await learnerContext.close();
  }
} finally {
  await browser.close();
}

result.summary = {
  expectedScreens: screensToCheck.length,
  renderedScreens: result.screens.filter((screen) => screen.rendered).length,
  interactionChecks: result.interactions.length,
  passedInteractions: result.interactions.filter((interaction) => interaction.passed).length,
};
writeFileSync(reportPath, `${JSON.stringify(result, null, 2)}\n`);
console.table(result.summary);
if (result.summary.renderedScreens !== result.summary.expectedScreens || result.summary.passedInteractions !== result.summary.interactionChecks) process.exitCode = 1;
