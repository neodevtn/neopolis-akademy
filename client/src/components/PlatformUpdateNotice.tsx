import { RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { extractEntryBundle, isLearnerLearningRoute, shouldShowPlatformUpdate } from "@/lib/platformUpdate";

const POLL_INTERVAL_MS = 60_000;

function getLoadedEntryBundle(): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.querySelector<HTMLScriptElement>('script[type="module"][src*="/assets/index-"]');
  return entry?.getAttribute("src") ?? null;
}

export function PlatformUpdateNotice() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const loadedBundleRef = useRef<string | null>(getLoadedEntryBundle());
  const enabled = typeof window !== "undefined" && isLearnerLearningRoute(window.location.pathname);

  useEffect(() => {
    if (!enabled) {
      setUpdateAvailable(false);
      return;
    }

    let cancelled = false;
    const checkForUpdate = async () => {
      try {
        const response = await fetch(`/?platform-update=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) return;

        const availableBundle = extractEntryBundle(await response.text());
        const loadedBundle = loadedBundleRef.current;
        if (!loadedBundle && availableBundle) {
          loadedBundleRef.current = availableBundle;
          return;
        }
        if (!cancelled && shouldShowPlatformUpdate(loadedBundle, availableBundle)) {
          setUpdateAvailable(true);
        }
      } catch {
        // A failed availability probe must never interrupt the course.
      }
    };

    void checkForUpdate();
    const interval = window.setInterval(() => void checkForUpdate(), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [enabled]);

  if (!enabled || !updateAvailable) return null;

  return (
    <div className="fixed inset-x-0 top-3 z-[80] flex justify-center px-4" role="status" aria-live="polite">
      <div className="flex w-full max-w-3xl flex-col gap-3 border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Une mise à jour de Neopolis Akademy est disponible.</p>
          <p className="text-sm">Rafraîchissez maintenant pour poursuivre votre cours avec la version la plus récente.</p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex shrink-0 items-center justify-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Rafraîchir maintenant
        </button>
      </div>
    </div>
  );
}
