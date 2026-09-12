import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { MessageCircle, Plus, Send, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { isAdministrativeRole } from "@shared/roles";
import { privateConversationDisplayStatus } from "@shared/privateMessaging";

type ConversationSummary = {
  id: number;
  learnerId: number;
  subject: string;
  status: "open" | "closed";
  lastMessageAt: Date | string;
  lastMessagePreview: string | null;
  unreadCount: number;
  learner?: { id: number; name: string | null; email: string | null };
};

type RealtimeEvent = {
  type?: "conversation.created" | "message.created" | "conversation.status.changed" | "conversation.read";
  conversationId?: number;
};

function dateLabel(value: Date | string) {
  return new Date(value).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function conversationName(summary: ConversationSummary, isAdmin: boolean) {
  return isAdmin ? summary.learner?.name?.trim() || summary.learner?.email || "Apprenant" : "Équipe Neopolis";
}

function ConversationWindow({
  conversationId,
  isAdmin,
  onDismiss,
  onUpdated,
  stackIndex,
  refreshToken,
}: {
  conversationId: number;
  isAdmin: boolean;
  onDismiss: () => void;
  onUpdated: () => void;
  stackIndex: number;
  refreshToken: number;
}) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const detailQuery = trpc.privateMessaging.getConversation.useQuery({ conversationId }, { refetchOnWindowFocus: true });
  const markRead = trpc.privateMessaging.markRead.useMutation();
  const sendMessage = trpc.privateMessaging.send.useMutation({
    onSuccess: async () => {
      setBody("");
      await detailQuery.refetch();
      onUpdated();
    },
    onError: (error) => toast.error(error.message),
  });
  const statusMutation = trpc.privateMessaging.setStatus.useMutation({
    onSuccess: async () => {
      await detailQuery.refetch();
      onUpdated();
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (detailQuery.data) markRead.mutate({ conversationId });
  }, [conversationId, detailQuery.data]);

  useEffect(() => {
    if (refreshToken > 0) void detailQuery.refetch();
  }, [detailQuery, refreshToken]);

  const detail = detailQuery.data;
  const conversation = detail?.conversation;
  const submit = () => {
    if (!body.trim() || sendMessage.isPending || conversation?.status !== "open") return;
    sendMessage.mutate({ conversationId, body });
  };

  return (
    <section
      aria-label={`Conversation ${conversation?.subject || "avec Neopolis"}`}
      className={`fixed inset-x-3 bottom-3 z-[70] flex h-[min(560px,calc(100dvh-1.5rem))] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[390px] ${stackIndex > 0 ? "hidden sm:flex" : ""}`}
      style={{ bottom: `calc(1.25rem + ${stackIndex * 1.5}rem)` }}
    >
      <header className="flex min-w-0 items-start gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-950">{conversation?.subject || "Chargement de la conversation…"}</p><p className="mt-0.5 text-xs text-slate-500">{isAdmin ? detail?.learner?.name || detail?.learner?.email || "Apprenant" : "Équipe Neopolis"} · {conversation ? privateConversationDisplayStatus(conversation.status) : ""}</p></div>
        <Button variant="ghost" size="icon" aria-label="Fermer la fenêtre de conversation" onClick={onDismiss}><X className="h-4 w-4" /></Button>
      </header>
      <ScrollArea className="min-h-0 flex-1 px-4 py-4">
        {detailQuery.isLoading ? <p className="text-sm text-slate-500">Chargement des messages…</p> : null}
        {detailQuery.isError ? <p className="text-sm text-destructive">La conversation est indisponible.</p> : null}
        <div className="space-y-3">
          {detail?.messages.map((message: any) => {
            const mine = message.authorUserId === user?.id || (isAdmin && message.authorRole === "admin");
            const author = message.authorRole === "admin" ? "Équipe Neopolis" : message.authorRole === "system" ? "Neopolis Akademy" : detail?.learner?.name || "Vous";
            return <article key={message.id} className={`max-w-[88%] rounded-xl px-3 py-2.5 text-sm ${mine ? "ml-auto bg-primary text-primary-foreground" : "bg-slate-100 text-slate-800"}`}><p className={`mb-1 text-[11px] font-semibold ${mine ? "text-primary-foreground/80" : "text-slate-500"}`}>{author}</p><p className="whitespace-pre-wrap break-words leading-relaxed">{message.body}</p><p className={`mt-1.5 text-[10px] ${mine ? "text-primary-foreground/75" : "text-slate-400"}`}>{dateLabel(message.createdAt)}</p></article>;
          })}
        </div>
      </ScrollArea>
      <footer className="border-t border-slate-100 bg-white p-3">
        {conversation?.status === "open" ? <><Label htmlFor={`private-message-${conversationId}`} className="sr-only">Votre message</Label><Textarea id={`private-message-${conversationId}`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Écrivez votre message…" className="min-h-20 resize-none" maxLength={5000} onKeyDown={(event) => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); submit(); } }} /><div className="mt-2 flex items-center justify-between gap-2"><Button variant="ghost" size="sm" className="text-slate-600" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ conversationId, status: "closed" })}>Clore</Button><Button size="sm" className="gap-1.5" disabled={!body.trim() || sendMessage.isPending} onClick={submit}>{sendMessage.isPending ? "Envoi…" : "Envoyer"}<Send className="h-3.5 w-3.5" /></Button></div></> : <div className="flex items-center justify-between gap-3"><p className="text-xs text-slate-500">Cette conversation est fermée. Son historique reste consultable.</p><Button size="sm" variant="outline" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ conversationId, status: "open" })}>Rouvrir</Button></div>}
      </footer>
    </section>
  );
}

export function PrivateMessagingOverlay() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAdministrativeRole(user?.role);
  const [pathname, navigate] = useLocation();
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<"message" | "report">("message");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [openConversationIds, setOpenConversationIds] = useState<number[]>([]);
  const [realtimeRevision, setRealtimeRevision] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const reconnectDelayRef = useRef(1_000);
  const recentRealtimeEventRef = useRef<string | null>(null);
  const learnerQuery = trpc.privateMessaging.getMine.useQuery(undefined, { enabled: isAuthenticated && !isAdmin, refetchOnWindowFocus: true });
  const adminQuery = trpc.privateMessaging.getAdminInbox.useQuery({ status: "all", limit: 100 }, { enabled: isAuthenticated && isAdmin, refetchOnWindowFocus: true });
  const createMine = trpc.privateMessaging.createMine.useMutation({
    onSuccess: async (created) => {
      setSubject("");
      setBody("");
      setComposeOpen(false);
      await learnerQuery.refetch();
      setOpenConversationIds((current) => Array.from(new Set([created.conversationId, ...current])).slice(0, 3));
    },
    onError: (error) => toast.error(error.message),
  });
  const refresh = () => { if (isAdmin) void adminQuery.refetch(); else void learnerQuery.refetch(); };

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const connect = () => {
      if (cancelled || socketRef.current?.readyState === WebSocket.OPEN || socketRef.current?.readyState === WebSocket.CONNECTING) return;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const socket = new WebSocket(`${protocol}//${window.location.host}/api/realtime/private-messaging`);
      socketRef.current = socket;
      socket.onopen = () => { reconnectDelayRef.current = 1_000; };
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(String(event.data)) as RealtimeEvent;
          if (!payload.type?.startsWith("conversation.") && !payload.type?.startsWith("message.")) return;
          refresh();
          setRealtimeRevision((revision) => revision + 1);
          const eventKey = `${payload.type}:${payload.conversationId || ""}`;
          if (payload.type === "message.created" && recentRealtimeEventRef.current !== eventKey) {
            recentRealtimeEventRef.current = eventKey;
            toast.info(isAdmin ? "Un apprenant a envoyé un nouveau message." : "L’équipe Neopolis vous a envoyé un nouveau message.");
          }
        } catch { /* Untrusted realtime payload ignored. */ }
      };
      socket.onclose = () => {
        if (socketRef.current === socket) socketRef.current = null;
        if (!cancelled) {
          const delay = reconnectDelayRef.current;
          reconnectDelayRef.current = Math.min(15_000, delay * 2);
          reconnectRef.current = window.setTimeout(connect, delay);
        }
      };
    };
    connect();
    return () => {
      cancelled = true;
      if (reconnectRef.current) window.clearTimeout(reconnectRef.current);
      const socket = socketRef.current;
      if (socket) socket.close();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [isAuthenticated, isAdmin]);

  const conversations = useMemo(() => (isAdmin ? adminQuery.data || [] : learnerQuery.data || []) as ConversationSummary[], [adminQuery.data, isAdmin, learnerQuery.data]);
  const unreadCount = conversations.reduce((total, conversation) => total + Number(conversation.unreadCount || 0), 0);
  const openConversation = (conversationId: number) => {
    setOpenConversationIds((current) => Array.from(new Set([conversationId, ...current])).slice(0, 3));
    setLauncherOpen(false);
  };

  if (!isAuthenticated || (isAdmin && pathname.startsWith("/admin"))) return null;
  const openComposer = (mode: "message" | "report") => { setComposeMode(mode); setSubject(mode === "report" ? "Signalement de problème" : ""); setBody(""); setLauncherOpen(false); setComposeOpen(true); };
  return <>
    <div className="fixed bottom-5 right-5 z-[65] sm:bottom-6 sm:right-6">
      <Button className="h-11 gap-2 rounded-full shadow-lg" onClick={() => setLauncherOpen((value) => !value)} aria-expanded={launcherOpen} aria-controls="private-messaging-launcher"><MessageCircle className="h-4 w-4" />{isAdmin ? "Messages" : "Échanger avec Neopolis"}{unreadCount > 0 ? <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] font-bold text-primary" aria-label={`${unreadCount} messages non lus`}>{unreadCount > 99 ? "99+" : unreadCount}</span> : null}</Button>
      {launcherOpen ? <section id="private-messaging-launcher" className="absolute bottom-14 right-0 flex w-[min(390px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl" aria-label="Conversations privées"><header className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h2 className="text-sm font-semibold text-slate-950">{isAdmin ? "Conversations apprenants" : "Échanger avec Neopolis"}</h2><p className="mt-0.5 text-xs text-slate-500">Historique privé et réponses de l’équipe.</p></div><Button variant="ghost" size="icon" aria-label="Fermer la liste" onClick={() => setLauncherOpen(false)}><X className="h-4 w-4" /></Button></header><ScrollArea className="max-h-80"><div className="p-2">{conversations.map((conversation) => <button key={conversation.id} type="button" onClick={() => openConversation(conversation.id)} className="flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-slate-50"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" style={{ opacity: conversation.unreadCount ? 1 : 0 }} /><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><strong className="truncate text-sm text-slate-900">{conversation.subject}</strong>{conversation.status === "closed" ? <span className="shrink-0 text-[10px] font-medium text-slate-400">Fermée</span> : null}</span><span className="mt-1 block truncate text-xs text-slate-500">{conversationName(conversation, isAdmin)} · {conversation.lastMessagePreview || "Aucun message"}</span><span className="mt-1 block text-[10px] text-slate-400">{dateLabel(conversation.lastMessageAt)}</span></span></button>)}{!conversations.length && !learnerQuery.isLoading && !adminQuery.isLoading ? <p className="px-3 py-6 text-center text-sm text-slate-500">Aucune conversation pour le moment.</p> : null}</div></ScrollArea><footer className="space-y-2 border-t border-slate-100 p-3">{isAdmin ? <Button variant="outline" className="w-full" onClick={() => { setLauncherOpen(false); navigate("/admin?tab=messages"); }}>Gérer les conversations</Button> : <><Button className="w-full gap-2" onClick={() => openComposer("message")}><Plus className="h-4 w-4" />Nouvelle conversation</Button><Button variant="ghost" className="w-full text-slate-600" onClick={() => openComposer("report")}>Signaler un problème</Button></>}</footer></section> : null}
    </div>
    {openConversationIds.map((conversationId, index) => <ConversationWindow key={conversationId} conversationId={conversationId} isAdmin={isAdmin} stackIndex={index} refreshToken={realtimeRevision} onDismiss={() => setOpenConversationIds((current) => current.filter((id) => id !== conversationId))} onUpdated={refresh} />)}
    <Dialog open={composeOpen} onOpenChange={setComposeOpen}><DialogContent><DialogHeader><DialogTitle>{composeMode === "report" ? "Signaler un problème à Neopolis" : "Nouvelle conversation avec Neopolis"}</DialogTitle></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label htmlFor="private-conversation-subject">Sujet</Label><Input id="private-conversation-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={220} placeholder="Ex. Question sur mon parcours" /></div><div className="space-y-2"><Label htmlFor="private-conversation-body">Message</Label><Textarea id="private-conversation-body" value={body} onChange={(event) => setBody(event.target.value)} maxLength={5000} className="min-h-32" placeholder={composeMode === "report" ? "Décrivez le problème rencontré et les étapes concernées…" : "Décrivez votre demande à l’équipe Neopolis…"} /></div></div><DialogFooter><Button variant="outline" onClick={() => setComposeOpen(false)}>Annuler</Button><Button disabled={subject.trim().length < 3 || !body.trim() || createMine.isPending} onClick={() => createMine.mutate({ subject, body, source: composeMode === "report" ? "problem_report" : "learner" })}>{createMine.isPending ? "Création…" : "Ouvrir la conversation"}</Button></DialogFooter></DialogContent></Dialog>
  </>;
}
