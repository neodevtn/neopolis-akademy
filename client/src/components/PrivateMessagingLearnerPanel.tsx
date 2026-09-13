import { Fragment, useState } from "react";
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
import { PrivateMessageAttachmentPicker, type PendingPrivateMessageAttachment } from "@/components/PrivateMessageAttachmentPicker";
import { PrivateMessageBubble, PrivateUnreadDivider, type PrivateMessageView } from "@/components/PrivateMessageContent";
import { privateConversationDisplaySource, privateConversationDisplayStatus, privateMessageIsUnreadForAudience, type PrivateConversationSource } from "@shared/privateMessaging";
import { usePrivateConversationViewport } from "@/hooks/usePrivateConversationViewport";
import { useLanguage } from "@/contexts/LanguageContext";

type ConversationSummary = {
  id: number;
  subject: string;
  source: PrivateConversationSource;
  status: "open" | "closed";
  lastMessageAt: Date | string;
  lastMessagePreview: string | null;
  unreadCount: number;
};

function formatDate(value: Date | string, lang: "fr" | "en" | "ar") {
  return new Date(value).toLocaleString(lang === "ar" ? "ar" : lang === "en" ? "en-GB" : "fr-FR");
}

export function PrivateMessagingLearnerPanel() {
  const { lang, t } = useLanguage();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<PendingPrivateMessageAttachment[]>([]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<"message" | "report">("message");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [composeAttachments, setComposeAttachments] = useState<PendingPrivateMessageAttachment[]>([]);
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
    onSuccess: () => { setReply(""); setReplyAttachments([]); refresh(); },
    onError: (error) => toast.error(error.message),
  });
  const statusMutation = trpc.privateMessaging.setStatus.useMutation({ onSuccess: refresh, onError: (error) => toast.error(error.message) });
  const createMutation = trpc.privateMessaging.createMine.useMutation({
    onSuccess: (created) => {
      setComposeOpen(false);
      setSubject("");
      setBody("");
      setComposeAttachments([]);
      setSelectedId(created.conversationId);
      void conversationsQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const conversations = (conversationsQuery.data || []) as ConversationSummary[];
  const selected = detailQuery.data?.conversation;
  const unreadMessages = (detailQuery.data?.messages || []).filter((message: PrivateMessageView) => privateMessageIsUnreadForAudience(message, "learner"));
  const firstUnreadMessageId = unreadMessages[0]?.id ?? null;
  const pendingReplyMessage: PrivateMessageView | null = sendMutation.isPending ? {
    id: -1,
    authorUserId: null,
    authorRole: "learner",
    body: reply || t({ fr: "Pièce jointe en cours d’envoi…", en: "Attachment sending…", ar: "جارٍ إرسال المرفق…" }),
    createdAt: new Date(),
    learnerDeliveredAt: null,
    adminDeliveredAt: null,
    learnerReadAt: new Date(),
    adminReadAt: null,
  } : null;
  const latestMessageId = detailQuery.data?.messages.at(-1)?.id ?? null;
  const { scrollAreaRef, bottomRef, scrollToLatest } = usePrivateConversationViewport({
    conversationId: selectedId || 1,
    latestMessageId,
    onLatestMessageVisible: (conversationId) => markReadMutation.mutate({ conversationId }),
  });
  const resetComposer = () => { setComposeOpen(false); setSubject(""); setBody(""); setComposeAttachments([]); };
  const openComposer = (mode: "message" | "report") => {
    setComposeMode(mode);
    setSubject(mode === "report" ? t({ fr: "Signalement de problème", en: "Problem report", ar: "الإبلاغ عن مشكلة" }) : "");
    setBody("");
    setComposeAttachments([]);
    setComposeOpen(true);
  };
  const sendReply = () => {
    if (selectedId === null || (!reply.trim() && !replyAttachments.length)) return;
    sendMutation.mutate({
      conversationId: selectedId,
      body: reply,
      attachments: replyAttachments.map(({ filename, mimeType, base64 }) => ({ filename, mimeType, base64 })),
    });
    scrollToLatest();
  };

  return <section className="space-y-5">
    <header className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground"><MessageCircle className="h-5 w-5 text-primary" />{t({ fr: "Échanger avec Neopolis", en: "Chat with Neopolis", ar: "تواصل مع نيوبوليس" })}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t({ fr: "Historique privé de vos conversations avec l’équipe Neopolis. Les communiqués généraux restent dans leur onglet dédié.", en: "Private history of your conversations with the Neopolis team. General announcements remain in their dedicated tab.", ar: "السجل الخاص لمحادثاتك مع فريق نيوبوليس. تبقى الإعلانات العامة في علامتها المخصصة." })}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row"><Button variant="outline" onClick={() => openComposer("report")}>{t({ fr: "Signaler un problème", en: "Report a problem", ar: "الإبلاغ عن مشكلة" })}</Button><Button className="gap-2" onClick={() => openComposer("message")}><Plus className="h-4 w-4" />{t({ fr: "Nouvelle conversation", en: "New conversation", ar: "محادثة جديدة" })}</Button></div>
    </header>
    <div className="grid gap-4 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.4fr)]">
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3"><h3 className="text-sm font-semibold text-foreground">{t({ fr: "Vos sujets", en: "Your topics", ar: "مواضيعك" })}</h3><p className="mt-1 text-xs text-muted-foreground">{t({ fr: "Ouvrez un fil pour consulter son historique ou répondre.", en: "Open a thread to view its history or reply.", ar: "افتح محادثة للاطلاع على سجلها أو الرد." })}</p></div>
        <ScrollArea className="h-[480px]"><div className="p-2">
          {conversations.map((conversation) => {
            const hasUnread = conversation.unreadCount > 0;
            return <button key={conversation.id} type="button" aria-pressed={selectedId === conversation.id} data-conversation-read-state={hasUnread ? "unread" : "read"} className={`w-full rounded-lg p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${hasUnread ? "border border-amber-300 bg-amber-50 shadow-sm hover:bg-amber-100" : selectedId === conversation.id ? "bg-primary/10" : "hover:bg-muted/60"}`} onClick={() => setSelectedId(conversation.id)}><div className="flex items-center justify-between gap-2"><strong className={`truncate text-sm text-foreground ${hasUnread ? "font-bold" : "font-semibold"}`}>{conversation.subject}</strong>{hasUnread ? <Badge className="bg-amber-600 text-white hover:bg-amber-600" aria-label={t({ fr: `${conversation.unreadCount} message${conversation.unreadCount > 1 ? "s" : ""} non lu${conversation.unreadCount > 1 ? "s" : ""}`, en: `${conversation.unreadCount} unread message${conversation.unreadCount > 1 ? "s" : ""}`, ar: `${conversation.unreadCount} رسائل غير مقروءة` })}>{conversation.unreadCount}</Badge> : <span className="text-[10px] font-medium text-emerald-700">{t({ fr: "Lu", en: "Read", ar: "مقروء" })}</span>}</div><p className={`mt-1 line-clamp-2 text-xs ${hasUnread ? "font-medium text-slate-800" : "text-muted-foreground"}`}>{conversation.lastMessagePreview || t({ fr: "Aucun message", en: "No message", ar: "لا توجد رسالة" })}</p><p className="mt-1 text-[11px] text-muted-foreground">{formatDate(conversation.lastMessageAt, lang)} · {privateConversationDisplayStatus(conversation.status, lang)} · {privateConversationDisplaySource(conversation.source, lang)}</p></button>;
          })}
          {!conversations.length && !conversationsQuery.isLoading ? <p className="p-8 text-center text-sm text-muted-foreground">{t({ fr: "Aucune conversation pour le moment.", en: "No conversations yet.", ar: "لا توجد محادثات حتى الآن." })}</p> : null}
          {conversationsQuery.isLoading ? <p className="p-8 text-center text-sm text-muted-foreground">{t({ fr: "Chargement des conversations…", en: "Loading conversations…", ar: "جارٍ تحميل المحادثات…" })}</p> : null}
          {conversationsQuery.isError ? <p className="p-5 text-center text-sm text-destructive">{t({ fr: "La messagerie ne peut pas être chargée pour le moment.", en: "Messaging cannot be loaded right now.", ar: "لا يمكن تحميل المراسلة حاليًا." })}</p> : null}
        </div></ScrollArea>
      </section>
      <section className="flex min-h-[540px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {selectedId === null ? <div className="m-auto max-w-sm p-8 text-center"><MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/40" /><h3 className="mt-3 font-semibold text-foreground">{t({ fr: "Sélectionnez une conversation", en: "Select a conversation", ar: "اختر محادثة" })}</h3><p className="mt-1 text-sm text-muted-foreground">{t({ fr: "L’historique et les actions de réponse seront affichés ici.", en: "Its history and reply actions will appear here.", ar: "سيظهر هنا سجل المحادثة وإجراءات الرد." })}</p></div> : <>
          <header className="border-b border-border px-4 py-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-base font-semibold text-foreground">{selected?.subject || t({ fr: "Chargement…", en: "Loading…", ar: "جارٍ التحميل…" })}</h3><p className="mt-1 text-xs text-muted-foreground">{t({ fr: "Équipe Neopolis", en: "Neopolis team", ar: "فريق نيوبوليس" })}{selected ? ` · ${privateConversationDisplaySource(selected.source, lang)}` : ""}</p></div>{selected ? <Button variant="outline" size="sm" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ conversationId: selectedId, status: selected.status === "open" ? "closed" : "open" })}>{selected.status === "open" ? t({ fr: "Clôturer", en: "Close", ar: "إغلاق" }) : t({ fr: "Rouvrir", en: "Reopen", ar: "إعادة الفتح" })}</Button> : null}</div></header>
          <ScrollArea ref={scrollAreaRef} className="min-h-0 flex-1 px-4 py-4"><div className="space-y-3">
            {detailQuery.isLoading ? <p className="text-sm text-muted-foreground">{t({ fr: "Chargement des messages…", en: "Loading messages…", ar: "جارٍ تحميل الرسائل…" })}</p> : null}
            {detailQuery.isError ? <p className="text-sm text-destructive">{t({ fr: "Cette conversation est indisponible.", en: "This conversation is unavailable.", ar: "هذه المحادثة غير متاحة." })}</p> : null}
            {detailQuery.data?.messages.map((message: PrivateMessageView) => <Fragment key={message.id}>{message.id === firstUnreadMessageId ? <PrivateUnreadDivider count={unreadMessages.length} /> : null}<PrivateMessageBubble message={message} mine={message.authorRole === "learner"} isUnread={privateMessageIsUnreadForAudience(message, "learner")} author={message.authorRole === "learner" ? t({ fr: "Vous", en: "You", ar: "أنت" }) : t({ fr: "Équipe Neopolis", en: "Neopolis team", ar: "فريق نيوبوليس" })} dateLabel={(value) => formatDate(value, lang)} /></Fragment>)}
            {pendingReplyMessage ? <PrivateMessageBubble message={pendingReplyMessage} mine author={t({ fr: "Vous", en: "You", ar: "أنت" })} dateLabel={(value) => formatDate(value, lang)} isSending /> : null}
            <div ref={bottomRef} aria-hidden="true" />
          </div></ScrollArea>
          <footer className="border-t border-border p-3">{selected?.status === "open" ? <><Label className="sr-only" htmlFor="learner-private-message-reply">{t({ fr: "Votre réponse", en: "Your reply", ar: "ردك" })}</Label><Textarea id="learner-private-message-reply" value={reply} onChange={(event) => setReply(event.target.value)} className="min-h-20 resize-none" maxLength={5000} placeholder={t({ fr: "Écrivez votre message à l’équipe Neopolis…", en: "Write your message to the Neopolis team…", ar: "اكتب رسالتك لفريق نيوبوليس…" })} /><PrivateMessageAttachmentPicker attachments={replyAttachments} onChange={setReplyAttachments} disabled={sendMutation.isPending} /><div className="mt-2 flex justify-end"><Button size="sm" className="gap-1.5" disabled={(!reply.trim() && !replyAttachments.length) || sendMutation.isPending} onClick={sendReply}>{sendMutation.isPending ? t({ fr: "Envoi…", en: "Sending…", ar: "جارٍ الإرسال…" }) : t({ fr: "Envoyer", en: "Send", ar: "إرسال" })}<Send className="h-3.5 w-3.5" /></Button></div></> : <p className="text-sm text-muted-foreground">{t({ fr: "Cette conversation est fermée. Son historique est conservé ; vous pouvez la rouvrir si nécessaire.", en: "This conversation is closed. Its history is kept; you can reopen it if needed.", ar: "هذه المحادثة مغلقة. يُحتفظ بسجلها ويمكنك إعادة فتحها عند الحاجة." })}</p>}</footer>
        </>}
      </section>
    </div>
    <Dialog open={composeOpen} onOpenChange={(open) => open ? setComposeOpen(true) : resetComposer()}><DialogContent><DialogHeader><DialogTitle>{composeMode === "report" ? t({ fr: "Signaler un problème à Neopolis", en: "Report a problem to Neopolis", ar: "الإبلاغ عن مشكلة إلى نيوبوليس" }) : t({ fr: "Nouvelle conversation avec Neopolis", en: "New conversation with Neopolis", ar: "محادثة جديدة مع نيوبوليس" })}</DialogTitle></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label htmlFor="learner-private-subject">{t({ fr: "Sujet", en: "Subject", ar: "الموضوع" })}</Label><Input id="learner-private-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={220} placeholder={t({ fr: "Ex. Question sur mon parcours", en: "E.g. Question about my learning path", ar: "مثال: سؤال حول مسار التعلم" })} /></div><div className="space-y-2"><Label htmlFor="learner-private-body">{t({ fr: "Message", en: "Message", ar: "الرسالة" })}</Label><Textarea id="learner-private-body" value={body} onChange={(event) => setBody(event.target.value)} maxLength={5000} className="min-h-32" placeholder={composeMode === "report" ? t({ fr: "Décrivez le problème rencontré et les étapes concernées…", en: "Describe the problem and the related steps…", ar: "صف المشكلة والخطوات المعنية…" }) : t({ fr: "Décrivez votre demande à l’équipe Neopolis…", en: "Describe your request to the Neopolis team…", ar: "صف طلبك لفريق نيوبوليس…" })} /><PrivateMessageAttachmentPicker attachments={composeAttachments} onChange={setComposeAttachments} disabled={createMutation.isPending} /></div></div><DialogFooter><Button variant="outline" onClick={resetComposer}>{t({ fr: "Annuler", en: "Cancel", ar: "إلغاء" })}</Button><Button disabled={subject.trim().length < 3 || (!body.trim() && !composeAttachments.length) || createMutation.isPending} onClick={() => createMutation.mutate({ subject, body, attachments: composeAttachments.map(({ filename, mimeType, base64 }) => ({ filename, mimeType, base64 })), source: composeMode === "report" ? "problem_report" : "learner" })}>{createMutation.isPending ? t({ fr: "Création…", en: "Creating…", ar: "جارٍ الإنشاء…" }) : t({ fr: "Ouvrir la conversation", en: "Open conversation", ar: "فتح المحادثة" })}</Button></DialogFooter></DialogContent></Dialog>
  </section>;
}
