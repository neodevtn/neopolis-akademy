import { createHmac } from "crypto";
import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

const { createEmailEvent, updateInvitationDeliveryStatus } = vi.hoisted(() => ({
  createEmailEvent: vi.fn().mockResolvedValue(true),
  updateInvitationDeliveryStatus: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("./db", () => ({ createEmailEvent, updateInvitationDeliveryStatus }));

import resendWebhookRouter from "./resendWebhook";

const configuredSecret = process.env.RESEND_WEBHOOK_SECRET;

function sign(rawBody: string, eventId: string, timestamp: string) {
  const key = Buffer.from(configuredSecret!.replace(/^whsec_/, ""), "base64");
  return createHmac("sha256", key).update(`${eventId}.${timestamp}.${rawBody}`).digest("base64");
}

async function postWebhook(rawBody: string, signature: string, timestamp = `${Math.floor(Date.now() / 1000)}`) {
  const app = express();
  app.use(express.raw({ type: "application/json" }));
  app.use(resendWebhookRouter);
  const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  try {
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    return await fetch(`http://127.0.0.1:${port}/api/webhooks/resend`, {
      method: "POST",
      headers: { "content-type": "application/json", "svix-id": "evt_test_webhook", "svix-timestamp": timestamp, "svix-signature": `v1,${signature}` },
      body: rawBody,
    });
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

describe.skipIf(!configuredSecret)("webhook Resend signé", () => {
  afterEach(() => vi.clearAllMocks());

  it("accepte par HTTP local un événement signé avec le secret configuré", async () => {
    const rawBody = JSON.stringify({ type: "email.delivered", created_at: "2026-09-07T00:00:00Z", data: { email_id: "msg_test", from: "noreply@example.test", to: ["learner@example.test"], subject: "Test", created_at: "2026-09-07T00:00:00Z" } });
    const timestamp = `${Math.floor(Date.now() / 1000)}`;
    const response = await postWebhook(rawBody, sign(rawBody, "evt_test_webhook", timestamp), timestamp);
    expect(response.status).toBe(200);
    expect(createEmailEvent).toHaveBeenCalledWith("msg_test", "delivered", "learner@example.test", undefined, "evt_test_webhook");
  });

  it("refuse un événement non signé sans effet de bord", async () => {
    const response = await postWebhook("{}", "invalid");
    expect(response.status).toBe(401);
    expect(createEmailEvent).not.toHaveBeenCalled();
  });
});
