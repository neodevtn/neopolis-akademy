import { useState, useRef, useCallback, useEffect } from "react";
import { CheckCircle2, PlayCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export const videoProviderFallbackCopy = {
  en: "The embedded provider could not start this video. Open the official video in a new tab, then confirm you watched it before marking this step complete.",
  fr: "Le fournisseur intégré n’a pas pu démarrer cette vidéo. Ouvrez la vidéo officielle dans un nouvel onglet, puis confirmez l’avoir regardée avant de valider cette étape.",
};

export type VideoEmbedHost = "privacy" | "standard";

export const videoEmbedHosts: Record<VideoEmbedHost, string> = {
  privacy: "https://www.youtube-nocookie.com",
  standard: "https://www.youtube.com",
};

export function nextVideoEmbedHostAfterProviderError(host: VideoEmbedHost): VideoEmbedHost | null {
  return host === "privacy" ? "standard" : null;
}

export function canMarkVideoComplete({
  playbackConfirmed,
  providerUnavailable,
  externalViewingConfirmed,
}: {
  playbackConfirmed: boolean;
  providerUnavailable: boolean;
  externalViewingConfirmed: boolean;
}) {
  return playbackConfirmed || (providerUnavailable && externalViewingConfirmed);
}

interface YouTubePlayerProps {
  videoId: string;
  videoKey: string;
  title: string;
  isCompleted: boolean;
  onMarkComplete: (videoKey: string) => void;
  watchUrl?: string;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  onPlaybackChange?: (isPlaying: boolean) => void;
}

export function YouTubePlayer({
  videoId,
  videoKey,
  title,
  isCompleted,
  onMarkComplete,
  watchUrl,
  lang,
  t,
  onPlaybackChange,
}: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoCompleted, setAutoCompleted] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const [embedHost, setEmbedHost] = useState<VideoEmbedHost>("privacy");
  const [playbackConfirmed, setPlaybackConfirmed] = useState(false);
  const [externalViewingConfirmed, setExternalViewingConfirmed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePlayClick = useCallback(() => {
    setEmbedError(false);
    setEmbedHost("privacy");
    setPlaybackConfirmed(false);
    setExternalViewingConfirmed(false);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    const onYouTubeMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube-nocookie.com" && event.origin !== "https://www.youtube.com") return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      try {
        const payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (payload?.event === "onError") {
          const nextHost = nextVideoEmbedHostAfterProviderError(embedHost);
          if (nextHost) {
            setEmbedHost(nextHost);
            return;
          }
          setPlaybackConfirmed(false);
          setEmbedError(true);
          onPlaybackChange?.(false);
          return;
        }
        if (payload?.event !== "onStateChange") return;
        if (payload.info === 1) {
          setEmbedError(false);
          setPlaybackConfirmed(true);
        }
        if (payload.info === 0 && !isCompleted) {
          onMarkComplete(videoKey);
          setAutoCompleted(true);
        }
        onPlaybackChange?.(payload.info === 1);
      } catch {
        // Ignore non-JSON messages from the embedded player.
      }
    };
    window.addEventListener("message", onYouTubeMessage);
    return () => {
      window.removeEventListener("message", onYouTubeMessage);
      onPlaybackChange?.(false);
    };
  }, [embedHost, isCompleted, onMarkComplete, onPlaybackChange, videoKey]);

  // L’hôte privacy-enhanced est essayé en premier. En cas d’erreur réelle signalée par
  // le fournisseur, le lecteur standard est tenté une seule fois avant le repli explicite.
  const embedUrl = `${videoEmbedHosts[embedHost]}/embed/${videoId}?rel=0&modestbranding=1&autoplay=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&widget_referrer=${encodeURIComponent(window.location.origin)}`;
  const fallbackUrl = watchUrl || `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  const manualCompletionAllowed = canMarkVideoComplete({
    playbackConfirmed,
    providerUnavailable: embedError,
    externalViewingConfirmed,
  });

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-colors ${
        isCompleted
          ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10"
          : "border-border bg-card"
      }`}
    >
      {/* Video header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <PlayCircle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          <span className="font-medium text-sm text-foreground">{title}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-semibold uppercase">
            {t({ en: "Video", fr: "Vidéo" })}
          </span>
        </div>
        {isCompleted && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-semibold">
            {t({ en: "✓ Watched", fr: "✓ Vue" })}
          </span>
        )}
      </div>

      {/* Video player area */}
      <div className="px-3 pt-3 pb-3">
        {!isPlaying ? (
          // Thumbnail with play button
          <div
            className="aspect-video rounded-lg overflow-hidden bg-black relative cursor-pointer group"
            onClick={handlePlayClick}
          >
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white ml-1" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          // Direct YouTube iframe embed with explicit recovery when the provider refuses playback.
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            {embedError ? (
              <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 bg-slate-950 px-5 text-center text-white">
                <p className="max-w-md text-sm leading-6">
                  {t(videoProviderFallbackCopy)}
                </p>
                <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  {t({ en: "Open official video", fr: "Ouvrir la vidéo officielle" })}
                </a>
                <label className="flex max-w-md items-start gap-2 text-left text-xs leading-5 text-slate-100">
                  <input
                    type="checkbox"
                    checked={externalViewingConfirmed}
                    onChange={(event) => setExternalViewingConfirmed(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-white/70 accent-white"
                  />
                  <span>{t({ en: "I confirm that I watched the official video.", fr: "Je confirme avoir regardé la vidéo officielle." })}</span>
                </label>
                <Button type="button" variant="outline" size="sm" className="border-white/70 text-white hover:bg-white/10 hover:text-white" onClick={handlePlayClick}>
                  {t({ en: "Try again", fr: "Réessayer" })}
                </Button>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                key={embedHost}
                src={embedUrl}
                onLoad={() => {
                  const target = iframeRef.current?.contentWindow;
                  const targetOrigin = videoEmbedHosts[embedHost];
                  target?.postMessage(JSON.stringify({ event: "command", func: "addEventListener", args: ["onStateChange"] }), targetOrigin);
                  target?.postMessage(JSON.stringify({ event: "command", func: "addEventListener", args: ["onError"] }), targetOrigin);
                }}
                title={title}
                className="w-full h-full"
                frameBorder="0"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        )}

        {/* Completion is recorded only after a real end-of-playback event. */}
        {autoCompleted && (
          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              {t({ en: "Video marked as watched after playback ended", fr: "Vidéo marquée comme vue après la fin de la lecture" })}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-3">
          <Button
            variant={isCompleted ? "outline" : "default"}
            size="sm"
            onClick={() => {
              if (!isCompleted && manualCompletionAllowed) {
                onMarkComplete(videoKey);
              }
            }}
            disabled={isCompleted || !manualCompletionAllowed}
            className={`gap-1.5 text-xs ${
              isCompleted
                ? "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-default"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t({ en: "Completed", fr: "Terminée" })}
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                {t({ en: "Mark as watched", fr: "Marquer comme vue" })}
              </>
            )}
          </Button>
          {watchUrl && (
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              {t({ en: "Watch on YouTube", fr: "Regarder sur YouTube" })}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
