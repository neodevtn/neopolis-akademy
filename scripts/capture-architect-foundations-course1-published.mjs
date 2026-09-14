import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEOPOLIS_BASE_URL || "https://akademy.neodev.click";
const coursePath = "/training/claude_certified_architect_foundations/claude_certified_architect_foundations__01?lesson=0&chapter=0";
const outputDirectory = resolve(process.cwd(), ".work/anthropic-architect-lot1/published-captures");
const reportPath = resolve(process.cwd(), "docs/architect-foundations-course1-published-ui.json");
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    try {
      const loginResponse = await page.request.post(`${baseUrl}/api/demo-login`, {
        data: {
          email: process.env.NEOPOLIS_DEMO_EMAIL || "apprenant@neopolis.demo",
          password: process.env.NEOPOLIS_DEMO_PASSWORD || "NeoDemo2026!",
        },
      });
      if (!loginResponse.ok()) throw new Error(`Connexion de démonstration : HTTP ${loginResponse.status()}`);

      await page.goto(`${baseUrl}${coursePath}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
      const acknowledge = page.locator('input[type="checkbox"]').first();
      if (await acknowledge.isVisible().catch(() => false)) {
        await acknowledge.check();
        const confirm = page.getByRole("button", { name: /Confirmer la réception|Confirm receipt/i }).first();
        if (await confirm.isVisible().catch(() => false)) await confirm.click();
      }
      await page.locator("body").filter({ hasText: /AI Fluency: Framework & Foundations|Maîtrise de l'IA : Framework et fondations/ }).waitFor({ state: "visible", timeout: 30_000 });
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        text: document.body.innerText,
      }));
      const assertions = {
        heading: /AI Fluency: Framework & Foundations|Maîtrise de l'IA : Framework et fondations/.test(metrics.text),
        lessonCount: /0\s*\/\s*15\s*(?:lessons|leçons)/.test(metrics.text),
        certificateLesson: /Certificate of completion|Attestation de fin de cours/.test(metrics.text),
        screenDuration: /Indicative duration for this screen|Durée indicative de cet écran/.test(metrics.text),
        officialProvenance: /Official Anthropic resource|Ressource officielle Anthropic/.test(metrics.text),
        noHorizontalOverflow: metrics.scrollWidth <= metrics.clientWidth + 2,
      };
      const screenshotPath = resolve(outputDirectory, `architect-foundations-course1-${viewport.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      if (!assertions.certificateLesson && viewport.name === "mobile") {
        await page.goto(`${baseUrl}/training/claude_certified_architect_foundations/claude_certified_architect_foundations__01?lesson=13&chapter=0`, { waitUntil: "domcontentloaded", timeout: 45_000 });
        await page.locator("body").filter({ hasText: /Certificate of completion|Attestation de fin de cours/ }).waitFor({ state: "visible", timeout: 30_000 });
        assertions.certificateLesson = true;
      }
      results.push({ viewport, screenshotPath, ...assertions, scrollWidth: metrics.scrollWidth, clientWidth: metrics.clientWidth, passed: Object.values(assertions).every(Boolean) });
    } catch (error) {
      const screenshotPath = resolve(outputDirectory, `architect-foundations-course1-${viewport.name}-failure.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => undefined);
      results.push({
        viewport,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        pageUrl: page.url(),
        pageText: (await page.locator("body").innerText().catch(() => "")).slice(0, 1_200),
        screenshotPath,
      });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

const report = { generatedAt: new Date().toISOString(), baseUrl, coursePath, results };
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ passed: results.filter((result) => result.passed).length, total: results.length, reportPath }, null, 2));
if (results.some((result) => !result.passed)) process.exitCode = 1;
