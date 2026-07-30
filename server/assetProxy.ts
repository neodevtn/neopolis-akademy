import type { Express, Request, Response } from "express";
import { ENV } from "./_core/env";

/**
 * Custom asset proxy that serves storage files directly (piped) instead of
 * relying on the platform's /manus-storage/ 307 redirect.
 * 
 * Problem: The platform intercepts /manus-storage/ at the edge and returns a
 * 307 redirect to a signed CloudFront URL (expires in ~1h). CloudFront returns
 * cache-control: max-age=31536000 (1 year). The browser caches the response
 * keyed by the signed URL. When the signed URL expires and the browser tries
 * to revalidate, CloudFront returns 403 → broken images.
 * 
 * Solution: Use /api/assets/ path which the platform doesn't intercept.
 * We fetch the file server-side and pipe it with proper cache headers.
 */
export function registerAssetProxy(app: Express) {
  app.get("/api/assets/*", async (req: Request, res: Response) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing asset key");
      return;
    }

    // Protect application files (CV, photos, videos) - require admin auth
    if (key.startsWith("applications/")) {
      try {
        const { sdk } = await import("./_core/sdk");
        const user = await sdk.authenticateRequest(req);
        if (!user || user.role !== "admin") {
          res.status(403).json({ error: "Accès réservé aux administrateurs" });
          return;
        }
      } catch {
        res.status(401).json({ error: "Authentification requise" });
        return;
      }
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[AssetProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      // Pipe the file directly - no redirect, no caching issues
      const fileResp = await fetch(url);
      if (!fileResp.ok) {
        res.status(502).send("Storage file fetch error");
        return;
      }

      const contentType = fileResp.headers.get("content-type");
      if (contentType) res.set("Content-Type", contentType);
      const contentLength = fileResp.headers.get("content-length");
      if (contentLength) res.set("Content-Length", contentLength);
      
      // Cache for 1 hour with must-revalidate - the browser will get a fresh
      // signed URL on each request after expiry instead of using a stale one
      res.set("Cache-Control", "public, max-age=3600, must-revalidate");
      res.set("Access-Control-Allow-Origin", "*");
      
      const arrayBuf = await fileResp.arrayBuffer();
      res.send(Buffer.from(arrayBuf));
    } catch (err) {
      console.error("[AssetProxy] failed:", err);
      res.status(502).send("Asset proxy error");
    }
  });
}
