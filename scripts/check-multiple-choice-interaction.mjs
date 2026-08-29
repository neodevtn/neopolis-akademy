import fs from "node:fs";
import { chromium } from "playwright-core";

const baseUrl = (process.env.MULTI_CHOICE_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const courseId = process.env.MULTI_CHOICE_QA_COURSE_ID;
const certificationId = process.env.MULTI_CHOICE_QA_CERTIFICATION_ID;
const sourceActivityType = process.env.MULTI_CHOICE_QA_SOURCE_TYPE || "";
const selectedLessonIndex = process.env.MULTI_CHOICE_QA_LESSON_INDEX === undefined
  ? null
  : Number.parseInt(process.env.MULTI_CHOICE_QA_LESSON_INDEX, 10);
const learnerEmail = process.env.QA_EMAIL;
const learnerPassword = process.env.QA_PASSWORD;

if (!courseId || !certificationId || !learnerEmail || !learnerPassword) {
  throw new Error("MULTI_CHOICE_QA_COURSE_ID, MULTI_CHOICE_QA_CERTIFICATION_ID, QA_EMAIL et QA_PASSWORD sont requis.");
}
if (selectedLessonIndex !== null && (!Number.isInteger(selectedLessonIndex) || selectedLessonIndex < 0)) {
  throw new Error("MULTI_CHOICE_QA_LESSON_INDEX doit être un entier positif ou nul.");
}

const course = JSON.parse(fs.readFileSync(`client/public/data/courses/${courseId}.json`, "utf8"));
const text = (value) => typeof value === "string" ? value : value?.fr || value?.en || "";
let target = null;

for (const [lessonIndex, lesson] of course.lessons.entries()) {
  if (selectedLessonIndex !== null && lessonIndex !== selectedLessonIndex) continue;
  for (const [chapterIndex, chapter] of lesson.chapters.entries()) {
    if (sourceActivityType && chapter.sourceActivityType !== sourceActivityType) continue;
    const block = chapter.blocks?.find((candidate) => candidate.type === "multi_choice_exercise");
    if (block) {
      target = { lessonIndex, chapterIndex, block };
      break;
    }
  }
  if (target) break;
}

if (!target) throw new Error(`Aucun QCM multiple ${sourceActivityType || ""} trouvé pour ${courseId}.`);
const correctIds = String(target.block.correctAnswers || "").split(",").map((id) => id.trim()).filter(Boolean);
if (!correctIds.length) throw new Error("Le QCM sélectionné ne définit aucune réponse correcte.");

const result = {
  generatedAt: new Date().toISOString(),
  target: { lessonIndex: target.lessonIndex, chapterIndex: target.chapterIndex, blockId: target.block.id, sourceActivityType: sourceActivityType || "any" },
  visualContextRendered: true,
  chatScenarioRendered: true,
  correctionHiddenBeforeAttempt: false,
  submitLockedBeforeSelection: false,
  submitEnabledAfterSelection: false,
  feedbackVisible: false,
  nextUnlockedAfterCorrect: false,
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"],
});

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, {
    data: { email: learnerEmail, password: learnerPassword },
    headers: { "x-neopolis-qa-probe": "1" },
  });
  if (!login.ok()) throw new Error(`Connexion apprenant refusée (${login.status()}).`);
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!cookie) throw new Error("Cookie de session apprenant absent.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);

  const page = await context.newPage();
  await page.goto(`${baseUrl}/training/${certificationId}/${courseId}?lesson=${target.lessonIndex}&chapter=${target.chapterIndex}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  const accept = page.getByRole("button", { name: "Accepter" });
  if (await accept.count()) await accept.first().click().catch(() => undefined);

  if (target.block.visualAssetUrl) {
    result.visualContextRendered = await page.locator("img").evaluateAll((images, expectedUrl) => images.some((image) => image.getAttribute("src") === expectedUrl && image.complete && image.naturalWidth > 0), target.block.visualAssetUrl);
  }
  if (target.block.chatScenario?.messages?.length) {
    const firstMessage = text(target.block.chatScenario.messages[0]?.text);
    const scenarioMessage = firstMessage ? page.getByText(firstMessage, { exact: true }) : null;
    if (scenarioMessage) await scenarioMessage.waitFor({ state: "visible", timeout: 10_000 });
    result.chatScenarioRendered = Boolean(scenarioMessage && await scenarioMessage.isVisible());
  }

  const explanation = text(target.block.explanation);
  result.correctionHiddenBeforeAttempt = explanation ? !(await page.locator("body").innerText()).includes(explanation) : true;
  const submit = page.getByRole("button", { name: /Vérifier|Check answers/ });
  result.submitLockedBeforeSelection = !(await submit.isEnabled());

  for (const optionId of correctIds) {
    const option = target.block.options.find((candidate) => candidate.id === optionId);
    if (!option) throw new Error(`Option correcte introuvable : ${optionId}`);
    await page.getByRole("button", { name: text(option.text), exact: true }).click();
  }
  result.submitEnabledAfterSelection = await submit.isEnabled();
  await submit.click();

  const feedback = explanation ? page.getByText(explanation, { exact: true }) : null;
  if (feedback) await feedback.waitFor({ state: "visible", timeout: 5_000 });
  result.feedbackVisible = !feedback || await feedback.isVisible();
  await page.waitForFunction(() => !/Validez l’activité pour continuer/i.test(document.body.innerText), { timeout: 5_000 }).catch(() => undefined);
  result.nextUnlockedAfterCorrect = !/Validez l’activité pour continuer/i.test(await page.locator("body").innerText());
  await page.screenshot({ path: `docs/block-qa-screenshots/${courseId}-multi-choice-mobile.png`, fullPage: true });
  await context.close();
} finally {
  await browser.close();
}

fs.writeFileSync(`docs/${courseId}_multi_choice_qa_2026-08-28.json`, `${JSON.stringify(result, null, 2)}\n`);
console.table(result);
if (!Object.values(result).filter((value) => typeof value === "boolean").every(Boolean)) process.exitCode = 1;
