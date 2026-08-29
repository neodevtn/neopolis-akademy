import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const root = process.cwd();
const baseUrl = (process.env.TP_LEGACY_LINK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.QA_ADMIN_EMAIL;
const password = process.env.QA_ADMIN_PASSWORD;
const collectionId = "ia_appliquee_metiers_tp";
const sourcePath = path.resolve(root, "../ia_appliquee_metiers_tp_bundle/catalogue_ia_appliquee_metiers_tp.json");
const indexPath = path.join(root, "client/src/data/trainingIndex.json");
const outputPath = path.join(root, "docs/ia-appliquee-metiers-legacy-links-report.json");

if (!email || !password) throw new Error("Les identifiants QA administrateur sont requis pour vérifier les liens historiques des TP.");

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const certifications = Array.isArray(index.certifications) ? index.certifications : [];
const courses = Array.isArray(index.courses) ? index.courses : [];
const courseIdFor = (order) => `${collectionId}__${String(order).padStart(2, "0")}`;
const certificationIdFor = (order) => `${collectionId}__formation_${String(order).padStart(2, "0")}`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer", "--no-zygote"],
});

const results = [];
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, { data: { email, password }, headers: { "x-neopolis-qa-probe": "1" } });
  if (!login.ok()) throw new Error(`Connexion administrateur QA refusée (${login.status()}).`);
  const session = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!session) throw new Error("La connexion administrateur QA n’a pas retourné de session.");
  await context.addCookies([{ name: "app_session_id", value: session, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  const page = await context.newPage();

  for (const tutorial of source.tutorials) {
    const order = tutorial.order;
    const courseId = courseIdFor(order);
    const certificationId = certificationIdFor(order);
    const expectedPath = `/training/${certificationId}/${courseId}`;
    const legacyUrl = `${baseUrl}/training/${collectionId}/${courseId}?lesson=0&chapter=2`;
    const certification = certifications.find((entry) => entry.id === certificationId);
    const course = courses.find((entry) => entry.id === courseId);

    await page.goto(legacyUrl, { waitUntil: "domcontentloaded" });
    await page.waitForFunction((expected) => window.location.pathname === expected && new URLSearchParams(window.location.search).get("lesson") === "0" && new URLSearchParams(window.location.search).get("chapter") === "2", expectedPath, { timeout: 12000 });
    const resolvedUrl = new URL(page.url());
    results.push({
      order,
      title: tutorial.title,
      legacyUrl,
      resolvedPath: resolvedUrl.pathname,
      expectedPath,
      lessonPreserved: resolvedUrl.searchParams.get("lesson") === "0",
      chapterPreserved: resolvedUrl.searchParams.get("chapter") === "2",
      isStandaloneTP: certification?.isStandaloneTP === true,
      oneCourseAttached: Array.isArray(certification?.courses) && certification.courses.length === 1 && certification.courses[0] === courseId,
      supportPresent: Boolean(course?.downloadCount) && Number(course.downloadCount) > 0,
    });
  }

  await context.close();
} finally {
  await browser.close();
}

fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, results }, null, 2)}\n`);
const failures = results.filter((result) => result.resolvedPath !== result.expectedPath || !result.lessonPreserved || !result.chapterPreserved || !result.isStandaloneTP || !result.oneCourseAttached || !result.supportPresent);
console.table(results.map((result) => ({ tp: result.order, redirection: result.resolvedPath === result.expectedPath, lesson: result.lessonPreserved, chapter: result.chapterPreserved, standalone: result.isStandaloneTP, course: result.oneCourseAttached, support: result.supportPresent })));
if (failures.length > 0) process.exitCode = 1;
