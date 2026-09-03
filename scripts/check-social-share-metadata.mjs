import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const baseUrl = (process.env.SOCIAL_SHARE_QA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const publicOrigin = "https://akademy.neodev.click";
const openGraphImage = `${publicOrigin}/manus-storage/og-neopolis-akademy-1200x630_eef162a5.png`;
const xImage = `${publicOrigin}/manus-storage/x-neopolis-akademy-1200x675_28f812f5.png`;
const routes = [
  "/",
  "/ai-news",
  "/apply",
  "/refer?ref=NEO-QA-TEST&utm_content=course&course=ai_for_finance__01",
  "/apply?ref=NEO-QA-TEST&utm_content=course&course=ai_for_finance__01",
  "/mentions-legales",
  "/formations-ia",
  "/formations-ia/comptabilite-finance",
  "/en/ai-training",
  "/ar/ai-training",
  "/accept-invitation",
];

const expected = [
  `<meta property="og:image" content="${openGraphImage}"`,
  `<meta property="og:image:secure_url" content="${openGraphImage}"`,
  '<meta property="og:image:type" content="image/png"',
  '<meta property="og:image:width" content="1200"',
  '<meta property="og:image:height" content="630"',
  '<meta name="twitter:card" content="summary_large_image"',
  `<meta name="twitter:image" content="${xImage}"`,
];

const results = [];
for (const route of routes) {
  const response = await fetch(`${baseUrl}${route}`);
  const html = await response.text();
  results.push({
    path: route,
    status: response.status,
    openGraphImagePresent: expected.slice(0, 5).every((value) => html.includes(value)),
    xImagePresent: expected.slice(5).every((value) => html.includes(value)),
    titlePresent: /<meta property="og:title" content="[^"]+"/.test(html),
    descriptionPresent: /<meta property="og:description" content="[^"]+"/.test(html),
    canonicalPresent: /<link rel="canonical" href="https:\/\/akademy\.neodev\.click\/[^"]*"/.test(html),
  });
}

const imageChecks = await Promise.all([openGraphImage, xImage].map(async (image) => {
  const response = await fetch(image);
  return { image, status: response.status, contentType: response.headers.get("content-type") || "" };
}));

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  results,
  imageChecks,
  passed: results.every((result) => result.status === 200 && result.openGraphImagePresent && result.xImagePresent && result.titlePresent && result.descriptionPresent && result.canonicalPresent)
    && imageChecks.every((result) => result.status === 200 && result.contentType.startsWith("image/png")),
};

mkdirSync(path.join(root, "docs"), { recursive: true });
writeFileSync(path.join(root, "docs", "social-share-metadata-qa.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
