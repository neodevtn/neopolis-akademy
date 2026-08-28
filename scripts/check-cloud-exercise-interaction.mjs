import fs from "node:fs";
import { chromium } from "playwright-core";

const baseUrl = (process.env.CLOUD_EXERCISE_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const courseId = process.env.CLOUD_EXERCISE_QA_COURSE_ID;
const certificationId = process.env.CLOUD_EXERCISE_QA_CERTIFICATION_ID;
const chapterId = process.env.CLOUD_EXERCISE_QA_CHAPTER_ID;
const learnerEmail = process.env.QA_EMAIL;
const learnerPassword = process.env.QA_PASSWORD;

if (!courseId || !certificationId || !chapterId || !learnerEmail || !learnerPassword) {
  throw new Error("CLOUD_EXERCISE_QA_COURSE_ID, CLOUD_EXERCISE_QA_CERTIFICATION_ID, CLOUD_EXERCISE_QA_CHAPTER_ID, QA_EMAIL et QA_PASSWORD sont requis.");
}

const course = JSON.parse(fs.readFileSync(`client/public/data/courses/${courseId}.json`, "utf8"));
let target = null;
for (const [lessonIndex, lesson] of course.lessons.entries()) {
  const chapterIndex = (lesson.chapters ?? []).findIndex((chapter) => chapter.id === chapterId);
  if (chapterIndex >= 0) {
    const block = lesson.chapters[chapterIndex].blocks?.find((candidate) => candidate.type === "cloud_exercise");
    if (block) target = { lessonIndex, chapterIndex, block };
    break;
  }
}
if (!target) throw new Error(`TP introuvable pour le chapitre ${chapterId}.`);

const result = {
  generatedAt: new Date().toISOString(),
  target: { lessonIndex: target.lessonIndex, chapterIndex: target.chapterIndex, blockId: target.block.id },
  rubricVisible: false,
  answerFieldVisible: false,
  submitLockedBeforeAnswer: false,
  solutionHiddenBeforeAnswer: false,
  nextLockedBeforeEvaluation: false,
  navigationButtons: [],
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
    timeout: 60_000,
  });
  if (!login.ok()) throw new Error(`Connexion apprenant refusée (${login.status()}).`);
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!cookie) throw new Error("Cookie de session apprenant absent.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);

  const page = await context.newPage();
  await page.goto(`${baseUrl}/training/${certificationId}/${courseId}?lesson=${target.lessonIndex}&chapter=${target.chapterIndex}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  const accept = page.getByRole("button", { name: "Accepter" });
  if (await accept.count()) await accept.first().click().catch(() => undefined);

  const answer = page.locator("textarea").first();
  await answer.waitFor({ state: "visible", timeout: 45_000 });
  result.answerFieldVisible = await answer.isVisible() && await answer.isEnabled();
  result.rubricVisible = await page.getByText(/Ce que votre travail doit montrer|What your work should demonstrate/).isVisible();
  const evaluate = page.getByRole("button", { name: /Évaluer ma réponse|Evaluate my answer/ });
  result.submitLockedBeforeAnswer = !(await evaluate.isEnabled());
  const solutionText = String(target.block.solution ?? "").trim();
  result.solutionHiddenBeforeAnswer = !solutionText || !(await page.locator("body").innerText()).includes(solutionText);
  result.navigationButtons = await page.getByRole("button", { name: /Suivant|Next|Validez l'activité pour continuer|Complete activity to continue/ }).evaluateAll((buttons) => buttons.map((button) => ({
    label: button.textContent?.replace(/\s+/g, " ").trim() ?? "",
    disabled: (button).disabled,
    visible: Boolean((button).offsetParent),
  })));
  const gatedNext = result.navigationButtons.find((button) => /Validez l'activité pour continuer|Complete activity to continue/i.test(button.label));
  result.nextLockedBeforeEvaluation = Boolean(gatedNext?.visible && gatedNext.disabled);
  await page.screenshot({ path: `docs/block-qa-screenshots/${courseId}-cloud-exercise-mobile.png`, fullPage: true });
  await context.close();
} finally {
  await browser.close();
}

fs.writeFileSync(`docs/${courseId}_cloud_exercise_qa_2026-08-28.json`, `${JSON.stringify(result, null, 2)}\n`);
console.table(result);
if (!Object.values(result).filter((value) => typeof value === "boolean").every(Boolean)) process.exitCode = 1;
