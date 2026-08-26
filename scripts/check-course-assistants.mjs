import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.COURSE_ASSISTANT_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const adminEmail = process.env.QA_ADMIN_EMAIL;
const adminPassword = process.env.QA_ADMIN_PASSWORD;
const learnerEmail = process.env.QA_EMAIL;
const learnerPassword = process.env.QA_PASSWORD;
const reportPath = resolve("docs/course_assistant_qa_2026-08-26.json");
const desktop = process.env.COURSE_ASSISTANT_QA_VIEWPORT === "desktop";
const viewport = desktop ? { width: 1440, height: 1000 } : { width: 390, height: 844 };
const index = JSON.parse(readFileSync(resolve("client/src/data/trainingIndex.json"), "utf8"));
const courseMeta = new Map((index.courses || []).map((course) => [course.id, course]));

if (!adminEmail || !adminPassword || !learnerEmail || !learnerPassword) throw new Error("QA_ADMIN_EMAIL, QA_ADMIN_PASSWORD, QA_EMAIL et QA_PASSWORD sont requis.");

const assistants = [];
for (const filename of readdirSync(resolve("client/public/data/courses")).filter((name) => name.endsWith(".json"))) {
  const course = JSON.parse(readFileSync(join(resolve("client/public/data/courses"), filename), "utf8"));
  for (const [lessonIndex, lesson] of (course.lessons || []).entries()) {
    for (const [chapterIndex, chapter] of (lesson.chapters || []).entries()) {
      for (const block of chapter.blocks || []) {
        if (block.type === "learning_tools" && block.toolMode === "assistant") assistants.push({ courseId: course.courseId, lessonIndex, chapterIndex, blockId: block.id });
      }
    }
  }
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer", "--no-zygote"] });
const result = { generatedAt: new Date().toISOString(), assistantCount: assistants.length, staticChecks: [], interactiveCheck: null };
try {
  async function authenticatedContext(email, password, label) {
    const context = await browser.newContext({ viewport, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
    const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers: { "x-neopolis-qa-probe": "1" } });
    if (!login.ok()) throw new Error(`Connexion QA ${label} refusée (${login.status()}).`);
    const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
    if (!cookie) throw new Error(`Cookie de session ${label} absent.`);
    await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
    return context;
  }

  for (const item of assistants) {
    const meta = courseMeta.get(item.courseId);
    result.staticChecks.push({ ...item, certId: meta?.certId || null, resolvable: Boolean(meta?.certId) });
  }

  const target = assistants[0];
  if (!target) throw new Error("Aucun assistant pédagogique trouvé dans les cours.");
  const targetMeta = courseMeta.get(target.courseId);
  const targetUrl = `${baseUrl}/training/${targetMeta.certId}/${target.courseId}?lesson=${target.lessonIndex}&chapter=${target.chapterIndex}`;
  const context = await authenticatedContext(learnerEmail, learnerPassword, "apprenant");
  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
  const acceptCookies = page.getByRole("button", { name: "Accepter" });
  await acceptCookies.waitFor({ state: "visible", timeout: 2_000 }).catch(() => undefined);
  if (await acceptCookies.count()) await acceptCookies.first().click().catch(() => undefined);
  await page.waitForFunction(() => /demandez à votre assistant/i.test(document.body.innerText), { timeout: 12_000 }).catch(() => undefined);
  const initialBody = await page.locator("body").innerText().catch(() => "");
  if (!/demandez à votre assistant/i.test(initialBody)) {
    throw new Error(`Assistant non rendu sur ${page.url()} : ${initialBody.slice(0, 600)}`);
  }
  await page.getByLabel("Question pour l’assistant pédagogique").fill("ouvre le robinet et laisse couler l’eau");
  await page.getByRole("button", { name: "Demander" }).click();
  const responseTitle = page.getByText("Réponse à votre question");
  await responseTitle.waitFor({ state: "visible", timeout: 12_000 });
  const responseCard = responseTitle.locator("..");
  const responseText = await responseCard.innerText();
  const style = await responseCard.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { maxHeight: computed.maxHeight, overflowY: computed.overflowY, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight };
  });
  const relevantQuestion = "Quels contrôles puis-je appliquer pour vérifier une suggestion de catégorisation comptable, sans donnée réelle ?";
  const relevantRequest = page.waitForResponse((response) => response.url().includes("courseAssistant.ask") && response.request().method() === "POST");
  await page.getByLabel("Question pour l’assistant pédagogique").fill(relevantQuestion);
  await page.getByRole("button", { name: "Demander" }).click();
  const relevantNetworkResponse = await relevantRequest;
  const relevantNetworkText = await relevantNetworkResponse.text().catch(() => "");
  await page.waitForFunction((question) => document.body.innerText.includes(question) || document.body.innerText.includes("Réponse indisponible"), relevantQuestion, { timeout: 12_000 }).catch(() => undefined);
  const hasRelevantAnswer = await responseTitle.count() > 0;
  const relevantResponseText = hasRelevantAnswer ? await responseCard.innerText() : "";
  const relevantStyle = hasRelevantAnswer ? await responseCard.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { maxHeight: computed.maxHeight, overflowY: computed.overflowY, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight };
  }) : { maxHeight: "", overflowY: "", scrollHeight: 0, clientHeight: 0 };
  const screenshot = resolve(`docs/block-qa-screenshots/course-assistant-${desktop ? "desktop" : "mobile"}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  result.interactiveCheck = {
    courseId: target.courseId,
    lessonIndex: target.lessonIndex,
    chapterIndex: target.chapterIndex,
    responseText,
    containsOutOfScopeMessage: /ne concerne pas l’écran/i.test(responseText),
    repeatsSuggestedContext: /contrôle humain pour usage responsable/i.test(responseText),
    fullResponseVisible: style.maxHeight === "none" && style.overflowY === "visible" && style.scrollHeight <= style.clientHeight,
    learnerControlsHidden: !/Modifier cet écran|Mode Révision/i.test(initialBody),
    relevantQuestion: {
      submitted: relevantQuestion,
      displayed: relevantResponseText.includes(relevantQuestion),
      networkStatus: relevantNetworkResponse.status(),
      networkPreview: relevantNetworkText.slice(0, 500),
      renderedError: (await page.locator("body").innerText()).includes("Réponse indisponible"),
      rejectedAsOutOfScope: /ne concerne pas l’écran/i.test(relevantResponseText),
      fullResponseVisible: relevantStyle.maxHeight === "none" && relevantStyle.overflowY === "visible" && relevantStyle.scrollHeight <= relevantStyle.clientHeight,
      answerChanged: relevantResponseText !== responseText,
      markdownFormatted: !relevantResponseText.includes("**"),
    },
    style,
    screenshot,
  };
  await context.close();
  const adminContext = await authenticatedContext(adminEmail, adminPassword, "administrateur");
  const adminPage = await adminContext.newPage();
  await adminPage.goto(targetUrl, { waitUntil: "domcontentloaded" });
  const acceptAdminCookies = adminPage.getByRole("button", { name: "Accepter" });
  await acceptAdminCookies.waitFor({ state: "visible", timeout: 2_000 }).catch(() => undefined);
  if (await acceptAdminCookies.count()) await acceptAdminCookies.first().click().catch(() => undefined);
  await adminPage.waitForFunction(() => document.body.innerText.includes("Modifier cet écran"), { timeout: 12_000 }).catch(() => undefined);
  result.interactiveCheck.adminControlsVisible = /Modifier cet écran/i.test(await adminPage.locator("body").innerText());
  await adminContext.close();
} finally {
  await browser.close();
}

writeFileSync(reportPath, `${JSON.stringify({ viewport, ...result }, null, 2)}\n`);
console.table({ assistants: result.assistantCount, resolvable: result.staticChecks.filter((item) => item.resolvable).length, outOfScope: result.interactiveCheck?.containsOutOfScopeMessage, fullResponseVisible: result.interactiveCheck?.fullResponseVisible, learnerControlsHidden: result.interactiveCheck?.learnerControlsHidden, adminControlsVisible: result.interactiveCheck?.adminControlsVisible, relevantQuestionDisplayed: result.interactiveCheck?.relevantQuestion.displayed, relevantQuestionRejected: result.interactiveCheck?.relevantQuestion.rejectedAsOutOfScope, relevantAnswerVisible: result.interactiveCheck?.relevantQuestion.fullResponseVisible, markdownFormatted: result.interactiveCheck?.relevantQuestion.markdownFormatted });
if (result.staticChecks.some((item) => !item.resolvable) || !result.interactiveCheck?.containsOutOfScopeMessage || result.interactiveCheck.repeatsSuggestedContext || !result.interactiveCheck.fullResponseVisible || !result.interactiveCheck.learnerControlsHidden || !result.interactiveCheck.adminControlsVisible || !result.interactiveCheck.relevantQuestion.displayed || result.interactiveCheck.relevantQuestion.rejectedAsOutOfScope || !result.interactiveCheck.relevantQuestion.fullResponseVisible || !result.interactiveCheck.relevantQuestion.answerChanged || !result.interactiveCheck.relevantQuestion.markdownFormatted) process.exitCode = 1;
