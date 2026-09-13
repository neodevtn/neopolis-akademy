import { useMemo, useState } from "react";
import { Link } from "wouter";
import { MessageCircle, Plus, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PRIVATE_INTEGRITY_REVIEW_TEMPLATE, privateConversationDisplaySource, privateConversationDisplayStatus, type PrivateConversationSource } from "@shared/privateMessaging";
import { PrivateMessagingNotificationCenter } from "@/components/PrivateMessagingNotificationCenter";
import { PrivateMessageAttachmentPicker, type PendingPrivateMessageAttachment } from "@/components/PrivateMessageAttachmentPicker";
import { PrivateMessageBubble, type PrivateMessageView } from "@/components/PrivateMessageContent";
import { useLanguage } from "@/contexts/LanguageContext";

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

function formatDate(value: Date | string, lang: "fr" | "en" | "ar") {
  return new Date(value).toLocaleString(lang === "ar" ? "ar" : lang === "en" ? "en-GB" : "fr-FR");
}

function integrityStatusLabel(status: string, lang: "fr" | "en" | "ar") {
  if (lang === "en") return status === "confirmed" ? "Review confirmed" : status === "temporary_hold" ? "Enhanced review" : "To review";
  if (lang === "ar") return status === "confirmed" ? "تم تأكيد المراجعة" : status === "temporary_hold" ? "مراجعة معززة" : "قيد المراجعة";
  if (status === "confirmed") return "Revue confirmée";
  if (status === "temporary_hold") return "Revue renforcée";
  return "À examiner";
}

