import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { and, asc, eq, inArray, lte, sql } from "drizzle-orm";
import {
  AGENTIC_DISCOVERY_ORIGIN,
  getAgenticPublicUrls,
  getIndexNowContentRevision,
  getIndexNowPayload,
} from "@shared/agenticDiscovery";
import { indexNowSubmissionState } from "../drizzle/schema";
import { getDb } from "./db";
import { getRuntimeVersionManifest } from "./versionManifest";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_MAX_URLS = 10_000;
const MAX_ATTEMPTS = 6;
const RETRY_DELAYS_MS = [30_000, 120_000, 600_000, 1_800_000, 7_200_000, 21_600_000] as const;
const PROCESSING_LEASE_MS = 10 * 60 * 1_000;

let wakeTimer: ReturnType<typeof setTimeout> | null = null;
let workerRunning = false;

export type IndexNowQueueReason =
  | `deployment:${string}`
  | `content:${string}`
  | `manual:${string}`;

function getGeneratedDeploymentRevision() {
  const dataRoot = path.resolve(import.meta.dirname, "data");
  try {
    const parsed = JSON.parse(fs.readFileSync(path.join(dataRoot, "indexnowDeployment.json"), "utf8")) as {
      deploymentRevision?: unknown;
      contentRevision?: unknown;
    };
    if (typeof parsed.deploymentRevision === "string" && typeof parsed.contentRevision === "string") {
      return { revision: parsed.deploymentRevision, contentRevision: parsed.contentRevision };
    }
  } catch {
    // Development and older releases use the runtime document fallback below.
  }
  return null;
}

export function buildDeploymentIndexNowRevision() {
  const generated = getGeneratedDeploymentRevision();
  if (generated) {
    return {
      ...generated,
      runtimeVersion: getRuntimeVersionManifest().version,
    };
  }
  const contentRevision = getIndexNowContentRevision();
  const runtimeVersion = getRuntimeVersionManifest().version;
  return {
    contentRevision,
    runtimeVersion,
    revision: createHash("sha256").update(`${contentRevision}:${runtimeVersion}`).digest("hex"),
  };
}

export function buildContentUpdateRevision(event: string, discriminator = "") {
  return createHash("sha256")
    .update(getIndexNowContentRevision())
    .update(`:${event}:${discriminator}:${Date.now()}`)
    .digest("hex");
}

export function isSuccessfulIndexNowStatus(status: number) {
  return status === 200 || status === 202;
}

export function indexNowRetryDelay(attemptCount: number) {
  return RETRY_DELAYS_MS[Math.min(Math.max(0, attemptCount - 1), RETRY_DELAYS_MS.length - 1)];
}

export async function submitIndexNowUrls(
  urls = getAgenticPublicUrls(),
  fetchImpl: typeof fetch = fetch,
) {
  const uniqueUrls = Array.from(new Set(urls));
  const batches = Array.from(
    { length: Math.ceil(uniqueUrls.length / INDEXNOW_MAX_URLS) },
    (_, index) => uniqueUrls.slice(index * INDEXNOW_MAX_URLS, (index + 1) * INDEXNOW_MAX_URLS),
  );
  const statuses: number[] = [];

  for (const urlList of batches) {
    const response = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(getIndexNowPayload(urlList)),
      signal: AbortSignal.timeout(25_000),
    });
    statuses.push(response.status);
    if (!isSuccessfulIndexNowStatus(response.status)) {
      const detail = (await response.text().catch(() => "")).slice(0, 500);
      throw Object.assign(new Error(`IndexNow HTTP ${response.status}${detail ? `: ${detail}` : ""}`), {
        httpStatus: response.status,
      });
    }
  }

  return { urlCount: uniqueUrls.length, statuses };
}

