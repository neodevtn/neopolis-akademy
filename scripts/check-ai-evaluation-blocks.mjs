import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.COURSE_AI_BLOCK_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const learnerEmail = process.env.QA_EMAIL;
const learnerPassword = process.env.QA_PASSWORD;
const requestedCatalog = (process.env.COURSE_AI_BLOCK_QA_CATALOG || "all").toLowerCase();
const desktop = process.env.COURSE_AI_BLOCK_QA_VIEWPORT === "desktop";
const viewport = desktop ? { width: 1440, height: 1000 } : { width: 390, height: 844 };
const reportPath = resolve("docs/ai_evaluation_block_qa_2026-08-26.json");
if (!learnerEmail || !learnerPassword) throw new Error("QA_EMAIL et QA_PASSWORD sont requis.");

const index = JSON.parse(readFileSync(resolve("client/src/data/trainingIndex.json"), "utf8"));
const courseMeta = new Map((index.courses || []).map((course) => [course.id, course]));
const catalogFor = (courseId) => {
  const certId = courseMeta.get(courseId)?.certId || "";
  if (certId.startsWith("datacamp_")) return "datacamp";
  if (certId.includes("claude_certified") || certId.includes("anthropic")) return "anthropic";
  if (certId.includes("novasavo")) return "novasavo";
  return "other";
};

const blocks = [];
for (const filename of readdirSync(resolve("client/public/data/courses")).filter((name) => name.endsWith(".json"))) {
  const course = JSON.parse(readFileSync(join(resolve("client/public/data/courses"), filename), "utf8"));
  for (const [lessonIndex, lesson] of (course.lessons || []).entries()) {
    for (const [chapterIndex, chapter] of (lesson.chapters || []).entries()) {
      for (const block of chapter.blocks || []) {
        if (block.type === "ai_evaluation") blocks.push({ courseId: course.courseId, lessonIndex, chapterIndex, blockId: block.id, catalog: catalogFor(course.courseId), minWords: block.minWords || 50 });
      }
    }
  }
}

