import { lazy, Suspense, useEffect, useState } from "react";
import type { ReactNode } from "react";

const HomeAuthEnhancements = lazy(() => import("./HomeAuthEnhancements"));

type DeferredHomeAuthProps = {
  slot: "training" | "logout" | "mobile-training" | "resume";
  fallback?: ReactNode;
  onNavigate?: () => void;
};

/** Defers authenticated landing-page enhancements until the browser is idle. */
export default function DeferredHomeAuth({ slot, fallback = null, onNavigate }: DeferredHomeAuthProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const schedule = window.requestIdleCallback
      ? window.requestIdleCallback(() => setShouldLoad(true), { timeout: 1400 })
      : window.setTimeout(() => setShouldLoad(true), 1100);

    return () => {
      if (typeof schedule === "number") window.clearTimeout(schedule);
      else window.cancelIdleCallback?.(schedule);
    };
  }, []);

  if (!shouldLoad) return <>{fallback}</>;

  return (
    <Suspense fallback={fallback}>
      <HomeAuthEnhancements slot={slot} onNavigate={onNavigate} />
    </Suspense>
  );
}
