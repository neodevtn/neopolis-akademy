import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEOPOLIS_BASE_URL || "http://127.0.0.1:3000";
const coursePath = resolve(process.cwd(), "client/public/data/courses/claude_certified_architect_foundations__01.json");
const outputDirectory = resolve(process.cwd(), ".work/anthropic-architect-lot1/video-playback");
const outputPath = resolve(process.cwd(), "docs/architect-foundations-course1-video-playback.json");
const course = JSON.parse(await readFile(coursePath, "utf8"));
const officialVideos = course.lessons.flatMap((lesson, lessonIndex) => (lesson.chapters || [])
  .flatMap((chapter, chapterIndex) => (chapter.blocks || [])
    .filter((block) => block.type === "video" && block.mediaMeta?.official === true)
    .map((block) => ({ videoId: block.videoId, lessonIndex, chapterIndex, title: block.title }))))
  .slice(0, Number(process.env.VIDEO_LIMIT || Number.POSITIVE_INFINITY));
const requestDelayMs = Math.max(1_000, Number(process.env.REQUEST_DELAY_MS || 3_000));

const pause = (ms) => new Promise((resolvePause) => setTimeout(resolvePause, ms));

async function gotoCourseWithBackoff(page, url) {
  let lastFailure = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      const text = await page.locator("body").innerText().catch(() => "");
      if (!/too many requests|rate limit/i.test(text)) return;
      lastFailure = new Error("La plateforme a limité les requêtes de contrôle média.");
    } catch (error) {
      lastFailure = error instanceof Error ? error : new Error(String(error));
    }
    await pause(requestDelayMs * (attempt + 1));
  }
  throw lastFailure || new Error("Chargement du cours impossible.");
}

async function readPlayerMetrics(page, videoId) {
  const frame = page.frames().find((candidate) => candidate.url().includes(`/embed/${videoId}`));
  if (!frame) throw new Error("iframe YouTube absente après lancement");
  return frame.evaluate(() => {
    const video = document.querySelector("video");
    const text = document.body?.innerText || "";
    return {
      configurationError: /video player configuration error|error 153/i.test(text),
      currentTime: Number(video?.currentTime || 0),
      duration: Number(video?.duration || 0),
      paused: Boolean(video?.paused),
      readyState: Number(video?.readyState || 0),
      videoWidth: Number(video?.videoWidth || 0),
      videoHeight: Number(video?.videoHeight || 0),
      videoDecodedBytes: Number(video?.webkitVideoDecodedByteCount || 0),
      audioDecodedBytes: Number(video?.webkitAudioDecodedByteCount || 0),
    };
  });
}

async function sendPlayerCommand(iframe, func, args = []) {
  await iframe.evaluate((node, payload) => {
    node.contentWindow?.postMessage(JSON.stringify({ event: "command", func: payload.func, args: payload.args }), "https://www.youtube-nocookie.com");
  }, { func, args });
}

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required", "--disable-dev-shm-usage"],
});
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const loginPage = await context.newPage();
const loginResponse = await loginPage.request.post(`${baseUrl}/api/demo-login`, {
  data: {
    email: process.env.NEOPOLIS_DEMO_EMAIL || "apprenant@neopolis.demo",
    password: process.env.NEOPOLIS_DEMO_PASSWORD || "NeoDemo2026!",
  },
});
if (!loginResponse.ok()) throw new Error(`Connexion apprenant de démonstration impossible : HTTP ${loginResponse.status()}`);
await loginPage.close();

