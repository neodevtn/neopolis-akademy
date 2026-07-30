import type { Express } from "express";

export function registerStorageProxy(app: Express) {
  // Redirect old /manus-storage/ URLs to /api/assets/ for backward compatibility
  // (DB records may still contain /manus-storage/ paths from before the migration)
  // Note: In production, the platform intercepts /manus-storage/ at the edge and
  // returns a 307 redirect to a signed CloudFront URL. This local handler only
  // runs in dev mode. The real fix is using /api/assets/ which bypasses the platform.
  app.get("/manus-storage/*", (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    // Redirect to our custom asset proxy
    res.redirect(301, `/api/assets/${key}`);
  });
}
