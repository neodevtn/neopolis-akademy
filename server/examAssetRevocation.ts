import type { Express, Request, Response } from "express";

export const RETIRED_PUBLIC_EXAM_ASSET_PATHS = [
  "/data/mockExamQuestions.json",
  "/data/examConfigurations.json",
];

/**
 * Prevents historical CDN/static assets from exposing answer keys after the
 * question bank was moved to the server-only data directory.
 */
export function registerExamAssetRevocations(app: Pick<Express, "all">): void {
  app.all(RETIRED_PUBLIC_EXAM_ASSET_PATHS, (_req: Request, res: Response) => {
    res
      .status(410)
      .set("Cache-Control", "no-store, max-age=0")
      .type("text/plain; charset=utf-8")
      .send("This resource is no longer available.");
  });
}
