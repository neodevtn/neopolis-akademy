import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";

// In-memory error log (last 100 errors, rotates)
const MAX_ERROR_LOG = 100;
const errorLog: Array<{
  message: string;
  stack: string;
  source: string;
  url: string;
  timestamp: number;
  componentStack: string;
  receivedAt: number;
}> = [];

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

      // Store in memory log
      errorLog.push({
        ...input,
        stack: input.stack || "",
        componentStack: input.componentStack || "",
        receivedAt: Date.now(),
      });
      if (errorLog.length > MAX_ERROR_LOG) {
        errorLog.shift();
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
        limit: z.number().min(1).max(100).optional().default(50),
      })
    )
    .query(({ input }) => {
      return errorLog.slice(-input.limit).reverse();
    }),
});
