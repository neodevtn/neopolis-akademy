import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const root = process.cwd();
const trainingIndex = JSON.parse(fs.readFileSync(path.join(root, "client", "src", "data", "trainingIndex.json"), "utf8"));
const baseUrl = (process.env.EXAM_VISIBILITY_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const learnerEmail = process.env.QA_EMAIL;
const learnerPassword = process.env.QA_PASSWORD;
const adminEmail = process.env.QA_ADMIN_EMAIL || process.env.QA_EMAIL;
const adminPassword = process.env.QA_ADMIN_PASSWORD || process.env.QA_PASSWORD;
const output = path.join(root, "docs", "exam-visibility-browser-qa.json");
const screenshotDir = path.join(root, "docs", "exam-visibility-screenshots");

if (!learnerEmail || !learnerPassword) throw new Error("Les identifiants QA apprenant sont requis pour vérifier le catalogue et les examens.");
if (!adminEmail || !adminPassword) throw new Error("Les identifiants QA administrateur sont requis pour vérifier la hiérarchie catalogue admin.");
fs.mkdirSync(screenshotDir, { recursive: true });

async function login(context, email, password) {
  const response = await context.request.post(`${baseUrl}/api/auth/login`, {
    data: { email, password },
    headers: { "x-neopolis-qa-probe": "1" },
  });
  if (!response.ok()) throw new Error(`Connexion QA refusée (${response.status()}).`);
  const session = response.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!session) throw new Error("La connexion QA n’a pas retourné de session.");
  await context.addCookies([{ name: "app_session_id", value: session, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
}

async function markLessonComplete(context, { certificationId, courseId, lessonIndex }) {
  const response = await context.request.post(`${baseUrl}/api/trpc/training.markLessonComplete?batch=1`, {
    headers: { "content-type": "application/json", "x-neopolis-qa-probe": "1" },
    data: { "0": { json: { certificationId, courseId, lessonIndex } } },
  });
  if (!response.ok()) throw new Error(`Préparation de complétion QA impossible pour ${courseId}#${lessonIndex} (${response.status()}).`);
}

async function saveChapterProgress(context, { courseId, lessonIndex, chapterIndex, totalChapters }) {
  const response = await context.request.post(`${baseUrl}/api/trpc/training.saveChapterProgress?batch=1`, {
    headers: { "content-type": "application/json", "x-neopolis-qa-probe": "1" },
    data: { "0": { json: { courseId, lessonIndex, chapterIndex, totalChapters } } },
  });
  if (!response.ok()) throw new Error(`Préparation de progression chapitre QA impossible pour ${courseId}#${lessonIndex} (${response.status()}).`);
}

function getCourseChapterCount(courseId) {
  const coursePath = path.join(root, "client", "public", "data", "courses", `${courseId}.json`);
  try {
    const courseData = JSON.parse(fs.readFileSync(coursePath, "utf8"));
    const chapters = courseData?.lessons?.[0]?.chapters;
    return Array.isArray(chapters) ? Math.max(1, chapters.length) : 1;
  } catch {
    return 1;
  }
}

async function completeCertificationForQa(context, certificationId) {
  const certCourses = trainingIndex.courses.filter((course) => course.certId === certificationId).sort((a, b) => (a.order || 0) - (b.order || 0));
  if (!certCourses.length) throw new Error(`Aucun cours trouvé pour la formation certifiante ${certificationId}.`);
  for (const course of certCourses) {
    const totalLessons = Math.max(1, Number(course.lessonCount) || 1);
    if (totalLessons === 1) {
      const totalChapters = getCourseChapterCount(course.id);
      await saveChapterProgress(context, { courseId: course.id, lessonIndex: 0, chapterIndex: totalChapters, totalChapters });
    }
    for (let lessonIndex = 0; lessonIndex < totalLessons; lessonIndex += 1) {
      await markLessonComplete(context, { certificationId, courseId: course.id, lessonIndex });
    }
  }
  return certCourses.at(-1);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer", "--no-zygote"],
});

const results = [];
try {
  const learnerContext = await browser.newContext({ viewport: { width: 390, height: 844 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  await login(learnerContext, learnerEmail, learnerPassword);
  const learnerPage = await learnerContext.newPage();
  learnerPage.setDefaultTimeout(30000);
  await learnerPage.goto(`${baseUrl}/training?tab=catalog&exam_visibility_qa=1`, { waitUntil: "domcontentloaded" });
  await learnerPage.waitForFunction(() => [...document.querySelectorAll("select option")].some((option) => option.textContent?.includes("Avec examen blanc")), { timeout: 15000 });
  const filters = learnerPage.locator("select");
  const examFilter = filters.nth(6);
  await examFilter.selectOption("with_exam");
  await learnerPage.waitForFunction(() => document.body.innerText.includes("Examen blanc de certification disponible"), { timeout: 10000 });
  const examCatalogText = await learnerPage.locator("body").innerText();
  const examCards = await learnerPage.locator('a[href^="/training/claude_certified_"]').count();
  results.push({
    type: "learner_catalog_exam_filter",
    selected: await examFilter.inputValue(),
    examCards,
    hasExamBadge: examCatalogText.includes("Examen blanc"),
    hasQuestionsAndDuration: /\b(53|60|63) questions\b/.test(examCatalogText) && examCatalogText.includes("120 min"),
  });
  await learnerPage.screenshot({ path: path.join(screenshotDir, "learner-catalog-exam-filter-mobile.png"), fullPage: false });

  await learnerPage.goto(`${baseUrl}/training/claude_certified_associate_foundations?exam_visibility_qa=1`, { waitUntil: "domcontentloaded" });
  await learnerPage.waitForFunction(() => {
    const text = document.body.innerText;
    return text.includes("Claude Certified Associate") && !text.trim().startsWith("Chargement");
  }, { timeout: 30000 });
  const certificationText = await learnerPage.locator("body").innerText();
  const normalizedCertificationText = certificationText.toLowerCase();
  results.push({
    type: "learner_certification_exam_panel",
    hasExamCallout: normalizedCertificationText.includes("examen blanc") || normalizedCertificationText.includes("mock exam"),
    hasExamDetails: certificationText.includes("60 questions") && certificationText.includes("120 min") && certificationText.includes("720/1000"),
    hasUnlockOrLockedMessage: certificationText.includes("débloqué") || certificationText.includes("verrouillé"),
  });
  await learnerPage.screenshot({ path: path.join(screenshotDir, "learner-certification-exam-panel-mobile.png"), fullPage: false });
  const learnerDimensions = await learnerPage.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const overflowing = [...document.querySelectorAll("body *")]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === "string" ? element.className.slice(0, 160) : "",
          text: (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 120),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter((item) => item.right > clientWidth + 2 || item.left < -2 || item.width > clientWidth + 2)
      .sort((a, b) => b.right - a.right)
      .slice(0, 12);
    return { clientWidth, scrollWidth, overflowing };
  });
  results.push({ type: "learner_mobile_layout", ...learnerDimensions, overflow: learnerDimensions.scrollWidth > learnerDimensions.clientWidth + 2 });

  const postCompletionCertificationId = "claude_certified_associate_foundations";
  const completedLastCourse = await completeCertificationForQa(learnerContext, postCompletionCertificationId);
  await learnerPage.goto(`${baseUrl}/training/${postCompletionCertificationId}/${completedLastCourse.id}?exam_completion_qa=1`, { waitUntil: "domcontentloaded" });
  await learnerPage.waitForFunction(() => document.body.innerText.includes("Passer l’examen blanc") || document.body.innerText.includes("Take the mock exam"), { timeout: 15000 });
  const completionText = await learnerPage.locator("body").innerText();
  const examCtaHref = await learnerPage.locator(`a[href="/mock-exam/${postCompletionCertificationId}"]`).first().getAttribute("href");
  results.push({
    type: "learner_post_completion_exam_cta",
    certificationId: postCompletionCertificationId,
    courseId: completedLastCourse.id,
    hasCompletionMessage: completionText.includes("Bravo ! Vous avez terminé le dernier cours requis") || completionText.includes("final course required"),
    hasExamDetails: completionText.includes("60 questions") && completionText.includes("120 min") && completionText.includes("720/1000"),
    hasExamCta: examCtaHref === `/mock-exam/${postCompletionCertificationId}`,
  });
  await learnerPage.screenshot({ path: path.join(screenshotDir, "learner-post-completion-exam-cta-mobile.png"), fullPage: false });
  await learnerContext.close();

  const adminContext = await browser.newContext({ viewport: { width: 1280, height: 720 }, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
  await login(adminContext, adminEmail, adminPassword);
  const adminPage = await adminContext.newPage();
  await adminPage.goto(`${baseUrl}/admin/content?mode=catalog&exam_visibility_qa=1`, { waitUntil: "domcontentloaded" });
  await adminPage.waitForFunction(() => document.body.innerText.includes("Catalogue apprenant : catégories"), { timeout: 15000 });
  const adminText = await adminPage.locator("body").innerText();
  results.push({
    type: "admin_catalog_hierarchy",
    hasLearnerCatalogTitle: adminText.includes("Catalogue apprenant : catégories"),
    hasHierarchyLevels: ["Catégorie de formation", "Formation / certification", "Cours et activités"].every((text) => adminText.includes(text)),
    hasExamManagement: adminText.includes("Gérer l’examen de certification"),
    hasExamDetails: adminText.includes("60 questions") && adminText.includes("120 min"),
  });
  await adminPage.screenshot({ path: path.join(screenshotDir, "admin-catalog-hierarchy.png"), fullPage: false });
  await adminContext.close();
} finally {
  await browser.close();
}

fs.writeFileSync(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, results }, null, 2)}\n`);
console.table(results);
const failures = results.filter((result) =>
  result.type === "learner_catalog_exam_filter" && (result.selected !== "with_exam" || result.examCards < 4 || !result.hasExamBadge || !result.hasQuestionsAndDuration)
  || result.type === "learner_certification_exam_panel" && (!result.hasExamCallout || !result.hasExamDetails || !result.hasUnlockOrLockedMessage)
  || result.type === "learner_mobile_layout" && result.overflow
  || result.type === "learner_post_completion_exam_cta" && (!result.hasCompletionMessage || !result.hasExamDetails || !result.hasExamCta)
  || result.type === "admin_catalog_hierarchy" && (!result.hasLearnerCatalogTitle || !result.hasHierarchyLevels || !result.hasExamManagement || !result.hasExamDetails),
);
if (failures.length) {
  console.error(JSON.stringify({ failures }, null, 2));
  process.exitCode = 1;
}
