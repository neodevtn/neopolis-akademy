import { lazy, Suspense, useEffect, useState } from "react";

const CookieConsent = lazy(() => import("./CookieConsent"));
import { COOKIE_CONSENT_KEY } from "@/lib/cookieConsentState";

/**
 * The consent banner has no bearing on the first visible screen. Loading it once
 * the browser is idle keeps the public home page responsive while preserving the
 * established post-LCP consent notice for visitors who have not chosen yet.
 */
export default function DeferredCookieConsent() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(COOKIE_CONSENT_KEY)) return;

    const schedule = window.requestIdleCallback
      ? window.requestIdleCallback(() => setShouldLoad(true), { timeout: 1200 })
      : window.setTimeout(() => setShouldLoad(true), 900);

    return () => {
      if (typeof schedule === "number") {
        window.clearTimeout(schedule);
      } else {
        window.cancelIdleCallback?.(schedule);
      }
    };
  }, []);

  if (!shouldLoad) return null;

  return (
    <Suspense fallback={null}>
      <CookieConsent />
    </Suspense>
  );
}