async function getPublishedContentRevision(fetchImpl: typeof fetch = fetch) {
  const response = await fetchImpl(`${AGENTIC_DISCOVERY_ORIGIN}/indexnow-manifest.json`, {
    headers: { accept: "application/json", "cache-control": "no-cache" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) return null;
  const body = await response.json().catch(() => null) as { revision?: unknown } | null;
  return typeof body?.revision === "string" ? body.revision : null;
}

function expectedPublishedRevision(reason: string) {
  return reason.startsWith("deployment:") ? reason.slice("deployment:".length) : null;
}

async function recoverExpiredLeases() {
  const db = await getDb();
  if (!db) return;
  const expiredBefore = new Date(Date.now() - PROCESSING_LEASE_MS);
  await db.update(indexNowSubmissionState).set({
    status: "pending",
    nextAttemptAt: new Date(),
    lastError: "processing_lease_recovered",
  }).where(and(
    eq(indexNowSubmissionState.status, "processing"),
    lte(indexNowSubmissionState.lastAttemptAt, expiredBefore),
  ));
}

async function claimNextSubmission() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [candidate] = await db.select().from(indexNowSubmissionState)
    .where(and(
      inArray(indexNowSubmissionState.status, ["pending", "failed"]),
      lte(indexNowSubmissionState.nextAttemptAt, new Date()),
      sql`${indexNowSubmissionState.attemptCount} < ${MAX_ATTEMPTS}`,
    ))
    .orderBy(asc(indexNowSubmissionState.requestedAt))
    .limit(1);
  if (!candidate) return null;

  const result = await db.update(indexNowSubmissionState).set({
    status: "processing",
    attemptCount: candidate.attemptCount + 1,
    lastAttemptAt: new Date(),
    lastError: null,
  }).where(and(
    eq(indexNowSubmissionState.id, candidate.id),
    inArray(indexNowSubmissionState.status, ["pending", "failed"]),
  ));
  if (Number(result[0]?.affectedRows || 0) !== 1) return null;
  return { ...candidate, attemptCount: candidate.attemptCount + 1 };
}

async function completeSubmission(id: number, result: { urlCount: number; statuses: number[] }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(indexNowSubmissionState).set({
    status: "submitted",
    urlCount: result.urlCount,
    lastHttpStatus: result.statuses.at(-1) || 200,
    lastError: null,
    submittedAt: new Date(),
    nextAttemptAt: new Date(),
  }).where(eq(indexNowSubmissionState.id, id));
}

async function failSubmission(id: number, attemptCount: number, error: unknown) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const terminal = attemptCount >= MAX_ATTEMPTS;
  const delayMs = indexNowRetryDelay(attemptCount);
  const httpStatus = typeof error === "object" && error && "httpStatus" in error
    ? Number((error as { httpStatus?: unknown }).httpStatus) || null
    : null;
  await db.update(indexNowSubmissionState).set({
    status: terminal ? "failed" : "pending",
    lastHttpStatus: httpStatus,
    lastError: String(error instanceof Error ? error.message : error).slice(0, 2000),
    nextAttemptAt: new Date(Date.now() + delayMs),
  }).where(eq(indexNowSubmissionState.id, id));
  if (!terminal) scheduleIndexNowWorker(delayMs);
}

export async function enqueueIndexNowSubmission(input: {
  revision: string;
  reason: IndexNowQueueReason;
  urlCount?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const urlCount = input.urlCount ?? getAgenticPublicUrls().length;
  await db.insert(indexNowSubmissionState).values({
    revision: input.revision,
    reason: input.reason,
    urlCount,
    status: "pending",
    attemptCount: 0,
    nextAttemptAt: new Date(),
  }).onDuplicateKeyUpdate({
    set: { reason: input.reason, urlCount },
  });
  scheduleIndexNowWorker(1_000);
  return { queued: true, revision: input.revision };
}

export async function enqueueDeploymentIndexNowSubmission() {
  const deployment = buildDeploymentIndexNowRevision();
  return enqueueIndexNowSubmission({
    revision: deployment.revision,
    reason: `deployment:${deployment.contentRevision}`,
  });
}

export async function enqueuePublicContentUpdate(event: string, discriminator = "") {
  return enqueueIndexNowSubmission({
    revision: buildContentUpdateRevision(event, discriminator),
    reason: `content:${event}`,
  });
}

export async function processPendingIndexNowSubmissions() {
  if (workerRunning) return { processed: 0, busy: true };
  workerRunning = true;
  let processed = 0;
  try {
    await recoverExpiredLeases();
    while (true) {
      const submission = await claimNextSubmission();
      if (!submission) break;
      processed += 1;
      try {
        const expectedRevision = expectedPublishedRevision(submission.reason);
        if (expectedRevision) {
          const publishedRevision = await getPublishedContentRevision();
          if (publishedRevision !== expectedRevision) {
            throw new Error(`public_revision_pending:${publishedRevision || "unavailable"}`);
          }
        }
        await completeSubmission(submission.id, await submitIndexNowUrls());
      } catch (error) {
        await failSubmission(submission.id, submission.attemptCount, error);
      }
    }
    return { processed, busy: false };
  } finally {
    workerRunning = false;
  }
}

export function scheduleIndexNowWorker(delayMs = 1_000) {
  if (wakeTimer) clearTimeout(wakeTimer);
  wakeTimer = setTimeout(() => {
    wakeTimer = null;
    void processPendingIndexNowSubmissions().catch((error) => console.error("[IndexNow] worker failed", error));
  }, Math.max(0, delayMs));
  wakeTimer.unref?.();
}

export function startIndexNowAutomation() {
  if (process.env.NODE_ENV !== "production") return;
  setTimeout(() => {
    void enqueueDeploymentIndexNowSubmission()
      .then(() => processPendingIndexNowSubmissions())
      .catch((error) => console.error("[IndexNow] deployment enqueue failed", error));
  }, 20_000).unref?.();
}

export async function getIndexNowAutomationStatus() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(indexNowSubmissionState)
    .orderBy(sql`${indexNowSubmissionState.requestedAt} desc`)
    .limit(20);
}

export const INDEXNOW_AUTOMATION_MAX_ATTEMPTS = MAX_ATTEMPTS;
export const INDEXNOW_AUTOMATION_ENDPOINT = INDEXNOW_ENDPOINT;
