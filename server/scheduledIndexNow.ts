import type { Request, Response } from "express";
import { createHeartbeatJob, listHeartbeatJobs, updateHeartbeatJob } from "./_core/heartbeat";
import { sdk } from "./_core/sdk";
import {
  getProjectHeartbeatTaskUid,
  isRegisteredProjectHeartbeatJob,
  registerProjectHeartbeatJob,
} from "./db";
import { processPendingIndexNowSubmissions } from "./indexNowAutomation";

export const INDEXNOW_RETRY_HEARTBEAT_KEY = "indexnow_retry";
const INDEXNOW_RETRY_HEARTBEAT_NAME = "neopolis-indexnow-retry";
const INDEXNOW_RETRY_PATH = "/api/scheduled/indexnow-retry";
const INDEXNOW_RETRY_CRON = "0 */15 * * * *";

export async function scheduledIndexNowRetryHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    if (!await isRegisteredProjectHeartbeatJob(INDEXNOW_RETRY_HEARTBEAT_KEY, user.taskUid)) {
      return res.status(403).json({ error: "unregistered-job" });
    }
    return res.json({ ok: true, ...(await processPendingIndexNowSubmissions()) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/session|auth|unauthor/i.test(message)) return res.status(403).json({ error: "cron-only" });
    console.error("[IndexNow] scheduled retry failed", error);
    return res.status(500).json({ error: "indexnow-retry-failed" });
  }
}

/** Idempotently creates or repairs the single project-level retry heartbeat. */
export async function ensureIndexNowRetryHeartbeat() {
  const registeredTaskUid = await getProjectHeartbeatTaskUid(INDEXNOW_RETRY_HEARTBEAT_KEY);
  if (registeredTaskUid) {
    try {
      await updateHeartbeatJob(registeredTaskUid, {
        cron: INDEXNOW_RETRY_CRON,
        path: INDEXNOW_RETRY_PATH,
        method: "POST",
        payload: {},
        description: "Retry durable IndexNow submissions after public content releases",
        enable: true,
      }, "");
      return { taskUid: registeredTaskUid, created: false };
    } catch (error) {
      console.warn("[IndexNow] registered retry heartbeat could not be refreshed", error);
    }
  }

  const jobs = await listHeartbeatJobs("", { page: 1, pageSize: 100 });
  const existing = jobs.jobs.find((job) => job.name === INDEXNOW_RETRY_HEARTBEAT_NAME);
  if (existing) {
    await updateHeartbeatJob(existing.taskUid, {
      cron: INDEXNOW_RETRY_CRON,
      path: INDEXNOW_RETRY_PATH,
      method: "POST",
      payload: {},
      description: "Retry durable IndexNow submissions after public content releases",
      enable: true,
    }, "");
    await registerProjectHeartbeatJob(INDEXNOW_RETRY_HEARTBEAT_KEY, existing.taskUid);
    return { taskUid: existing.taskUid, created: false };
  }

  const created = await createHeartbeatJob({
    name: INDEXNOW_RETRY_HEARTBEAT_NAME,
    cron: INDEXNOW_RETRY_CRON,
    path: INDEXNOW_RETRY_PATH,
    method: "POST",
    payload: {},
    description: "Retry durable IndexNow submissions after public content releases",
  }, "");
  await registerProjectHeartbeatJob(INDEXNOW_RETRY_HEARTBEAT_KEY, created.taskUid);
  return { taskUid: created.taskUid, created: true };
}
