import { Fragment } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PrivateMessageBubble, PrivateUnreadDivider, type PrivateMessageView } from "@/components/PrivateMessageContent";
import { usePrivateConversationViewport } from "@/hooks/usePrivateConversationViewport";
import { privateMessageIsUnreadForAudience } from "@shared/privateMessaging";

type LocalizedText = (values: { fr: string; en: string; ar: string }) => string;

export function AdminConversationMessages({
  messages,
  learnerName,
  lang,
  t,
  onLatestMessageVisible,
  conversationId,
  pendingBody,
  isSending = false,
}: {
  messages: PrivateMessageView[];
  learnerName: string;
  lang: "fr" | "en" | "ar";
  t: LocalizedText;
  onLatestMessageVisible: (conversationId: number) => void;
  conversationId: number;
  pendingBody?: string;
  isSending?: boolean;
}) {
  const unreadMessages = messages.filter((message) => privateMessageIsUnreadForAudience(message, "admin"));
  const firstUnreadMessageId = unreadMessages[0]?.id ?? null;
  const latestMessageId = messages.at(-1)?.id ?? null;
  const { scrollAreaRef, bottomRef } = usePrivateConversationViewport({
    conversationId,
    latestMessageId,
    onLatestMessageVisible,
  });
  const formatDate = (value: Date | string) => new Date(value).toLocaleString(lang === "ar" ? "ar" : lang === "en" ? "en-GB" : "fr-FR");

  return <ScrollArea ref={scrollAreaRef} className="min-h-0 flex-1 px-4 py-4"><div className="space-y-3">
    {messages.map((message) => <Fragment key={message.id}>{message.id === firstUnreadMessageId ? <PrivateUnreadDivider count={unreadMessages.length} /> : null}<PrivateMessageBubble message={message} mine={message.authorRole === "admin"} isUnread={privateMessageIsUnreadForAudience(message, "admin")} author={message.authorRole === "admin" ? t({ fr: "Équipe Neopolis", en: "Neopolis team", ar: "فريق نيوبوليس" }) : learnerName} dateLabel={formatDate} /></Fragment>)}
    {isSending ? <PrivateMessageBubble message={{ id: -conversationId, authorUserId: null, authorRole: "admin", body: pendingBody || t({ fr: "Pièce jointe en cours d’envoi…", en: "Attachment sending…", ar: "جارٍ إرسال المرفق…" }), createdAt: new Date(), learnerDeliveredAt: null, adminDeliveredAt: null, learnerReadAt: null, adminReadAt: new Date() }} mine author={t({ fr: "Équipe Neopolis", en: "Neopolis team", ar: "فريق نيوبوليس" })} dateLabel={formatDate} isSending /> : null}
    <div ref={bottomRef} aria-hidden="true" />
  </div></ScrollArea>;
}
