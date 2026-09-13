import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { privateConversationDisplayStatus, privateMessageIsUnreadForAudience } from "@shared/privateMessaging";
import { PrivateMessagingNotificationCenter } from "@/components/PrivateMessagingNotificationCenter";
import { PrivateMessageAttachmentPicker, type PendingPrivateMessageAttachment } from "@/components/PrivateMessageAttachmentPicker";
import { PrivateMessageBubble, PrivateUnreadDivider, type PrivateMessageView } from "@/components/PrivateMessageContent";
import { usePrivateConversationViewport } from "@/hooks/usePrivateConversationViewport";
import { usePrivateMessageChime } from "@/hooks/usePrivateMessageChime";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORT_HUB_EVENT, type SupportHubEventDetail } from "@/lib/supportHub";

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

function dateLabel(value: Date | string, lang: "fr" | "en" | "ar") {
  return new Date(value).toLocaleString(lang === "ar" ? "ar" : lang === "en" ? "en-GB" : "fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function conversationName(summary: ConversationSummary, isAdmin: boolean, fallbackLearner: string, team: string) {
  return isAdmin ? summary.learner?.name?.trim() || summary.learner?.email || fallbackLearner : team;
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
  const { lang, t } = useLanguage();
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<PendingPrivateMessageAttachment[]>([]);
  const detailQuery = trpc.privateMessaging.getConversation.useQuery({ conversationId }, { refetchOnWindowFocus: true });
  const markRead = trpc.privateMessaging.markRead.useMutation({ onSuccess: onUpdated });
  const sendMessage = trpc.privateMessaging.send.useMutation({
    onSuccess: async () => {
      setBody("");
      setAttachments([]);
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
    if (refreshToken > 0) void detailQuery.refetch();
  }, [detailQuery, refreshToken]);

  const detail = detailQuery.data;
  const conversation = detail?.conversation;
  const audience = isAdmin ? "admin" : "learner";
  const unreadMessages = (detail?.messages || []).filter((message: PrivateMessageView) => privateMessageIsUnreadForAudience(message, audience));
  const firstUnreadMessageId = unreadMessages[0]?.id ?? null;
  const pendingOutgoingMessage: PrivateMessageView | null = sendMessage.isPending ? {
    id: -conversationId,
    authorUserId: user?.id ?? null,
    authorRole: isAdmin ? "admin" : "learner",
    body: body || t({ fr: "Pièce jointe en cours d’envoi…", en: "Attachment sending…", ar: "جارٍ إرسال المرفق…" }),
    createdAt: new Date(),
    learnerDeliveredAt: null,
    adminDeliveredAt: null,
    learnerReadAt: isAdmin ? null : new Date(),
    adminReadAt: isAdmin ? new Date() : null,
  } : null;
  const latestMessageId = detail?.messages.at(-1)?.id ?? null;
  const { scrollAreaRef, bottomRef, scrollToLatest } = usePrivateConversationViewport({
    conversationId,
    latestMessageId,
    onLatestMessageVisible: (id) => markRead.mutate({ conversationId: id }),
  });
  const submit = () => {
    if ((!body.trim() && !attachments.length) || sendMessage.isPending || conversation?.status !== "open") return;
    sendMessage.mutate({ conversationId, body, attachments: attachments.map(({ filename, mimeType, base64 }) => ({ filename, mimeType, base64 })) });
    scrollToLatest();
  };

  return (
    <section
      aria-label={`${t({ fr: "Conversation", en: "Conversation", ar: "محادثة" })} ${conversation?.subject || t({ fr: "avec Neopolis", en: "with Neopolis", ar: "مع نيوبوليس" })}`}
      className={`fixed inset-x-3 bottom-3 z-[70] flex h-[min(560px,calc(100dvh-1.5rem))] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[390px] ${stackIndex > 0 ? "hidden sm:flex" : ""}`}
      style={{ bottom: `calc(1.25rem + ${stackIndex * 1.5}rem)` }}
    >
      <header className="flex min-w-0 items-start gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-950">{conversation?.subject || t({ fr: "Chargement de la conversation…", en: "Loading conversation…", ar: "جارٍ تحميل المحادثة…" })}</p><p className="mt-0.5 text-xs text-slate-500">{isAdmin ? detail?.learner?.name || detail?.learner?.email || t({ fr: "Apprenant", en: "Learner", ar: "متعلم" }) : t({ fr: "Équipe Neopolis", en: "Neopolis team", ar: "فريق نيوبوليس" })} · {conversation ? privateConversationDisplayStatus(conversation.status, lang) : ""}</p></div>
        <Button variant="ghost" size="icon" aria-label={t({ fr: "Fermer la fenêtre de conversation", en: "Close conversation window", ar: "إغلاق نافذة المحادثة" })} onClick={onDismiss}><X className="h-4 w-4" /></Button>
      </header>
      <ScrollArea ref={scrollAreaRef} className="min-h-0 flex-1 px-4 py-4">
        {detailQuery.isLoading ? <p className="text-sm text-slate-500">{t({ fr: "Chargement des messages…", en: "Loading messages…", ar: "جارٍ تحميل الرسائل…" })}</p> : null}
        {detailQuery.isError ? <p className="text-sm text-destructive">{t({ fr: "La conversation est indisponible.", en: "This conversation is unavailable.", ar: "هذه المحادثة غير متاحة." })}</p> : null}
        <div className="space-y-3">
          {detail?.messages.map((message: PrivateMessageView) => {
            const mine = message.authorUserId === user?.id || (isAdmin && message.authorRole === "admin");
            const author = message.authorRole === "admin" ? t({ fr: "Équipe Neopolis", en: "Neopolis team", ar: "فريق نيوبوليس" }) : message.authorRole === "system" ? "Neopolis Akademy" : detail?.learner?.name || t({ fr: "Vous", en: "You", ar: "أنت" });
            return <Fragment key={message.id}>{message.id === firstUnreadMessageId ? <PrivateUnreadDivider count={unreadMessages.length} /> : null}<PrivateMessageBubble message={message} mine={mine} isUnread={privateMessageIsUnreadForAudience(message, audience)} author={author} dateLabel={(value) => dateLabel(value, lang)} /></Fragment>;
          })}
          {pendingOutgoingMessage ? <PrivateMessageBubble message={pendingOutgoingMessage} mine author={isAdmin ? t({ fr: "Équipe Neopolis", en: "Neopolis team", ar: "فريق نيوبوليس" }) : t({ fr: "Vous", en: "You", ar: "أنت" })} dateLabel={(value) => dateLabel(value, lang)} isSending /> : null}
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </ScrollArea>
      <footer className="border-t border-slate-100 bg-white p-3">
        {conversation?.status === "open" ? <><Label htmlFor={`private-message-${conversationId}`} className="sr-only">{t({ fr: "Votre message", en: "Your message", ar: "رسالتك" })}</Label><Textarea id={`private-message-${conversationId}`} value={body} onChange={(event) => setBody(event.target.value)} placeholder={t({ fr: "Écrivez votre message…", en: "Write your message…", ar: "اكتب رسالتك…" })} className="min-h-20 resize-none" maxLength={5000} onKeyDown={(event) => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); submit(); } }} /><PrivateMessageAttachmentPicker attachments={attachments} onChange={setAttachments} disabled={sendMessage.isPending} /><div className="mt-2 flex items-center justify-between gap-2"><Button variant="ghost" size="sm" className="text-slate-600" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ conversationId, status: "closed" })}>{t({ fr: "Clôturer", en: "Close", ar: "إغلاق" })}</Button><Button size="sm" className="gap-1.5" disabled={(!body.trim() && !attachments.length) || sendMessage.isPending} onClick={submit}>{sendMessage.isPending ? t({ fr: "Envoi…", en: "Sending…", ar: "جارٍ الإرسال…" }) : t({ fr: "Envoyer", en: "Send", ar: "إرسال" })}<Send className="h-3.5 w-3.5" /></Button></div></> : <div className="flex items-center justify-between gap-3"><p className="text-xs text-slate-500">{t({ fr: "Cette conversation est fermée. Son historique reste consultable.", en: "This conversation is closed. Its history remains available.", ar: "هذه المحادثة مغلقة. يبقى سجلها متاحًا." })}</p><Button size="sm" variant="outline" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ conversationId, status: "open" })}>{t({ fr: "Rouvrir", en: "Reopen", ar: "إعادة الفتح" })}</Button></div>}
      </footer>
    </section>
  );
}

