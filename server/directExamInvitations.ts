import { randomBytes, createHash } from "node:crypto";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { directExamInvitations, learnerActivityLog, learnerGroupMemberships, learnerGroups, learnerProfiles, users } from "../drizzle/schema";
import { getExamDefinition } from "./examDefinition";
import trainingIndex from "../client/src/data/trainingIndex.json";

const TOKEN_BYTES = 32;
const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const hashExamInvitationToken = (token: string) => createHash("sha256").update(token).digest("hex");
const newToken = () => randomBytes(TOKEN_BYTES).toString("hex");

export function examInvitationDestination(certificationId: string) {
  if (!trainingIndex.certifications.some((cert) => cert.id === certificationId)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Certification inconnue." });
  }
  return `/mock-exam/${encodeURIComponent(certificationId)}`;
}

export function examInvitationTitle(certificationId: string, language: "fr" | "en" = "fr") {
  const cert = trainingIndex.certifications.find((item) => item.id === certificationId);
  return cert?.title?.[language] || cert?.title?.en || certificationId;
}

export async function createDirectExamInvitation(input: {
  email: string;
  certificationId: string;
  name?: string;
  invitedBy: number;
}) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base indisponible." });
  const email = normalizeEmail(input.email);
  examInvitationDestination(input.certificationId);
  const definition = await getExamDefinition(input.certificationId);
  if (!definition?.isPublished) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "L’examen doit être publié avant l’invitation." });
  const [account] = await db.select({ id: users.id, role: users.role, blocked: users.blocked }).from(users).where(eq(users.email, email)).limit(1);
  if (account && (account.blocked !== 0 || account.role === "manager")) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Ce compte ne peut pas être invité à un examen." });
  }
  const token = newToken();
  const [current] = await db.select({ id: directExamInvitations.id, status: directExamInvitations.status })
    .from(directExamInvitations).where(and(eq(directExamInvitations.email, email), eq(directExamInvitations.certificationId, input.certificationId))).limit(1);
  if (current?.status === "accepted") {
    throw new TRPCError({ code: "CONFLICT", message: "Cet apprenant dispose déjà de cet accès direct. Révoquez-le si nécessaire." });
  }
  const record = {
    email,
    certificationId: input.certificationId,
    name: input.name?.trim() || null,
    tokenHash: hashExamInvitationToken(token),
    invitedBy: input.invitedBy,
    status: "pending" as const,
    acceptedAt: null,
    acceptedUserId: null,
    revokedAt: null,
  };
  // La clé unique sérialise deux invitations simultanées. Ne jamais rétrograder
  // une invitation acceptée si elle est activée entre la lecture et l'upsert.
  await db.insert(directExamInvitations).values(record).onDuplicateKeyUpdate({ set: {
    tokenHash: sql`IF(${directExamInvitations.status} = 'accepted', ${directExamInvitations.tokenHash}, ${record.tokenHash})`,
    name: sql`IF(${directExamInvitations.status} = 'accepted', ${directExamInvitations.name}, ${record.name})`,
    invitedBy: sql`IF(${directExamInvitations.status} = 'accepted', ${directExamInvitations.invitedBy}, ${record.invitedBy})`,
    acceptedUserId: sql`IF(${directExamInvitations.status} = 'accepted', ${directExamInvitations.acceptedUserId}, NULL)`,
    acceptedAt: sql`IF(${directExamInvitations.status} = 'accepted', ${directExamInvitations.acceptedAt}, NULL)`,
    revokedAt: null,
    status: sql`IF(${directExamInvitations.status} = 'accepted', 'accepted', 'pending')`,
  } });
  const [saved] = await db.select({ id: directExamInvitations.id, tokenHash: directExamInvitations.tokenHash, status: directExamInvitations.status }).from(directExamInvitations)
    .where(and(eq(directExamInvitations.email, email), eq(directExamInvitations.certificationId, input.certificationId))).limit(1);
  if (!saved || saved.status !== "pending" || saved.tokenHash !== record.tokenHash) {
    throw new TRPCError({ code: "CONFLICT", message: "Cet accès vient de changer. Vérifiez son statut puis réessayez." });
  }
  return { id: saved.id, email, certificationId: input.certificationId, token, existingAccount: Boolean(account) };
}

export async function getDirectExamInvitationByToken(token: string) {
  if (!/^[0-9a-f]{64}$/.test(token)) return null;
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  const [invitation] = await db.select().from(directExamInvitations)
    .where(eq(directExamInvitations.tokenHash, hashExamInvitationToken(token))).limit(1);
  return invitation || null;
}

export async function acceptDirectExamInvitation(input: { token: string; userId: number }) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  const invitation = await getDirectExamInvitationByToken(input.token);
  if (!invitation || invitation.status === "revoked") throw new TRPCError({ code: "NOT_FOUND", message: "Invitation révoquée ou invalide." });
  const [user] = await db.select({ email: users.email, blocked: users.blocked }).from(users).where(eq(users.id, input.userId)).limit(1);
  if (!user || user.blocked !== 0 || normalizeEmail(user.email || "") !== invitation.email) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Connectez-vous au compte correspondant à l’invitation." });
  }
  if (invitation.status === "accepted") {
    if (invitation.acceptedUserId !== input.userId) throw new TRPCError({ code: "FORBIDDEN" });
    return { certificationId: invitation.certificationId, destination: examInvitationDestination(invitation.certificationId) };
  }
  const result = await db.update(directExamInvitations)
    .set({ status: "accepted", acceptedUserId: input.userId, acceptedAt: new Date() })
    .where(and(eq(directExamInvitations.id, invitation.id), eq(directExamInvitations.tokenHash, hashExamInvitationToken(input.token)), eq(directExamInvitations.status, "pending")));
  if (result[0].affectedRows !== 1) throw new TRPCError({ code: "CONFLICT", message: "L’invitation vient de changer d’état." });
  return { certificationId: invitation.certificationId, destination: examInvitationDestination(invitation.certificationId) };
}

