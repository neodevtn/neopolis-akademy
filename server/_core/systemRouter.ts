import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { getDb } from "../db";
import { clientErrors } from "../../drizzle/schema";
import { desc, eq, like, and, gte } from "drizzle-orm";

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
        source: z.enum(["window", "promise", "boundary", "manual"]),
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

      // Persist to database
      try {
        const db = await getDb();
        if (!db) throw new Error("DB not available");
        await db.insert(clientErrors).values({
          message: input.message,
          stack: input.stack || null,
          source: input.source,
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
      if (input.source === "boundary") {
        try {
          await notifyOwner({
            title: `⚠️ Crash client détecté`,
            content: `Source: ErrorBoundary\nURL: ${input.url}\nMessage: ${input.message}\nStack: ${(input.stack || "").slice(0, 500)}`,
          });
        } catch {
          // Best effort
        }
      }

      return { accepted: true } as const;
    }),

  // Admin endpoint to view recent client errors
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

  // Admin endpoint to get error stats
  getClientErrorStats: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, boundary: 0, window: 0, promise: 0, hourlyData: [] };
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 3600_000);

      const recentErrors = await db
        .select()
        .from(clientErrors)
        .where(gte(clientErrors.createdAt, last24h))
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
});
