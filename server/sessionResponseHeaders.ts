import type { NextFunction, Request, Response } from "express";

/** Prevent shared caches from replaying a previous user's auth.me response. */
export function privateApiResponseHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("Cache-Control", "no-store, private, max-age=0");
  res.setHeader("Pragma", "no-cache");
  next();
}
