import { Resend } from "resend";
import type { CommunicationRecipientFilter } from "./adminDb";
import { createCommunicationReceiptsForRecipients, getRecipientsByFilter, updateCommunicationStatus } from "./adminDb";
import { interpolateRecipientName, sanitizeCommunicationHtml } from "./communicationBody";

type DeliverableCommunication = { id: number; subject: string; body: string; recipientFilter: unknown };

/** Sends a communication that has already been atomically claimed for delivery. */
export async function deliverClaimedCommunication(communication: DeliverableCommunication) {
  try {
    const recipients = await getRecipientsByFilter((communication.recipientFilter || {}) as CommunicationRecipientFilter);
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) throw new Error("RESEND_API_KEY not configured");
    const resend = new Resend(resendApiKey);
    let sentCount = 0;

    for (let index = 0; index < recipients.length; index += 10) {
      const batch = recipients.slice(index, index + 10);
      await Promise.all(batch.map(async (recipient) => {
        try {
          await resend.emails.send({
            from: "Neopolis Akademy <info@neopolis-dev.com>",
            to: [recipient.email],
            subject: communication.subject,
            html: interpolateRecipientName(sanitizeCommunicationHtml(communication.body), recipient.name),
          });
          sentCount++;
        } catch (error) {
          console.error(`[Comm] Failed to send to ${recipient.email}:`, error);
        }
      }));
    }

    await createCommunicationReceiptsForRecipients(communication.id, recipients);
    await updateCommunicationStatus(communication.id, "sent", sentCount);
    return { success: true, sentCount, recipients: recipients.length };
  } catch (error) {
    await updateCommunicationStatus(communication.id, "failed");
    throw error;
  }
}
