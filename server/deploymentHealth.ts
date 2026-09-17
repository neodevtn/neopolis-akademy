import type { Express, Request, Response } from "express";

export const DEPLOYMENT_HEALTH_PATH = "/healthz";

/**
 * Lightweight liveness endpoint for the hosting platform. It deliberately does
 * not access the database, authentication, or upstream services: process
 * readiness must be observable even while a dependent service is recovering.
 */
export function registerDeploymentHealthRoute(app: Pick<Express, "get">): void {
  app.get(DEPLOYMENT_HEALTH_PATH, (_req: Request, res: Response) => {
    res.status(200).set({
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    }).json({ status: "ok" });
  });
}

/** Production platforms must be served on the port they inject. */
export function resolveHostingPort(portValue: string | undefined): number {
  const parsed = Number.parseInt(portValue || "3000", 10);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 65_535 ? parsed : 3000;
}

/** Local development can avoid a busy terminal port; production must not. */
export function mayUseAlternatePort(nodeEnv: string | undefined): boolean {
  return nodeEnv === "development";
}