function IntegrityClarificationQueue() {
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const utils = trpc.useUtils();
  const queueQuery = trpc.privateMessaging.getIntegrityClarificationQueue.useQuery(undefined, { enabled: open, refetchOnWindowFocus: true });
  const createConversations = trpc.privateMessaging.createIntegrityClarificationConversations.useMutation({
    onSuccess: async (result) => {
      setConfirmOpen(false);
      await Promise.all([
        queueQuery.refetch(),
        utils.privateMessaging.getAdminInbox.invalidate(),
      ]);
      toast.success(t({ fr: `${result.created} conversation${result.created > 1 ? "s" : ""} créée${result.created > 1 ? "s" : ""}${result.skipped ? `, ${result.skipped} déjà existante${result.skipped > 1 ? "s" : ""}` : ""}.`, en: `${result.created} conversation${result.created > 1 ? "s" : ""} created${result.skipped ? `, ${result.skipped} already existed` : ""}.`, ar: `تم إنشاء ${result.created} محادثة${result.skipped ? `، ${result.skipped} موجودة مسبقًا` : ""}.` }));
    },
    onError: (error) => toast.error(error.message),
  });
  const rows = queueQuery.data || [];
  return <>
    <Button variant="outline" onClick={() => setOpen(true)}>{t({ fr: "File d’intégrité", en: "Integrity queue", ar: "قائمة النزاهة" })}</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>{t({ fr: "Demandes de clarification à examiner", en: "Clarification requests to review", ar: "طلبات التوضيح قيد المراجعة" })}</DialogTitle></DialogHeader>
        <p className="text-sm leading-6 text-slate-600">{t({ fr: "Cette file provient exclusivement des signaux existants à revue humaine. Aucun fil de messagerie, e-mail, notification, blocage ou sanction n’est créé depuis cet écran.", en: "This queue only uses existing signals requiring human review. No conversation, email, notification, restriction or sanction is created from this screen.", ar: "تستند هذه القائمة فقط إلى إشارات تتطلب مراجعة بشرية. لا يتم إنشاء أي محادثة أو بريد إلكتروني أو إشعار أو تقييد أو عقوبة من هذه الشاشة." })}</p>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><p className="font-semibold">{t({ fr: "Texte approuvé", en: "Approved text", ar: "النص المعتمد" })}</p><p className="mt-2 text-xs font-medium">{t({ fr: "Sujet", en: "Subject", ar: "الموضوع" })} : {PRIVATE_INTEGRITY_REVIEW_TEMPLATE.subject}</p><p className="mt-2 whitespace-pre-wrap text-xs leading-5">{PRIVATE_INTEGRITY_REVIEW_TEMPLATE.body}</p></div>
        <div className="max-h-72 overflow-auto rounded-lg border border-slate-200"><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-slate-50 text-xs text-slate-500"><tr><th className="px-3 py-2 font-medium">{t({ fr: "Apprenant", en: "Learner", ar: "المتعلم" })}</th><th className="px-3 py-2 font-medium">{t({ fr: "Revue", en: "Review", ar: "المراجعة" })}</th><th className="px-3 py-2 font-medium">{t({ fr: "Signaux", en: "Signals", ar: "الإشارات" })}</th><th className="px-3 py-2 font-medium">{t({ fr: "Action", en: "Action", ar: "الإجراء" })}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.learnerId} className="border-t border-slate-100"><td className="px-3 py-2"><p className="font-medium text-slate-900">{row.learnerName || t({ fr: "Apprenant", en: "Learner", ar: "متعلم" })}</p><p className="text-xs text-slate-500">{t({ fr: "Score de revue", en: "Review score", ar: "درجة المراجعة" })} : {row.riskScore}/100</p></td><td className="px-3 py-2 text-slate-700">{integrityStatusLabel(row.reviewStatus, lang)}</td><td className="px-3 py-2 text-slate-700">{row.signalCount}</td><td className="px-3 py-2"><Link href={`/admin/training?tab=learners&learner=${row.learnerId}`} className="text-xs font-semibold text-primary hover:underline" onClick={() => setOpen(false)}>{t({ fr: "Ouvrir la revue", en: "Open review", ar: "فتح المراجعة" })}</Link></td></tr>)}{!rows.length && !queueQuery.isLoading ? <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">{t({ fr: "Aucune demande de clarification n’est actuellement à examiner.", en: "No clarification requests need review right now.", ar: "لا توجد حاليًا طلبات توضيح قيد المراجعة." })}</td></tr> : null}{queueQuery.isLoading ? <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">{t({ fr: "Chargement de la file…", en: "Loading queue…", ar: "جارٍ تحميل القائمة…" })}</td></tr> : null}{queueQuery.isError ? <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-destructive">{t({ fr: "La file ne peut pas être chargée pour le moment.", en: "The queue cannot be loaded right now.", ar: "لا يمكن تحميل القائمة حاليًا." })}</td></tr> : null}</tbody></table></div>
        <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>{t({ fr: "Fermer", en: "Close", ar: "إغلاق" })}</Button><Button disabled={!rows.length || createConversations.isPending} onClick={() => setConfirmOpen(true)}>{createConversations.isPending ? t({ fr: "Création…", en: "Creating…", ar: "جارٍ الإنشاء…" }) : t({ fr: `Créer ${rows.length} conversation${rows.length > 1 ? "s" : ""}`, en: `Create ${rows.length} conversation${rows.length > 1 ? "s" : ""}`, ar: `إنشاء ${rows.length} محادثة` })}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t({ fr: "Confirmer la création des conversations de revue", en: "Confirm review conversation creation", ar: "تأكيد إنشاء محادثات المراجعة" })}</AlertDialogTitle><AlertDialogDescription>{t({ fr: "Cette action créera un fil privé et notifiera chaque apprenant encore présent dans la file, selon ses préférences. Aucun blocage automatique ne sera appliqué. Les conversations existantes de revue seront ignorées.", en: "This creates a private thread and notifies each learner still in the queue according to their preferences. No automatic restriction will be applied. Existing review conversations are ignored.", ar: "سينشئ هذا الإجراء محادثة خاصة ويخطر كل متعلم ما زال في القائمة وفقًا لتفضيلاته. لن يُطبق أي تقييد تلقائي. سيتم تجاهل محادثات المراجعة الموجودة." })}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={createConversations.isPending}>{t({ fr: "Annuler", en: "Cancel", ar: "إلغاء" })}</AlertDialogCancel><AlertDialogAction disabled={createConversations.isPending} onClick={() => createConversations.mutate()}>{t({ fr: "Créer les conversations", en: "Create conversations", ar: "إنشاء المحادثات" })}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>;
}

