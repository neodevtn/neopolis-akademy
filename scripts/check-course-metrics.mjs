import fs from "node:fs";
import { chromium } from "playwright-core";

const courseId = process.env.COURSE_METRICS_ID;
const baseUrl = (process.env.COURSE_METRICS_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.QA_ADMIN_EMAIL;
const password = process.env.QA_ADMIN_PASSWORD;
if (!courseId || !email || !password) throw new Error("COURSE_METRICS_ID, QA_ADMIN_EMAIL et QA_ADMIN_PASSWORD sont requis.");

const coursePath = `client/public/data/courses/${courseId}.json`;
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const index = JSON.parse(fs.readFileSync("client/src/data/trainingIndex.json", "utf8"));
const certification = index.certifications.find((entry) => (entry.courses ?? []).some((item) => (typeof item === "string" ? item : item.id) === courseId));
if (!certification) throw new Error(`Certification introuvable pour ${courseId}.`);

const chapters = course.lessons.flatMap((lesson) => lesson.chapters ?? []);
const blocks = chapters.flatMap((chapter) => chapter.blocks ?? []);
const metrics = {
  activities: chapters.length,
  videos: blocks.filter((block) => block.type === "video").length,
  interactiveExercises: blocks.filter((block) => ["cloud_exercise", "bucket_sort", "single_choice_exercise", "multiple_choice_exercise", "multi_choice_exercise", "code_exercise", "ai_evaluation"].includes(block.type)).length,
  downloads: blocks.filter((block) => block.type === "download").length,
};
const expected = [`${metrics.activities} activités`, `${metrics.videos} vidéos`, `${metrics.interactiveExercises} exercices interactifs`, `${metrics.downloads} téléchargements`];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"] });
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers: { "x-neopolis-qa-probe": "1" }, timeout: 60_000 });
  if (!login.ok()) throw new Error(`Connexion administrateur refusée (${login.status()}).`);
  const cookie = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!cookie) throw new Error("Cookie de session administrateur absent.");
  await context.addCookies([{ name: "app_session_id", value: cookie, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  const page = await context.newPage();

  await page.goto(`${baseUrl}/training?tab=catalog`, { waitUntil: "commit", timeout: 60_000 });
  const card = page.locator(`a[href='/training/${certification.id}']`);
  await card.waitFor({ state: "visible", timeout: 45_000 });
  const cardText = (await card.innerText()).replace(/\s+/g, " ");
  for (const value of expected) if (!cardText.toLocaleLowerCase("fr-FR").includes(value)) throw new Error(`Carte catalogue : métrique absente « ${value} ». Contenu=${cardText}`);

  await page.goto(`${baseUrl}/training/${certification.id}`, { waitUntil: "commit", timeout: 60_000 });
  await page.waitForFunction((requiredMetrics) => {
    const pageText = document.body?.innerText?.toLocaleLowerCase("fr-FR") ?? "";
    return requiredMetrics.every((metric) => pageText.includes(metric)) && !pageText.includes("chargement...");
  }, expected, { timeout: 45_000 });
  const pageText = (await page.locator("body").innerText({ timeout: 45_000 })).replace(/\s+/g, " ");
  for (const value of expected) if (!pageText.toLocaleLowerCase("fr-FR").includes(value)) throw new Error(`Fiche formation : métrique absente « ${value} ». Contenu=${pageText.slice(0, 1800)}`);

  console.table({ courseId, certificationId: certification.id, ...metrics });
  await context.close();
} finally {
  await browser.close();
}
