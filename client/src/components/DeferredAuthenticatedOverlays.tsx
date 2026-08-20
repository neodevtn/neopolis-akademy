import { lazy, Suspense, useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

const SentryUserSync = lazy(() => import("./SentryUserSync").then((module) => ({ default: module.SentryUserSync })));
const PlatformUpdateNotice = lazy(() => import("./PlatformUpdateNotice").then((module) => ({ default: module.PlatformUpdateNotice })));
const AchievementCelebration = lazy(() => import("./AchievementCelebration").then((module) => ({ default: module.AchievementCelebration })));
const ImportantCommunicationLightbox = lazy(() => import("./ImportantCommunicationLightbox").then((module) => ({ default: module.ImportantCommunicationLightbox })));

/**
 * Les alertes, succès et synchronisation Sentry sont utiles après authentification,
 * pas pendant le rendu critique de la landing page. Leur montage différé préserve
 * l’expérience fonctionnelle sans imposer leur code aux visiteurs anonymes.
 */
export function DeferredAuthenticatedOverlays() {
  const { isAuthenticated } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setReady(false);
      return;
    }

    const schedule = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(callback, 0));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = schedule(() => setReady(true));
    return () => cancel(handle);
  }, [isAuthenticated]);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <SentryUserSync />
      <PlatformUpdateNotice />
      <AchievementCelebration />
      <ImportantCommunicationLightbox />
    </Suspense>
  );
}
