import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle2, PlayCircle, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
    __ytApiLoaded?: boolean;
    __ytApiCallbacks?: (() => void)[];
  }
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
}

// Load YouTube IFrame API script once globally
function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (window.__ytApiLoaded && window.YT && window.YT.Player) {
      resolve();
      return;
    }

    if (!window.__ytApiCallbacks) {
      window.__ytApiCallbacks = [];
    }
    window.__ytApiCallbacks.push(resolve);

    // If script is already being loaded, just wait for callback
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      window.__ytApiLoaded = true;
      window.__ytApiCallbacks?.forEach((cb) => cb());
      window.__ytApiCallbacks = [];
    };
  });
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
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0); // 0-100
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [autoCompleted, setAutoCompleted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);

  // Load the YouTube API on mount
  useEffect(() => {
    loadYouTubeAPI().then(() => setApiLoaded(true));
  }, []);

  // Create the player when API is loaded and user clicks play
  const initPlayer = useCallback(() => {
    if (!apiLoaded || !containerRef.current || playerRef.current) return;

    const playerId = `yt-player-${videoKey.replace(/[^a-zA-Z0-9]/g, "_")}`;
    
    // Create a div for the player
    const playerDiv = document.createElement("div");
    playerDiv.id = playerId;
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(playerDiv);

    playerRef.current = new window.YT.Player(playerId, {
      videoId,
      width: "100%",
      height: "100%",
      playerVars: {
        rel: 0,
        modestbranding: 1,
        autoplay: 1,
        origin: window.location.origin,
        enablejsapi: 1,
      },
      events: {
        onReady: (event: any) => {
          setPlayerReady(true);
          setDuration(event.target.getDuration());
          startTracking();
        },
        onStateChange: (event: any) => {
          const state = event.data;
          if (state === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            startTracking();
          } else if (state === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          } else if (state === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            // Video ended = 100% watched
            setWatchProgress(100);
            if (!isCompleted) {
              onMarkComplete(videoKey);
              setAutoCompleted(true);
            }
          }
        },
      },
    });
  }, [apiLoaded, videoId, videoKey, isCompleted, onMarkComplete]);

  // Track progress every 1.5 seconds
  const startTracking = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
        try {
          const current = playerRef.current.getCurrentTime();
          const total = playerRef.current.getDuration();
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            setCurrentTime(current);
            setDuration(total);
            setWatchProgress((prev) => Math.max(prev, pct));

            // Auto-complete at 80%
            if (pct >= 80 && !isCompleted && !autoCompleted) {
              onMarkComplete(videoKey);
              setAutoCompleted(true);
            }
          }
        } catch (_) {}
      }
    }, 1500);
  }, [isCompleted, autoCompleted, onMarkComplete, videoKey]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }
    };
  }, []);

  const handlePlayClick = () => {
    setIsPlaying(true);
    initPlayer();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

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
        {!playerRef.current && !isPlaying ? (
          // Thumbnail with play button
          <div
            className="aspect-video rounded-lg overflow-hidden bg-black relative cursor-pointer group"
            onClick={handlePlayClick}
          >
            <img
              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <PlayCircle className="w-7 h-7 text-white fill-white" />
              </div>
            </div>
          </div>
        ) : (
          // YouTube IFrame Player
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <div ref={containerRef} className="w-full h-full" />
          </div>
        )}

        {/* Watch progress bar */}
        {(isPlaying || watchProgress > 0) && !isCompleted && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
              <span>{t({ en: "Watch progress", fr: "Progression" })}</span>
              <span>
                {watchProgress >= 80
                  ? t({ en: "✓ 80% reached — auto-validated!", fr: "✓ 80% atteint — validé automatiquement !" })
                  : `${watchProgress}% — ${t({ en: "80% required", fr: "80% requis" })}`}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  watchProgress >= 80 ? "bg-emerald-500" : "bg-primary"
                }`}
                style={{ width: `${Math.min(watchProgress, 100)}%` }}
              />
            </div>
            {duration > 0 && (
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            )}
          </div>
        )}

        {/* Auto-completed notification */}
        {autoCompleted && (
          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              {t({ en: "Video automatically marked as watched (80%+ viewed)", fr: "Vidéo automatiquement marquée comme vue (80%+ visionnée)" })}
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
                {t({ en: "Mark as watched (manual)", fr: "Marquer comme vue (manuel)" })}
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
