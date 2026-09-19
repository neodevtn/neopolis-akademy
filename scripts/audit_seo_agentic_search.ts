import fs from "node:fs";
import path from "node:path";
import {
  AGENTIC_DISCOVERY_ORIGIN,
  AGENTIC_DISCOVERY_UPDATED_AT,
  INDEXNOW_KEY_PATH,
  buildAgenticIndex,
  findForbiddenAgenticContent,
  getAgenticDiscoveryDocuments,
  getAgenticDiscoverySummary,
  getAgenticPublicUrls,
  renderLlmsTxt,
  renderRobotsTxt,
} from "../shared/agenticDiscovery";
import { renderPublicTrainingSitemap, getPublicTrainingSitemapFiles } from "../server/publicTrainingPages";
import { renderSeoHead } from "../server/seo";

const root = path.resolve(import.meta.dirname, "..");
const baseUrlArgument = process.argv.find((argument) => argument.startsWith("--base-url="));
const baseUrl = baseUrlArgument?.slice("--base-url=".length).replace(/\/$/, "") || "";
const writeReport = process.argv.includes("--write-report");
const checks: Array<{ name: string; passed: boolean; detail: string }> = [];

function check(name: string, passed: boolean, detail: string) {
  checks.push({ name, passed, detail });
}

const index = buildAgenticIndex();
const summary = getAgenticDiscoverySummary();
const robots = renderRobotsTxt();
const llms = renderLlmsTxt();
const sitemapFiles = getPublicTrainingSitemapFiles();
const sitemapIndex = renderPublicTrainingSitemap();
const sitemapUrls = sitemapFiles.flatMap((file) => [...file.xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
const sitemapIndexUrls = [...sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const privatePattern = /\/(?:admin|api|training|mock-exam|account|settings|login)(?:\/|$)/;

check("catalogue coverage", summary.programmes === index.metrics.certificationCount && summary.courses === index.metrics.courseCount, `${summary.programmes} programmes, ${summary.courses} courses`);
check("three public languages", summary.languages === 3 && index.languages.map((item) => item.code).join(",") === "fr,en,ar", index.languages.map((item) => item.code).join(", "));
check("no private data in AI index", findForbiddenAgenticContent().length === 0, findForbiddenAgenticContent().join(", ") || "none");
check("robots allows public crawling", robots.includes("User-agent: *\nAllow: /") && !/User-agent:\s*(?:GPTBot|ClaudeBot|Google-Extended)/i.test(robots), "no named AI bot block");
check("robots protects private paths", ["/admin/", "/api/", "/training", "/mock-exam/", "/account"].every((value) => robots.includes(`Disallow: ${value}`)), "private paths excluded");
check("robots references canonical sitemap", robots.includes(`Sitemap: ${AGENTIC_DISCOVERY_ORIGIN}/sitemap-index.xml`), "canonical sitemap present");
check("llms discovery links", ["/sitemap-index.xml", "/llms-full.txt", "/ai-index.json"].every((value) => llms.includes(`${AGENTIC_DISCOVERY_ORIGIN}${value}`)), "canonical discovery endpoints present");
check("llms multilingual", ["## Français", "## English", "## العربية"].every((value) => llms.includes(value)), "fr, en, ar sections present");
check("sitemap batches", sitemapFiles.every((file) => file.urlCount > 0 && file.urlCount <= 50), `${sitemapFiles.length} batches, max 50 URLs`);
check("sitemap index coverage", sitemapIndexUrls.length === sitemapFiles.length, `${sitemapIndexUrls.length} index entries`);
check("sitemap URL uniqueness", new Set(sitemapUrls).size === sitemapUrls.length, `${sitemapUrls.length} canonical URLs`);
check("IndexNow URL parity", getAgenticPublicUrls().length === sitemapUrls.length && getAgenticPublicUrls().every((url) => sitemapUrls.includes(url)), `${getAgenticPublicUrls().length}/${sitemapUrls.length} canonical URLs`);
check("sitemap contains reliable lastmod", sitemapFiles.every((file) => file.xml.includes(`<lastmod>${AGENTIC_DISCOVERY_UPDATED_AT}</lastmod>`)), AGENTIC_DISCOVERY_UPDATED_AT);
check("sitemap excludes private paths", sitemapUrls.every((url) => !privatePattern.test(new URL(url).pathname)), "no authenticated route");
check("home knowledge graph", ["FAQPage", "SearchAction", `${AGENTIC_DISCOVERY_ORIGIN}/llms.txt`, `${AGENTIC_DISCOVERY_ORIGIN}/ai-index.json`].every((value) => renderSeoHead("/").includes(value)), "FAQ, site search and discovery links present");
check("IndexNow ownership document", getAgenticDiscoveryDocuments().some((document) => document.path === INDEXNOW_KEY_PATH && document.body.trim().length >= 32), INDEXNOW_KEY_PATH);

if (baseUrl) {
  const agents = [
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot",
    "ClaudeBot/1.0; +https://anthropic.com/bot",
  ];
  for (const document of getAgenticDiscoveryDocuments()) {
    for (const userAgent of agents) {
      try {
        const response = await fetch(`${baseUrl}${document.path}`, { redirect: "manual", headers: { "user-agent": userAgent } });
        const body = await response.text();
        check(`HTTP ${document.path} for ${userAgent.split(/[ /;]/)[0]}`, response.status === 200 && body.length > 0 && !response.headers.get("location"), `HTTP ${response.status}, ${body.length} bytes`);
      } catch (error) {
        check(`HTTP ${document.path}`, false, error instanceof Error ? error.message : String(error));
      }
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  target: baseUrl || "source and generated documents",
  summary,
  sitemap: { files: sitemapFiles.map((file) => ({ path: file.path, urlCount: file.urlCount, bytes: Buffer.byteLength(file.xml, "utf8") })), totalUrls: sitemapUrls.length },
  checks,
  passed: checks.every((item) => item.passed),
};

if (writeReport) {
  const reportPath = path.join(root, "docs", "seo-agentic-search-audit-2026-09-19.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Report: ${reportPath}`);
}

console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
