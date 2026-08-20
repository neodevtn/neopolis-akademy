import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { injectSeoHead } from "../seo";

export const SPA_DOCUMENT_NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
} as const;

export const VERSIONED_ASSET_CACHE_CONTROL = "public, max-age=31536000, immutable";

export function applySpaDocumentNoCacheHeaders(res: { set: (headers: Record<string, string>) => unknown }) {
  res.set(SPA_DOCUMENT_NO_CACHE_HEADERS);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      template = injectSeoHead(template, url);
      const page = await vite.transformIndexHtml(url, template);
      applySpaDocumentNoCacheHeaders(res);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.get("/index.html", (_req, res) => res.redirect(301, "/"));
  // Les bundles Vite possèdent un hash de contenu. Ils peuvent être conservés un an,
  // alors que le document HTML reste explicitement non cacheable plus bas afin de
  // toujours pointer vers le bundle courant après une publication.
  app.use(
    "/assets",
    express.static(path.resolve(distPath, "assets"), {
      immutable: true,
      maxAge: "1y",
      index: false,
    }),
  );
  app.use(express.static(distPath, { index: false }));

  // A hashed JavaScript asset from a previous deployment must never receive
  // the SPA document as a fallback. Browsers treat that HTML response as a
  // stale module and can crash while reconciling an already-loaded screen.
  app.use("/assets", (_req, res) => {
    res.status(404).type("text/plain").send("Asset not found");
  });

  // fall through to index.html if the file doesn't exist
  app.use("*", async (req, res, next) => {
    applySpaDocumentNoCacheHeaders(res);
    try {
      const template = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8");
      res.status(200).type("html").send(injectSeoHead(template, req.originalUrl));
    } catch (error) {
      next(error);
    }
  });
}
