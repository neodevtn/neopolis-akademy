import type { MediaKind } from "@shared/contentStudio";

/** Converts legacy storage and relative references into browser-safe preview URLs. */
export function toPreviewMediaUrl(url: string, kind: MediaKind): string {
  const value = (url || "").trim();
  if (!value) return "";
  if (kind === "youtube" && !/^https?:\/\//i.test(value)) {
    const id = value.replace(/^.*(?:youtu\.be\/|v=|embed\/)/, "").split(/[?&#/]/)[0];
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }
  if (/^https?:\/\//i.test(value) || /^(data|blob):/i.test(value)) return value;
  if (value.startsWith("/api/assets/")) return value;
  if (value.startsWith("/manus-storage/")) return `/api/assets/${value.replace(/^\/manus-storage\//, "")}`;
  if (value.startsWith("/")) return value;
  return `/api/assets/${value.split("/").map((segment) => encodeURIComponent(segment)).join("/")}`;
}

/** Keeps a bare YouTube ID when the target field explicitly expects an ID. */
export function toBlockMediaUrl(url: string, kind: MediaKind, fieldKey: string): string {
  if (kind === "youtube" && /youtubeid/i.test(fieldKey)) return url.trim();
  return toPreviewMediaUrl(url, kind);
}
