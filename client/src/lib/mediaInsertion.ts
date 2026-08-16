import type { MediaAsset } from "@shared/contentStudio";

export function createMediaBlock(asset: MediaAsset) {
  const title = { fr: asset.title, en: asset.title };
  if (asset.kind === "youtube") return { type: "video", title, url: asset.url, transcript: "" };
  if (asset.kind === "video" || asset.kind === "audio") return { type: "video", title, ...(asset.kind === "audio" ? { audioUrl: asset.url } : { mp4Url: asset.url }), transcript: "" };
  if (asset.kind === "image") return { type: "content", body: { fr: `![${asset.title}](${asset.url})`, en: `![${asset.title}](${asset.url})` } };
  return { type: "download", title, description: { fr: "", en: "" }, download_url: asset.url, filename: asset.url.split("/").pop() || "fichier" };
}

export function linkMediaToBlock(block: any, asset: MediaAsset) {
  if (block.type === "content") {
    const rendered = asset.kind === "image" ? `![${asset.title}](${asset.url})` : `[${asset.title}](${asset.url})`;
    const body = typeof block.body === "object" && block.body !== null ? block.body : { en: String(block.body || ""), fr: "" };
    return { ...block, body: { en: `${body.en || ""}\n\n${rendered}`.trim(), fr: `${body.fr || ""}\n\n${rendered}`.trim() } };
  }
  if (block.type === "video") return { ...block, ...(asset.kind === "youtube" ? { url: asset.url } : asset.kind === "audio" ? { audioUrl: asset.url } : { mp4Url: asset.url }) };
  if (block.type === "download") return { ...block, download_url: asset.url, filename: asset.url.split("/").pop() || block.filename };
  return block;
}
