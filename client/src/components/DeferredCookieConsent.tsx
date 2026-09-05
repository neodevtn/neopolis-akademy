import { lazy, Suspense, useEffect, useState } from "react";

import CookieConsent from "./CookieConsent";
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

    // `requestIdleCallback` peut rester différé plusieurs secondes dans Chrome
    // lorsque l’accueil exécute encore ses animations et requêtes. Le bandeau de
    // confidentialité doit être déterministe : le chargement dynamique commence
    // juste après le premier rendu sans entrer dans le chemin critique initial.
    const schedule = window.setTimeout(() => setShouldLoad(true), 250);

    return () => {
      window.clearTimeout(schedule);
    };
  }, []);

  if (!shouldLoad) return null;

  return <CookieConsent />;
}
