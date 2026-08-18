import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createAdminNote, getAdminNotes, updateAdminNote, deleteAdminNote,
  createAdminTag, getAdminTags, deleteAdminTag,
  assignTagToUser, removeTagFromUser, getUserTags,
  createCommunication, getCommunications, updateCommunicationStatus,
  getCommunicationById, claimCommunicationForDelivery, markCommunicationScheduled, cancelScheduledCommunication,
  createCommunicationSegment, getCommunicationSegments, deleteCommunicationSegment,
  logAdminActivity, getAdminActivityLog,
  bulkUpdateApplicationStatus, getApplicationsByIds,
  getLearnerAnalytics, getRecipientsByFilter, getRecipientPreview, getCommunicationSegmentOptions,
} from "./adminDb";
import {
  getAdminNotifications, getUnreadNotificationCount,
  markNotificationRead, markAllNotificationsRead,
  createAdminNotification,
} from "./notificationsDb";
import { upsertUser, setUserPasswordHash, getUserByEmail } from "./db";
import { sendDecisionEmail } from "./email";
import bcrypt from "bcryptjs";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import { createHeartbeatJob, deleteHeartbeatJob } from "./_core/heartbeat";
import { formatCommunicationBody } from "./communicationBody";
import { deliverClaimedCommunication } from "./communicationDelivery";
import { isSchedulableCommunicationDate, toOneShotCommunicationCron } from "@shared/communicationScheduling";
import type { CommunicationRecipientFilter } from "./adminDb";
import { getIntegrityReviewQueue, getLearnerIntegrityReview, reviewLearnerIntegrity } from "./integrityService";

const SALT_ROUNDS = 10;

const communicationRecipientFilterSchema = z.object({
  audience: z.enum(["all", "invited", "registered_invitees", "learners_inactive", "learners_started", "diploma_holders", "competency_level"]).optional(),
  tags: z.array(z.number()).optional(),
  status: z.array(z.string()).optional(),
  role: z.array(z.string()).optional(),
  competencyId: z.string().min(2).max(80).optional(),
  minCompetencyLevel: z.number().min(0).max(100).optional(),
  courseId: z.string().min(2).max(200).optional(),
  courseProgressStatus: z.enum(["started", "completed"]).optional(),
  activityWithinDays: z.number().int().min(1).max(365).optional(),
  manualEmails: z.array(z.string().email()).max(500).optional(),
  criteriaLogic: z.enum(["all", "any"]).optional(),
});

function sessionTokenFromRequest(req: { headers: { cookie?: string } }) {
  return parseCookieHeader(req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
}

// Helper to enforce admin role
function assertAdmin(ctx: { user: { role: string } }) {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs" });
  }
}

