import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createApplication, getApplications, getApplicationById, updateApplicationStatus, getApplicationStats } from "./db";
import { calculateScore } from "./scoring";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "./_core/notification";

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
    submit: publicProcedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(5),
        country: z.string().min(1),
        city: z.string().min(1),
        sector: z.string().min(1),
        currentRole: z.string().min(1),
        yearsExperience: z.number().min(0).max(50),
        programmingLevel: z.enum(["none", "beginner", "intermediate", "advanced", "expert"]),
        aiKnowledge: z.enum(["none", "basic", "intermediate", "advanced", "expert"]),
        cloudExperience: z.enum(["none", "basic", "intermediate", "advanced", "expert"]),
        technicalTools: z.string().optional().default(""),
        certifications: z.string().optional().default(""),
        sectorExpertise: z.enum(["junior", "intermediate", "senior", "expert"]),
        clientNetwork: z.enum(["none", "small", "medium", "large"]),
        businessDevelopment: z.enum(["none", "basic", "intermediate", "advanced"]),
        languages: z.string().optional().default(""),
        publicSpeaking: z.enum(["none", "basic", "intermediate", "advanced"]),
        salesExperience: z.enum(["none", "less_1y", "1_3y", "3_5y", "more_5y"]),
        motivation: z.string().min(50),
      }))
      .mutation(async ({ input }) => {
        // Calculate score
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
        });

        // Save to database
        const application = await createApplication({
          ...input,
          technicalTools: input.technicalTools || null,
          certifications: input.certifications || null,
          languages: input.languages || null,
          scoreTechnique: scores.scoreTechnique.toString(),
          scoreMetier: scores.scoreMetier.toString(),
          scoreCommunication: scores.scoreCommunication.toString(),
          scoreTotal: scores.scoreTotal.toString(),
        });

        // Send notification to owner
        try {
          await notifyOwner({
            title: `Nouvelle candidature : ${input.firstName} ${input.lastName}`,
            content: `Score: ${scores.scoreTotal.toFixed(1)}% | Pays: ${input.country} | Secteur: ${input.sector} | Poste: ${input.currentRole}`,
          });
        } catch (e) {
          console.error("Failed to send notification:", e);
        }

        return {
          id: application.id,
          scoreTotal: scores.scoreTotal,
          scoreTechnique: scores.scoreTechnique,
          scoreMetier: scores.scoreMetier,
          scoreCommunication: scores.scoreCommunication,
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
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await updateApplicationStatus(input.id, input.status);
      }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      return await getApplicationStats();
    }),
  }),
});

export type AppRouter = typeof appRouter;
