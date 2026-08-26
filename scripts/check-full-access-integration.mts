import crypto from "node:crypto";
import mysql from "mysql2/promise";
import { applyInvitationGroupsToUser, createInvitation, replaceLearnerGroupMembers, upsertUser, userCanAccessCourse } from "../server/db";

const connection = await mysql.createConnection(process.env.DATABASE_URL!);
const runId = crypto.randomUUID().replaceAll("-", "").slice(0, 16);
const makeIdentity = (label: string) => ({ openId: `qa-full-access-${label}-${runId}`, email: `qa-full-access-${label}-${runId}@invalid.test`, name: `QA Full access ${label}` });
const createdOpenIds: string[] = [];

async function createRawUser(label: string) {
  const user = makeIdentity(label);
  createdOpenIds.push(user.openId);
  await connection.execute(
    "INSERT INTO users (openId, name, email, loginMethod, role, blocked, lastSignedIn, createdAt, updatedAt) VALUES (?, ?, ?, 'qa', 'user', 0, NOW(), NOW(), NOW())",
    [user.openId, user.name, user.email],
  );
  const [[row]] = await connection.execute<any[]>("SELECT id FROM users WHERE openId = ?", [user.openId]);
  return { ...user, id: Number(row.id) };
}

async function hasFullAccess(userId: number, fullAccessGroupId: number) {
  const [[row]] = await connection.execute<any[]>("SELECT COUNT(*) AS total FROM learner_group_memberships WHERE userId = ? AND groupId = ?", [userId, fullAccessGroupId]);
  return Number(row.total) === 1;
}

try {
  const [[fullAccess]] = await connection.execute<any[]>("SELECT id FROM learner_groups WHERE isSystem = 1 AND active = 1 ORDER BY id DESC LIMIT 1");
  const [[admin]] = await connection.execute<any[]>("SELECT id FROM users WHERE role = 'admin' AND blocked = 0 ORDER BY id LIMIT 1");
  if (!fullAccess || !admin) throw new Error("Groupe Full access ou administrateur de QA introuvable.");
  const fullAccessGroupId = Number(fullAccess.id);
  const adminId = Number(admin.id);

  const invitationUser = await createRawUser("invitation");
  const invitation = await createInvitation(invitationUser.email, invitationUser.name, adminId);
  await applyInvitationGroupsToUser(invitation.token, invitationUser.id);
  if (!(await hasFullAccess(invitationUser.id, fullAccessGroupId))) throw new Error("Invitation sans groupe : Full access absent.");

  const upsertUserIdentity = makeIdentity("upsert");
  createdOpenIds.push(upsertUserIdentity.openId);
  await upsertUser({ ...upsertUserIdentity, loginMethod: "qa", role: "user", lastSignedIn: new Date() });
  const [[upsertRow]] = await connection.execute<any[]>("SELECT id FROM users WHERE openId = ?", [upsertUserIdentity.openId]);
  if (!(await hasFullAccess(Number(upsertRow.id), fullAccessGroupId))) throw new Error("Création de compte : Full access absent.");

  const accessUser = await createRawUser("access");
  if (!(await userCanAccessCourse(accessUser.id, "automatisation_comptable_ia__01"))) throw new Error("Premier accès : le cours reste refusé.");
  if (!(await hasFullAccess(accessUser.id, fullAccessGroupId))) throw new Error("Premier accès : Full access absent.");

  const manualUser = await createRawUser("manual");
  const [existingRows] = await connection.execute<any[]>("SELECT userId FROM learner_group_memberships WHERE groupId = ? ORDER BY userId", [fullAccessGroupId]);
  const existingUserIds = existingRows.map((row) => Number(row.userId));
  await replaceLearnerGroupMembers(fullAccessGroupId, [...existingUserIds, manualUser.id], adminId);
  const [[manualEvent]] = await connection.execute<any[]>("SELECT metadata FROM learner_activity_log WHERE userId = ? AND actionType = 'learner_group_full_access_manually_assigned' ORDER BY id DESC LIMIT 1", [manualUser.id]);
  if (!manualEvent || Number(manualEvent.metadata.assignedBy) !== adminId) throw new Error("Affectation manuelle : journal avec assignedBy absent.");
  await replaceLearnerGroupMembers(fullAccessGroupId, existingUserIds, adminId);

  console.table({ invitation_without_group: "passed", account_upsert: "passed", first_course_access: "passed", manual_assignment_trace: "passed" });
} finally {
  if (createdOpenIds.length) {
    const placeholders = createdOpenIds.map(() => "?").join(", ");
    await connection.query(`DELETE l FROM learner_activity_log l JOIN users u ON u.id = l.userId WHERE u.openId IN (${placeholders})`, createdOpenIds);
    await connection.query(`DELETE gm FROM learner_group_memberships gm JOIN users u ON u.id = gm.userId WHERE u.openId IN (${placeholders})`, createdOpenIds);
    await connection.query(`DELETE ig FROM invitation_groups ig JOIN user_invitations i ON i.id = ig.invitationId WHERE i.email LIKE ?`, [`qa-full-access-%${runId}%`]);
    await connection.query("DELETE FROM user_invitations WHERE email LIKE ?", [`qa-full-access-%${runId}%`]);
    await connection.query(`DELETE FROM users WHERE openId IN (${placeholders})`, createdOpenIds);
  }
  await connection.end();
}
