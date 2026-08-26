import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.BLOCK_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const qaEmail = process.env.QA_EMAIL || process.env.DEMO_EMAIL;
const qaPassword = process.env.QA_PASSWORD || process.env.DEMO_PASSWORD;
const useDemoAuth = !process.env.QA_EMAIL && !process.env.QA_PASSWORD;
const coveragePath = resolve("docs/block_qa_coverage_2026-08-25.json");
const trainingIndexPath = resolve("client/src/data/trainingIndex.json");
const outputPath = resolve("docs/block_qa_browser_results_2026-08-25.json");
const screenshotsDir = resolve("docs/block-qa-screenshots");
const mobile = process.argv.includes("--mobile");
const maxSamples = Number(process.env.BLOCK_QA_MAX_SAMPLES || 24);
const sampleOffset = Number(process.env.BLOCK_QA_SAMPLE_OFFSET || 0);
const waitBetweenSamplesMs = Number(process.env.BLOCK_QA_WAIT_MS || 0);

if (!qaEmail || !qaPassword) throw new Error("QA_EMAIL et QA_PASSWORD, ou DEMO_EMAIL et DEMO_PASSWORD, sont requis.");

const coverage = JSON.parse(readFileSync(coveragePath, "utf8"));
const courseIndex = new Map((JSON.parse(readFileSync(trainingIndexPath, "utf8")).courses || []).map((course) => [course.id, course]));
const PILOT_COURSE_ID = "automatisation_comptable_ia__01";
const samples = coverage.blockTypes
  .filter((entry) => entry.samples?.length)
  .slice(sampleOffset, sampleOffset + maxSamples)
  .map((entry) => {
    const unlockedPilotSample = entry.samples.find((sample) => sample.courseId === PILOT_COURSE_ID && sample.lessonIndex === 0);
    return { type: entry.type, ...(unlockedPilotSample || entry.samples[0]) };
  });

mkdirSync(screenshotsDir, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer", "--no-zygote"],
});

const results = [];
try {
  const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 };
  const qaHeaders = { "x-neopolis-qa-probe": "1" };
  const context = await browser.newContext({ viewport, extraHTTPHeaders: qaHeaders });
  const loginPath = useDemoAuth ? "/api/demo-login" : "/api/auth/login";
  const login = await context.request.post(`${baseUrl}${loginPath}`, { data: { email: qaEmail, password: qaPassword }, headers: qaHeaders });
  if (!login.ok()) throw new Error(`Connexion QA refusée (${login.status()}).`);
  const sessionCookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!sessionCookie) throw new Error("La connexion démo n’a pas renvoyé de cookie de session.");
  await context.addCookies([{ name: "app_session_id", value: sessionCookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  let page = await context.newPage();

  for (const [sampleIndex, sample] of samples.entries()) {
    if (sampleIndex > 0 && sampleIndex % 8 === 0) {
      await page.close().catch(() => undefined);
      page = await context.newPage();
    }
    const courseMeta = courseIndex.get(sample.courseId);
    const certId = courseMeta?.certId || sample.courseId.replace(/__\d+$/, "");
    const url = `${baseUrl}/training/${certId}/${sample.courseId}?lesson=${sample.lessonIndex}&chapter=${sample.chapterIndex}`;
    let lastError = "";
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => document.body.innerText.trim().length > 150 || /too many requests|cours verrouillé|unité verrouillée/i.test(document.body.innerText), { timeout: 10000 }).catch(() => undefined);
        await page.waitForTimeout(400);
        const acceptCookies = page.getByRole("button", { name: "Accepter" });
        if (await acceptCookies.count()) await acceptCookies.first().click().catch(() => undefined);
        let bodyText = await page.locator("body").innerText().catch(() => "");
        if (!bodyText.trim()) {
          await page.reload({ waitUntil: "domcontentloaded" });
          await page.waitForFunction(() => document.body.innerText.trim().length > 150 || /too many requests|cours verrouillé|unité verrouillée/i.test(document.body.innerText), { timeout: 10000 }).catch(() => undefined);
          bodyText = await page.locator("body").innerText().catch(() => "");
        }
        const locked = /(?:Cours|Unité) verrouillé(?:e)?/i.test(bodyText);
        const selector = `[data-block-type="${sample.type}"]`;
        const rendered = await page.locator(selector).count();
        const measurement = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
        const rateLimited = /too many requests|trop de requêtes/i.test(bodyText);
        const screenshot = resolve(screenshotsDir, `${mobile ? "mobile" : "desktop"}-${sample.type}-${sample.courseId}-l${sample.lessonIndex + 1}-e${sample.chapterIndex + 1}.png`);
        await page.screenshot({ path: screenshot, fullPage: false });
        results.push({ type: sample.type, courseId: sample.courseId, lessonIndex: sample.lessonIndex, chapterIndex: sample.chapterIndex, required: sample.required, locked, url, finalUrl: page.url(), bodyText: bodyText.slice(0, 500), rendered, rateLimited, clientWidth: measurement.clientWidth, scrollWidth: measurement.scrollWidth, overflow: measurement.scrollWidth > measurement.clientWidth + 2, screenshot });
        await page.waitForTimeout(waitBetweenSamplesMs);
        lastError = "";
        break;
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Erreur inconnue de navigateur";
        await page.close().catch(() => undefined);
        page = await context.newPage();
      }
    }
    if (lastError) {
      results.push({ type: sample.type, courseId: sample.courseId, lessonIndex: sample.lessonIndex, chapterIndex: sample.chapterIndex, required: sample.required, locked: false, url, finalUrl: "", bodyText: lastError, rendered: 0, rateLimited: false, clientWidth: 0, scrollWidth: 0, overflow: false, screenshot: "" });
    }
  }
  await context.close();
} finally {
  await browser.close();
}

writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), viewport: mobile ? "390x844" : "1440x1000", results }, null, 2)}\n`);
console.table(results.map(({ type, courseId, lessonIndex, chapterIndex, rendered, locked, rateLimited, overflow }) => ({ type, courseId, screen: `L${lessonIndex + 1}/E${chapterIndex + 1}`, rendered, locked, rateLimited, overflow })));
if (results.some((result) => result.rateLimited || (!result.locked && result.rendered < 1) || result.overflow)) process.exitCode = 1;
