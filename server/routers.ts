import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createApplication, getApplications, getApplicationById, updateApplicationStatus, getApplicationStats, getUserProgress, markLessonComplete, isCertificationComplete, createExamAttempt, getExamAttempts, getAllLearners, getLearnerProgress, getAllLearnersStats, getVideoProgress, toggleVideoProgress, getChapterProgress, upsertChapterProgress, blockUser, updateUserRole, createInvitation, getInvitations, getDirectInvitations, cancelInvitation, getAdminAnalytics, getLearningReporting, exportLearnersCSV, submitVideoFeedback, getUserVideoFeedback, getSelectedCandidates, updateApplicationEmail, createInvitationWithTracking, getEmailDeliveryStats, updateInvitationDeliveryStatus, recordLearningEvent, getUserAchievements, getAdminEmailRecipients } from "./db";
import { awardCertification, awardCourseCompletionBadge } from "./achievementService";
import { calculateScore } from "./scoring";
import { TRPCError } from "@trpc/server";
import { applicationSchema } from "@shared/validation";
import { storagePut } from "./storage";
import { sendAdminNewApplicationEmail, sendConfirmationEmail, sendDecisionEmail, sendInvitationEmail, sendReminderEmail } from "./email";
import { generateCandidatePDF } from "./pdf";
import { uploadRateLimit, submitRateLimit, getClientIp } from "./security";
import { adminEnhancedRouter } from "./adminRouter";
import { acknowledgeLearnerCommunication, getLearnerCommunications, markLearnerCommunicationRead } from "./adminDb";
import { adminContentRouter } from "./adminContentRouter";
import { videoRecommendationsRouter } from "./videoRecommendationsRouter";
import { createAdminNotification } from "./notificationsDb";
import { applyCompetencyEvent, getCompetencyFramework, getCompetencyLeaderboard, getContentCompetencyTags, getGamificationConfig, getUserCompetencies, getUserGamification, replaceCompetencyFramework, saveGamificationConfig } from "./competencyService";
import { COMPETENCY_SOURCE_TYPES } from "../shared/competencyFramework";
import { backfillCompetencies } from "./competencyBackfill";
import { completeLearnerOrientation, createLegacyOrientationReminderDraft, getAdminOrientationOverview, getLearnerOrientation, saveLearnerOrientationGoals } from "./orientationService";

const orientationGoalsSchema = z.array(z.object({
  competencyId: z.string().min(2).max(80),
  targetLevel: z.enum(["bronze", "silver", "gold"]),
})).min(1).max(5);

