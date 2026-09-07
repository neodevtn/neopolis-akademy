import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export function versionFromApplicationDocument(document: string): string {
  return createHash("sha256").update(document).digest("hex").slice(0, 16);
}

function getApplicationDocumentPath(): string {
  return process.env.NODE_ENV === "development"
    ? path.resolve(import.meta.dirname, "..", "client", "index.html")
    : path.resolve(import.meta.dirname, "public", "index.html");
}

/**
 * Le manifeste est calculé depuis le document HTML livré. Il change avec les
 * références de bundles Vite après une publication et ne dépend donc pas d’un
 * fichier public ignoré par le contexte de build.
 */
export function getRuntimeVersionManifest(): { version: string } {
  try {
    return { version: versionFromApplicationDocument(fs.readFileSync(getApplicationDocumentPath(), "utf8")) };
  } catch {
    return { version: "runtime-unavailable" };
  }
}
