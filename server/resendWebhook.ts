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
    const payload = req.body as ResendWebhookPayload;
    
    if (!payload || !payload.type || !payload.data) {
      console.warn("[Resend Webhook] Invalid payload received");
      return res.status(400).json({ error: "Invalid payload" });
    }

    const { type, data } = payload;
    const resendMessageId = data.email_id;
    const email = data.to?.[0] || "";

    console.log(`[Resend Webhook] Event: ${type} for ${email} (messageId: ${resendMessageId})`);

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

    // Record the email event
    if (eventType && resendMessageId) {
      await createEmailEvent(resendMessageId, eventType, email, reason);
    }

    // Update invitation delivery status (only for delivery-related events)
    if (deliveryStatus && resendMessageId) {
      await updateInvitationDeliveryStatus(resendMessageId, deliveryStatus);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Resend Webhook] Error processing webhook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default resendWebhookRouter;