const scopedBlocks = requestedCatalog === "all" ? blocks : blocks.filter((block) => block.catalog === requestedCatalog);
const result = {
  generatedAt: new Date().toISOString(),
  requestedCatalog,
  viewport,
  totalBlocks: blocks.length,
  scopedBlockCount: scopedBlocks.length,
  catalogCounts: Object.fromEntries(["anthropic", "datacamp", "novasavo", "other"].map((catalog) => [catalog, blocks.filter((block) => block.catalog === catalog).length])),
  staticChecks: scopedBlocks.map((block) => ({ ...block, certId: courseMeta.get(block.courseId)?.certId || null, resolvable: Boolean(courseMeta.get(block.courseId)?.certId) })),
  interactiveCheck: null,
};

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer", "--no-zygote"] });
try {
  const target = scopedBlocks[0];
  if (!target) {
    writeFileSync(reportPath, `${JSON.stringify(result, null, 2)}\n`);
    console.table({ catalog: requestedCatalog, aiEvaluationBlocks: 0, interactiveCheck: "non requis" });
  } else {
    const context = await browser.newContext({ viewport, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
    const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email: learnerEmail, password: learnerPassword }, headers: { "x-neopolis-qa-probe": "1" } });
    if (!login.ok()) throw new Error(`Connexion apprenant refusée (${login.status()}).`);
    const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
    if (!cookie) throw new Error("Cookie de session apprenant absent.");
    await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
    const meta = courseMeta.get(target.courseId);
    const page = await context.newPage();
    await page.goto(`${baseUrl}/training/${meta.certId}/${target.courseId}?lesson=${target.lessonIndex}&chapter=${target.chapterIndex}`, { waitUntil: "domcontentloaded" });
    const accept = page.getByRole("button", { name: "Accepter" });
    await accept.waitFor({ state: "visible", timeout: 2_000 }).catch(() => undefined);
    if (await accept.count()) await accept.first().click().catch(() => undefined);
    const textarea = page.locator("textarea").first();
    await textarea.waitFor({ state: "visible", timeout: 15_000 });
    const initialText = await page.locator("body").innerText();
    const baseAnswer = "Je commence par formuler une demande claire avec le contexte utile et un objectif observable. Je vérifie ensuite le résultat obtenu avec un exemple entièrement fictif. Je contrôle la cohérence entre la demande, les éléments fournis et la réponse proposée. J’identifie les limites, les ambiguïtés et les hypothèses qui demandent une vérification humaine. Enfin, je reformule mon instruction avec des critères plus précis, je compare le nouveau résultat au précédent et je conserve seulement une conclusion justifiée, reproductible et adaptée au sujet de l’exercice.";
    const baseWordCount = baseAnswer.trim().split(/\s+/).length;
    const answer = Array.from({ length: Math.max(1, Math.ceil((target.minWords + 8) / baseWordCount)) }, () => baseAnswer).join(" ");
    await textarea.fill(answer);
    const evaluateButton = page.getByRole("button", { name: /Évaluer avec l.?IA|Evaluate with AI/ });
    if (!(await evaluateButton.count())) {
      const buttonLabels = await page.getByRole("button").allTextContents();
      throw new Error(`Bouton d’évaluation absent sur ${page.url()}. Boutons visibles : ${buttonLabels.join(" | ")}. Page : ${(await page.locator("body").innerText()).slice(0, 900)}`);
    }
    if (!(await evaluateButton.isEnabled())) throw new Error(`Bouton d’évaluation bloqué malgré ${answer.trim().split(/\s+/).length} mots pour un seuil de ${target.minWords}.`);
    const responseRequest = page.waitForResponse((response) => response.url().includes("training.evaluate") && response.request().method() === "POST");
    await evaluateButton.click();
    const response = await responseRequest;
    await page.waitForFunction(() => /Score IA|AI Score|Évaluation échouée|Evaluation failed|n’a pas pu être effectuée|could not be completed/.test(document.body.innerText), { timeout: 15_000 }).catch(() => undefined);
    const evaluationCard = page.getByText(/Score IA|AI Score/).locator("..").locator("..");
    const evaluationText = await evaluationCard.innerText().catch(async () => page.locator("body").innerText());
    const style = await evaluationCard.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { maxHeight: computed.maxHeight, overflowY: computed.overflowY, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight };
    }).catch(() => ({ maxHeight: "", overflowY: "", scrollHeight: 0, clientHeight: 0 }));
    const screenshot = resolve(`docs/block-qa-screenshots/ai-evaluation-${requestedCatalog}-${desktop ? "desktop" : "mobile"}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    result.interactiveCheck = {
      courseId: target.courseId,
      lessonIndex: target.lessonIndex,
      chapterIndex: target.chapterIndex,
      blockId: target.blockId,
      requestStatus: response.status(),
      inputAccepted: true,
      feedbackVisible: /Score IA|AI Score/.test(evaluationText),
      markdownFormatted: !evaluationText.includes("**"),
      fullResponseVisible: style.maxHeight === "none" && style.overflowY === "visible" && style.scrollHeight <= style.clientHeight,
      learnerControlsHidden: !/Modifier cet écran|Mode Révision/i.test(initialText),
      screenshot,
    };
    await context.close();
    writeFileSync(reportPath, `${JSON.stringify(result, null, 2)}\n`);
  }
} finally {
  await browser.close();
}

console.table({ catalog: requestedCatalog, aiEvaluationBlocks: result.scopedBlockCount, feedbackVisible: result.interactiveCheck?.feedbackVisible ?? "non requis", markdownFormatted: result.interactiveCheck?.markdownFormatted ?? "non requis", fullResponseVisible: result.interactiveCheck?.fullResponseVisible ?? "non requis", learnerControlsHidden: result.interactiveCheck?.learnerControlsHidden ?? "non requis" });
if (result.staticChecks.some((block) => !block.resolvable) || (result.interactiveCheck && (!result.interactiveCheck.feedbackVisible || !result.interactiveCheck.markdownFormatted || !result.interactiveCheck.fullResponseVisible || !result.interactiveCheck.learnerControlsHidden))) process.exitCode = 1;
