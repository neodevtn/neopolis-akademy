import { useState, useRef, useCallback, useEffect, useId } from "react";
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

// 153 is returned when YouTube refuses an embedded playback request because
// it cannot establish a valid client/referrer identity. It is a provider
// refusal, not a successful media event, so it must follow the same explicit
// recovery path as the documented embed-denial codes.
const youtubeProviderErrorCodes = new Set([2, 5, 100, 101, 150, 153]);

type YouTubePlayerEvent = { data: number; target: { destroy: () => void } };
type YouTubePlayerInstance = {
  destroy: () => void;
};

type YouTubeNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      host: string;
      playerVars: Record<string, number>;
      events: {
        onReady?: () => void;
        onStateChange?: (event: YouTubePlayerEvent) => void;
        onError?: (event: YouTubePlayerEvent) => void;
      };
    },
  ) => YouTubePlayerInstance;
  PlayerState: { PLAYING: number; ENDED: number };
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeIframeApiPromise: Promise<YouTubeNamespace> | null = null;

export function loadYouTubeIframeApi(): Promise<YouTubeNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeIframeApiPromise) return youtubeIframeApiPromise;

  youtubeIframeApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-neopolis-youtube-api="true"]');
    const previousReady = window.onYouTubeIframeAPIReady;
    const resolveWhenReady = () => {
      previousReady?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube IFrame API is unavailable after initialization."));
    };

    window.onYouTubeIframeAPIReady = resolveWhenReady;
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.dataset.neopolisYoutubeApi = "true";
    script.onerror = () => reject(new Error("Unable to load the YouTube IFrame API."));
    document.head.appendChild(script);
  });

  return youtubeIframeApiPromise;
}

export function isYouTubeProviderError(code: number) {
  return youtubeProviderErrorCodes.has(code);
}

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
  language?: string;
  durationSeconds?: number;
  objectiveBefore?: string;
  questionsAfter?: string[];
  alternativeTextFr?: string;
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
  language,
  durationSeconds,
  objectiveBefore,
  questionsAfter,
  alternativeTextFr,
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
  const playerMountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const playerId = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const handlePlayClick = useCallback(() => {
    setEmbedError(false);
    setEmbedHost("privacy");
    setPlaybackConfirmed(false);
    setExternalViewingConfirmed(false);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying || embedError || !playerMountRef.current) return;

    let disposed = false;
    const mount = playerMountRef.current;
    mount.replaceChildren();

    loadYouTubeIframeApi()
      .then((YT) => {
        if (disposed) return;
        playerRef.current?.destroy();
        playerRef.current = new YT.Player(mount, {
          videoId,
          host: videoEmbedHosts[embedHost],
          playerVars: {
            autoplay: 1,
            enablejsapi: 1,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: () => {
              if (!disposed) setEmbedError(false);
            },
            onStateChange: (event) => {
              if (disposed) return;
              if (event.data === YT.PlayerState.PLAYING) {
                setEmbedError(false);
                setPlaybackConfirmed(true);
                onPlaybackChange?.(true);
              } else {
                onPlaybackChange?.(false);
              }
              if (event.data === YT.PlayerState.ENDED && !isCompleted) {
                onMarkComplete(videoKey);
                setAutoCompleted(true);
              }
            },
            onError: (event) => {
              if (disposed || !isYouTubeProviderError(event.data)) return;
              const nextHost = nextVideoEmbedHostAfterProviderError(embedHost);
              if (nextHost) {
                setEmbedHost(nextHost);
                return;
              }
              setPlaybackConfirmed(false);
              setEmbedError(true);
              onPlaybackChange?.(false);
            },
          },
        });
      })
      .catch(() => {
        if (!disposed) {
          setPlaybackConfirmed(false);
          setEmbedError(true);
          onPlaybackChange?.(false);
        }
      });

    return () => {
      disposed = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      onPlaybackChange?.(false);
    };
  }, [embedError, embedHost, isCompleted, isPlaying, onMarkComplete, onPlaybackChange, videoId, videoKey]);

  const fallbackUrl = watchUrl || `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  const durationLabel = Number.isFinite(durationSeconds) && Number(durationSeconds) > 0
    ? `${Math.floor(Number(durationSeconds) / 60)}:${String(Number(durationSeconds) % 60).padStart(2, "0")}`
    : null;
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
        {(language || durationLabel || objectiveBefore) && (
          <div className="mb-3 rounded-lg border border-border bg-muted/30 p-3 text-sm">
            {(language || durationLabel) && <p className="font-medium text-foreground">{language && <span>{lang === "fr" ? "Langue" : "Language"}: {language.toUpperCase()}</span>}{language && durationLabel && <span className="mx-2 text-muted-foreground">·</span>}{durationLabel && <span>{lang === "fr" ? "Durée" : "Duration"}: {durationLabel}</span>}</p>}
            {objectiveBefore && <p className="mt-1.5 leading-relaxed text-muted-foreground"><span className="font-medium text-foreground">{lang === "fr" ? "Avant la lecture : " : "Before playback: "}</span>{objectiveBefore}</p>}
          </div>
        )}
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
              <div
                id={`youtube-player-${playerId}`}
                ref={playerMountRef}
                aria-label={title}
                className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full"
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
        {(questionsAfter?.length || alternativeTextFr) && (
          <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
            {questionsAfter?.length ? <div><p className="font-semibold text-foreground">{lang === "fr" ? "Questions après lecture" : "Questions after viewing"}</p><ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">{questionsAfter.map((question, index) => <li key={index}>{question}</li>)}</ol></div> : null}
            {alternativeTextFr ? <details className="rounded-lg border border-border bg-muted/20"><summary className="cursor-pointer px-3 py-2 font-medium text-foreground">{lang === "fr" ? "Alternative textuelle française" : "French text alternative"}</summary><p className="border-t border-border px-3 py-3 leading-relaxed text-muted-foreground">{alternativeTextFr}</p></details> : null}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
