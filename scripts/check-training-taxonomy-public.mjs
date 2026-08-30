import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const root = process.cwd();
const baseUrl = (process.env.TAXONOMY_QA_URL || "https://akademy.neodev.click").replace(/\/$/, "");
const email = process.env.QA_EMAIL;
const password = process.env.QA_PASSWORD;
const output = path.join(root, "docs", "training-catalog-taxonomy-public-qa.json");

if (!email || !password) throw new Error("Les identifiants QA apprenant sont requis pour le contrôle de taxonomie public.");

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer", "--no-zygote"],
});

const results = [];
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    extraHTTPHeaders: { "x-neopolis-qa-probe": "1" },
  });
  const login = await context.request.post(`${baseUrl}/api/auth/login`, {
    data: { email, password },
    headers: { "x-neopolis-qa-probe": "1" },
  });
  if (!login.ok()) throw new Error(`Connexion QA refusée (${login.status()}).`);
  const session = login.headers()["set-cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
  if (!session) throw new Error("La connexion QA n’a pas retourné de session.");
  await context.addCookies([{ name: "app_session_id", value: session, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);

  const page = await context.newPage();
  await page.goto(`${baseUrl}/training?tab=catalog&taxonomy_public_qa=1`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => [...document.querySelectorAll("select option")].some((option) => option.getAttribute("value") === "tutorial_tp"), { timeout: 15000 });

  const filters = page.locator("select");
  const jobFilter = filters.nth(2);
  const formatFilter = filters.nth(5);
  await jobFilter.selectOption({ label: "Business developer" });
  await page.waitForFunction(() => document.body.innerText.includes("Agent de prospection Google Maps avec scoring automatique"));
  const jobCards = page.locator('a[href^="/training/ia_appliquee_metiers_tp__formation_"]');
  const jobCount = await jobCards.count();
  const jobResult = await jobCards.first().innerText();
  results.push({
    type: "job_filter",
    selected: await jobFilter.inputValue(),
    resultCount: jobCount,
    expectedTitleVisible: jobResult.includes("Agent de prospection Google Maps avec scoring automatique"),
  });

  await formatFilter.selectOption("tutorial_tp");
  await page.waitForTimeout(150);
  const combinedCount = await jobCards.count();
  const combinedText = await jobCards.first().innerText();
  results.push({
    type: "job_and_format_filter",
    selectedJob: await jobFilter.inputValue(),
    selectedFormat: await formatFilter.inputValue(),
    resultCount: combinedCount,
    correctFormatVisible: combinedText.includes("Tutoriel / TP"),
  });

  await page.getByRole("button", { name: /Réinitialiser/ }).click();
  await page.waitForFunction(() => {
    const filters = document.querySelectorAll("select");
    return filters[2]?.value !== "Business developer" && filters[5]?.value !== "tutorial_tp";
  });
  const search = page.getByRole("searchbox");
  await search.fill("prospection Google Maps");
  await page.waitForFunction(() => document.body.innerText.includes("Checkpoint : environnement et sécurité"), { timeout: 10000 });
  const searchText = await page.locator("body").innerText();
  results.push({
    type: "search",
    query: await search.inputValue(),
    courseResultVisible: searchText.includes("Agent de prospection Google Maps avec scoring automatique"),
    chaptersVisible: searchText.includes("Checkpoint : environnement et sécurité"),
  });

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  results.push({ type: "mobile_layout", ...dimensions, overflow: dimensions.scrollWidth > dimensions.clientWidth + 2 });
  await page.screenshot({ path: path.join(root, "docs", "training-catalog-taxonomy-public-mobile.png"), fullPage: false });
  await context.close();
} finally {
  await browser.close();
}

fs.writeFileSync(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, viewport: "390x844", results }, null, 2)}\n`);
console.table(results);
const failures = results.filter((result) =>
  result.type === "job_filter" && (result.selected !== "Business developer" || result.resultCount !== 1 || !result.expectedTitleVisible)
  || result.type === "job_and_format_filter" && (result.selectedJob !== "Business developer" || result.selectedFormat !== "tutorial_tp" || result.resultCount !== 1 || !result.correctFormatVisible)
  || result.type === "search" && (!result.courseResultVisible || !result.chaptersVisible)
  || result.type === "mobile_layout" && result.overflow,
);
if (failures.length) process.exitCode = 1;