export function PrivateMessagingAdminPanel({ learnerId: fixedLearnerId, learnerLabel }: PrivateMessagingAdminPanelProps) {
  const { lang, t } = useLanguage();
  const [status, setStatus] = useState<"all" | "open" | "closed">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [body, setBody] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<PendingPrivateMessageAttachment[]>([]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [learnerSearch, setLearnerSearch] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [firstMessageAttachments, setFirstMessageAttachments] = useState<PendingPrivateMessageAttachment[]>([]);
  const inboxQuery = trpc.privateMessaging.getAdminInbox.useQuery(
    { status, search: search.trim() || undefined, learnerId: fixedLearnerId, page, pageSize: 25 },
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
    setFirstMessageAttachments([]);
  };
  const sendMutation = trpc.privateMessaging.send.useMutation({
    onSuccess: () => { setBody(""); setReplyAttachments([]); refresh(); },
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
  const items = (inboxQuery.data?.items || []) as InboxConversation[];
  const inboxPage = inboxQuery.data;
  const learners = useMemo(() => learnersQuery.data?.users || [], [learnersQuery.data?.users]);
  const targetLearnerId = fixedLearnerId ?? (recipientId ? Number(recipientId) : null);
  const contextTitle = fixedLearnerId ? t({ fr: `Messages de ${learnerLabel || "cet apprenant"}`, en: `Messages for ${learnerLabel || "this learner"}`, ar: `رسائل ${learnerLabel || "هذا المتعلم"}` }) : t({ fr: "Messagerie privée", en: "Private messaging", ar: "المراسلة الخاصة" });
  const contextDescription = fixedLearnerId
    ? t({ fr: "Historique privé lié à cet apprenant. Les communiqués et leurs statistiques restent séparés.", en: "Private history for this learner. Announcements and their metrics remain separate.", ar: "السجل الخاص المرتبط بهذا المتعلم. تبقى الإعلانات وإحصاءاتها منفصلة." })
    : t({ fr: "Conversations privées entre un apprenant et l’équipe Neopolis. Les communiqués restent séparés.", en: "Private conversations between a learner and the Neopolis team. Announcements remain separate.", ar: "محادثات خاصة بين المتعلم وفريق نيوبوليس. تبقى الإعلانات منفصلة." });

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950"><MessageCircle className="h-5 w-5 text-primary" />{contextTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{contextDescription}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">{!fixedLearnerId ? <IntegrityClarificationQueue /> : null}<PrivateMessagingNotificationCenter isAdmin onOpenConversation={(conversationId) => { setSelectedId(conversationId); markRead.mutate({ conversationId }); }} /><Button className="gap-2" onClick={() => setComposeOpen(true)}><Plus className="h-4 w-4" />{t({ fr: "Nouvelle conversation", en: "New conversation", ar: "محادثة جديدة" })}</Button></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.4fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-2 border-b border-slate-100 p-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={fixedLearnerId ? t({ fr: "Rechercher un sujet", en: "Search a topic", ar: "البحث عن موضوع" }) : t({ fr: "Rechercher un sujet ou apprenant", en: "Search a topic or learner", ar: "البحث عن موضوع أو متعلم" })} aria-label={t({ fr: "Rechercher une conversation", en: "Search conversations", ar: "البحث في المحادثات" })} />
            </div>
            <Select value={status} onValueChange={(value) => { setStatus(value as typeof status); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-32" aria-label={t({ fr: "Filtrer les conversations", en: "Filter conversations", ar: "تصفية المحادثات" })}><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">{t({ fr: "Toutes", en: "All", ar: "الكل" })}</SelectItem><SelectItem value="open">{t({ fr: "Ouvertes", en: "Open", ar: "مفتوحة" })}</SelectItem><SelectItem value="closed">{t({ fr: "Fermées", en: "Closed", ar: "مغلقة" })}</SelectItem></SelectContent>
            </Select>
          </div>
          <p className="px-3 pt-2 text-xs text-slate-500">{inboxPage ? t({ fr: `${inboxPage.total} conversation${inboxPage.total > 1 ? "s" : ""} · page ${inboxPage.page}/${inboxPage.totalPages}`, en: `${inboxPage.total} conversation${inboxPage.total > 1 ? "s" : ""} · page ${inboxPage.page}/${inboxPage.totalPages}`, ar: `${inboxPage.total} محادثة · الصفحة ${inboxPage.page}/${inboxPage.totalPages}` }) : t({ fr: "Chargement de l’inbox…", en: "Loading inbox…", ar: "جارٍ تحميل البريد الوارد…" })}</p>
          <ScrollArea className="h-[480px]">
            <div className="p-2">
              {items.map((item) => (
                <button key={item.id} type="button" aria-pressed={selectedId === item.id} className={`w-full rounded-lg p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedId === item.id ? "bg-primary/10" : "hover:bg-slate-50"}`} onClick={() => { setSelectedId(item.id); markRead.mutate({ conversationId: item.id }); }}>
                  <div className="flex items-center justify-between gap-2"><strong className="truncate text-sm text-slate-900">{item.subject}</strong>{item.unreadCount ? <Badge aria-label={`${item.unreadCount} message${item.unreadCount > 1 ? "s" : ""} non lu${item.unreadCount > 1 ? "s" : ""}`}>{item.unreadCount}</Badge> : null}</div>
                  {!fixedLearnerId ? <p className="mt-1 truncate text-xs text-slate-600">{item.learner?.name || item.learner?.email || t({ fr: "Apprenant", en: "Learner", ar: "متعلم" })} · {item.lastMessagePreview || t({ fr: "Aucun message", en: "No message", ar: "لا توجد رسالة" })}</p> : <p className="mt-1 truncate text-xs text-slate-600">{item.lastMessagePreview || t({ fr: "Aucun message", en: "No message", ar: "لا توجد رسالة" })}</p>}
                  <p className="mt-1 text-[11px] text-slate-400">{formatDate(item.lastMessageAt, lang)} · {privateConversationDisplayStatus(item.status, lang)} · {privateConversationDisplaySource(item.source, lang)}</p>
                </button>
              ))}
              {!items.length && !inboxQuery.isLoading ? <p className="p-8 text-center text-sm text-slate-500">{t({ fr: "Aucune conversation ne correspond aux filtres.", en: "No conversations match these filters.", ar: "لا توجد محادثات تطابق هذه المرشحات." })}</p> : null}
              {inboxQuery.isLoading ? <p className="p-8 text-center text-sm text-slate-500">{t({ fr: "Chargement des conversations…", en: "Loading conversations…", ar: "جارٍ تحميل المحادثات…" })}</p> : null}
              {inboxQuery.isError ? <p className="p-5 text-center text-sm text-destructive">{t({ fr: "La messagerie ne peut pas être chargée pour le moment.", en: "Messaging cannot be loaded right now.", ar: "لا يمكن تحميل المراسلة حاليًا." })}</p> : null}
            </div>
          </ScrollArea>
          {inboxPage && inboxPage.totalPages > 1 ? <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-3"><Button variant="outline" size="sm" disabled={inboxPage.page <= 1 || inboxQuery.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))}>{t({ fr: "Précédent", en: "Previous", ar: "السابق" })}</Button><span className="text-xs text-slate-500">{t({ fr: `Page ${inboxPage.page} sur ${inboxPage.totalPages}`, en: `Page ${inboxPage.page} of ${inboxPage.totalPages}`, ar: `الصفحة ${inboxPage.page} من ${inboxPage.totalPages}` })}</span><Button variant="outline" size="sm" disabled={inboxPage.page >= inboxPage.totalPages || inboxQuery.isFetching} onClick={() => setPage((current) => current + 1)}>{t({ fr: "Suivant", en: "Next", ar: "التالي" })}</Button></div> : null}
        </section>

        <section className="flex min-h-[540px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          {selectedId === null ? (
            <div className="m-auto max-w-sm p-8 text-center"><MessageCircle className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 font-semibold text-slate-900">{t({ fr: "Sélectionnez une conversation", en: "Select a conversation", ar: "اختر محادثة" })}</h3><p className="mt-1 text-sm text-slate-500">{t({ fr: "Son historique et les actions de réponse apparaîtront ici.", en: "Its history and reply actions will appear here.", ar: "سيظهر هنا سجل المحادثة وإجراءات الرد." })}</p></div>
          ) : (
            <>
              <header className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><h3 className="truncate text-base font-semibold text-slate-950">{selected?.subject || t({ fr: "Chargement…", en: "Loading…", ar: "جارٍ التحميل…" })}</h3><p className="mt-1 text-xs text-slate-500">{detailQuery.data?.learner?.name || detailQuery.data?.learner?.email || t({ fr: "Apprenant", en: "Learner", ar: "متعلم" })}{selected ? ` · ${privateConversationDisplaySource(selected.source, lang)}` : ""}</p>{!fixedLearnerId && detailQuery.data?.learner ? <Link href={`/admin/training?tab=learners&learner=${detailQuery.data.learner.id}`} className="mt-1 inline-block text-xs font-medium text-primary hover:underline">{t({ fr: "Ouvrir le dossier apprenant", en: "Open learner record", ar: "فتح ملف المتعلم" })}</Link> : null}</div>
                  {selected ? <Button variant="outline" size="sm" onClick={() => statusMutation.mutate({ conversationId: selectedId, status: selected.status === "open" ? "closed" : "open" })}>{selected.status === "open" ? t({ fr: "Clôturer", en: "Close", ar: "إغلاق" }) : t({ fr: "Rouvrir", en: "Reopen", ar: "إعادة الفتح" })}</Button> : null}
                </div>
              </header>
              <ScrollArea className="min-h-0 flex-1 px-4 py-4"><div className="space-y-3">{detailQuery.data?.messages.map((message: PrivateMessageView) => <PrivateMessageBubble key={message.id} message={message} mine={message.authorRole === "admin"} author={message.authorRole === "admin" ? t({ fr: "Équipe Neopolis", en: "Neopolis team", ar: "فريق نيوبوليس" }) : detailQuery.data?.learner?.name || t({ fr: "Apprenant", en: "Learner", ar: "متعلم" })} dateLabel={(value) => formatDate(value, lang)} />)}</div></ScrollArea>
              <footer className="border-t border-slate-100 p-3">{selected?.status === "open" ? <><Label className="sr-only" htmlFor="admin-private-message-reply">{t({ fr: "Réponse", en: "Reply", ar: "الرد" })}</Label><Textarea id="admin-private-message-reply" value={body} onChange={(event) => setBody(event.target.value)} className="min-h-20 resize-none" maxLength={5000} placeholder={t({ fr: "Répondre au nom de l’équipe Neopolis…", en: "Reply as the Neopolis team…", ar: "الرد باسم فريق نيوبوليس…" })} /><PrivateMessageAttachmentPicker attachments={replyAttachments} onChange={setReplyAttachments} disabled={sendMutation.isPending} /><div className="mt-2 flex justify-end"><Button size="sm" className="gap-1.5" disabled={(!body.trim() && !replyAttachments.length) || sendMutation.isPending} onClick={() => selectedId && sendMutation.mutate({ conversationId: selectedId, body, attachments: replyAttachments.map(({ filename, mimeType, base64 }) => ({ filename, mimeType, base64 })) })}>{sendMutation.isPending ? t({ fr: "Envoi…", en: "Sending…", ar: "جارٍ الإرسال…" }) : t({ fr: "Envoyer", en: "Send", ar: "إرسال" })}<Send className="h-3.5 w-3.5" /></Button></div></> : <p className="text-sm text-slate-500">{t({ fr: "Conversation fermée. L’historique est conservé ; vous pouvez la rouvrir.", en: "Conversation closed. Its history is kept; you can reopen it.", ar: "المحادثة مغلقة. يُحتفظ بسجلها ويمكنك إعادة فتحها." })}</p>}</footer>
            </>
          )}
        </section>
      </div>

      <Dialog open={composeOpen} onOpenChange={(open) => open ? setComposeOpen(true) : resetComposer()}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t({ fr: "Nouvelle conversation", en: "New conversation", ar: "محادثة جديدة" })}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {fixedLearnerId ? <div className="space-y-2"><Label>{t({ fr: "Destinataire", en: "Recipient", ar: "المستلم" })}</Label><Input value={learnerLabel || t({ fr: "Apprenant sélectionné", en: "Selected learner", ar: "المتعلم المحدد" })} readOnly aria-readonly="true" /></div> : <div className="space-y-2"><Label htmlFor="message-learner-search">{t({ fr: "Destinataire", en: "Recipient", ar: "المستلم" })}</Label><Input id="message-learner-search" value={learnerSearch} onChange={(event) => setLearnerSearch(event.target.value)} placeholder={t({ fr: "Rechercher un apprenant par nom ou e-mail", en: "Search a learner by name or email", ar: "البحث عن متعلم بالاسم أو البريد الإلكتروني" })} /><Select value={recipientId} onValueChange={setRecipientId}><SelectTrigger aria-label={t({ fr: "Choisir un apprenant", en: "Choose a learner", ar: "اختيار متعلم" })}><SelectValue placeholder={t({ fr: "Choisir un apprenant", en: "Choose a learner", ar: "اختيار متعلم" })} /></SelectTrigger><SelectContent>{learners.map((learner: any) => <SelectItem key={learner.id} value={String(learner.id)}>{learner.name || learner.email || `${t({ fr: "Apprenant", en: "Learner", ar: "متعلم" })} ${learner.id}`}</SelectItem>)}{!learners.length && !learnersQuery.isLoading ? <SelectItem value="no-result" disabled>{t({ fr: "Aucun apprenant trouvé", en: "No learner found", ar: "لم يتم العثور على متعلم" })}</SelectItem> : null}</SelectContent></Select></div>}
            <div className="space-y-2"><Label htmlFor="message-subject">{t({ fr: "Sujet", en: "Subject", ar: "الموضوع" })}</Label><Input id="message-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={220} placeholder={t({ fr: "Ex. Point à clarifier", en: "E.g. Topic to clarify", ar: "مثال: موضوع يحتاج إلى توضيح" })} /></div>
            <div className="space-y-2"><Label htmlFor="message-first">{t({ fr: "Premier message", en: "First message", ar: "الرسالة الأولى" })}</Label><Textarea id="message-first" value={firstMessage} onChange={(event) => setFirstMessage(event.target.value)} maxLength={5000} className="min-h-32" placeholder={t({ fr: "Rédigez le premier message de l’équipe…", en: "Write the team’s first message…", ar: "اكتب أول رسالة للفريق…" })} /><PrivateMessageAttachmentPicker attachments={firstMessageAttachments} onChange={setFirstMessageAttachments} disabled={createMutation.isPending} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={resetComposer}>{t({ fr: "Annuler", en: "Cancel", ar: "إلغاء" })}</Button><Button disabled={!targetLearnerId || subject.trim().length < 3 || (!firstMessage.trim() && !firstMessageAttachments.length) || createMutation.isPending} onClick={() => targetLearnerId && createMutation.mutate({ learnerId: targetLearnerId, subject, body: firstMessage, attachments: firstMessageAttachments.map(({ filename, mimeType, base64 }) => ({ filename, mimeType, base64 })), source: "admin" })}>{createMutation.isPending ? t({ fr: "Création…", en: "Creating…", ar: "جارٍ الإنشاء…" }) : t({ fr: "Créer et envoyer", en: "Create and send", ar: "إنشاء وإرسال" })}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
