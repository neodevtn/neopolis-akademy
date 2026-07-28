import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createApplication, getApplications, getApplicationById, updateApplicationStatus, getApplicationStats, getUserProgress, markLessonComplete, isCertificationComplete, createExamAttempt, getExamAttempts, getAllLearners, getLearnerProgress, getAllLearnersStats, getVideoProgress, toggleVideoProgress, getChapterProgress, upsertChapterProgress, blockUser, updateUserRole, createInvitation, getInvitations, getAdminAnalytics, exportLearnersCSV } from "./db";
import { calculateScore } from "./scoring";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "./_core/notification";
import { applicationSchema } from "@shared/validation";
import { storagePut } from "./storage";
import { sendConfirmationEmail, sendDecisionEmail, sendInvitationEmail } from "./email";
import { uploadRateLimit, submitRateLimit, getClientIp } from "./security";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  applications: router({
    uploadFile: publicProcedure
      .input(z.object({
        fileName: z.string().min(1).max(255),
        fileData: z.string(), // base64 encoded
        contentType: z.string(),
        type: z.enum(["cv", "photo", "video"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Rate limit per IP (F-006: max 10 uploads/hour)
        const ip = getClientIp(ctx.req);
        if (!uploadRateLimit(ip)) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Trop de fichiers envoyés. Veuillez réessayer dans quelques minutes.",
          });
        }

        // Validate content type
        const allowedCvTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];
        const allowedVideoTypes = ["video/webm", "video/mp4", "video/ogg"];
        const allowed = input.type === "cv" ? allowedCvTypes : input.type === "photo" ? allowedPhotoTypes : allowedVideoTypes;
        
        if (!allowed.includes(input.contentType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: input.type === "cv" 
              ? "Format de CV non autorisé. Formats acceptés : PDF, DOC, DOCX" 
              : input.type === "photo"
              ? "Format de photo non autorisé. Formats acceptés : JPEG, PNG, WEBP"
              : "Format de vidéo non autorisé. Formats acceptés : WebM, MP4, OGG",
          });
        }

        // Validate file extension against whitelist (F-013)
        const allowedExtensions: Record<string, string[]> = {
          cv: ["pdf", "doc", "docx"],
          photo: ["jpg", "jpeg", "png", "webp"],
          video: ["webm", "mp4", "ogg"],
        };
        const ext = (input.fileName.split(".").pop() || "").toLowerCase();
        if (!allowedExtensions[input.type].includes(ext)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Extension de fichier non autorisée (.${ext}). Extensions acceptées : ${allowedExtensions[input.type].join(", ")}`,
          });
        }

        const buffer = Buffer.from(input.fileData, "base64");
        
        // Validate file size (CV: 10MB max, Photo: 5MB max, Video: 50MB max)
        const maxSize = input.type === "cv" ? 10 * 1024 * 1024 : input.type === "photo" ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
        if (buffer.length > maxSize) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: input.type === "cv" 
              ? "Le CV ne doit pas dépasser 10 Mo" 
              : input.type === "photo"
              ? "La photo ne doit pas dépasser 5 Mo"
              : "La vidéo ne doit pas dépasser 50 Mo",
          });
        }

        // Generate unique filename with validated extension
        const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
        const prefix = input.type === "cv" ? "cv" : input.type === "photo" ? "photos" : "videos";
        const key = `applications/${prefix}/${uniqueName}`;
        const result = await storagePut(key, buffer, input.contentType);
        return { key: result.key, url: result.url };
      }),

    submit: publicProcedure
      .input(applicationSchema)
      .mutation(async ({ input, ctx }) => {
        // Rate limit per IP (F-007: max 3 submissions/hour)
        const ip = getClientIp(ctx.req);
        if (!submitRateLimit(ip)) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Trop de candidatures soumises. Veuillez r\u00e9essayer plus tard.",
          });
        }

        // Vid\u00e9o obligatoire
        if (!input.videoFileUrl || input.videoFileUrl.trim() === "") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "L'enregistrement vidéo est obligatoire. Veuillez enregistrer votre vidéo pitch avant de soumettre.",
          });
        }

        // Calculate score with all new fields
        const scores = calculateScore({
          programmingLevel: input.programmingLevel,
          aiKnowledge: input.aiKnowledge,
          cloudExperience: input.cloudExperience,
          technicalTools: input.technicalTools,
          certifications: input.certifications,
          sectorExpertise: input.sectorExpertise,
          clientNetwork: input.clientNetwork,
          businessDevelopment: input.businessDevelopment,
          yearsExperience: input.yearsExperience,
          publicSpeaking: input.publicSpeaking,
          salesExperience: input.salesExperience,
          languages: input.languages,
          motivation: input.motivation,
          // New fields for enhanced scoring
          industryContacts: input.industryContacts,
          targetMarketKnowledge: input.targetMarketKnowledge,
          distributionNetwork: input.distributionNetwork,
          existingPartnerships: input.existingPartnerships,
          riskTolerance: input.riskTolerance,
          autonomyLevel: input.autonomyLevel,
          resilienceLevel: input.resilienceLevel,
          leadershipStyle: input.leadershipStyle,
          entrepreneurialExperience: input.entrepreneurialExperience,
          aiAgentScenario: input.aiAgentScenario,
          aiAgentImpact: input.aiAgentImpact,
        });

        // Save to database
        const application = await createApplication({
          ...input,
          technicalTools: input.technicalTools || null,
          certifications: input.certifications || null,
          languages: input.languages || null,
          distributionNetwork: input.distributionNetwork || null,
          existingPartnerships: input.existingPartnerships || null,
          entrepreneurialExperience: input.entrepreneurialExperience || null,
          aiAgentScenario: input.aiAgentScenario || null,
          aiAgentSector: input.aiAgentSector || null,
          aiAgentImpact: input.aiAgentImpact || null,
          linkedinUrl: input.linkedinUrl || null,
          twitterUrl: input.twitterUrl || null,
          githubUrl: input.githubUrl || null,
          websiteUrl: input.websiteUrl || null,
          otherSocialUrl: input.otherSocialUrl || null,
          cvFileKey: input.cvFileKey || null,
          cvFileUrl: input.cvFileUrl || null,
          photoFileKey: input.photoFileKey || null,
          photoFileUrl: input.photoFileUrl || null,
          videoFileKey: input.videoFileKey || null,
          videoFileUrl: input.videoFileUrl || null,
          scoreTechnique: scores.scoreTechnique.toString(),
          scoreMetier: scores.scoreMetier.toString(),
          scoreCommunication: scores.scoreCommunication.toString(),
          scoreTotal: scores.scoreTotal.toString(),
        });

        // Send notification to owner
        try {
          await notifyOwner({
            title: `Nouvelle candidature : ${input.firstName} ${input.lastName}`,
            content: `Score: ${scores.scoreTotal.toFixed(1)}% | Pays: ${input.country} | Secteur: ${input.sector} | Poste: ${input.currentRole} | Scénario IA: ${input.aiAgentSector || "N/A"}`,
          });
        } catch (e) {
          console.error("Failed to send notification:", e);
        }

        // Send confirmation email to candidate
        try {
          await sendConfirmationEmail({
            to: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            country: input.country,
            sector: input.sector,
            currentRole: input.currentRole,
            scores,
          });
        } catch (e) {
          console.error("Failed to send confirmation email:", e);
        }

        // F-009: Ne pas exposer les scores détaillés au client (risque de reverse-engineering)
        return {
          id: application.id,
          success: true,
          message: "Votre candidature a été soumise avec succès. Vous recevrez un email de confirmation.",
        };
      }),

    // Admin endpoints
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        country: z.string().optional(),
        sector: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await getApplications(input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const app = await getApplicationById(input.id);
        if (!app) throw new TRPCError({ code: "NOT_FOUND" });
        return app;
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["en_attente", "selectionne", "refuse"]),
        adminNotes: z.string().optional(),
        sendEmail: z.boolean().optional().default(true),
        language: z.enum(["fr", "en"]).optional().default("fr"),
        recommendedCourses: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const result = await updateApplicationStatus(input.id, input.status);

        // Send decision email if status changed to selectionne or refuse
        if (input.sendEmail && (input.status === "selectionne" || input.status === "refuse")) {
          const app = await getApplicationById(input.id);
          if (app) {
            try {
              await sendDecisionEmail({
                to: app.email,
                firstName: app.firstName,
                lastName: app.lastName,
                language: input.language,
                decision: input.status,
                scores: {
                  scoreTotal: Number(app.scoreTotal) || 0,
                  scoreTechnique: Number(app.scoreTechnique) || 0,
                  scoreMetier: Number(app.scoreMetier) || 0,
                  scoreCommunication: Number(app.scoreCommunication) || 0,
                },
                adminNotes: input.adminNotes,
                recommendedCourses: input.recommendedCourses,
                platformUrl: "https://akademy.neodev.click",
              });
            } catch (emailErr) {
              console.error("[Admin] Decision email failed:", emailErr);
              // Don't throw - status was already updated
            }
          }
        }
        return result;
      }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      return await getApplicationStats();
    }),
  }),

  // ============ Training Progress ============
  training: router({
    getProgress: protectedProcedure
      .input(z.object({ certificationId: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await getUserProgress(ctx.user.id, input?.certificationId);
      }),

    markLessonComplete: protectedProcedure
      .input(z.object({
        certificationId: z.string(),
        courseId: z.string(),
        lessonIndex: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await markLessonComplete(ctx.user.id, input.certificationId, input.courseId, input.lessonIndex);
      }),

    checkCertCompletion: protectedProcedure
      .input(z.object({
        certificationId: z.string(),
        totalLessonsPerCourse: z.record(z.string(), z.number()),
      }))
      .query(async ({ ctx, input }) => {
        const complete = await isCertificationComplete(ctx.user.id, input.certificationId, input.totalLessonsPerCourse);
        return { complete };
      }),

    submitExamAttempt: protectedProcedure
      .input(z.object({
        certificationId: z.string(),
        score: z.number().min(100).max(1000),
        totalQuestions: z.number(),
        correctAnswers: z.number(),
        passed: z.number().min(0).max(1),
        domainScores: z.any(),
        startedAt: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createExamAttempt({
          userId: ctx.user.id,
          certificationId: input.certificationId,
          score: input.score,
          totalQuestions: input.totalQuestions,
          correctAnswers: input.correctAnswers,
          passed: input.passed,
          domainScores: input.domainScores,
          startedAt: input.startedAt,
        });
      }),

    getExamHistory: protectedProcedure
      .input(z.object({ certificationId: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await getExamAttempts(ctx.user.id, input?.certificationId);
      }),

    // Chapter progress
    getChapterProgress: protectedProcedure
      .input(z.object({ courseId: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await getChapterProgress(ctx.user.id, input?.courseId);
      }),

    saveChapterProgress: protectedProcedure
      .input(z.object({
        courseId: z.string(),
        lessonIndex: z.number(),
        chapterIndex: z.number(),
        totalChapters: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await upsertChapterProgress(ctx.user.id, input.courseId, input.lessonIndex, input.chapterIndex, input.totalChapters);
      }),
  }),

  // ============ Video Progress ============
  videoProgress: router({
    get: protectedProcedure
      .input(z.object({ courseId: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await getVideoProgress(ctx.user.id, input?.courseId);
      }),

    toggle: protectedProcedure
      .input(z.object({
        courseId: z.string(),
        youtubeId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await toggleVideoProgress(ctx.user.id, input.courseId, input.youtubeId);
      }),
  }),

  // ============ Admin Dashboard ============
  admin: router({
    getLearners: protectedProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await getAllLearners(input?.page || 1, input?.pageSize || 20, input?.search);
      }),

    getLearnerDetail: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await getLearnerProgress(input.userId);
      }),

    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await getAllLearnersStats();
      }),

    blockUser: protectedProcedure
      .input(z.object({ userId: z.number(), blocked: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await blockUser(input.userId, input.blocked);
      }),

    updateUserRole: protectedProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot change your own role" });
        }
        return await updateUserRole(input.userId, input.role);
      }),

    createInvitation: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
        language: z.enum(["fr", "en"]).optional().default("fr"),
        message: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const invitation = await createInvitation(input.email, input.name || null, ctx.user.id);

        // Send invitation email
        try {
          const baseUrl = process.env.VITE_APP_URL || "https://akademy.neodev.click";
          const invitationLink = `${baseUrl}/register?token=${(invitation as any).token || ""}`;
          await sendInvitationEmail({
            to: input.email,
            name: input.name || null,
            language: input.language,
            invitedBy: ctx.user.name || "Neopolis Akademy Admin",
            invitationLink,
            message: input.message,
          });
        } catch (emailErr) {
          console.error("[Admin] Invitation email failed:", emailErr);
          // Don't throw - invitation was already created
        }
        return invitation;
      }),

    getInvitations: protectedProcedure
      .input(z.object({ page: z.number().min(1).default(1), pageSize: z.number().min(1).max(100).default(20) }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await getInvitations(input?.page || 1, input?.pageSize || 20);
      }),

    getAnalytics: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await getAdminAnalytics();
      }),

    exportLearners: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await exportLearnersCSV();
      }),
  }),
});

export type AppRouter = typeof appRouter;
