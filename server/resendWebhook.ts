import { createHmac, timingSafeEqual } from "crypto";
import { Router, Request, Response } from "express";
import { updateInvitationDeliveryStatus, createEmailEvent } from "./db";

/**
 * Resend Webhook handler
 * Receives delivery events from Resend (bounced, delivered, complained, opened, clicked)
 * and updates the invitation delivery status accordingly.
 * 
 * Webhook URL: /api/webhooks/resend
 * Configure in Resend dashboard: https://resend.com/webhooks
 */

const resendWebhookRouter = Router();
const WEBHOOK_MAX_AGE_SECONDS = 5 * 60;

function hasValidSignature(rawBody: Buffer, headers: Request["headers"]): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const eventId = headers["svix-id"];
  const timestamp = headers["svix-timestamp"];
  const signatureHeader = headers["svix-signature"];
  if (!secret || typeof eventId !== "string" || typeof timestamp !== "string" || typeof signatureHeader !== "string") return false;
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > WEBHOOK_MAX_AGE_SECONDS) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  if (!key.length) return false;
  const expected = createHmac("sha256", key).update(`${eventId}.${timestamp}.${rawBody.toString("utf8")}`).digest("base64");
  return signatureHeader.split(" ").some((candidate) => {
    const supplied = candidate.replace(/^v1,/, "");
    const expectedBuffer = Buffer.from(expected);
    const suppliedBuffer = Buffer.from(supplied);
    return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
  });
}

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    bounce?: {
      message: string;
    };
  };
}

resendWebhookRouter.post("/api/webhooks/resend", async (req: Request, res: Response) => {
  try {
    if (!Buffer.isBuffer(req.body) || !hasValidSignature(req.body, req.headers)) {
      return res.status(401).json({ error: "Invalid webhook signature" });
    }
    const payload = JSON.parse(req.body.toString("utf8")) as ResendWebhookPayload;
    
    if (!payload || !payload.type || !payload.data) {
      console.warn("[Resend Webhook] Invalid payload received");
      return res.status(400).json({ error: "Invalid payload" });
    }

    const { type, data } = payload;
    const resendMessageId = data.email_id;
    const email = data.to?.[0] || "";

    const webhookEventId = req.header("svix-id")!;
    console.info("[Resend Webhook] Signed delivery event received", { type, hasMessageId: Boolean(resendMessageId) });

    // Map Resend event types to our delivery status
    let deliveryStatus: "sent" | "delivered" | "bounced" | "complained" | "suppressed" | null = null;
    let eventType: "sent" | "delivered" | "bounced" | "complained" | "opened" | "clicked" | null = null;
    let reason: string | undefined;

    switch (type) {
      case "email.sent":
        deliveryStatus = "sent";
        eventType = "sent";
        break;
      case "email.delivered":
        deliveryStatus = "delivered";
        eventType = "delivered";
        break;
      case "email.bounced":
        deliveryStatus = "bounced";
        eventType = "bounced";
        reason = data.bounce?.message || "Email bounced";
        break;
      case "email.complained":
        deliveryStatus = "complained";
        eventType = "complained";
        break;
      case "email.opened":
        eventType = "opened";
        break;
      case "email.clicked":
        eventType = "clicked";
        break;
      default:
        console.log(`[Resend Webhook] Unhandled event type: ${type}`);
    }

    // Delivery updates are idempotent and deliberately precede the receipt
    // insertion. A retry can therefore repair a transient update failure.
    if (deliveryStatus && resendMessageId) {
      await updateInvitationDeliveryStatus(resendMessageId, deliveryStatus);
    }

    // Persist the signed Svix event id as a durable replay receipt.
    if (eventType && resendMessageId) {
      const inserted = await createEmailEvent(resendMessageId, eventType, email, reason, webhookEventId);
      if (!inserted) return res.status(200).json({ received: true, duplicate: true });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Resend Webhook] Error processing webhook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default resendWebhookRouter;
