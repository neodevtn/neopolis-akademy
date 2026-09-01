import type { Request, Response } from "express";
import { EXAM_REMINDER_HEARTBEAT_KEY, isRegisteredProjectHeartbeatJob } from "./db";
import { sdk } from "./_core/sdk";
import { runExamReminderJob } from "./examReminderService";

/** Daily Heartbeat callback. It accepts only the registered project-level task. */
export async function scheduledExamReminderHandler(req: Request, res: Response) {
  let user: Awaited<ReturnType<typeof sdk.authenticateRequest>>;
  try {
    user = await sdk.authenticateRequest(req);
  } catch {
    return res.status(403).json({ error: "cron-only" });
  }
  try {
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    if (!await isRegisteredProjectHeartbeatJob(EXAM_REMINDER_HEARTBEAT_KEY, user.taskUid)) {
      return res.json({ ok: true, skipped: "unregistered-task" });
    }
    return res.json({ ok: true, ...(await runExamReminderJob()) });
  } catch (error) {
    console.error("Exam reminder scheduled job failed:", error);
    return res.status(500).json({
      error: "exam-reminder-job-failed",
      context: { url: req.url },
      timestamp: new Date().toISOString(),
    });
  }
}
