import { RefreshCw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { extractPlatformVersion, isLearnerLearningRoute, shouldShowVersionUpdate } from "@/lib/platformUpdate";

const POLL_INTERVAL_MS = 60_000;

export function PlatformUpdateNotice() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(() => typeof window !== "undefined" && sessionStorage.getItem("neopolis-update-dismissed") === "true");
  const loadedVersionRef = useRef<string | null>(null);
  const enabled = typeof window !== "undefined" && isLearnerLearningRoute(window.location.pathname);

  useEffect(() => {
    if (!enabled) {
      setUpdateAvailable(false);
      return;
    }

    let cancelled = false;
    const checkForUpdate = async () => {
      try {
        const response = await fetch(`/__manus__/version.json?platform-update=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) return;

        const availableVersion = extractPlatformVersion(await response.json());
        const loadedVersion = loadedVersionRef.current;
        if (!loadedVersion && availableVersion) {
          loadedVersionRef.current = availableVersion;
          return;
        }
        if (!cancelled && shouldShowVersionUpdate(loadedVersion, availableVersion)) {
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

  if (!enabled || !updateAvailable || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex max-w-sm px-4" role="status" aria-live="polite">
      <div className="flex w-full flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950 shadow-lg">
        <div>
          <p className="text-sm font-semibold">Une mise à jour de Neopolis Akademy est disponible.</p>
          <p className="text-sm">Rafraîchissez maintenant pour poursuivre votre cours avec la version la plus récente.</p>
        </div>
        <div className="flex items-center gap-2"><button type="button" onClick={() => window.location.reload()} className="inline-flex shrink-0 items-center justify-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><RefreshCw className="h-4 w-4" aria-hidden="true" />Rafraîchir</button><button type="button" aria-label="Masquer cette notification" onClick={() => { sessionStorage.setItem("neopolis-update-dismissed", "true"); setDismissed(true); }} className="rounded-md p-2 text-amber-950 hover:bg-amber-100"><X className="h-4 w-4" /></button></div>
      </div>
    </div>
  );
}
