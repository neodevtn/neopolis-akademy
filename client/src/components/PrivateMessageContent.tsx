import { Check, CheckCheck, Clock3, FileText, ImageIcon } from "lucide-react";
import { privateMessageReceiptLabel, privateMessageReceiptState } from "@shared/privateMessaging";
import { useLanguage } from "@/contexts/LanguageContext";

export type PrivateMessageAttachment = {
  id: number;
  originalName: string;
  mimeType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "application/pdf";
  sizeBytes: number;
  url: string;
};

export type PrivateMessageView = {
  id: number;
  authorUserId: number | null;
  authorRole: "learner" | "admin" | "system";
  body: string;
  createdAt: Date | string;
  learnerDeliveredAt: Date | string | null;
  adminDeliveredAt: Date | string | null;
  learnerReadAt: Date | string | null;
  adminReadAt: Date | string | null;
  attachments?: PrivateMessageAttachment[];
};

function formatBytes(value: number, locale: string) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} ${locale === "en" ? "KB" : "Ko"}`;
  return `${(value / (1024 * 1024)).toFixed(1).replace(".0", "")} ${locale === "en" ? "MB" : "Mo"}`;
}

function receiptForMessage(message: PrivateMessageView, lang: "fr" | "en" | "ar", isSending: boolean) {
  return message.authorRole === "admin"
    ? privateMessageReceiptLabel({ sending: isSending, deliveredAt: message.learnerDeliveredAt, readAt: message.learnerReadAt }, lang)
    : privateMessageReceiptLabel({ sending: isSending, deliveredAt: message.adminDeliveredAt, readAt: message.adminReadAt }, lang);
}

function Receipt({ message, isSending = false }: { message: PrivateMessageView; isSending?: boolean }) {
  const { lang, t } = useLanguage();
  const status = receiptForMessage(message, lang, isSending);
  const state = message.authorRole === "admin"
    ? privateMessageReceiptState({ sending: isSending, deliveredAt: message.learnerDeliveredAt, readAt: message.learnerReadAt })
    : privateMessageReceiptState({ sending: isSending, deliveredAt: message.adminDeliveredAt, readAt: message.adminReadAt });
  const isRead = state === "read";
  const iconClass = isRead ? "text-sky-600" : "text-slate-200";
  return <span className={`inline-flex items-center gap-1 ${isRead ? "rounded-full bg-white px-1 py-0.5 shadow-sm ring-1 ring-sky-100" : ""}`} title={status} aria-label={`${t({ fr: "Statut du message", en: "Message status", ar: "حالة الرسالة" })} : ${status}`}>
    {state === "sending" ? <Clock3 className={`h-3.5 w-3.5 ${iconClass}`} aria-hidden="true" /> : state === "sent" ? <Check className={`h-3.5 w-3.5 ${iconClass}`} aria-hidden="true" /> : <CheckCheck className={`h-3.5 w-3.5 ${iconClass}`} aria-hidden="true" />}
    <span className="sr-only">{status}</span>
  </span>;
}

export function PrivateMessageBubble({
  message,
  mine,
  author,
  dateLabel,
  isUnread = false,
  isSending = false,
}: {
  message: PrivateMessageView;
  mine: boolean;
  author: string;
  dateLabel: (value: Date | string) => string;
  isUnread?: boolean;
  isSending?: boolean;
}) {
  const { lang, t } = useLanguage();
  const attachments = message.attachments || [];
  const receivedUnread = !mine && isUnread;
  return <article data-message-read-state={mine ? "outgoing" : receivedUnread ? "unread" : "read"} className={`max-w-[88%] rounded-xl px-3 py-2.5 text-sm ${mine ? "ml-auto bg-primary text-primary-foreground" : receivedUnread ? "border border-amber-300 bg-amber-50 text-slate-900 ring-1 ring-amber-200" : "bg-slate-100 text-slate-800"}`}>
    <div className="mb-1 flex items-center justify-between gap-3"><p className={`text-[11px] font-semibold ${mine ? "text-primary-foreground/80" : receivedUnread ? "text-amber-900" : "text-slate-500"}`}>{author}</p>{receivedUnread ? <span className="rounded-full bg-amber-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-950">{t({ fr: "Nouveau", en: "New", ar: "جديد" })}</span> : null}</div>
    {message.body ? <p className="whitespace-pre-wrap break-words leading-relaxed">{message.body}</p> : null}
    {attachments.length ? <div className={`${message.body ? "mt-2" : ""} grid gap-2`}>
      {attachments.map((attachment) => attachment.mimeType.startsWith("image/")
        ? <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-black/10 bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80" aria-label={`${t({ fr: "Ouvrir l’image", en: "Open image", ar: "فتح الصورة" })} ${attachment.originalName}`}>
          <img src={attachment.url} alt={attachment.originalName} className="max-h-60 w-full object-contain" loading="lazy" />
          <span className={`flex items-center gap-1 px-2 py-1 text-[10px] ${mine ? "text-primary-foreground/80" : "text-slate-500"}`}><ImageIcon className="h-3 w-3" aria-hidden="true" />{attachment.originalName} · {formatBytes(attachment.sizeBytes, lang)}</span>
        </a>
        : <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left focus-visible:outline-none focus-visible:ring-2 ${mine ? "border-white/25 bg-white/10 text-primary-foreground" : "border-slate-200 bg-white text-slate-700"}`} aria-label={`${t({ fr: "Ouvrir le PDF", en: "Open PDF", ar: "فتح ملف PDF" })} ${attachment.originalName}`}>
          <FileText className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="min-w-0"><span className="block truncate text-xs font-semibold">{attachment.originalName}</span><span className={`mt-0.5 block text-[10px] ${mine ? "text-primary-foreground/80" : "text-slate-500"}`}>PDF · {formatBytes(attachment.sizeBytes, lang)}</span></span>
        </a>,
      )}
    </div> : null}
    <p className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${mine ? "text-primary-foreground/75" : "text-slate-400"}`}>
      {dateLabel(message.createdAt)}
      {mine ? <Receipt message={message} isSending={isSending} /> : null}
    </p>
  </article>;
}

export function PrivateUnreadDivider({ count }: { count: number }) {
  const { t } = useLanguage();
  return <div className="flex items-center gap-3 py-1" role="status" aria-label={t({ fr: `${count} nouveau${count > 1 ? "x" : ""} message${count > 1 ? "s" : ""} non lu${count > 1 ? "s" : ""}`, en: `${count} new unread message${count > 1 ? "s" : ""}`, ar: `${count} رسالة جديدة غير مقروءة` })}>
    <span className="h-px flex-1 bg-amber-200" />
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">{t({ fr: `${count} nouveau${count > 1 ? "x" : ""} message${count > 1 ? "s" : ""}`, en: `${count} new message${count > 1 ? "s" : ""}`, ar: `${count} رسالة جديدة` })}</span>
    <span className="h-px flex-1 bg-amber-200" />
  </div>;
}
