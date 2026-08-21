import type { Express, Request, Response } from "express";
import { ENV } from "./_core/env";

/**
 * Custom asset proxy that serves storage files directly (piped) instead of
 * relying on the platform's /manus-storage/ 307 redirect.
 * 
 * Problem: The platform intercepts /manus-storage/ at the edge and returns a
 * 307 redirect to a signed CloudFront URL. Browser extensions (ad blockers)
 * and strict CSP can block these redirects → ERR_BLOCKED_BY_CLIENT.
 * 
 * Solution: /api/assets/ path bypasses the platform edge. We fetch the file
 * server-side and pipe it with proper headers including Range request support
 * for video/audio streaming.
 */

// MIME type map for common media extensions
const MIME_MAP: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".vtt": "text/vtt; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const DEFAULT_PUBLIC_ASSET_CACHE_CONTROL = "public, max-age=3600, must-revalidate";
export const VERSIONED_PUBLIC_ASSET_CACHE_CONTROL = "public, max-age=31536000, immutable";

/** Les assets téléversés avec un suffixe hashé peuvent être mis en cache durablement. */
export function getAssetCacheControl(key: string): string {
  return /_[a-f0-9]{8}\.[a-z0-9]+$/i.test(key)
    ? VERSIONED_PUBLIC_ASSET_CACHE_CONTROL
    : DEFAULT_PUBLIC_ASSET_CACHE_CONTROL;
}

function getMimeFromKey(key: string): string | null {
  const ext = key.substring(key.lastIndexOf(".")).toLowerCase();
  return MIME_MAP[ext] || null;
}

export function registerAssetProxy(app: Express) {
  app.get("/api/assets/*", async (req: Request, res: Response) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing asset key");
      return;
    }
    const cacheControl = getAssetCacheControl(key);

    // Protect application files - require admin auth
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
      // Get presigned URL from forge
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

      // Determine content type from key extension (more reliable than upstream)
      const mimeFromKey = getMimeFromKey(key);

      // Check if this is a Range request (video/audio seeking)
      const rangeHeader = req.headers.range;

      if (rangeHeader) {
        // Relay the requested range directly. Some signed storage endpoints do not
        // reliably support HEAD for newly uploaded large files, even though GET Range
        // succeeds. The upstream Content-Range is the authoritative source here.
        const rangeResp = await fetch(url, {
          headers: { Range: rangeHeader },
        });
        if (!rangeResp.ok) {
          res.status(502).send("Storage file range fetch error");
          return;
        }

        const contentType = mimeFromKey || rangeResp.headers.get("content-type") || "application/octet-stream";
        const contentRange = rangeResp.headers.get("content-range");
        const contentLength = rangeResp.headers.get("content-length");

        res.status(rangeResp.status === 206 ? 206 : 200);
        res.set("Content-Type", contentType);
        if (contentLength) res.set("Content-Length", contentLength);
        if (contentRange) res.set("Content-Range", contentRange);
        res.set("Accept-Ranges", "bytes");
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Cache-Control", cacheControl);

        const arrayBuf = await rangeResp.arrayBuffer();
        res.send(Buffer.from(arrayBuf));
      } else {
        // Full file request
        const fileResp = await fetch(url);
        if (!fileResp.ok) {
          res.status(502).send("Storage file fetch error");
          return;
        }

        const contentType = mimeFromKey || fileResp.headers.get("content-type") || "application/octet-stream";
        const contentLength = fileResp.headers.get("content-length");

        res.set("Content-Type", contentType);
        if (contentLength) res.set("Content-Length", contentLength);
        res.set("Accept-Ranges", "bytes");
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Cache-Control", cacheControl);

        const arrayBuf = await fileResp.arrayBuffer();
        res.send(Buffer.from(arrayBuf));
      }
    } catch (err) {
      console.error("[AssetProxy] failed:", err);
      res.status(502).send("Asset proxy error");
    }
  });
}
