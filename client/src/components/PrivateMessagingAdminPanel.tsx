import { useMemo, useState } from "react";
import { Link } from "wouter";
import { MessageCircle, Plus, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { privateConversationDisplaySource, privateConversationDisplayStatus, type PrivateConversationSource } from "@shared/privateMessaging";

type InboxConversation = {
  id: number;
  learnerId: number;
  subject: string;
  status: "open" | "closed";
  source: PrivateConversationSource;
  lastMessageAt: Date | string;
  lastMessagePreview: string | null;
  unreadCount: number;
  learner?: { id: number; name: string | null; email: string | null };
};

type PrivateMessagingAdminPanelProps = {
  learnerId?: number;
  learnerLabel?: string;
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString("fr-FR");
}

export function PrivateMessagingAdminPanel({ learnerId: fixedLearnerId, learnerLabel }: PrivateMessagingAdminPanelProps) {
  const [status, setStatus] = useState<"all" | "open" | "closed">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [body, setBody] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [learnerSearch, setLearnerSearch] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const inboxQuery = trpc.privateMessaging.getAdminInbox.useQuery(
    { status, search: search.trim() || undefined, learnerId: fixedLearnerId, limit: 200 },
    { refetchOnWindowFocus: true },
  );
  const learnersQuery = trpc.admin.getLearners.useQuery(
    { page: 1, pageSize: 50, search: learnerSearch.trim() || undefined, sortBy: "name", sortDirection: "asc" },
    { enabled: composeOpen && !fixedLearnerId },
  );
  const detailQuery = trpc.privateMessaging.getConversation.useQuery(
    { conversationId: selectedId || 1 },
    { enabled: selectedId !== null, refetchOnWindowFocus: true },
  );
  const refresh = () => {
    void inboxQuery.refetch();
    if (selectedId) void detailQuery.refetch();
  };
  const resetComposer = () => {
    setComposeOpen(false);
    setLearnerSearch("");
    setRecipientId("");
    setSubject("");
    setFirstMessage("");
  };
  const sendMutation = trpc.privateMessaging.send.useMutation({
    onSuccess: () => { setBody(""); refresh(); },
    onError: (error) => toast.error(error.message),
  });
  const statusMutation = trpc.privateMessaging.setStatus.useMutation({ onSuccess: refresh, onError: (error) => toast.error(error.message) });
  const createMutation = trpc.privateMessaging.createForLearner.useMutation({
    onSuccess: (result) => {
      resetComposer();
      setSelectedId(result.conversationId);
      void inboxQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  const markRead = trpc.privateMessaging.markRead.useMutation({ onSuccess: refresh });
  const selected = detailQuery.data?.conversation;
  const items = (inboxQuery.data || []) as InboxConversation[];
  const learners = useMemo(() => learnersQuery.data?.users || [], [learnersQuery.data?.users]);
  const targetLearnerId = fixedLearnerId ?? (recipientId ? Number(recipientId) : null);
  const contextTitle = fixedLearnerId ? `Messages de ${learnerLabel || "cet apprenant"}` : "Messagerie privée";
  const contextDescription = fixedLearnerId
    ? "Historique privé lié à cet apprenant. Les communiqués et leurs statistiques restent séparés."
    : "Conversations privées entre un apprenant et l’équipe Neopolis. Les communiqués restent séparés.";

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950"><MessageCircle className="h-5 w-5 text-primary" />{contextTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{contextDescription}</p>
        </div>
        <Button className="gap-2" onClick={() => setComposeOpen(true)}><Plus className="h-4 w-4" />Nouvelle conversation</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.4fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-2 border-b border-slate-100 p-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={fixedLearnerId ? "Rechercher un sujet" : "Rechercher un sujet ou apprenant"} aria-label="Rechercher une conversation" />
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
              <SelectTrigger className="w-full sm:w-32" aria-label="Filtrer les conversations"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">Toutes</SelectItem><SelectItem value="open">Ouvertes</SelectItem><SelectItem value="closed">Fermées</SelectItem></SelectContent>
            </Select>
          </div>
          <p className="px-3 pt-2 text-xs text-slate-500">Les 200 conversations les plus récentes sont affichées.</p>
          <ScrollArea className="h-[480px]">
            <div className="p-2">
              {items.map((item) => (
                <button key={item.id} type="button" aria-pressed={selectedId === item.id} className={`w-full rounded-lg p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedId === item.id ? "bg-primary/10" : "hover:bg-slate-50"}`} onClick={() => { setSelectedId(item.id); markRead.mutate({ conversationId: item.id }); }}>
                  <div className="flex items-center justify-between gap-2"><strong className="truncate text-sm text-slate-900">{item.subject}</strong>{item.unreadCount ? <Badge aria-label={`${item.unreadCount} message${item.unreadCount > 1 ? "s" : ""} non lu${item.unreadCount > 1 ? "s" : ""}`}>{item.unreadCount}</Badge> : null}</div>
                  {!fixedLearnerId ? <p className="mt-1 truncate text-xs text-slate-600">{item.learner?.name || item.learner?.email || "Apprenant"} · {item.lastMessagePreview || "Aucun message"}</p> : <p className="mt-1 truncate text-xs text-slate-600">{item.lastMessagePreview || "Aucun message"}</p>}
                  <p className="mt-1 text-[11px] text-slate-400">{formatDate(item.lastMessageAt)} · {privateConversationDisplayStatus(item.status)} · {privateConversationDisplaySource(item.source)}</p>
                </button>
              ))}
              {!items.length && !inboxQuery.isLoading ? <p className="p-8 text-center text-sm text-slate-500">Aucune conversation ne correspond aux filtres.</p> : null}
              {inboxQuery.isLoading ? <p className="p-8 text-center text-sm text-slate-500">Chargement des conversations…</p> : null}
              {inboxQuery.isError ? <p className="p-5 text-center text-sm text-destructive">La messagerie ne peut pas être chargée pour le moment.</p> : null}
            </div>
          </ScrollArea>
        </section>

        <section className="flex min-h-[540px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          {selectedId === null ? (
            <div className="m-auto max-w-sm p-8 text-center"><MessageCircle className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 font-semibold text-slate-900">Sélectionnez une conversation</h3><p className="mt-1 text-sm text-slate-500">Son historique et les actions de réponse apparaîtront ici.</p></div>
          ) : (
            <>
              <header className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><h3 className="truncate text-base font-semibold text-slate-950">{selected?.subject || "Chargement…"}</h3><p className="mt-1 text-xs text-slate-500">{detailQuery.data?.learner?.name || detailQuery.data?.learner?.email || "Apprenant"}{selected ? ` · ${privateConversationDisplaySource(selected.source)}` : ""}</p>{!fixedLearnerId && detailQuery.data?.learner ? <Link href={`/admin/training?tab=learners&learner=${detailQuery.data.learner.id}`} className="mt-1 inline-block text-xs font-medium text-primary hover:underline">Ouvrir le dossier apprenant</Link> : null}</div>
                  {selected ? <Button variant="outline" size="sm" onClick={() => statusMutation.mutate({ conversationId: selectedId, status: selected.status === "open" ? "closed" : "open" })}>{selected.status === "open" ? "Clore" : "Rouvrir"}</Button> : null}
                </div>
              </header>
              <ScrollArea className="min-h-0 flex-1 px-4 py-4"><div className="space-y-3">{detailQuery.data?.messages.map((message: any) => <article key={message.id} className={`max-w-[85%] rounded-xl px-3 py-2.5 text-sm ${message.authorRole === "admin" ? "ml-auto bg-primary text-primary-foreground" : "bg-slate-100 text-slate-800"}`}><p className="mb-1 text-[11px] font-semibold opacity-80">{message.authorRole === "admin" ? "Équipe Neopolis" : detailQuery.data?.learner?.name || "Apprenant"}</p><p className="whitespace-pre-wrap break-words">{message.body}</p><p className="mt-1 text-[10px] opacity-70">{formatDate(message.createdAt)}</p></article>)}</div></ScrollArea>
              <footer className="border-t border-slate-100 p-3">{selected?.status === "open" ? <><Label className="sr-only" htmlFor="admin-private-message-reply">Réponse</Label><Textarea id="admin-private-message-reply" value={body} onChange={(event) => setBody(event.target.value)} className="min-h-20 resize-none" maxLength={5000} placeholder="Répondre au nom de l’équipe Neopolis…" /><div className="mt-2 flex justify-end"><Button size="sm" className="gap-1.5" disabled={!body.trim() || sendMutation.isPending} onClick={() => sendMutation.mutate({ conversationId: selectedId, body })}>{sendMutation.isPending ? "Envoi…" : "Envoyer"}<Send className="h-3.5 w-3.5" /></Button></div></> : <p className="text-sm text-slate-500">Conversation fermée. L’historique est conservé ; vous pouvez la rouvrir.</p>}</footer>
            </>
          )}
        </section>
      </div>

      <Dialog open={composeOpen} onOpenChange={(open) => open ? setComposeOpen(true) : resetComposer()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle conversation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {fixedLearnerId ? <div className="space-y-2"><Label>Destinataire</Label><Input value={learnerLabel || "Apprenant sélectionné"} readOnly aria-readonly="true" /></div> : <div className="space-y-2"><Label htmlFor="message-learner-search">Destinataire</Label><Input id="message-learner-search" value={learnerSearch} onChange={(event) => setLearnerSearch(event.target.value)} placeholder="Rechercher un apprenant par nom ou e-mail" /><Select value={recipientId} onValueChange={setRecipientId}><SelectTrigger aria-label="Choisir un apprenant"><SelectValue placeholder="Choisir un apprenant" /></SelectTrigger><SelectContent>{learners.map((learner: any) => <SelectItem key={learner.id} value={String(learner.id)}>{learner.name || learner.email || `Apprenant ${learner.id}`}</SelectItem>)}{!learners.length && !learnersQuery.isLoading ? <SelectItem value="no-result" disabled>Aucun apprenant trouvé</SelectItem> : null}</SelectContent></Select></div>}
            <div className="space-y-2"><Label htmlFor="message-subject">Sujet</Label><Input id="message-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={220} /></div>
            <div className="space-y-2"><Label htmlFor="message-first">Premier message</Label><Textarea id="message-first" value={firstMessage} onChange={(event) => setFirstMessage(event.target.value)} maxLength={5000} className="min-h-32" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={resetComposer}>Annuler</Button><Button disabled={!targetLearnerId || subject.trim().length < 3 || !firstMessage.trim() || createMutation.isPending} onClick={() => targetLearnerId && createMutation.mutate({ learnerId: targetLearnerId, subject, body: firstMessage, source: "admin" })}>{createMutation.isPending ? "Création…" : "Créer et envoyer"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