const results = [];
try {
  for (const video of officialVideos) {
    const record = { ...video, transcript: false, phases: [], status: "failed", failure: null };
    const chapter = course.lessons[video.lessonIndex]?.chapters?.[video.chapterIndex];
    record.transcript = Boolean(chapter?.blocks?.some((block) => block.type === "transcript" && block.videoId === video.videoId && block.body?.en?.trim() && block.body?.fr?.trim()));
    const page = await context.newPage();
    const session = await page.context().newCDPSession(page);
    const mediaEvents = [];
    await session.send("Media.enable");
    session.on("Media.playerPropertiesChanged", (event) => mediaEvents.push(event));
    session.on("Media.playerEventsAdded", (event) => mediaEvents.push(event));
    try {
      await gotoCourseWithBackoff(page, `${baseUrl}/training/claude_certified_architect_foundations/claude_certified_architect_foundations__01?lesson=${video.lessonIndex}&chapter=${video.chapterIndex}`);
      const refuseCookies = page.getByRole("button", { name: /Refuser|Reject/i }).first();
      if (await refuseCookies.isVisible().catch(() => false)) await refuseCookies.click();
      const acknowledgement = page.locator('input[type="checkbox"]').first();
      if (await acknowledgement.isVisible().catch(() => false)) {
        await acknowledgement.check();
        const confirm = page.getByRole("button", { name: /Confirmer la réception|Confirm receipt/i }).first();
        if (await confirm.isVisible().catch(() => false)) await confirm.click();
      }
      const thumbnail = page.locator(`img[src*="/vi/${video.videoId}/"]`).first();
      await thumbnail.waitFor({ state: "visible", timeout: 15_000 });
      await thumbnail.click({ force: true });
      const iframe = page.locator(`iframe[src*="${video.videoId}"]`).first();
      await iframe.waitFor({ state: "visible", timeout: 15_000 });
      await sendPlayerCommand(iframe, "playVideo");
      await page.waitForTimeout(7_000);

      const capturePhase = async (phase, requestedStartSeconds = null) => {
        const metrics = await readPlayerMetrics(page, video.videoId);
        await page.screenshot({ path: resolve(outputDirectory, `${video.videoId}-${phase}.png`), fullPage: false });
        record.phases.push({
          phase,
          requestedStartSeconds,
          imageVisible: metrics.videoWidth > 0 && metrics.videoHeight > 0 && !metrics.configurationError,
          videoSignal: metrics.videoDecodedBytes > 0,
          audioSignal: metrics.audioDecodedBytes > 0,
          playbackSignal: metrics.currentTime > 0 && !metrics.paused && metrics.readyState >= 2,
          metrics,
        });
        return metrics;
      };

      const startMetrics = await capturePhase("start");
      const duration = startMetrics.duration;
      const middleStart = duration > 10 ? Math.min(Math.max(2, Math.floor(duration / 2)), 120) : 2;
      await sendPlayerCommand(iframe, "seekTo", [middleStart, true]);
      await sendPlayerCommand(iframe, "playVideo");
      await page.waitForTimeout(5_000);
      await capturePhase("middle", middleStart);
      const endStart = duration > 10 ? Math.max(1, Math.floor(duration) - 5) : 2;
      await sendPlayerCommand(iframe, "seekTo", [endStart, true]);
      await sendPlayerCommand(iframe, "playVideo");
      await page.waitForTimeout(5_000);
      await capturePhase("end", endStart);
      record.status = record.transcript && record.phases.every((phase) => phase.imageVisible && phase.videoSignal && phase.audioSignal && phase.playbackSignal) ? "passed" : "manual_review_required";
    } catch (error) {
      record.failure = error instanceof Error ? error.message : String(error);
      record.pageUrl = page.url();
      record.pageText = (await page.locator("body").innerText().catch(() => "")).slice(0, 600);
      if (/iframe YouTube absente|video player configuration error|error 153/i.test(`${record.failure}\n${record.pageText}`)) {
        record.status = "provider_playback_blocked";
      } else if (/limité les requêtes|too many requests|rate limit/i.test(`${record.failure}\n${record.pageText}`)) {
        record.status = "rate_limited";
      }
    } finally {
      await session.detach().catch(() => undefined);
      await page.close();
    }
    results.push(record);
    await pause(requestDelayMs);
  }
} finally {
  await context.close();
  await browser.close();
}

const report = { generatedAt: new Date().toISOString(), baseUrl, officialVideos: results };
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
const failed = results.filter((result) => result.status !== "passed");
console.log(JSON.stringify({ checked: results.length, passed: results.length - failed.length, reviewRequired: failed.length, providerBlocked: results.filter((result) => result.status === "provider_playback_blocked").length, rateLimited: results.filter((result) => result.status === "rate_limited").length, outputPath }, null, 2));
if (failed.length) process.exitCode = 1;
