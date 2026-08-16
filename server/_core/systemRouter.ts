import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { getDb } from "../db";
import { clientErrors, learningEvents } from "../../drizzle/schema";
import { desc, eq, like, and, gte, inArray, notLike } from "drizzle-orm";

// Rate limit: max 10 reports per IP per minute
const ipReportCounts = new Map<string, { count: number; resetAt: number }>();

function checkReportRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipReportCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipReportCounts.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

// Patterns to filter out (build/deploy artifacts)
const BUILD_ERROR_PATTERNS = [
  '%Failed to fetch dynamically imported module%',
  '%Importing a module script failed%',
  '%Loading module from%',
  '%Loading chunk%',
  '%ChunkLoadError%',
];

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  // Client-side error reporting endpoint (public - no auth required)
  reportError: publicProcedure
    .input(
      z.object({
        message: z.string().max(500),
        stack: z.string().max(2000).optional().default(""),
        source: z.enum(["window", "promise", "boundary", "manual", "react_critical"]),
        url: z.string().max(500),
        timestamp: z.number(),
        componentStack: z.string().max(1000).optional().default(""),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limit by IP
      const ip = ctx.req.ip || ctx.req.headers["x-forwarded-for"]?.toString() || "unknown";
      if (!checkReportRateLimit(ip)) {
        return { accepted: false } as const;
      }

      // Filter out build/deploy errors server-side too
      const isBuildError = [
        'Failed to fetch dynamically imported module',
        'Importing a module script failed',
        'Loading module from',
        'Loading chunk',
        'ChunkLoadError',
      ].some(pattern => input.message.includes(pattern));
      
      if (isBuildError) {
        return { accepted: false, reason: 'build_error_filtered' } as const;
      }

      // Persist to database
      try {
        const db = await getDb();
        if (!db) throw new Error("DB not available");
        await db.insert(clientErrors).values({
          message: input.message,
          stack: input.stack || null,
          source: input.source as "window" | "promise" | "boundary" | "manual" | "react_critical",
          url: input.url,
          componentStack: input.componentStack || null,
          clientTimestamp: new Date(input.timestamp),
          ip,
          userAgent: ctx.req.headers["user-agent"]?.slice(0, 500) || null,
        });
      } catch (err) {
        console.error("[ClientError] Failed to persist error:", err);
      }

      // Log to server console for monitoring
      console.warn(
        `[ClientError] [${input.source}] ${input.message} | URL: ${input.url}`
      );

      // For critical errors (ErrorBoundary crashes), notify owner
      if (input.source === "boundary" || input.source === "react_critical") {
        const isCritical = input.source === "react_critical";
        const title = isCritical
          ? `🚨 Erreur React critique détectée`
          : `⚠️ Crash client détecté`;
        const content = isCritical
          ? `Type: ${input.message.startsWith('[') ? input.message.split(']')[0].slice(1) : 'React Critical'}\nURL: ${input.url}\nMessage: ${input.message}\n\nConseils:\n- Duplicate key → vérifier les IDs de chapitres dans les JSON de cours (pnpm validate-courses)\n- Hooks order → vérifier les hooks conditionnels (pnpm lint)`
          : `Source: ErrorBoundary\nURL: ${input.url}\nMessage: ${input.message}\nStack: ${(input.stack || "").slice(0, 500)}`;
        try {
          await notifyOwner({
            title,
            content,
          });
        } catch {
          // Best effort
        }
      }

      return { accepted: true } as const;
    }),

  // Admin endpoint to view recent client errors (excludes build errors)
  getClientErrors: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(200).optional().default(50),
        source: z.enum(["window", "promise", "boundary", "manual"]).optional(),
        search: z.string().max(200).optional(),
        since: z.number().optional(), // Unix timestamp in ms
      })
    )
    .query(async ({ input }) => {
      const conditions = [];
      if (input.source) {
        conditions.push(eq(clientErrors.source, input.source));
      }
      if (input.search) {
        conditions.push(like(clientErrors.message, `%${input.search}%`));
      }
      if (input.since) {
        conditions.push(gte(clientErrors.createdAt, new Date(input.since)));
      }
      // Exclude build/deploy errors
      for (const pattern of BUILD_ERROR_PATTERNS) {
        conditions.push(notLike(clientErrors.message, pattern));
      }

      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(clientErrors)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(clientErrors.createdAt))
        .limit(input.limit);

      // Map to the format the frontend expects
      return rows.map((r) => ({
        id: r.id,
        message: r.message,
        stack: r.stack || "",
        source: r.source,
        url: r.url,
        componentStack: r.componentStack || "",
        timestamp: r.clientTimestamp.getTime(),
        receivedAt: r.createdAt.getTime(),
        ip: r.ip || "",
        userAgent: r.userAgent || "",
      }));
    }),

  // Admin endpoint to get error stats (excludes build errors)
  getClientErrorStats: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, boundary: 0, window: 0, promise: 0, hourlyData: [] };
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 3600_000);

      // Exclude build errors from stats
      const buildExclusions = BUILD_ERROR_PATTERNS.map(p => notLike(clientErrors.message, p));
      
      const recentErrors = await db
        .select()
        .from(clientErrors)
        .where(and(gte(clientErrors.createdAt, last24h), ...buildExclusions))
        .orderBy(desc(clientErrors.createdAt));

      const total = recentErrors.length;
      const boundary = recentErrors.filter((e) => e.source === "boundary").length;
      const window_ = recentErrors.filter((e) => e.source === "window").length;
      const promise = recentErrors.filter((e) => e.source === "promise").length;

      // Group by hour for chart
      const hourlyData: { hour: string; count: number; boundary: number }[] = [];
      for (let i = 23; i >= 0; i--) {
        const hourStart = new Date(now.getTime() - (i + 1) * 3600_000);
        const hourEnd = new Date(now.getTime() - i * 3600_000);
        const inHour = recentErrors.filter(
          (e) => e.createdAt >= hourStart && e.createdAt < hourEnd
        );
        hourlyData.push({
          hour: `${hourEnd.getHours().toString().padStart(2, "0")}:00`,
          count: inHour.length,
          boundary: inHour.filter((e) => e.source === "boundary").length,
        });
      }

      return { total, boundary, window: window_, promise, hourlyData };
    }),

  // Real operational timeline: combines learner events with client incidents.
  getOperationalLogs: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(200).optional().default(100) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const limit = input?.limit ?? 100;
      const [learning, errors] = await Promise.all([
        db.select().from(learningEvents).orderBy(desc(learningEvents.createdAt)).limit(limit),
        db.select().from(clientErrors).orderBy(desc(clientErrors.createdAt)).limit(limit),
      ]);
      return [
        ...learning.map((event) => ({
          id: `learning-${event.id}`,
          timestamp: event.createdAt.getTime(),
          type: event.eventType,
          category: "learning" as const,
          userId: event.userId,
          courseId: event.courseId || "",
          details: { lessonIndex: event.lessonIndex, chapterIndex: event.chapterIndex, durationSeconds: event.durationSeconds, success: event.success, score: event.score, attemptNumber: event.attemptNumber },
        })),
        ...errors.map((error) => ({
          id: `error-${error.id}`,
          timestamp: error.createdAt.getTime(),
          type: error.source,
          category: "incident" as const,
          userId: null,
          courseId: "",
          details: { message: error.message, url: error.url },
        })),
      ].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    }),

  // Admin endpoint to delete specific errors (mark as resolved)
  deleteClientErrors: adminProcedure
    .input(
      z.object({
        ids: z.array(z.number()).min(1).max(100),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { deleted: 0 };
      
      const result = await db
        .delete(clientErrors)
        .where(inArray(clientErrors.id, input.ids));
      
      return { deleted: input.ids.length };
    }),

  // Admin endpoint to delete all errors (clear all)
  clearAllClientErrors: adminProcedure
    .mutation(async () => {
      const db = await getDb();
      if (!db) return { deleted: 0 };
      
      // Only delete non-build errors (build errors are already filtered)
      const buildExclusions = BUILD_ERROR_PATTERNS.map(p => notLike(clientErrors.message, p));
      await db.delete(clientErrors).where(and(...buildExclusions));
      
      return { success: true };
    }),
});