/** Inscription invitée atomique : le profil est obligatoire avant de débloquer l’examen. */
export async function registerDirectExamGuest(input: {
  token: string;
  firstName: string;
  lastName: string;
  phone: string;
  passwordHash: string;
}) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  const invitation = await getDirectExamInvitationByToken(input.token);
  if (!invitation || invitation.status !== "pending") throw new TRPCError({ code: "NOT_FOUND", message: "Invitation révoquée, déjà utilisée ou invalide." });
  const openId = `local_${randomBytes(20).toString("hex")}`;
  try {
    await db.transaction(async (tx) => {
      const [existing] = await tx.select({ id: users.id }).from(users).where(eq(users.email, invitation.email)).limit(1);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Ce compte existe déjà : connectez-vous pour accepter l’invitation." });
      const result = await tx.insert(users).values({
        openId, email: invitation.email, passwordHash: input.passwordHash,
        name: `${input.firstName} ${input.lastName}`, loginMethod: "email", role: "user", lastSignedIn: new Date(), invitedAt: new Date(), invitedBy: invitation.invitedBy,
      });
      const userId = result[0].insertId;
      await tx.insert(learnerProfiles).values({ userId, firstName: input.firstName, lastName: input.lastName, phone: input.phone });
      const [defaultGroup] = await tx.select({ id: learnerGroups.id }).from(learnerGroups)
        .where(and(eq(learnerGroups.isSystem, 1), eq(learnerGroups.active, 1))).limit(1);
      if (!defaultGroup) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Groupe apprenant indisponible." });
      await tx.insert(learnerGroupMemberships).values({ userId, groupId: defaultGroup.id, assignedBy: invitation.invitedBy });
      await tx.insert(learnerActivityLog).values({ userId, actionType: "learner_group_full_access_assigned", metadata: { groupId: defaultGroup.id, source: "invitation_fallback", assignedBy: invitation.invitedBy } });
      const updated = await tx.update(directExamInvitations)
        .set({ status: "accepted", acceptedUserId: userId, acceptedAt: new Date() })
        .where(and(eq(directExamInvitations.id, invitation.id), eq(directExamInvitations.tokenHash, hashExamInvitationToken(input.token)), eq(directExamInvitations.status, "pending")));
      if (updated[0].affectedRows !== 1) throw new TRPCError({ code: "CONFLICT", message: "L’invitation vient de changer d’état." });
    });
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ER_DUP_ENTRY") {
      throw new TRPCError({ code: "CONFLICT", message: "Un compte existe déjà : connectez-vous pour accepter l’invitation." });
    }
    throw error;
  }
  return { openId, email: invitation.email, name: `${input.firstName} ${input.lastName}`, destination: examInvitationDestination(invitation.certificationId) };
}

export async function hasAcceptedDirectExamInvitation(userId: number, certificationId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  const [record] = await db.select({ id: directExamInvitations.id }).from(directExamInvitations)
    .where(and(eq(directExamInvitations.acceptedUserId, userId), eq(directExamInvitations.certificationId, certificationId), eq(directExamInvitations.status, "accepted"))).limit(1);
  return Boolean(record);
}

export async function getMyDirectExamInvitations(userId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  const rows = await db.select({ certificationId: directExamInvitations.certificationId, acceptedAt: directExamInvitations.acceptedAt })
    .from(directExamInvitations).where(and(eq(directExamInvitations.acceptedUserId, userId), eq(directExamInvitations.status, "accepted")))
    .orderBy(desc(directExamInvitations.acceptedAt));
  return rows.filter((row) => trainingIndex.certifications.some((cert) => cert.id === row.certificationId))
    .map((row) => ({ ...row, title: { fr: examInvitationTitle(row.certificationId, "fr"), en: examInvitationTitle(row.certificationId, "en") }, destination: examInvitationDestination(row.certificationId) }));
}

export async function listDirectExamInvitations(input: { limit: number; offset: number; search?: string }) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  const query = input.search?.trim();
  const filter = query ? or(like(directExamInvitations.email, `%${query}%`), like(directExamInvitations.certificationId, `%${query}%`)) : undefined;
  const [rows, totals] = await Promise.all([
    db.select({ id: directExamInvitations.id, email: directExamInvitations.email, name: directExamInvitations.name, certificationId: directExamInvitations.certificationId, status: directExamInvitations.status, acceptedUserId: directExamInvitations.acceptedUserId, invitedBy: directExamInvitations.invitedBy, createdAt: directExamInvitations.createdAt, acceptedAt: directExamInvitations.acceptedAt, revokedAt: directExamInvitations.revokedAt }).from(directExamInvitations).where(filter).orderBy(desc(directExamInvitations.createdAt)).limit(input.limit).offset(input.offset),
    db.select({ total: sql<number>`count(*)` }).from(directExamInvitations).where(filter),
  ]);
  return { rows, total: Number(totals[0]?.total || 0) };
}

export async function revokeDirectExamInvitation(id: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  const result = await db.update(directExamInvitations).set({ status: "revoked", revokedAt: new Date() }).where(and(eq(directExamInvitations.id, id), or(eq(directExamInvitations.status, "pending"), eq(directExamInvitations.status, "accepted"))));
  return { revoked: result[0].affectedRows === 1 };
}
