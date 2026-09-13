import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  initialPresenceChallengeState,
  reducePresenceChallenge,
  TURNSTILE_VERIFICATION_TIMEOUT_MS,
  TURNSTILE_WIDGET_TIMEOUT_MS,
} from "./learningIntegrityTurnstile";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
      reset?: (widgetId?: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_ID = "neopolis-turnstile-api";
const WIDGET_UNAVAILABLE_MESSAGE = "Le contrôle de présence ne répond pas. Vérifiez que les défis Cloudflare ne sont pas bloqués, puis relancez la vérification.";
const VERIFICATION_TIMEOUT_MESSAGE = "La validation prend trop de temps. Relancez le contrôle ; vos progrès ne sont pas affectés.";

/** A transparent, risk-triggered presence check shared by courses and exams. */
export function LearningIntegrityGate() {
  const { user } = useAuth();
  const gateQuery = trpc.training.getIntegrityGate.useQuery(undefined, {
    enabled: Boolean(user) && user?.role !== "admin",
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
  const verifyMutation = trpc.training.verifyIntegrityPresence.useMutation();
  const verifyPresenceRef = useRef(verifyMutation.mutate);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  const [renderAttempt, setRenderAttempt] = useState(0);
  const [challengeState, dispatchChallenge] = useReducer(reducePresenceChallenge, initialPresenceChallengeState);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const status = gateQuery.data?.status;
  const refetchGate = gateQuery.refetch;

  useEffect(() => {
    verifyPresenceRef.current = verifyMutation.mutate;
  }, [verifyMutation.mutate]);

  const removeWidget = useCallback(() => {
    if (widgetId.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetId.current);
      } catch {
        // A stale Cloudflare widget can already be detached from the DOM.
      }
    }
    widgetId.current = null;
    if (mountRef.current) mountRef.current.replaceChildren();
  }, []);

  const retryChallenge = useCallback(() => {
    removeWidget();
    dispatchChallenge({ type: "retry" });
    setRenderAttempt((attempt) => attempt + 1);
    void refetchGate();
  }, [refetchGate, removeWidget]);

  useEffect(() => {
    if (status !== "challenge_required") return;
    if (!siteKey) {
      dispatchChallenge({ type: "failed", message: "Le contrôle de présence n’est pas configuré. Contactez l’équipe Neopolis." });
      return;
    }
    if (!mountRef.current) return;

    let disposed = false;
    let apiPoll: number | null = null;
    let widgetWatchdog: number | null = null;
    let verificationWatchdog: number | null = null;

    const clearTimers = () => {
      if (apiPoll !== null) window.clearTimeout(apiPoll);
      if (widgetWatchdog !== null) window.clearTimeout(widgetWatchdog);
      if (verificationWatchdog !== null) window.clearTimeout(verificationWatchdog);
    };

    const fail = (message: string) => {
      if (disposed) return;
      clearTimers();
      dispatchChallenge({ type: "failed", message });
    };

    const renderWidget = () => {
      if (disposed || !mountRef.current || !window.turnstile || widgetId.current) return;
      try {
        widgetId.current = window.turnstile.render(mountRef.current, {
          sitekey: siteKey,
          action: "learning_integrity",
          appearance: "always",
          retry: "never",
          "refresh-expired": "manual",
          callback: (token: string) => {
            if (disposed) return;
            if (widgetWatchdog !== null) window.clearTimeout(widgetWatchdog);
            dispatchChallenge({ type: "verification_started" });
            verificationWatchdog = window.setTimeout(() => fail(VERIFICATION_TIMEOUT_MESSAGE), TURNSTILE_VERIFICATION_TIMEOUT_MS);
            verifyPresenceRef.current(
              { turnstileToken: token },
              {
                onSuccess: async () => {
                  if (disposed) return;
                  clearTimers();
                  dispatchChallenge({ type: "verification_succeeded" });
                  await refetchGate();
                },
                onError: (error) => fail(error.message || "La vérification n’a pas pu être validée. Relancez le contrôle."),
              },
            );
          },
          "error-callback": () => fail("La vérification Cloudflare a échoué. Relancez le contrôle."),
          "expired-callback": () => fail("La vérification a expiré. Relancez le contrôle."),
          "timeout-callback": () => fail(VERIFICATION_TIMEOUT_MESSAGE),
          "unsupported-callback": () => fail("Ce navigateur ne peut pas exécuter la vérification. Désactivez le blocage des défis Cloudflare ou utilisez un autre navigateur."),
        });
        dispatchChallenge({ type: "widget_ready" });
        widgetWatchdog = window.setTimeout(() => fail(WIDGET_UNAVAILABLE_MESSAGE), TURNSTILE_WIDGET_TIMEOUT_MS);
      } catch {
        fail(WIDGET_UNAVAILABLE_MESSAGE);
      }
    };

    const waitForApi = (remainingAttempts = 40) => {
      if (disposed) return;
      if (window.turnstile) {
        renderWidget();
        return;
      }
      if (remainingAttempts <= 0) {
        fail(WIDGET_UNAVAILABLE_MESSAGE);
        return;
      }
      apiPoll = window.setTimeout(() => waitForApi(remainingAttempts - 1), 250);
    };

    const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (!existing) {
      const script = document.createElement("script");
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("error", () => fail(WIDGET_UNAVAILABLE_MESSAGE), { once: true });
      document.head.appendChild(script);
    }
    waitForApi();

    return () => {
      disposed = true;
      clearTimers();
      removeWidget();
    };
  }, [refetchGate, removeWidget, renderAttempt, siteKey, status]);

  if (!user || user.role === "admin" || !status || status === "allow") return null;
  const suspended = status === "temporarily_suspended";
  const waitingForWidget = challengeState.phase === "loading_widget";
  const verifying = challengeState.phase === "verifying";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-4" role="alertdialog" aria-modal="true" aria-labelledby="learning-integrity-title">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl">
        <div className="flex items-start gap-3">
          {suspended ? <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" /> : <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-primary" />}
          <div>
            <h2 id="learning-integrity-title" className="text-lg font-bold">{suspended ? "Validation temporairement suspendue" : "Vérification de présence requise"}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{gateQuery.data?.message}</p>
          </div>
        </div>
        {suspended ? (
          <p className="mt-5 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">Vous pouvez continuer à consulter les cours. Pour toute validation ou passage d’examen, un administrateur doit d’abord examiner le dossier d’intégrité.</p>
        ) : (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-muted-foreground">Cette vérification protège les apprenants et n’accède ni à vos réponses ni au contenu des cours.</p>
            <div ref={mountRef} className="min-h-[65px]" aria-label="Contrôle de présence Cloudflare" />
            {(waitingForWidget || verifying) && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                <Loader2 className="h-4 w-4 animate-spin" />
                {verifying ? "Validation sécurisée en cours…" : "Chargement du contrôle sécurisé…"}
              </p>
            )}
            {challengeState.error && <p className="text-sm text-destructive" role="alert">{challengeState.error}</p>}
            <Button variant="outline" size="sm" onClick={retryChallenge} disabled={verifying}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Relancer la vérification
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
