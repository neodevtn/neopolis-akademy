import mysql from "mysql2/promise";
import { createInvitationWithTracking } from "../server/db";
import { sendInvitationEmail } from "../server/email";

type ExpiredRecipient = {
  email: string;
  name: string | null;
  invitedBy: number;
  invitedByName: string | null;
  applicationId: number | null;
  oldInvitationIds: string;
  groupIds: string | null;
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL est requis.");

const connection = await mysql.createConnection(databaseUrl);
const baseUrl = process.env.VITE_APP_URL || "https://akademy.neodev.click";
const report = { eligible: 0, created: 0, sent: 0, failed: 0, invalidatedExpired: 0 };

try {
  const [recipients] = await connection.query<ExpiredRecipient[]>(`
    SELECT
      MIN(i.email) AS email,
      MAX(i.name) AS name,
      MAX(i.invitedBy) AS invitedBy,
      MAX(inviter.name) AS invitedByName,
      MAX(i.applicationId) AS applicationId,
      GROUP_CONCAT(DISTINCT i.id ORDER BY i.id) AS oldInvitationIds,
      GROUP_CONCAT(DISTINCT ig.groupId ORDER BY ig.groupId) AS groupIds
    FROM user_invitations i
    LEFT JOIN users u ON LOWER(u.email) = LOWER(i.email)
    LEFT JOIN users inviter ON inviter.id = i.invitedBy
    LEFT JOIN invitation_groups ig ON ig.invitationId = i.id
    WHERE (i.status = 'expired' OR (i.status = 'pending' AND i.expiresAt < NOW()))
      AND u.id IS NULL
      AND i.emailDeliveryStatus NOT IN ('bounced', 'complained', 'suppressed')
      AND NOT EXISTS (
        SELECT 1 FROM user_invitations active_invitation
        WHERE LOWER(active_invitation.email) = LOWER(i.email)
          AND active_invitation.status = 'pending'
          AND active_invitation.expiresAt >= NOW()
      )
    GROUP BY LOWER(i.email)
    ORDER BY MIN(i.id)
  `);

  report.eligible = recipients.length;
  for (const recipient of recipients) {
    const groupIds = recipient.groupIds ? recipient.groupIds.split(",").map(Number).filter(Number.isFinite) : [];
    try {
      const invitation = await createInvitationWithTracking(
        recipient.email,
        recipient.name,
        Number(recipient.invitedBy),
        recipient.applicationId ? Number(recipient.applicationId) : undefined,
        7,
        groupIds,
      );
      report.created += 1;
      const { messageId } = await sendInvitationEmail({
        to: recipient.email,
        name: recipient.name,
        language: "fr",
        invitedBy: recipient.invitedByName || "Neopolis Akademy",
        invitationLink: `${baseUrl}/accept-invitation?token=${invitation.token}`,
        message: "Votre précédente invitation a expiré. Voici un nouveau lien valable 7 jours.",
      });
      if (!messageId) throw new Error("Aucun identifiant de délivrabilité retourné.");
      await connection.execute(
        "UPDATE user_invitations SET resendMessageId = ?, emailDeliveryStatus = 'sent' WHERE id = ?",
        [messageId, invitation.id],
      );
      await connection.query(
        `UPDATE user_invitations SET status = 'expired' WHERE id IN (${recipient.oldInvitationIds}) AND status = 'pending'`,
      );
      report.invalidatedExpired += recipient.oldInvitationIds.split(",").length;
      report.sent += 1;
    } catch {
      report.failed += 1;
    }
  }
  console.table(report);
  if (report.failed) process.exitCode = 1;
} finally {
  await connection.end();
}