export const adminEnhancedRouter = router({
  // ============ Notes ============
  notes: router({
    create: protectedProcedure
      .input(z.object({
        targetType: z.enum(["user", "application"]),
        targetId: z.number(),
        content: z.string().min(1).max(5000),
        category: z.enum(["general", "evaluation", "follow_up", "alert", "decision"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        assertAdmin(ctx);
        const note = await createAdminNote({
          targetType: input.targetType,
          targetId: input.targetId,
          authorId: ctx.user.id,
          content: input.content,
          category: input.category || "general",
        });
        await logAdminActivity({
          adminId: ctx.user.id,
          action: "create_note",
          targetType: input.targetType,
          targetId: input.targetId,
          details: { category: input.category || "general" },
        });
        return note;
      }),

    list: protectedProcedure
      .input(z.object({
        targetType: z.enum(["user", "application"]),
        targetId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        assertAdmin(ctx);
        return await getAdminNotes(input.targetType, input.targetId);
      }),

    update: protectedProcedure
      .input(z.object({
        noteId: z.number(),
        content: z.string().min(1).max(5000),
        category: z.enum(["general", "evaluation", "follow_up", "alert", "decision"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        assertAdmin(ctx);
        return await updateAdminNote(input.noteId, input.content, input.category);
      }),

    delete: protectedProcedure
      .input(z.object({ noteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        assertAdmin(ctx);
        await deleteAdminNote(input.noteId);
        return { success: true };
      }),
  }),

  // ============ Tags ============
  tags: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
        description: z.string().max(500).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        assertAdmin(ctx);
        const tag = await createAdminTag({
          name: input.name,
          color: input.color || "#6b7280",
          description: input.description || null,
          createdBy: ctx.user.id,
        });
        await logAdminActivity({
          adminId: ctx.user.id,
          action: "create_tag",
          targetType: "tag",
          targetId: tag.id,
          details: { name: input.name },
        });
        return tag;
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        assertAdmin(ctx);
        return await getAdminTags();
      }),

    delete: protectedProcedure
      .input(z.object({ tagId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        assertAdmin(ctx);
        await deleteAdminTag(input.tagId);
        await logAdminActivity({
          adminId: ctx.user.id,
          action: "delete_tag",
          targetType: "tag",
          targetId: input.tagId,
          details: {},
        });
        return { success: true };
      }),

    assignToUser: protectedProcedure
      .input(z.object({ userId: z.number(), tagId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        assertAdmin(ctx);
        return await assignTagToUser(input.userId, input.tagId, ctx.user.id);
      }),

    removeFromUser: protectedProcedure
      .input(z.object({ userId: z.number(), tagId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        assertAdmin(ctx);
        return await removeTagFromUser(input.userId, input.tagId);
      }),

    getUserTags: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        assertAdmin(ctx);
        return await getUserTags(input.userId);
      }),
  }),

  // ============ Integrity review (human decision only) ============
  integrity: router({
    queue: protectedProcedure.query(async ({ ctx }) => {
      assertAdmin(ctx);
      return await getIntegrityReviewQueue();
    }),
    getForLearner: protectedProcedure.input(z.object({ userId: z.number() })).query(async ({ ctx, input }) => {
      assertAdmin(ctx);
      return await getLearnerIntegrityReview(input.userId);
    }),
    review: protectedProcedure.input(z.object({
      userId: z.number(),
      status: z.enum(["review_required", "confirmed", "dismissed"]),
      notes: z.string().max(3000).optional(),
    })).mutation(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const result = await reviewLearnerIntegrity({ ...input, reviewerId: ctx.user.id });
      await logAdminActivity({
        adminId: ctx.user.id,
        action: "review_learning_integrity",
        targetType: "user",
        targetId: input.userId,
        details: { status: input.status, riskScore: result.assessment.riskScore, signalIds: result.assessment.signals.map((signal) => signal.id) },
      });
      return result;
    }),
  }),

  // ============ Communications ============
  communications: router({
    create: protectedProcedure
      .input(z.object({
        subject: z.string().min(1).max(500),
        body: z.string().min(1).max(50000),
        bodyFormat: z.enum(["markdown", "html"]).optional(),
        type: z.enum(["invitation", "announcement", "reminder", "welcome", "custom"]),
        isImportant: z.boolean().optional(),
        recipientFilter: communicationRecipientFilterSchema.optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        assertAdmin(ctx);
        const comm = await createCommunication({
          subject: input.subject,
          body: formatCommunicationBody(input.body, input.bodyFormat || "html"),
          type: input.type,
          isImportant: input.isImportant ? 1 : 0,
          recipientFilter: input.recipientFilter || {},
          sentBy: ctx.user.id,
          status: "draft",
          recipientCount: 0,
        });
        await logAdminActivity({
          adminId: ctx.user.id,
          action: "create_communication",
          targetType: "communication",
          targetId: comm.id,
          details: { subject: input.subject, type: input.type, isImportant: Boolean(input.isImportant) },
        });
        return comm;
      }),

    list: protectedProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      }).optional())
      .query(async ({ ctx, input }) => {
        assertAdmin(ctx);
        return await getCommunications(input?.page || 1, input?.pageSize || 20);
      }),

    send: protectedProcedure
      .input(z.object({ communicationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        assertAdmin(ctx);
        const comm = await claimCommunicationForDelivery(input.communicationId, ["draft"]);
        if (!comm) throw new TRPCError({ code: "BAD_REQUEST", message: "Ce brouillon ne peut plus être envoyé" });
        try {
          const result = await deliverClaimedCommunication(comm);
          await logAdminActivity({
            adminId: ctx.user.id,
            action: "send_communication",
            targetType: "communication",
            targetId: input.communicationId,
            details: { recipientCount: result.sentCount, subject: comm.subject },
          });
          return result;
        } catch {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Échec de l'envoi" });
        }
      }),

    getRecipientCount: protectedProcedure
      .input(z.object({
        recipientFilter: communicationRecipientFilterSchema,
      }))
      .query(async ({ ctx, input }) => {
        assertAdmin(ctx);
        return await getRecipientPreview(input.recipientFilter);
      }),

    getSegmentOptions: protectedProcedure
      .query(async ({ ctx }) => {
        assertAdmin(ctx);
        return await getCommunicationSegmentOptions();
      }),

    segments: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        assertAdmin(ctx);
        return await getCommunicationSegments();
      }),

      create: protectedProcedure
        .input(z.object({
          name: z.string().trim().min(2).max(160),
          description: z.string().trim().max(1000).optional(),
          recipientFilter: communicationRecipientFilterSchema,
        }))
        .mutation(async ({ ctx, input }) => {
          assertAdmin(ctx);
          const segment = await createCommunicationSegment({
            name: input.name,
            description: input.description || null,
            recipientFilter: input.recipientFilter,
            createdBy: ctx.user.id,
          });
          await logAdminActivity({ adminId: ctx.user.id, action: "create_communication_segment", targetType: "communication_segment", targetId: segment.id, details: { name: segment.name } });
          return segment;
        }),

      delete: protectedProcedure
        .input(z.object({ segmentId: z.number().positive() }))
        .mutation(async ({ ctx, input }) => {
          assertAdmin(ctx);
          await deleteCommunicationSegment(input.segmentId);
          await logAdminActivity({ adminId: ctx.user.id, action: "delete_communication_segment", targetType: "communication_segment", targetId: input.segmentId, details: {} });
          return { success: true };
        }),
    }),

    schedule: protectedProcedure
      .input(z.object({
        communicationId: z.number().positive(),
        scheduledAt: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        assertAdmin(ctx);
        if (!isSchedulableCommunicationDate(input.scheduledAt)) throw new TRPCError({ code: "BAD_REQUEST", message: "Choisissez une date comprise entre deux minutes et douze mois dans le futur" });
        const communication = await getCommunicationById(input.communicationId);
        if (!communication) throw new TRPCError({ code: "NOT_FOUND", message: "Communication non trouvée" });
        if (communication.status !== "draft") throw new TRPCError({ code: "BAD_REQUEST", message: "Seul un brouillon peut être programmé" });
        const preview = await getRecipientPreview((communication.recipientFilter || {}) as CommunicationRecipientFilter);
        if (preview.count === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Aucun destinataire ne correspond à ce segment" });

        const sessionToken = sessionTokenFromRequest(ctx.req);
        const job = await createHeartbeatJob({
          name: `communication-${communication.id}-${input.scheduledAt.getTime()}`,
          cron: toOneShotCommunicationCron(input.scheduledAt),
          path: "/api/scheduled/send-communication",
          payload: { communicationId: communication.id },
          description: `Envoi différé du communiqué « ${communication.subject.slice(0, 80)} »`,
        }, sessionToken);
        const marked = await markCommunicationScheduled(communication.id, input.scheduledAt, job.taskUid, preview.count);
        if (!marked) {
          try { await deleteHeartbeatJob(job.taskUid, sessionToken); } catch { /* The orphan performs no delivery without a persisted task UID. */ }
          throw new TRPCError({ code: "CONFLICT", message: "Le brouillon a été modifié avant sa programmation" });
        }
        await logAdminActivity({ adminId: ctx.user.id, action: "schedule_communication", targetType: "communication", targetId: communication.id, details: { scheduledAt: input.scheduledAt.toISOString(), recipientCount: preview.count } });
        return { success: true, scheduledAt: input.scheduledAt, recipientCount: preview.count, nextExecutionAt: job.nextExecutionAt || null };
      }),

    cancelSchedule: protectedProcedure
      .input(z.object({ communicationId: z.number().positive() }))
      .mutation(async ({ ctx, input }) => {
        assertAdmin(ctx);
        const communication = await cancelScheduledCommunication(input.communicationId);
        if (!communication) throw new TRPCError({ code: "BAD_REQUEST", message: "Cette communication n’est pas programmée" });
        if (communication.scheduleCronTaskUid) await deleteHeartbeatJob(communication.scheduleCronTaskUid, sessionTokenFromRequest(ctx.req));
        await logAdminActivity({ adminId: ctx.user.id, action: "cancel_communication_schedule", targetType: "communication", targetId: input.communicationId, details: {} });
        return { success: true };
      }),
  }),

  // ============ Bulk Actions ============
  bulk: router({
    updateStatus: protectedProcedure
      .input(z.object({
        applicationIds: z.array(z.number()).min(1).max(100),
        status: z.enum(["selectionne", "refuse"]),
      }))
      .mutation(async ({ ctx, input }) => {
        assertAdmin(ctx);
        const result = await bulkUpdateApplicationStatus(input.applicationIds, input.status);

        // If accepted, auto-create accounts
        if (input.status === "selectionne") {
          const apps = await getApplicationsByIds(input.applicationIds);
          for (const app of apps) {
            try {
              // Check if user already exists
              const existing = await getUserByEmail(app.email.toLowerCase());
              if (!existing) {
                // Generate a temporary password
                const tempPassword = `NA_${Math.random().toString(36).slice(2, 10)}`;
                const passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);
                const openId = `accepted_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

                await upsertUser({
                  openId,
                  name: `${app.firstName} ${app.lastName}`,
                  email: app.email.toLowerCase(),
                  loginMethod: "email",
                  lastSignedIn: new Date(),
                });
                await setUserPasswordHash(openId, passwordHash);

                // Send acceptance email with credentials
                await sendDecisionEmail({
                  to: app.email,
                  firstName: app.firstName,
                  lastName: app.lastName,
                  decision: "selectionne",
                  scores: {
                    scoreTotal: Number(app.scoreTotal) || 0,
                    scoreTechnique: Number(app.scoreTechnique) || 0,
                    scoreMetier: Number(app.scoreMetier) || 0,
                    scoreCommunication: Number(app.scoreCommunication) || 0,
                  },
                  adminNotes: `Mot de passe temporaire: ${tempPassword}`,
                });
              }
            } catch (e) {
              console.error(`[Bulk] Failed to create account for ${app.email}:`, e);
            }
          }
        } else {
          // Send rejection emails
          const apps = await getApplicationsByIds(input.applicationIds);
          for (const app of apps) {
            try {
              await sendDecisionEmail({
                to: app.email,
                firstName: app.firstName,
                lastName: app.lastName,
                decision: "refuse",
                scores: {
                  scoreTotal: Number(app.scoreTotal) || 0,
                  scoreTechnique: Number(app.scoreTechnique) || 0,
                  scoreMetier: Number(app.scoreMetier) || 0,
                  scoreCommunication: Number(app.scoreCommunication) || 0,
                },
              });
            } catch (e) {
              console.error(`[Bulk] Failed to send rejection to ${app.email}:`, e);
            }
          }
        }

        await logAdminActivity({
          adminId: ctx.user.id,
          action: `bulk_${input.status}`,
          targetType: "application",
          targetId: null,
          details: { count: input.applicationIds.length, ids: input.applicationIds },
        });

        return result;
      }),
  }),

  // ============ Analytics ============
  analytics: router({
    getLearnerAnalytics: protectedProcedure
      .query(async ({ ctx }) => {
        assertAdmin(ctx);
        return await getLearnerAnalytics();
      }),
  }),

  // ============ Activity Log ============
  activityLog: router({
    list: protectedProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(50),
      }).optional())
      .query(async ({ ctx, input }) => {
        assertAdmin(ctx);
        return await getAdminActivityLog(input?.page || 1, input?.pageSize || 50);
      }),
  }),

  // ============ Notifications ============
  notifications: router({
    list: protectedProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(50).default(20),
        unreadOnly: z.boolean().default(false),
      }).optional())
      .query(async ({ ctx, input }) => {
        assertAdmin(ctx);
        return await getAdminNotifications(
          input?.page || 1,
          input?.pageSize || 20,
          input?.unreadOnly || false
        );
      }),

    unreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        assertAdmin(ctx);
        return await getUnreadNotificationCount();
      }),

    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        assertAdmin(ctx);
        await markNotificationRead(input.id);
        return { success: true };
      }),

    markAllRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        assertAdmin(ctx);
        await markAllNotificationsRead();
        return { success: true };
      }),
  }),
});
