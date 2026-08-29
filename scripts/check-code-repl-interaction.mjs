import fs from "node:fs";
import { chromium } from "playwright-core";

const baseUrl = (process.env.CODE_REPL_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const courseId = process.env.CODE_REPL_QA_COURSE_ID;
const certificationId = process.env.CODE_REPL_QA_CERTIFICATION_ID;
const learnerEmail = process.env.QA_EMAIL;
const learnerPassword = process.env.QA_PASSWORD;

if (!courseId || !certificationId || !learnerEmail || !learnerPassword) {
  throw new Error("CODE_REPL_QA_COURSE_ID, CODE_REPL_QA_CERTIFICATION_ID, QA_EMAIL et QA_PASSWORD sont requis.");
}

const course = JSON.parse(fs.readFileSync(`client/public/data/courses/${courseId}.json`, "utf8"));
let target = null;
for (const [lessonIndex, lesson] of course.lessons.entries()) {
  for (const [chapterIndex, chapter] of lesson.chapters.entries()) {
    const block = chapter.blocks?.find((candidate) => candidate.type === "code_repl" && candidate.solutionCode);
    if (block) {
      target = { lessonIndex, chapterIndex, block };
      break;
    }
  }
  if (target) break;
}
if (!target) throw new Error(`Aucun Code REPL avec solution canonique trouvé pour ${courseId}.`);

const result = {
  generatedAt: new Date().toISOString(),
  target: { lessonIndex: target.lessonIndex, chapterIndex: target.chapterIndex, blockId: target.block.id },
  editorVisible: false,
  solutionHiddenBeforeAction: false,
  canonicalSolutionSubmitted: false,
  successFeedbackVisible: false,
  nextUnlockedAfterCanonicalSolution: false,
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

  const editor = page.locator("textarea").first();
  await editor.waitFor({ state: "visible", timeout: 30_000 });
  result.editorVisible = await editor.isVisible();
  result.solutionHiddenBeforeAction = !(await page.locator("body").innerText()).includes(target.block.solutionCode);

  await editor.fill(target.block.solutionCode);
  const execute = page.getByRole("button", { name: /Exécuter|Run/ });
  await execute.click();
  result.canonicalSolutionSubmitted = true;

  const success = page.getByText(/Votre code correspond à la solution attendue|matches the expected solution/i);
  await success.waitFor({ state: "visible", timeout: 10_000 });
  result.successFeedbackVisible = await success.isVisible();
  await page.waitForFunction(() => !/Validez l’activité pour continuer/i.test(document.body.innerText), { timeout: 10_000 });
  result.nextUnlockedAfterCanonicalSolution = !/Validez l’activité pour continuer/i.test(await page.locator("body").innerText());
  await page.screenshot({ path: `docs/block-qa-screenshots/${courseId}-code-repl-mobile.png`, fullPage: true });
  await context.close();
} finally {
  await browser.close();
}

fs.writeFileSync(`docs/${courseId}_code_repl_qa_2026-08-29.json`, `${JSON.stringify(result, null, 2)}\n`);
console.table(result);
if (!Object.values(result).filter((value) => typeof value === "boolean").every(Boolean)) process.exitCode = 1;
