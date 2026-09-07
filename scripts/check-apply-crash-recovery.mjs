import { chromium } from "playwright-core";

const baseUrl = (process.env.APPLY_CRASH_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const viewports = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "mobile", width: 390, height: 844 },
];
const results = [];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"],
});

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, extraHTTPHeaders: { "x-neopolis-qa-probe": "1" } });
    const page = await context.newPage();
    const pageErrors = [];
    const consoleErrors = [];
    const failedResources = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("requestfailed", (request) => {
      let host = "unknown";
      try { host = new URL(request.url()).hostname; } catch { /* URL illisible */ }
      failedResources.push(`${request.resourceType()}:${host}:${request.failure()?.errorText || "failed"}`);
    });
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto(`${baseUrl}/apply`, { waitUntil: "networkidle", timeout: 60_000 });
    const consent = page.getByRole("button", { name: /accepter|accept/i });
    if (await consent.isVisible().catch(() => false)) await consent.click();
    const closeCommunication = page.getByRole("button", { name: /close|fermer/i });
    if (await closeCommunication.isVisible().catch(() => false)) await closeCommunication.click();

    const fields = page.locator("main input");
    await fields.nth(0).fill("Test");
    await fields.nth(1).fill("Parcours");
    await fields.nth(2).fill("qa@example.invalid");
    await fields.nth(3).fill("+216 20000000");
    await page.getByRole("button", { name: /suivant|next/i }).click();
    await page.getByText(/Pays de résidence|Country of Residence/i).waitFor({ state: "visible", timeout: 20_000 });

    const selects = page.getByRole("combobox");
    await selects.nth(0).click();
    await page.getByRole("option", { name: "Tunisie" }).click();
    await selects.nth(0).click();
    await page.getByRole("option", { name: "Algérie" }).click();
    await selects.nth(1).click();
    await page.getByRole("option", { name: "Comptabilité & Finance" }).click();
    await selects.nth(1).click();
    await page.getByRole("option", { name: "Développement logiciel" }).click();

    await page.getByRole("button", { name: /précédent|previous/i }).click();
    await page.getByRole("button", { name: /suivant|next/i }).click();
    await page.waitForTimeout(500);

    const bodyText = await page.locator("body").innerText();
    const relevantFailedResources = failedResources.filter((entry) => {
      if (entry.startsWith("font:fonts.gstatic.com:")) return false;
      if (/^fetch:(www\.|region\d+\.)?google-analytics\.com:net::ERR_ABORTED$/.test(entry)) return false;
      return true;
    });
    const relevantConsoleErrors = consoleErrors.filter((message) => {
      if (/favicon|font|third-party/i.test(message)) return false;
      if (/Failed to load resource: net::ERR_FAILED/i.test(message) && relevantFailedResources.length === 0) return false;
      return true;
    });
    results.push({
      viewport: viewport.name,
      countryValue: await selects.nth(0).textContent(),
      sectorValue: await selects.nth(1).textContent(),
      recoveryParam: new URL(page.url()).searchParams.has("client-recovery"),
      errorBoundary: /unexpected error|une erreur inattendue/i.test(bodyText),
      pageErrors: pageErrors.length,
      consoleErrors: relevantConsoleErrors.length,
      consoleSummary: [...new Set(relevantConsoleErrors
        .map((message) => message.replace(/https?:\/\/[^\s)]+/gi, "[url]").replace(/\s+/g, " ").slice(0, 160)))].join(" | "),
      failedResources: [...new Set(relevantFailedResources)].join(" | "),
    });
    await context.close();
  }
} finally {
  await browser.close();
}

console.table(results);
if (results.some((result) => result.errorBoundary || result.pageErrors > 0 || result.consoleErrors > 0)) {
  process.exitCode = 1;
}
