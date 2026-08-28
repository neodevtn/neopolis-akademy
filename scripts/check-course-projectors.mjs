import fs from "node:fs";
import { chromium } from "playwright-core";

const baseUrl = (process.env.PROJECTOR_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.QA_EMAIL;
const password = process.env.QA_PASSWORD;
const courseId = process.env.PROJECTOR_QA_ID;
const courseSlug = process.env.PROJECTOR_QA_SLUG;
if (!email || !password || !courseId || !courseSlug) throw new Error("QA_EMAIL, QA_PASSWORD, PROJECTOR_QA_ID et PROJECTOR_QA_SLUG sont requis.");

const course = JSON.parse(fs.readFileSync(`client/public/data/courses/${courseId}.json`, "utf8"));
const targets = course.lessons.flatMap((lesson, lessonIndex) => lesson.chapters.map((chapter, chapterIndex) => ({ lessonIndex, chapterIndex, chapter })))
  .filter(({ chapter }) => chapter.blocks?.some((block) => block.type === "video" && block.projectorSlides?.length));
const result = { generatedAt: new Date().toISOString(), courseId, targetCount: targets.length, results: [] };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"] });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers: { "x-neopolis-qa-probe": "1" } });
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!login.ok() || !cookie) throw new Error("Connexion QA refusée.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  for (const { lessonIndex, chapterIndex } of targets) {
    const page = await context.newPage();
    const current = { lessonIndex, chapterIndex, rendered: false, audioVisible: false, slideVisible: false, providerReferenceVisible: false };
    try {
      await page.goto(`${baseUrl}/training/${courseSlug}/${courseId}?lesson=${lessonIndex}&chapter=${chapterIndex}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector('[data-block-type="video"]', { timeout: 30000 });
      const projector = page.locator('[data-block-type="video"]');
      current.rendered = true;
      current.audioVisible = await projector.locator("video").count() > 0;
      current.slideVisible = await projector.getByRole("button", { name: /Lire la leçon|Mettre en pause/ }).count() > 0;
      current.providerReferenceVisible = /DataCamp|Copilot/i.test(await projector.innerText());
    } catch (error) {
      current.error = error instanceof Error ? error.message : String(error);
      current.finalUrl = page.url();
      current.pageText = (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 600);
    } finally { await page.close(); }
    result.results.push(current);
  }
  await context.close();
} finally { await browser.close(); }
fs.writeFileSync(`docs/${courseId}_projector_matrix_qa_2026-08-28.json`, `${JSON.stringify(result, null, 2)}\n`);
console.table(result.results);
if (result.targetCount === 0 || result.results.some((item) => !item.rendered || !item.audioVisible || !item.slideVisible || item.providerReferenceVisible)) process.exitCode = 1;