export const appRouter = router({
  system: systemRouter,
  videoRecommendations: videoRecommendationsRouter,
  orientation: router({
    getMine: protectedProcedure.query(async ({ ctx }) => getLearnerOrientation(ctx.user.id)),
    saveGoals: protectedProcedure.input(z.object({
      goals: orientationGoalsSchema,
      wantsOfficialCertification: z.boolean().default(false),
      officialCertificationIds: z.array(z.string().min(2).max(200)).max(8).default([]),
      certificationTargetDates: z.record(z.string(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).default({}),
    })).mutation(async ({ ctx, input }) => saveLearnerOrientationGoals({
      userId: ctx.user.id,
      ...input,
    })),
    completeDiagnostic: protectedProcedure.input(z.object({
      answers: z.array(z.object({ questionId: z.string().min(2).max(120), choiceId: z.string().min(1).max(30) })).min(1).max(10),
    })).mutation(async ({ ctx, input }) => completeLearnerOrientation({ userId: ctx.user.id, answers: input.answers })),
    getAdminOverview: protectedProcedure.input(z.object({
      userId: z.number().int().positive().optional(),
      limit: z.number().int().min(1).max(200).optional(),
    }).optional()).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAdminOrientationOverview(input || {});
    }),
    prepareLegacyReminder: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return createLegacyOrientationReminderDraft(ctx.user.id);
    }),
  }),
  competencies: router({
    getMine: protectedProcedure.query(async ({ ctx }) => getUserCompetencies(ctx.user.id)),
    getGamification: protectedProcedure.query(async ({ ctx }) => getUserGamification(ctx.user.id)),
    getFramework: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getCompetencyFramework();
    }),
    getGamificationConfig: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getGamificationConfig();
    }),
    saveGamificationConfig: protectedProcedure.input(z.object({
      ranks: z.array(z.object({ id: z.string().min(2).max(40), label: z.string().min(1).max(80), minPoints: z.number().min(0).max(100), color: z.string().min(1).max(40), icon: z.string().min(1).max(80), sortOrder: z.number().int(), active: z.number().int().min(0).max(1) })).min(1),
      settings: z.object({ weeklyGoalPoints: z.number().min(0.5).max(100), pointsLabel: z.string().min(1).max(120), rewardNotice: z.string().min(20).max(2000) }),
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return saveGamificationConfig(input);
    }),
    saveFramework: protectedProcedure
      .input(z.object({
        definitions: z.array(z.object({ id: z.string().min(2).max(80), title: z.any(), description: z.any().nullable().optional(), category: z.string().min(1).max(100), icon: z.string().max(80), color: z.string().max(40), maxPoints: z.union([z.string(), z.number()]).refine((value) => Number.isFinite(Number(value)) && Number(value) >= 1 && Number(value) <= 100, "Le niveau maximal doit être compris entre 1 et 100."), sortOrder: z.number().int(), active: z.number().int().min(0).max(1) })),
        rules: z.array(z.object({ id: z.number().int().optional(), competencyId: z.string().min(2).max(80), sourceType: z.enum(COMPETENCY_SOURCE_TYPES), sourceKey: z.string().min(1).max(255), label: z.string().min(1).max(255), points: z.union([z.string(), z.number()]).refine((value) => Number.isFinite(Number(value)) && Number(value) > 0 && Number(value) <= 100, "Les points doivent être compris entre 0 et 100."), minScore: z.union([z.string(), z.number()]).nullable().optional().refine((value) => value === null || value === undefined || (Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100), "Le score minimal doit être compris entre 0 et 100."), active: z.number().int().min(0).max(1), sortOrder: z.number().int() })),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return replaceCompetencyFramework({
          definitions: input.definitions.map((definition) => ({ ...definition, maxPoints: Number(definition.maxPoints).toFixed(2) })),
          rules: input.rules.map(({ id: _id, ...rule }) => ({ ...rule, points: Number(rule.points).toFixed(2), minScore: rule.minScore === null || rule.minScore === undefined ? null : Number(rule.minScore).toFixed(2) })),
        });
      }),
    recordAssessmentOutcome: protectedProcedure
      .input(z.object({ sourceType: z.enum(["quiz_passed", "checkpoint_passed"]), sourceKey: z.string().min(1).max(255), eventKey: z.string().min(1).max(255), score: z.number().min(0).max(100), certificationId: z.string().optional(), courseId: z.string().optional(), lessonIndex: z.number().int().optional(), chapterIndex: z.number().int().optional() }))
      .mutation(async ({ ctx, input }) => {
        await recordLearningEvent({ userId: ctx.user.id, eventType: input.sourceType, certificationId: input.certificationId, courseId: input.courseId, lessonIndex: input.lessonIndex, chapterIndex: input.chapterIndex, score: Math.round(input.score), success: 1, metadata: { eventKey: input.eventKey } });
        const competencyTags = getContentCompetencyTags({ courseId: input.courseId, lessonIndex: input.lessonIndex, certificationId: input.certificationId });
        return { contributions: await applyCompetencyEvent({ userId: ctx.user.id, sourceType: input.sourceType, sourceKey: input.sourceKey, eventKey: input.eventKey, score: input.score, competencyTags, evidence: { certificationId: input.certificationId, courseId: input.courseId, lessonIndex: input.lessonIndex, chapterIndex: input.chapterIndex, competencyTags } }) };
      }),
    backfill: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return backfillCompetencies();
    }),
    leaderboard: protectedProcedure.input(z.object({ competencyId: z.string().optional(), limit: z.number().int().min(1).max(200).optional() }).optional()).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getCompetencyLeaderboard(input || {});
    }),
  }),
  auth: router({
    me: publicProcedure.query(opts => {
      if (!opts.ctx.user) return null;
      const { passwordHash, ...safeUser } = opts.ctx.user;
      return safeUser;
    }),
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

        // Vidéo optionnelle mais fortement recommandée

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

        // Send the internal notification through Neopolis email, not Manus platform mail.
        try {
          await sendAdminNewApplicationEmail({
            to: await getAdminEmailRecipients(),
            applicationId: Number(application.id),
            firstName: input.firstName,
            lastName: input.lastName,
            country: input.country,
            sector: input.sector,
            currentRole: input.currentRole,
            scoreTotal: scores.scoreTotal,
          });
        } catch (e) {
          console.error("Failed to send Neopolis application notification:", e);
        }

        // Create admin notification for new application
        try {
          await createAdminNotification({
            type: "new_application",
            title: `Nouvelle candidature de ${input.firstName} ${input.lastName}`,
            message: `Score: ${scores.scoreTotal.toFixed(1)}% | Pays: ${input.country} | Secteur: ${input.sector}`,
            targetType: "application",
            targetId: application.id,
          });
        } catch (e) {
          console.error("Failed to create admin notification:", e);
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

    exportPDF: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const app = await getApplicationById(input.applicationId);
        if (!app) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }
        const pdfBuffer = await generateCandidatePDF(app as any);
        return { pdf: pdfBuffer.toString("base64"), filename: `candidat_${app.firstName}_${app.lastName}.pdf` };
      }),

    sendReminder: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        language: z.enum(["fr", "en"]).default("fr"),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const app = await getApplicationById(input.applicationId);
        if (!app) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }
        if (app.status !== "en_attente") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Only pending applications can receive reminders" });
        }
        const daysPending = Math.floor((Date.now() - new Date(app.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        await sendReminderEmail({
          to: app.email,
          firstName: app.firstName,
          lastName: app.lastName,
          language: input.language,
          daysPending,
        });
        return { success: true, daysPending };
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
        const result = await markLessonComplete(ctx.user.id, input.certificationId, input.courseId, input.lessonIndex);
        await recordLearningEvent({ userId: ctx.user.id, eventType: "lesson_completed", certificationId: input.certificationId, courseId: input.courseId, lessonIndex: input.lessonIndex, success: 1 });
        const achievement = await awardCourseCompletionBadge(ctx.user, input.certificationId, input.courseId);
        return { ...result, achievement };
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
        const attempt = await createExamAttempt({
          userId: ctx.user.id,
          certificationId: input.certificationId,
          score: input.score,
          totalQuestions: input.totalQuestions,
          correctAnswers: input.correctAnswers,
          passed: input.passed,
          domainScores: input.domainScores,
          startedAt: input.startedAt,
        });
        const achievement = input.passed === 1
          ? await awardCertification(ctx.user, input.certificationId, input.score, Number(attempt.id))
          : null;
        return { ...attempt, achievement };
      }),

    getExamHistory: protectedProcedure
      .input(z.object({ certificationId: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await getExamAttempts(ctx.user.id, input?.certificationId);
      }),

    getAchievements: protectedProcedure.query(async ({ ctx }) => getUserAchievements(ctx.user.id)),

    getCommunications: protectedProcedure.query(async ({ ctx }) => {
      const items = await getLearnerCommunications(ctx.user.id);
      const pendingImportant = items.filter((item) => item.isImportant === 1 && !item.isAcknowledged);
      return { items, unreadCount: items.filter((item) => !item.isRead).length, pendingImportant };
    }),

    markCommunicationRead: protectedProcedure
      .input(z.object({ communicationId: z.number().positive() }))
      .mutation(async ({ ctx, input }) => {
        const result = await markLearnerCommunicationRead(ctx.user.id, input.communicationId);
        if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Communiqué non disponible" });
        return result;
      }),

    acknowledgeCommunication: protectedProcedure
      .input(z.object({ communicationId: z.number().positive() }))
      .mutation(async ({ ctx, input }) => {
        const result = await acknowledgeLearnerCommunication(ctx.user.id, input.communicationId);
        if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Communiqué important non disponible" });
        return result;
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
        const result = await upsertChapterProgress(ctx.user.id, input.courseId, input.lessonIndex, input.chapterIndex, input.totalChapters);
        await recordLearningEvent({ userId: ctx.user.id, eventType: "chapter_progress", courseId: input.courseId, lessonIndex: input.lessonIndex, chapterIndex: input.chapterIndex, metadata: { totalChapters: input.totalChapters } });
        return result;
      }),
    recordLearningTime: protectedProcedure
      .input(z.object({ certificationId: z.string().optional(), courseId: z.string(), lessonIndex: z.number(), chapterIndex: z.number().optional(), durationSeconds: z.number().min(5).max(3600) }))
      .mutation(async ({ ctx, input }) => recordLearningEvent({ userId: ctx.user.id, eventType: "learning_time", ...input })),
    evaluateAnswer: protectedProcedure
      .input(z.object({
        answer: z.string(),
        rubric: z.string(),
        prompt: z.string(),
        maxScore: z.number().default(10),
        lang: z.string().default("en"),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const systemPrompt = `You are an expert educator evaluating a student's answer. 
Evaluate the answer based on the rubric provided. Return a JSON object with:
- score: number (0 to ${input.maxScore})
- feedback: string (2-3 sentences of overall feedback in ${input.lang === "fr" ? "French" : "English"})
- strengths: string[] (1-3 bullet points of what was done well, in ${input.lang === "fr" ? "French" : "English"})
- improvements: string[] (1-3 bullet points of what could be improved, in ${input.lang === "fr" ? "French" : "English"})

Rubric: ${input.rubric}

IMPORTANT: Return ONLY valid JSON, no markdown formatting.`;
        const userMessage = `Question: ${input.prompt}\n\nStudent's answer: ${input.answer}`;
        try {
          const result = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
          });
          const msg = result.choices?.[0]?.message;
          const text = typeof msg?.content === "string" ? msg.content : Array.isArray(msg?.content) ? (msg.content.find((c: any) => c.type === "text") as any)?.text || "" : "";
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              score: Math.min(input.maxScore, Math.max(0, parsed.score || 0)),
              feedback: parsed.feedback || "",
              strengths: parsed.strengths || [],
              improvements: parsed.improvements || [],
            };
          }
          return { score: 0, feedback: text.slice(0, 300), strengths: [] as string[], improvements: [] as string[] };
        } catch (err: any) {
          return { score: 0, feedback: `Evaluation error: ${err.message}`, strengths: [] as string[], improvements: [] as string[] };
        }
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

  // ============ Video Feedback (Recommendations) ============
  videoFeedback: router({
    submit: protectedProcedure
      .input(z.object({
        videoId: z.string().min(1).max(32),
        lessonId: z.string().min(1),
        certId: z.string().min(1),
        reason: z.enum(["not_relevant", "obsolete", "broken_link", "other"]),
        comment: z.string().max(500).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await submitVideoFeedback(ctx.user.id, input.videoId, input.lessonId, input.certId, input.reason, input.comment);
      }),

    getMyFeedback: protectedProcedure
      .input(z.object({ certId: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await getUserVideoFeedback(ctx.user.id, input?.certId);
      }),
  }),

  // ============ Admin Dashboard ============
  admin: router({
    getLearners: protectedProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        sortBy: z.enum(["lastSignedIn", "name", "email", "createdAt", "globalScore", "role", "blocked"]).default("lastSignedIn"),
        sortDirection: z.enum(["asc", "desc"]).default("desc"),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await getAllLearners(input?.page || 1, input?.pageSize || 20, input?.search, input?.sortBy, input?.sortDirection);
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
          const invitationLink = `${baseUrl}/accept-invitation?token=${invitation.token}`;
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

    getDirectInvitations: protectedProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        search: z.string().max(200).optional(),
        sortBy: z.enum(["createdAt", "email", "name", "status", "expiresAt"]).default("createdAt"),
        sortDirection: z.enum(["asc", "desc"]).default("desc"),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        return await getDirectInvitations(input?.page || 1, input?.pageSize || 20, input?.search, input?.sortBy, input?.sortDirection);
      }),

    cancelInvitation: protectedProcedure
      .input(z.object({ invitationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        return await cancelInvitation(input.invitationId);
      }),

    bulkCreateInvitations: protectedProcedure
      .input(z.object({
        invitations: z.array(z.object({
          email: z.string().email(),
          name: z.string().optional(),
        })).min(1).max(100),
        language: z.enum(["fr", "en"]).optional().default("fr"),
        message: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const results: { email: string; success: boolean; error?: string }[] = [];
        const baseUrl = process.env.VITE_APP_URL || "https://akademy.neodev.click";

        for (const inv of input.invitations) {
          try {
            const invitation = await createInvitation(inv.email, inv.name || null, ctx.user.id);
            const invitationLink = `${baseUrl}/accept-invitation?token=${invitation.token}`;
            try {
              await sendInvitationEmail({
                to: inv.email,
                name: inv.name || null,
                language: input.language,
                invitedBy: ctx.user.name || "Neopolis Akademy Admin",
                invitationLink,
                message: input.message,
              });
            } catch (emailErr) {
              console.error(`[Admin] Bulk invitation email failed for ${inv.email}:`, emailErr);
            }
            results.push({ email: inv.email, success: true });
          } catch (err: any) {
            results.push({ email: inv.email, success: false, error: err.message || "Unknown error" });
          }
        }
        return { total: input.invitations.length, sent: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length, results };
      }),

    resendInvitation: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        // Re-create invitation (old one will be superseded)
        const invitation = await createInvitation(input.email, null, ctx.user.id);
        const baseUrl = process.env.VITE_APP_URL || "https://akademy.neodev.click";
        const invitationLink = `${baseUrl}/accept-invitation?token=${invitation.token}`;
        await sendInvitationEmail({
          to: input.email,
          name: null,
          language: "fr",
          invitedBy: ctx.user.name || "Neopolis Akademy Admin",
          invitationLink,
        });
        return { success: true };
      }),

    getAnalytics: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await getAdminAnalytics();
      }),

    getLearningReports: protectedProcedure
      .input(z.object({
        days: z.union([z.literal(7), z.literal(30), z.literal(90)]).default(30),
        certificationId: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await getLearningReporting(input);
      }),

    exportLearners: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await exportLearnersCSV();
      }),

    // ============ Selected Candidates Tracking ============
    getSelectedCandidates: protectedProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(10),
        search: z.string().max(200).optional(),
        sortBy: z.enum(["updatedAt", "email", "firstName", "scoreTotal"]).default("updatedAt"),
        sortDirection: z.enum(["asc", "desc"]).default("desc"),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await getSelectedCandidates(input?.page || 1, input?.pageSize || 10, input?.search, input?.sortBy, input?.sortDirection);
      }),

    updateCandidateEmail: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        newEmail: z.string().email(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await updateApplicationEmail(input.applicationId, input.newEmail);
      }),

    resendCandidateInvitation: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        email: z.string().email(),
        name: z.string().optional(),
        language: z.enum(["fr", "en"]).optional().default("fr"),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        // Create invitation with tracking
        const invitation = await createInvitationWithTracking(
          input.email,
          input.name || null,
          ctx.user.id,
          input.applicationId
        );
        const baseUrl = process.env.VITE_APP_URL || "https://akademy.neodev.click";
        const invitationLink = `${baseUrl}/accept-invitation?token=${invitation.token}`;

        try {
          const { messageId } = await sendInvitationEmail({
            to: input.email,
            name: input.name || null,
            language: input.language,
            invitedBy: ctx.user.name || "Neopolis Akademy Admin",
            invitationLink,
          });

          // Update invitation with resend message ID for tracking
          if (messageId) {
            const { getDb } = await import("./db");
            const db = await getDb();
            if (db) {
              const { userInvitations } = await import("../drizzle/schema");
              const { eq } = await import("drizzle-orm");
              await db.update(userInvitations)
                .set({ resendMessageId: messageId })
                .where(eq(userInvitations.token, invitation.token));
            }
          }
          return { success: true, messageId };
        } catch (emailErr: any) {
          console.error(`[Admin] Candidate invitation email failed for ${input.email}:`, emailErr);
          return { success: false, error: emailErr.message || "Email sending failed" };
        }
      }),

    getEmailDeliveryStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await getEmailDeliveryStats();
      }),
  }),

  // Enhanced admin tools (notes, tags, communications, bulk actions, analytics)
  adminTools: adminEnhancedRouter,
  adminContent: adminContentRouter,

  // ============ Exercise Results (Numeric Answers) ============
  exerciseResult: router({
    save: protectedProcedure
      .input(z.object({
        courseId: z.string(),
        moduleId: z.string(),
        score: z.number(),
        totalQuestions: z.number(),
        answers: z.array(z.object({
          questionId: z.string(),
          userAnswer: z.string(),
          isCorrect: z.boolean(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        // Store exercise results in DB
        const { saveExerciseResult } = await import("./db");
        const priorResults = await (await import("./db")).getExerciseResults(String(ctx.user.id), input.courseId);
        const attemptNumber = priorResults.filter((r) => r.moduleId === input.moduleId).length + 1;
        const result = await saveExerciseResult(String(ctx.user.id), input.courseId, input.moduleId, input.score, input.totalQuestions, JSON.stringify(input.answers));
        await recordLearningEvent({
          userId: ctx.user.id,
          eventType: "exercise_submitted",
          courseId: input.courseId,
          exerciseId: input.moduleId,
          score: input.score,
          success: input.score >= input.totalQuestions ? 1 : 0,
          attemptNumber,
          metadata: { totalQuestions: input.totalQuestions },
        });
        const percentage = input.totalQuestions > 0 ? (input.score / input.totalQuestions) * 100 : 0;
        if (percentage >= 70) {
          const competencyTags = getContentCompetencyTags({ courseId: input.courseId, moduleId: input.moduleId });
          await applyCompetencyEvent({ userId: ctx.user.id, sourceType: "exercise_passed", sourceKey: input.courseId, eventKey: `exercise:${input.moduleId}`, score: percentage, competencyTags, evidence: { totalQuestions: input.totalQuestions, score: input.score, competencyTags } });
        }
        return { ...result, attemptNumber };
      }),

    getMyResults: protectedProcedure
      .input(z.object({ courseId: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const { getExerciseResults } = await import("./db");
        return await getExerciseResults(String(ctx.user.id), input?.courseId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