export function PrivateMessagingOverlay() {
  const { isAuthenticated, user } = useAuth();
  const { lang, t } = useLanguage();
  const isAdmin = isAdministrativeRole(user?.role);
  const [pathname, navigate] = useLocation();
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<"message" | "report">("message");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [composeAttachments, setComposeAttachments] = useState<PendingPrivateMessageAttachment[]>([]);
  const [openConversationIds, setOpenConversationIds] = useState<number[]>([]);
  const [realtimeRevision, setRealtimeRevision] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const reconnectDelayRef = useRef(1_000);
  const recentRealtimeEventRef = useRef<string | null>(null);
  const learnerQuery = trpc.privateMessaging.getMine.useQuery(undefined, { enabled: isAuthenticated && !isAdmin, refetchOnWindowFocus: true });
  const adminQuery = trpc.privateMessaging.getAdminInbox.useQuery({ status: "all", page: 1, pageSize: 50 }, { enabled: isAuthenticated && isAdmin, refetchOnWindowFocus: true });
  const notificationPreferencesQuery = trpc.privateMessaging.getNotificationPreferences.useQuery(undefined, { enabled: isAuthenticated, refetchOnWindowFocus: true });
  const { prime: primeNotificationSound, play: playNotificationSound } = usePrivateMessageChime(Boolean(notificationPreferencesQuery.data?.soundEnabled));
  const createMine = trpc.privateMessaging.createMine.useMutation({
    onSuccess: async (created) => {
      setSubject("");
      setBody("");
      setComposeAttachments([]);
      setComposeOpen(false);
      await learnerQuery.refetch();
      setOpenConversationIds((current) => Array.from(new Set([created.conversationId, ...current])).slice(0, 3));
    },
    onError: (error) => toast.error(error.message),
  });
  const refresh = () => { if (isAdmin) void adminQuery.refetch(); else void learnerQuery.refetch(); };
  const openComposer = useCallback((mode: "message" | "report") => {
    setComposeMode(mode);
    setSubject(mode === "report" ? t({ fr: "Signalement de problème", en: "Problem report", ar: "الإبلاغ عن مشكلة" }) : "");
    setBody("");
    setComposeAttachments([]);
    setLauncherOpen(false);
    setComposeOpen(true);
  }, [t]);

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
            playNotificationSound();
            toast.info(isAdmin ? t({ fr: "Un apprenant a envoyé un nouveau message.", en: "A learner sent a new message.", ar: "أرسل متعلم رسالة جديدة." }) : t({ fr: "L’équipe Neopolis vous a envoyé un nouveau message.", en: "The Neopolis team sent you a new message.", ar: "أرسل لك فريق نيوبوليس رسالة جديدة." }));
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
  }, [isAuthenticated, isAdmin, playNotificationSound]);

  useEffect(() => {
    const primeOnFirstInteraction = () => { void primeNotificationSound(); };
    window.addEventListener("pointerdown", primeOnFirstInteraction, { once: true, passive: true });
    return () => window.removeEventListener("pointerdown", primeOnFirstInteraction);
  }, [primeNotificationSound]);

  useEffect(() => {
    const handleSupportAction = (event: Event) => {
      const detail = (event as CustomEvent<SupportHubEventDetail>).detail;
      if (!detail || isAdmin) return;
      if (detail.action === "open-conversations") setLauncherOpen(true);
      if (detail.action === "open-conversation" && detail.conversationId) {
        setOpenConversationIds((current) => Array.from(new Set([detail.conversationId!, ...current])).slice(0, 3));
      }
      if (detail.action === "new-conversation") openComposer("message");
      if (detail.action === "report-technical-issue") openComposer("report");
    };
    window.addEventListener(SUPPORT_HUB_EVENT, handleSupportAction);
    return () => window.removeEventListener(SUPPORT_HUB_EVENT, handleSupportAction);
  }, [isAdmin, openComposer]);

  const conversations = useMemo(() => (isAdmin ? adminQuery.data?.items || [] : learnerQuery.data || []) as ConversationSummary[], [adminQuery.data, isAdmin, learnerQuery.data]);
  const unreadCount = conversations.reduce((total, conversation) => total + Number(conversation.unreadCount || 0), 0);
  const openConversation = (conversationId: number) => {
    setOpenConversationIds((current) => Array.from(new Set([conversationId, ...current])).slice(0, 3));
    setLauncherOpen(false);
  };

  if (!isAuthenticated || (isAdmin && pathname.startsWith("/admin"))) return null;
  return <>
    <div className="fixed bottom-5 right-5 z-[65] flex items-center gap-2 sm:bottom-6 sm:right-6">
      <span className="hidden"><PrivateMessagingNotificationCenter isAdmin={isAdmin} onOpenConversation={openConversation} /></span>
      <div className="relative">
      <Button className="hidden" tabIndex={-1} aria-hidden="true" onClick={() => setLauncherOpen((value) => !value)} aria-expanded={launcherOpen} aria-controls="private-messaging-launcher"><MessageCircle className="h-4 w-4" />{isAdmin ? t({ fr: "Messages", en: "Messages", ar: "الرسائل" }) : t({ fr: "Échanger avec Neopolis", en: "Chat with Neopolis", ar: "تواصل مع نيوبوليس" })}{unreadCount > 0 ? <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] font-bold text-primary" aria-label={t({ fr: `${unreadCount} messages non lus`, en: `${unreadCount} unread messages`, ar: `${unreadCount} رسائل غير مقروءة` })}>{unreadCount > 99 ? "99+" : unreadCount}</span> : null}</Button>
      {launcherOpen ? <section id="private-messaging-launcher" className="absolute bottom-14 right-0 flex w-[min(390px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl" aria-label={t({ fr: "Conversations privées", en: "Private conversations", ar: "المحادثات الخاصة" })}><header className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h2 className="text-sm font-semibold text-slate-950">{isAdmin ? t({ fr: "Conversations apprenants", en: "Learner conversations", ar: "محادثات المتعلمين" }) : t({ fr: "Échanger avec Neopolis", en: "Chat with Neopolis", ar: "تواصل مع نيوبوليس" })}</h2><p className="mt-0.5 text-xs text-slate-500">{t({ fr: "Historique privé et réponses de l’équipe.", en: "Private history and team replies.", ar: "سجل خاص وردود الفريق." })}</p></div><Button variant="ghost" size="icon" aria-label={t({ fr: "Fermer la liste", en: "Close list", ar: "إغلاق القائمة" })} onClick={() => setLauncherOpen(false)}><X className="h-4 w-4" /></Button></header><ScrollArea className="max-h-80"><div className="p-2">{conversations.map((conversation) => { const hasUnread = conversation.unreadCount > 0; return <button key={conversation.id} type="button" data-conversation-read-state={hasUnread ? "unread" : "read"} onClick={() => openConversation(conversation.id)} className={`flex w-full items-start gap-3 rounded-lg p-3 text-left ${hasUnread ? "border border-amber-300 bg-amber-50 shadow-sm hover:bg-amber-100" : "hover:bg-slate-50"}`}><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${hasUnread ? "bg-amber-600" : "bg-transparent"}`} aria-hidden="true" /><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><strong className={`truncate text-sm text-slate-900 ${hasUnread ? "font-bold" : "font-semibold"}`}>{conversation.subject}</strong>{conversation.status === "closed" ? <span className="shrink-0 text-[10px] font-medium text-slate-400">{privateConversationDisplayStatus("closed", lang)}</span> : null}</span><span className={`mt-1 block truncate text-xs ${hasUnread ? "font-medium text-slate-800" : "text-slate-500"}`}>{conversationName(conversation, isAdmin, t({ fr: "Apprenant", en: "Learner", ar: "متعلم" }), t({ fr: "Équipe Neopolis", en: "Neopolis team", ar: "فريق نيوبوليس" }))} · {conversation.lastMessagePreview || t({ fr: "Aucun message", en: "No message", ar: "لا توجد رسالة" })}</span><span className="mt-1 block text-[10px] text-slate-400">{dateLabel(conversation.lastMessageAt, lang)}</span></span>{hasUnread ? <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white" aria-label={t({ fr: `${conversation.unreadCount} messages non lus`, en: `${conversation.unreadCount} unread messages`, ar: `${conversation.unreadCount} رسائل غير مقروءة` })}>{conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}</span> : <span className="text-[10px] font-medium text-emerald-700">{t({ fr: "Lu", en: "Read", ar: "مقروء" })}</span>}</button>; })}{!conversations.length && !learnerQuery.isLoading && !adminQuery.isLoading ? <p className="px-3 py-6 text-center text-sm text-slate-500">{t({ fr: "Aucune conversation pour le moment.", en: "No conversations yet.", ar: "لا توجد محادثات حتى الآن." })}</p> : null}</div></ScrollArea><footer className="space-y-2 border-t border-slate-100 p-3">{isAdmin ? <Button variant="outline" className="w-full" onClick={() => { setLauncherOpen(false); navigate("/admin?tab=messages"); }}>{t({ fr: "Gérer les conversations", en: "Manage conversations", ar: "إدارة المحادثات" })}</Button> : <><Button className="w-full gap-2" onClick={() => openComposer("message")}><Plus className="h-4 w-4" />{t({ fr: "Nouvelle conversation", en: "New conversation", ar: "محادثة جديدة" })}</Button><Button variant="ghost" className="w-full text-slate-600" onClick={() => openComposer("report")}>{t({ fr: "Signaler un problème", en: "Report a problem", ar: "الإبلاغ عن مشكلة" })}</Button></>}</footer></section> : null}
      </div>
    </div>
    {openConversationIds.map((conversationId, index) => <ConversationWindow key={conversationId} conversationId={conversationId} isAdmin={isAdmin} stackIndex={index} refreshToken={realtimeRevision} onDismiss={() => setOpenConversationIds((current) => current.filter((id) => id !== conversationId))} onUpdated={refresh} />)}
    <Dialog open={composeOpen} onOpenChange={setComposeOpen}><DialogContent><DialogHeader><DialogTitle>{composeMode === "report" ? t({ fr: "Signaler un problème à Neopolis", en: "Report a problem to Neopolis", ar: "الإبلاغ عن مشكلة إلى نيوبوليس" }) : t({ fr: "Nouvelle conversation avec Neopolis", en: "New conversation with Neopolis", ar: "محادثة جديدة مع نيوبوليس" })}</DialogTitle></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label htmlFor="private-conversation-subject">{t({ fr: "Sujet", en: "Subject", ar: "الموضوع" })}</Label><Input id="private-conversation-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={220} placeholder={t({ fr: "Ex. Question sur mon parcours", en: "E.g. Question about my learning path", ar: "مثال: سؤال حول مسار التعلم" })} /></div><div className="space-y-2"><Label htmlFor="private-conversation-body">{t({ fr: "Message", en: "Message", ar: "الرسالة" })}</Label><Textarea id="private-conversation-body" value={body} onChange={(event) => setBody(event.target.value)} maxLength={5000} className="min-h-32" placeholder={composeMode === "report" ? t({ fr: "Décrivez le problème rencontré et les étapes concernées…", en: "Describe the problem and the related steps…", ar: "صف المشكلة والخطوات المعنية…" }) : t({ fr: "Décrivez votre demande à l’équipe Neopolis…", en: "Describe your request to the Neopolis team…", ar: "صف طلبك لفريق نيوبوليس…" })} /><PrivateMessageAttachmentPicker attachments={composeAttachments} onChange={setComposeAttachments} disabled={createMine.isPending} /></div></div><DialogFooter><Button variant="outline" onClick={() => setComposeOpen(false)}>{t({ fr: "Annuler", en: "Cancel", ar: "إلغاء" })}</Button><Button disabled={subject.trim().length < 3 || (!body.trim() && !composeAttachments.length) || createMine.isPending} onClick={() => createMine.mutate({ subject, body, attachments: composeAttachments.map(({ filename, mimeType, base64 }) => ({ filename, mimeType, base64 })), source: composeMode === "report" ? "problem_report" : "learner" })}>{createMine.isPending ? t({ fr: "Création…", en: "Creating…", ar: "جارٍ الإنشاء…" }) : t({ fr: "Ouvrir la conversation", en: "Open conversation", ar: "فتح المحادثة" })}</Button></DialogFooter></DialogContent></Dialog>
  </>;
}
