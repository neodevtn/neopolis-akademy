import type { NextFunction, Request, Response } from "express";
import { ENV } from "./_core/env";

export const CANONICAL_PUBLIC_ORIGIN = "https://akademy.neodev.click";

function normalizedHost(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw || "").split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
}

/**
 * Managed preview domains use a separate host-only session cookie. Redirecting
 * browser navigation to the canonical custom domain before the app loads keeps
 * the public site, learner space and admin area in one browser session.
 */
export function canonicalNavigationLocation({
  method,
  host,
  forwardedHost,
  originalUrl,
}: {
  method: string;
  host?: string | string[];
  forwardedHost?: string | string[];
  originalUrl: string;
}) {
  if (method !== "GET" && method !== "HEAD") return null;
  const requestHost = normalizedHost(forwardedHost) || normalizedHost(host);
  if (!requestHost.endsWith(".manus.space")) return null;
  return `${CANONICAL_PUBLIC_ORIGIN}${originalUrl.startsWith("/") ? originalUrl : `/${originalUrl}`}`;
}

export function canonicalHostRedirect(req: Request, res: Response, next: NextFunction) {
  if (!ENV.isProduction) {
    next();
    return;
  }

  const location = canonicalNavigationLocation({
    method: req.method,
    host: req.headers.host,
    forwardedHost: req.headers["x-forwarded-host"],
    originalUrl: req.originalUrl || req.url,
  });

  if (!location) {
    next();
    return;
  }

  res.redirect(308, location);
}
