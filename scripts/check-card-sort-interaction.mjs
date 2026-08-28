import fs from "node:fs";
import { chromium } from "playwright-core";

const baseUrl = (process.env.CARD_SORT_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const learnerEmail = process.env.QA_EMAIL;
const learnerPassword = process.env.QA_PASSWORD;
if (!learnerEmail || !learnerPassword) throw new Error("QA_EMAIL et QA_PASSWORD sont requis.");

const course = JSON.parse(fs.readFileSync("client/public/data/courses/ai_for_finance__01.json", "utf8"));
let target = null;
for (const [lessonIndex, lesson] of (course.lessons || []).entries()) {
  for (const [chapterIndex, chapter] of (lesson.chapters || []).entries()) {
    const block = (chapter.blocks || []).find((candidate) => candidate.type === "bucket_sort");
    if (block) {
      target = { lessonIndex, chapterIndex, block };
      break;
    }
  }
  if (target) break;
}
if (!target) throw new Error("Aucun tri de cartes AI for Finance trouvé.");

const text = (value) => typeof value === "string" ? value : (value?.fr || value?.en || "");
const poolCard = (page, cardId) => page.locator(`button[data-card-id="${cardId}"]`);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"] });
const result = { generatedAt: new Date().toISOString(), target: { lessonIndex: target.lessonIndex, chapterIndex: target.chapterIndex, blockId: target.block.id }, clickPlacement: false, lockedBeforeSubmit: null, submitEnabledAfterPlacement: false, nextUnlockedAfterCorrect: null, feedbackVisible: false, accessibility: false };
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email: learnerEmail, password: learnerPassword }, headers: { "x-neopolis-qa-probe": "1" } });
  if (!login.ok()) throw new Error(`Connexion apprenant refusée (${login.status()}).`);
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!cookie) throw new Error("Cookie de session apprenant absent.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  const page = await context.newPage();
  await page.goto(`${baseUrl}/training/datacamp_ai_for_finance/ai_for_finance__01?lesson=${target.lessonIndex}&chapter=${target.chapterIndex}`, { waitUntil: "domcontentloaded" });
  const accept = page.getByRole("button", { name: "Accepter" });
  if (await accept.count()) await accept.first().click().catch(() => undefined);

  const firstCard = target.block.cards[0];
  const firstBucket = target.block.buckets.find((bucket) => bucket.id === firstCard.correctBucket);
  await poolCard(page, firstCard.id).click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[role="button"][aria-label]')).some((element) => /Appuyez sur Entrée|Press Enter/.test(element.getAttribute('aria-label') || '')), { timeout: 5_000 });
  const targetBucket = page.locator(`[data-bucket-id="${firstBucket.id}"]`);
  await page.locator(`[data-bucket-action="${firstBucket.id}"]`).click();
  await page.waitForTimeout(120);
  result.clickPlacement = !(await poolCard(page, firstCard.id).count());
  result.accessibility = (await targetBucket.getAttribute("tabindex")) === "0" && (await targetBucket.getAttribute("aria-label"))?.includes(text(firstBucket.label));

  const submit = page.getByRole("button", { name: "Soumettre" });
  result.lockedBeforeSubmit = !(await submit.isEnabled());
  for (const card of target.block.cards.slice(1)) {
    const bucket = target.block.buckets.find((candidate) => candidate.id === card.correctBucket);
    await poolCard(page, card.id).click();
    await page.waitForFunction(() => Array.from(document.querySelectorAll('[role="button"][aria-label]')).some((element) => /Appuyez sur Entrée|Press Enter/.test(element.getAttribute('aria-label') || '')), { timeout: 5_000 });
    await page.locator(`[data-bucket-action="${bucket.id}"]`).click();
    await page.waitForTimeout(120);
  }
  result.submitEnabledAfterPlacement = await submit.isEnabled();
  if (!result.submitEnabledAfterPlacement) {
    result.remainingPoolCards = await page.locator('button[data-card-id]').allTextContents();
    result.visibleBucketTargets = await page.locator('[role="button"][aria-label]').evaluateAll((elements) => elements.map((element) => element.getAttribute('aria-label')));
    throw new Error(`Soumettre est resté désactivé. Cartes encore dans le pool : ${result.remainingPoolCards.join(' | ')}`);
  }
  await submit.click();
  await page.getByText(/Parfait|Perfect/).waitFor({ state: "visible", timeout: 5_000 });
  result.feedbackVisible = true;
  await page.waitForFunction(() => !/Validez l’activité pour continuer/i.test(document.body.innerText), { timeout: 5_000 }).catch(() => undefined);
  result.nextUnlockedAfterCorrect = !/Validez l’activité pour continuer/i.test(await page.locator("body").innerText());
  await page.screenshot({ path: "docs/block-qa-screenshots/ai-for-finance-card-sort-mobile.png", fullPage: true });
  await context.close();
} finally {
  await browser.close();
}
fs.writeFileSync("docs/ai_for_finance_card_sort_qa_2026-08-28.json", `${JSON.stringify(result, null, 2)}\n`);
console.table(result);
if (!result.clickPlacement || !result.lockedBeforeSubmit || !result.submitEnabledAfterPlacement || !result.nextUnlockedAfterCorrect || !result.feedbackVisible || !result.accessibility) process.exitCode = 1;
