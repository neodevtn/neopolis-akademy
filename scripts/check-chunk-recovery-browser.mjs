import fs from "node:fs";
import { chromium } from "playwright-core";

const baseUrl = (process.env.CHUNK_RECOVERY_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputPath = "docs/chunk-recovery-browser-qa.json";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"] });

try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`${baseUrl}/?chunk-recovery-qa=1`, { waitUntil: "domcontentloaded" });

  const invoke = (kind) => page.evaluate(async (errorKind) => {
    const recovery = await import("/src/lib/chunkRecovery.ts");
    const error = errorKind === "react-tree"
      ? new DOMException("Failed to execute 'insertBefore' on 'Node'", "NotFoundError")
      : new TypeError("Cannot read properties of undefined (reading 'default')");
    return recovery.retryStaleClientBundle(error);
  }, kind);

  const firstRecovered = await invoke("lazy-default");
  await page.waitForURL(/client-recovery=/, { timeout: 15000 });
  const firstUrl = page.url();
  const duplicateRecovered = await invoke("lazy-default");
  const secondRecovered = await invoke("react-tree");
  await page.waitForFunction((previousUrl) => window.location.href !== previousUrl, firstUrl, { timeout: 15000 });
  const secondUrl = page.url();

  const result = {
    baseUrl,
    firstRecovered,
    duplicateRecovered,
    secondRecovered,
    firstUrlHasRecoveryParam: new URL(firstUrl).searchParams.has("client-recovery"),
    secondUrlHasRecoveryParam: new URL(secondUrl).searchParams.has("client-recovery"),
    distinctReloads: firstUrl !== secondUrl,
    pageErrors,
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result));
  if (!result.firstRecovered || result.duplicateRecovered || !result.secondRecovered || !result.firstUrlHasRecoveryParam || !result.secondUrlHasRecoveryParam || !result.distinctReloads || result.pageErrors.length) process.exitCode = 1;
  await context.close();
} finally {
  await browser.close();
}
