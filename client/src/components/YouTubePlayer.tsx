import { useState, useRef, useCallback, useEffect } from "react";
import { CheckCircle2, PlayCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export const videoProviderFallbackCopy = {
  en: "The video provider could not start this embedded player. You can open the official video in a new tab and, if you complete it, mark it as watched when you return.",
  fr: "Le fournisseur vidéo n’a pas pu démarrer ce lecteur intégré. Vous pouvez ouvrir la vidéo officielle dans un nouvel onglet puis, si vous l’avez terminée, la marquer comme vue à votre retour.",
};

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playbackSignalTimeoutRef = useRef<number | null>(null);
  const autoCompletionTimeoutRef = useRef<number | null>(null);

  const clearPlaybackSignalTimeout = useCallback(() => {
    if (playbackSignalTimeoutRef.current !== null) {
      window.clearTimeout(playbackSignalTimeoutRef.current);
      playbackSignalTimeoutRef.current = null;
    }
  }, []);

  const clearAutoCompletionTimeout = useCallback(() => {
    if (autoCompletionTimeoutRef.current !== null) {
      window.clearTimeout(autoCompletionTimeoutRef.current);
      autoCompletionTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    clearPlaybackSignalTimeout();
    clearAutoCompletionTimeout();
  }, [clearAutoCompletionTimeout, clearPlaybackSignalTimeout]);

  const handlePlayClick = useCallback(() => {
    clearPlaybackSignalTimeout();
    clearAutoCompletionTimeout();
    setEmbedError(false);
    setIsPlaying(true);
    // Auto-mark as complete after 30 seconds of watching (simplified tracking)
    if (!isCompleted && !autoCompleted) {
      autoCompletionTimeoutRef.current = window.setTimeout(() => {
        onMarkComplete(videoKey);
        setAutoCompleted(true);
      }, 30000); // 30 seconds
    }
  }, [autoCompleted, clearAutoCompletionTimeout, clearPlaybackSignalTimeout, isCompleted, onMarkComplete, videoKey]);

  useEffect(() => {
    const onYouTubeMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube-nocookie.com" && event.origin !== "https://www.youtube.com") return;
      try {
        const payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (payload?.event === "onError") {
          clearPlaybackSignalTimeout();
          clearAutoCompletionTimeout();
          setEmbedError(true);
          onPlaybackChange?.(false);
          return;
        }
        if (payload?.event !== "onStateChange") return;
        clearPlaybackSignalTimeout();
        if (payload.info === 1) setEmbedError(false);
        onPlaybackChange?.(payload.info === 1);
      } catch {
        // Ignore non-JSON messages from the embedded player.
      }
    };
    window.addEventListener("message", onYouTubeMessage);
    return () => {
      window.removeEventListener("message", onYouTubeMessage);
      clearPlaybackSignalTimeout();
      clearAutoCompletionTimeout();
      onPlaybackChange?.(false);
    };
  }, [clearAutoCompletionTimeout, clearPlaybackSignalTimeout, onPlaybackChange]);

  // Build the embed URL with appropriate parameters
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
  const fallbackUrl = watchUrl || `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;

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
                <Button type="button" variant="outline" size="sm" className="border-white/70 text-white hover:bg-white/10 hover:text-white" onClick={handlePlayClick}>
                  {t({ en: "Try again", fr: "Réessayer" })}
                </Button>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={embedUrl}
                onLoad={() => {
                  const target = iframeRef.current?.contentWindow;
                  target?.postMessage(JSON.stringify({ event: "command", func: "addEventListener", args: ["onStateChange"] }), "https://www.youtube-nocookie.com");
                  target?.postMessage(JSON.stringify({ event: "command", func: "addEventListener", args: ["onError"] }), "https://www.youtube-nocookie.com");
                  clearPlaybackSignalTimeout();
                  playbackSignalTimeoutRef.current = window.setTimeout(() => {
                    clearAutoCompletionTimeout();
                    setEmbedError(true);
                    onPlaybackChange?.(false);
                  }, 12_000);
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

        {/* Auto-completed notification */}
        {autoCompleted && (
          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              {t({ en: "Video automatically marked as watched", fr: "Vidéo automatiquement marquée comme vue" })}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-3">
          <Button
            variant={isCompleted ? "outline" : "default"}
            size="sm"
            onClick={() => {
              if (!isCompleted) {
                onMarkComplete(videoKey);
              }
            }}
            disabled={isCompleted}
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
