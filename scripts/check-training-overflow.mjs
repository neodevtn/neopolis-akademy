import { chromium } from "playwright-core";

const baseUrl = (process.env.CHECK_OVERFLOW_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const demoEmail = process.env.DEMO_EMAIL;
const demoPassword = process.env.DEMO_PASSWORD;
const coursePath = "/training/novasavo_automatisation_comptable_ia/automatisation_comptable_ia__01?lesson=0&chapter=8";
const viewports = [
  { name: "390x844", width: 390, height: 844 },
  { name: "375x667", width: 375, height: 667 },
];

if (!demoEmail || !demoPassword) {
  throw new Error("DEMO_EMAIL et DEMO_PASSWORD sont requis pour contrôler le lecteur authentifié.");
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--no-zygote",
  ],
});

const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();

    const login = await context.request.post(`${baseUrl}/api/demo-login`, {
      data: { email: demoEmail, password: demoPassword },
    });
    if (!login.ok()) throw new Error(`Connexion démo refusée (${login.status()}).`);

    await page.goto(`${baseUrl}${coursePath}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const acceptCookies = page.getByRole("button", { name: "Accepter" });
    if (await acceptCookies.count()) await acceptCookies.first().click().catch(() => undefined);

    const measurement = await page.evaluate(() => {
      const root = document.documentElement;
      const viewportWidth = root.clientWidth;
      const offenders = Array.from(document.querySelectorAll("body *"))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === "string" ? element.className : "",
            left: Math.round(rect.left * 10) / 10,
            right: Math.round(rect.right * 10) / 10,
            width: Math.round(rect.width * 10) / 10,
          };
        })
        .filter(({ width, left, right }) => width > 0 && (right > viewportWidth + 2 || left < -2))
        .slice(0, 12);

      return {
        viewport: viewportWidth,
        scrollWidth: root.scrollWidth,
        overflowPx: Math.max(0, root.scrollWidth - viewportWidth),
        overflow: root.scrollWidth > viewportWidth + 2,
        offenders,
      };
    });

    results.push({ viewport: viewport.name, ...measurement });
    await context.close();
  }
} finally {
  await browser.close();
}

console.table(results.map(({ viewport, viewport: width, scrollWidth, overflowPx, overflow }) => ({ viewport, width, scrollWidth, overflowPx, overflow })));
for (const result of results) {
  if (result.overflow) console.error(`\n${result.viewport} offenders:\n${JSON.stringify(result.offenders, null, 2)}`);
}

if (results.some((result) => result.overflow)) process.exitCode = 1;
