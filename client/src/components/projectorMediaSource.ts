export type ProjectorMediaSource = {
  url: string;
  mimeType: "audio/mpeg" | "video/mp4";
  kind: "audio" | "video" | "none";
};

/**
 * Les leçons Projector synchronisent les slides sur une piste sonore. Lorsqu’une
 * piste MP3 est fournie, elle est donc préférable au MP4, qui peut être absent
 * ou indisponible sans empêcher la consultation de la leçon.
 */
export function resolveProjectorMediaSource(mp4Url?: string, audioUrl?: string): ProjectorMediaSource {
  if (audioUrl?.trim()) {
    return { url: audioUrl, mimeType: "audio/mpeg", kind: "audio" };
  }

  if (mp4Url?.trim()) {
    return { url: mp4Url, mimeType: "video/mp4", kind: "video" };
  }

  return { url: "", mimeType: "audio/mpeg", kind: "none" };
}
