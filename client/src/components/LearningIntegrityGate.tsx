import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_ID = "neopolis-turnstile-api";

/** A transparent, risk-triggered presence check shared by courses and exams. */
export function LearningIntegrityGate() {
  const { user } = useAuth();
  const gateQuery = trpc.training.getIntegrityGate.useQuery(undefined, {
    enabled: Boolean(user) && user?.role !== "admin",
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
  const verifyMutation = trpc.training.verifyIntegrityPresence.useMutation({ onSuccess: () => gateQuery.refetch() });
  const mountRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  const [widgetError, setWidgetError] = useState("");
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const status = gateQuery.data?.status;

  useEffect(() => {
    if (status !== "challenge_required" || !siteKey || !mountRef.current) return;
    let disposed = false;
    const render = () => {
      if (disposed || !mountRef.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(mountRef.current, {
        sitekey: siteKey,
        action: "learning_integrity",
        callback: (token: string) => verifyMutation.mutate({ turnstileToken: token }),
        "error-callback": () => setWidgetError("La vérification est momentanément indisponible. Réessayez dans quelques instants."),
        "expired-callback": () => setWidgetError("La vérification a expiré. Veuillez la relancer."),
      });
    };
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (window.turnstile) render();
    else if (existing) existing.addEventListener("load", render, { once: true });
    else {
      const script = document.createElement("script");
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", render, { once: true });
      script.addEventListener("error", () => setWidgetError("La vérification est momentanément indisponible. Réessayez dans quelques instants."), { once: true });
      document.head.appendChild(script);
    }
    return () => {
      disposed = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [status, siteKey, verifyMutation]);

  if (!user || user.role === "admin" || !status || status === "allow") return null;
  const suspended = status === "temporarily_suspended";
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
        {suspended ? <p className="mt-5 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">Vous pouvez continuer à consulter les cours. Pour toute validation ou passage d’examen, un administrateur doit d’abord examiner le dossier d’intégrité.</p> : <div className="mt-5 space-y-3"><p className="text-sm text-muted-foreground">Cette vérification protège les apprenants et n’accède ni à vos réponses ni au contenu des cours.</p><div ref={mountRef} className="min-h-[65px]" />{verifyMutation.isPending && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Validation en cours…</p>}{widgetError && <p className="text-sm text-destructive">{widgetError}</p>}<Button variant="outline" size="sm" onClick={() => { setWidgetError(""); gateQuery.refetch(); }}>Actualiser le contrôle</Button></div>}
      </section>
    </div>
  );
}
