import { useEffect, useRef, useState } from "react";
import { MessageCircle, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { privateConversationDisplaySource, privateConversationDisplayStatus, type PrivateConversationSource } from "@shared/privateMessaging";

type ConversationSummary = {
  id: number;
  subject: string;
  source: PrivateConversationSource;
  status: "open" | "closed";
  lastMessageAt: Date | string;
  lastMessagePreview: string | null;
  unreadCount: number;
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString("fr-FR");
}

export function PrivateMessagingLearnerPanel() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<"message" | "report">("message");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const lastMarkedConversationRef = useRef<number | null>(null);
  const conversationsQuery = trpc.privateMessaging.getMine.useQuery(undefined, { refetchOnWindowFocus: true });
  const detailQuery = trpc.privateMessaging.getConversation.useQuery(
    { conversationId: selectedId || 1 },
    { enabled: selectedId !== null, refetchOnWindowFocus: true },
  );
  const refresh = () => {
    void conversationsQuery.refetch();
    if (selectedId) void detailQuery.refetch();
  };
  const markReadMutation = trpc.privateMessaging.markRead.useMutation({ onSuccess: refresh });
  const sendMutation = trpc.privateMessaging.send.useMutation({
    onSuccess: () => { setReply(""); refresh(); },
    onError: (error) => toast.error(error.message),
  });
  const statusMutation = trpc.privateMessaging.setStatus.useMutation({ onSuccess: refresh, onError: (error) => toast.error(error.message) });
  const createMutation = trpc.privateMessaging.createMine.useMutation({
    onSuccess: (created) => {
      setComposeOpen(false);
      setSubject("");
      setBody("");
      setSelectedId(created.conversationId);
      void conversationsQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (!detailQuery.data || selectedId === null || lastMarkedConversationRef.current === selectedId) return;
    lastMarkedConversationRef.current = selectedId;
    markReadMutation.mutate({ conversationId: selectedId });
  }, [detailQuery.data, markReadMutation, selectedId]);

  const conversations = (conversationsQuery.data || []) as ConversationSummary[];
  const selected = detailQuery.data?.conversation;
  const resetComposer = () => { setComposeOpen(false); setSubject(""); setBody(""); };
  const openComposer = (mode: "message" | "report") => {
    setComposeMode(mode);
    setSubject(mode === "report" ? "Signalement de problème" : "");
    setBody("");
    setComposeOpen(true);
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground"><MessageCircle className="h-5 w-5 text-primary" />Échanger avec Neopolis</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Historique privé de vos conversations avec l’équipe Neopolis. Les communiqués généraux restent dans leur onglet dédié.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row"><Button variant="outline" onClick={() => openComposer("report")}>Signaler un problème</Button><Button className="gap-2" onClick={() => openComposer("message")}><Plus className="h-4 w-4" />Nouvelle conversation</Button></div>
      </header>
      <div className="grid gap-4 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.4fr)]">
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3"><h3 className="text-sm font-semibold text-foreground">Vos sujets</h3><p className="mt-1 text-xs text-muted-foreground">Ouvrez un fil pour consulter son historique ou répondre.</p></div>
          <ScrollArea className="h-[480px]"><div className="p-2">
            {conversations.map((conversation) => <button key={conversation.id} type="button" aria-pressed={selectedId === conversation.id} className={`w-full rounded-lg p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedId === conversation.id ? "bg-primary/10" : "hover:bg-muted/60"}`} onClick={() => { lastMarkedConversationRef.current = null; setSelectedId(conversation.id); }}><div className="flex items-center justify-between gap-2"><strong className="truncate text-sm text-foreground">{conversation.subject}</strong>{conversation.unreadCount ? <Badge aria-label={`${conversation.unreadCount} message${conversation.unreadCount > 1 ? "s" : ""} non lu${conversation.unreadCount > 1 ? "s" : ""}`}>{conversation.unreadCount}</Badge> : null}</div><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{conversation.lastMessagePreview || "Aucun message"}</p><p className="mt-1 text-[11px] text-muted-foreground">{formatDate(conversation.lastMessageAt)} · {privateConversationDisplayStatus(conversation.status)} · {privateConversationDisplaySource(conversation.source)}</p></button>)}
            {!conversations.length && !conversationsQuery.isLoading ? <p className="p-8 text-center text-sm text-muted-foreground">Aucune conversation pour le moment.</p> : null}
            {conversationsQuery.isLoading ? <p className="p-8 text-center text-sm text-muted-foreground">Chargement des conversations…</p> : null}
            {conversationsQuery.isError ? <p className="p-5 text-center text-sm text-destructive">La messagerie ne peut pas être chargée pour le moment.</p> : null}
          </div></ScrollArea>
        </section>
        <section className="flex min-h-[540px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {selectedId === null ? <div className="m-auto max-w-sm p-8 text-center"><MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/40" /><h3 className="mt-3 font-semibold text-foreground">Sélectionnez une conversation</h3><p className="mt-1 text-sm text-muted-foreground">L’historique et les actions de réponse seront affichés ici.</p></div> : <><header className="border-b border-border px-4 py-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-base font-semibold text-foreground">{selected?.subject || "Chargement…"}</h3><p className="mt-1 text-xs text-muted-foreground">Équipe Neopolis{selected ? ` · ${privateConversationDisplaySource(selected.source)}` : ""}</p></div>{selected ? <Button variant="outline" size="sm" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ conversationId: selectedId, status: selected.status === "open" ? "closed" : "open" })}>{selected.status === "open" ? "Clore" : "Rouvrir"}</Button> : null}</div></header><ScrollArea className="min-h-0 flex-1 px-4 py-4"><div className="space-y-3">{detailQuery.isLoading ? <p className="text-sm text-muted-foreground">Chargement des messages…</p> : null}{detailQuery.isError ? <p className="text-sm text-destructive">Cette conversation est indisponible.</p> : null}{detailQuery.data?.messages.map((message: any) => <article key={message.id} className={`max-w-[88%] rounded-xl px-3 py-2.5 text-sm ${message.authorRole === "learner" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}><p className="mb-1 text-[11px] font-semibold opacity-80">{message.authorRole === "learner" ? "Vous" : "Équipe Neopolis"}</p><p className="whitespace-pre-wrap break-words leading-relaxed">{message.body}</p><p className="mt-1.5 text-[10px] opacity-70">{formatDate(message.createdAt)}</p></article>)}</div></ScrollArea><footer className="border-t border-border p-3">{selected?.status === "open" ? <><Label className="sr-only" htmlFor="learner-private-message-reply">Votre réponse</Label><Textarea id="learner-private-message-reply" value={reply} onChange={(event) => setReply(event.target.value)} className="min-h-20 resize-none" maxLength={5000} placeholder="Écrivez votre message à l’équipe Neopolis…" /><div className="mt-2 flex justify-end"><Button size="sm" className="gap-1.5" disabled={!reply.trim() || sendMutation.isPending} onClick={() => sendMutation.mutate({ conversationId: selectedId, body: reply })}>{sendMutation.isPending ? "Envoi…" : "Envoyer"}<Send className="h-3.5 w-3.5" /></Button></div></> : <p className="text-sm text-muted-foreground">Cette conversation est fermée. Son historique est conservé ; vous pouvez la rouvrir si nécessaire.</p>}</footer></>}
        </section>
      </div>
      <Dialog open={composeOpen} onOpenChange={(open) => open ? setComposeOpen(true) : resetComposer()}><DialogContent><DialogHeader><DialogTitle>{composeMode === "report" ? "Signaler un problème à Neopolis" : "Nouvelle conversation avec Neopolis"}</DialogTitle></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label htmlFor="learner-private-subject">Sujet</Label><Input id="learner-private-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={220} placeholder="Ex. Question sur mon parcours" /></div><div className="space-y-2"><Label htmlFor="learner-private-body">Message</Label><Textarea id="learner-private-body" value={body} onChange={(event) => setBody(event.target.value)} maxLength={5000} className="min-h-32" placeholder={composeMode === "report" ? "Décrivez le problème rencontré et les étapes concernées…" : "Décrivez votre demande à l’équipe Neopolis…"} /></div></div><DialogFooter><Button variant="outline" onClick={resetComposer}>Annuler</Button><Button disabled={subject.trim().length < 3 || !body.trim() || createMutation.isPending} onClick={() => createMutation.mutate({ subject, body, source: composeMode === "report" ? "problem_report" : "learner" })}>{createMutation.isPending ? "Création…" : "Ouvrir la conversation"}</Button></DialogFooter></DialogContent></Dialog>
    </section>
  );
}
