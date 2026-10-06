import type { RequestHandler } from "express";

/** Le lien porte un jeton privé : ne jamais l'exposer via Referer, crawler ou cache HTML. */
export const examInvitationSecurityHeaders: RequestHandler = (req, res, next) => {
  if (req.path === "/accept-exam-invitation") {
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
  }
  next();
};
