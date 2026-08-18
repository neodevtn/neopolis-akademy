import type { Request, Response } from "express";
import { deleteHeartbeatJob } from "./_core/heartbeat";
import { sdk } from "./_core/sdk";
import { clearCommunicationSchedule, claimCommunicationForDelivery, getCommunicationByScheduleTaskUid, updateCommunicationStatus } from "./adminDb";
import { deliverClaimedCommunication } from "./communicationDelivery";

/** Heartbeat callback. The job identity, not caller-supplied body data, identifies the communication. */
export async function scheduledCommunicationSendHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });

    const communication = await getCommunicationByScheduleTaskUid(user.taskUid);
    if (!communication) return res.json({ ok: true, skipped: "orphan" });
    if (communication.status !== "scheduled") return res.json({ ok: true, skipped: communication.status });
    if (communication.scheduledAt && communication.scheduledAt.getTime() > Date.now() + 60_000) {
      return res.json({ ok: true, skipped: "too-early" });
    }

    const claimed = await claimCommunicationForDelivery(communication.id, ["scheduled"]);
    if (!claimed) return res.json({ ok: true, skipped: "already-claimed" });
    const result = await deliverClaimedCommunication(claimed);
    await clearCommunicationSchedule(claimed.id);
    try { await deleteHeartbeatJob(user.taskUid, ""); } catch (error) { console.warn("[CommSchedule] Unable to remove completed task", error); }
    return res.json({ ok: true, communicationId: claimed.id, ...result });
  } catch (error: any) {
    console.error("Scheduled communication send failed:", error);
    return res.status(500).json({
      error: error.message || "Unknown error",
      stack: error.stack,
      context: { url: req.url, taskUid: (error as any).taskUid },
      timestamp: new Date().toISOString(),
    });
  }
}
