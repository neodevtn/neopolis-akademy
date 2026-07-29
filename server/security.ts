/**
 * Security middleware for Neopolis Akademy
 * Addresses: F-001 (headers), F-002 (X-Powered-By), F-003/F-007 (rate limiting)
 */
import type { Express, Request, Response, NextFunction } from "express";

// ─── Rate Limiting (in-memory, per IP) ───
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const keys = Array.from(rateLimitStore.keys());
  keys.forEach(key => {
    const entry = rateLimitStore.get(key);
    if (entry && entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  });
}, 5 * 60 * 1000);

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

function checkRateLimit(ip: string, prefix: string, maxRequests: number, windowMs: number): boolean {
  const key = `${prefix}:${ip}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= maxRequests) {
    return false; // blocked
  }

  entry.count++;
  return true; // allowed
}

// ─── Security Headers Middleware (F-001, F-002) ───
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Remove X-Powered-By (F-002)
  res.removeHeader("X-Powered-By");

  // Anti-clickjacking (F-001)
  res.setHeader("X-Frame-Options", "DENY");

  // XSS protection
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions policy (only allow camera/mic for self - needed for video recording)
  res.setHeader(
    "Permissions-Policy",
    "camera=(self), microphone=(self), geolocation=()"
  );

  // Content Security Policy (permissive enough for the app to work)
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://manus-analytics.com", // needed for Vite HMR in dev + Chart.js + analytics
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' blob: https:",
      "connect-src 'self' https: wss:", // needed for tRPC, OAuth, analytics, Vite HMR
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://youtube.com",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  next();
}

// ─── Global Rate Limit Middleware (F-003) ───
// 300 requests per minute per IP for all routes
export function globalRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  const allowed = checkRateLimit(ip, "global", 300, 60 * 1000);

  if (!allowed) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  next();
}

// ─── Upload Rate Limit (F-006) ───
// 10 uploads per hour per IP
export function uploadRateLimit(ip: string): boolean {
  return checkRateLimit(ip, "upload", 10, 60 * 60 * 1000);
}

// ─── Submit Rate Limit (F-007) ───
// 3 submissions per hour per IP
export function submitRateLimit(ip: string): boolean {
  return checkRateLimit(ip, "submit", 3, 60 * 60 * 1000);
}

// ─── Batch Limit for tRPC (F-011) ───
export function tRPCBatchLimit(req: Request, res: Response, next: NextFunction) {
  // tRPC batch requests use comma-separated procedure names in the URL path
  const path = req.path.replace("/api/trpc/", "");
  const procedures = path.split(",");

  if (procedures.length > 10) {
    res.status(400).json({ error: "Too many procedures in batch. Maximum is 10." });
    return;
  }

  next();
}

// ─── Helper to get IP from tRPC context ───
export { getClientIp };
