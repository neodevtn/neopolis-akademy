import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

/**
 * Acknowledgement-required broadcast shown after authentication and retained across route changes.
 * Its standard Dialog layer intentionally takes priority over the lower cookie-consent banner:
 * the learner must acknowledge the important communication before selecting a cookie preference.
 */
export function ImportantCommunicationLightbox() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const communicationsQuery = trpc.training.getCommunications.useQuery(undefined, { enabled: isAuthenticated, refetchOnWindowFocus: true });
  const refetchCommunications = communicationsQuery.refetch;
  const [acknowledged, setAcknowledged] = useState(false);
  const communication = communicationsQuery.data?.pendingImportant?.[0];
  const acknowledgeMutation = trpc.training.acknowledgeCommunication.useMutation({
    onSuccess: () => { setAcknowledged(false); communicationsQuery.refetch(); },
  });
  const markReadMutation = trpc.training.markCommunicationRead.useMutation({ onSuccess: () => communicationsQuery.refetch() });

  useEffect(() => { setAcknowledged(false); }, [communication?.id]);
  useEffect(() => { if (isAuthenticated) refetchCommunications(); }, [location, isAuthenticated, refetchCommunications]);
  useEffect(() => {
    if (communication && !communication.isRead && !markReadMutation.isPending) markReadMutation.mutate({ communicationId: communication.id });
  }, [communication, markReadMutation]);
  if (!communication) return null;

  return (
    <Dialog open onOpenChange={() => undefined}>
      <DialogContent
        className="flex max-h-[88vh] flex-col overflow-hidden sm:max-w-2xl"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400"><AlertTriangle className="h-5 w-5" /> Communication importante</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-amber-300/70 bg-amber-50/60 p-4 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="text-base font-semibold">{communication.subject}</p>
          <div className="prose prose-sm mt-3 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: communication.body }} />
        </div>
        <label className="flex shrink-0 cursor-pointer items-start gap-3 rounded-md border border-border bg-muted/30 p-3 text-sm">
          <Checkbox checked={acknowledged} onCheckedChange={(value) => setAcknowledged(value === true)} />
          <span><strong>J’accuse réception de ce communiqué.</strong><br /><span className="text-muted-foreground">Cette fenêtre restera affichée lors de votre navigation tant que vous ne l’aurez pas confirmé.</span></span>
        </label>
        <Button className="w-full shrink-0 gap-2" disabled={!acknowledged || acknowledgeMutation.isPending} onClick={() => acknowledgeMutation.mutate({ communicationId: communication.id })}>
          {acknowledgeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Confirmer la réception
        </Button>
      </DialogContent>
    </Dialog>
  );
}
