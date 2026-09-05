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
  // Express resolves the trusted reverse-proxy chain through `req.ip`.
  // Reading an arbitrary X-Forwarded-For header first would let a client evade rate limits.
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

const GA4_SCRIPT_ORIGINS = ["https://www.googletagmanager.com"] as const;
const GA4_CONNECT_ORIGINS = [
  "https://www.googletagmanager.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://analytics.google.com",
] as const;
const GA4_IMAGE_ORIGINS = ["https://www.googletagmanager.com", "https://*.google-analytics.com"] as const;

/**
 * Politique CSP commune. Les hôtes Analytics sont explicitement listés : aucun
 * joker de type `https:` n'est admis dans connect-src.
 */
export function buildContentSecurityPolicy(isDev = process.env.NODE_ENV === "development") {
  const scriptSources = ["'self'", "'unsafe-inline'", "https://manus-analytics.com", "https://www.youtube.com", ...GA4_SCRIPT_ORIGINS];
  if (isDev) scriptSources.push("'unsafe-eval'");

  const connectSources = [
    "'self'",
    "https://manus-analytics.com",
    "https://sentry.neopolis-dev.com",
    ...GA4_CONNECT_ORIGINS,
  ];
  if (isDev) connectSources.push("ws:", "wss:");

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: https: blob: ${GA4_IMAGE_ORIGINS.join(" ")}`,
    "media-src 'self' blob: https:",
    "worker-src 'self' blob:",
    `connect-src ${connectSources.join(" ")}`,
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://youtube.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
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

  res.setHeader("Content-Security-Policy", buildContentSecurityPolicy());
  // Strict-Transport-Security (HSTS) - enforce HTTPS for 1 year
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  next();
}

// ─── Global Rate Limit Middleware (F-003) ───
// 300 requests per minute per IP for all routes
export function globalRateLimit(req: Request, res: Response, next: NextFunction) {
  // La sonde Playwright interne est réservée à la prévisualisation. Elle parcourt
  // de nombreux écrans pour détecter des régressions et ne doit jamais modifier
  // le budget de débit appliqué aux utilisateurs de production.
  if (process.env.NODE_ENV !== "production" && req.get("x-neopolis-qa-probe") === "1") {
    next();
    return;
  }

  // Les bundles, médias et JSON de cours peuvent être demandés en rafale lors du
  // chargement d’un écran. Ils ne déclenchent aucune opération métier : les
  // compter avec les endpoints API ferait échouer un parcours légitime avant
  // que les limites spécialisées d’authentification, soumission et tRPC ne jouent.
  if (req.method === "GET" && (
    req.path === "/" ||
    req.path === "/__manus__/version.json" ||
    req.path.startsWith("/assets/") ||
    req.path.startsWith("/data/") ||
    req.path.startsWith("/api/assets/")
  )) {
    next();
    return;
  }

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
