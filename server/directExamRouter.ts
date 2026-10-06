import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./_core/trpc";
import { isAdministrativeRole } from "../shared/roles";
import { getCertificationLessonCounts } from "./examDefinition";
import { isCertificationComplete } from "./db";
import {
  createDirectExamInvitation, examInvitationTitle, getMyDirectExamInvitations,
  hasAcceptedDirectExamInvitation, listDirectExamInvitations, revokeDirectExamInvitation,
} from "./directExamInvitations";
import { sendDirectExamInvitationEmail } from "./directExamInvitationEmail";
import { logAdminActivity } from "./adminDb";

const certificationInput = z.object({ certificationId: z.string().trim().min(2).max(200) });
const CANONICAL_ORIGIN = "https://akademy.neodev.click";

export function safeExamInvitationOrigin(origin: string, isProduction = process.env.NODE_ENV === "production") {
  let parsed: URL;
  try { parsed = new URL(origin); } catch { throw new TRPCError({ code: "BAD_REQUEST", message: "Origine invalide." }); }
  if (parsed.origin !== origin || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Origine invalide." });
  }
  if (isProduction) {
    if (origin !== CANONICAL_ORIGIN && origin !== "https://neopacademy-6qa7lvjq.manus.space") {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Origine non autorisée." });
    }
    return CANONICAL_ORIGIN;
  }
  if (origin === CANONICAL_ORIGIN || (/^https:\/\/3000-[a-z0-9-]+\.us[12]\.manus\.computer$/.test(origin))) return origin;
  if (/^http:\/\/(localhost|127\.0\.0\.1):3000$/.test(origin)) return origin;
  throw new TRPCError({ code: "BAD_REQUEST", message: "Origine non autorisée." });
}

export async function getDirectExamAccess(userId: number, certificationId: string) {
  const direct = await hasAcceptedDirectExamInvitation(userId, certificationId);
  if (direct) return { allowed: true, direct: true, coursesComplete: false };
  const counts = getCertificationLessonCounts(certificationId);
  const coursesComplete = Object.keys(counts).length > 0 && await isCertificationComplete(userId, certificationId, counts);
  return { allowed: coursesComplete, direct: false, coursesComplete };
}

export const directExamRouter = router({
  create: protectedProcedure.input(z.object({
    email: z.string().trim().email().max(320),
    name: z.string().trim().max(200).optional(),
    certificationId: z.string().trim().min(2).max(200),
    origin: z.string().url().max(300),
    language: z.enum(["fr", "en"]).default("fr"),
  })).mutation(async ({ ctx, input }) => {
    if (!isAdministrativeRole(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
    const origin = safeExamInvitationOrigin(input.origin);
    const invitation = await createDirectExamInvitation({ email: input.email, name: input.name, certificationId: input.certificationId, invitedBy: ctx.user.id });
    await logAdminActivity({ adminId: ctx.user.id, action: "create_direct_exam_invitation", targetType: "exam_invitation", targetId: invitation.id, details: { certificationId: input.certificationId } });
    const url = `${origin}/accept-exam-invitation?token=${encodeURIComponent(invitation.token)}`;
    let delivered = false;
    try {
      const result = await sendDirectExamInvitationEmail({ to: invitation.email, name: input.name, examTitle: examInvitationTitle(input.certificationId, input.language), url, language: input.language, existingAccount: invitation.existingAccount });
      delivered = result.delivered;
    } catch (error) {
      console.error("[DirectExam] Invitation email not delivered", error);
    }
    // Seul l'administrateur créateur reçoit le lien. Le token n'est jamais inclus dans les listes.
    return { email: invitation.email, certificationId: invitation.certificationId, delivered, url };
  }),
  list: protectedProcedure.input(z.object({ offset: z.number().int().min(0).default(0), limit: z.number().int().min(1).max(50).default(20), search: z.string().trim().max(100).optional() }).optional()).query(async ({ ctx, input }) => {
    if (!isAdministrativeRole(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
    return listDirectExamInvitations(input || { offset: 0, limit: 20 });
  }),
  revoke: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    if (!isAdministrativeRole(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
    const revoked = await revokeDirectExamInvitation(input.id);
    if (!revoked.revoked) throw new TRPCError({ code: "NOT_FOUND", message: "Invitation inexistante ou déjà révoquée." });
    await logAdminActivity({ adminId: ctx.user.id, action: "revoke_direct_exam_invitation", targetType: "exam_invitation", targetId: input.id, details: {} });
    return true;
  }),
  getMy: protectedProcedure.query(async ({ ctx }) => ctx.user.blocked === 1 ? [] : getMyDirectExamInvitations(ctx.user.id)),
  getAccess: protectedProcedure.input(certificationInput).query(async ({ ctx, input }) => ctx.user.blocked === 1 ? { allowed: false, direct: false, coursesComplete: false } : getDirectExamAccess(ctx.user.id, input.certificationId)),
});
