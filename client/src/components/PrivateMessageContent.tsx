import { Check, CheckCheck, FileText, ImageIcon } from "lucide-react";
import { privateMessageReceiptLabel } from "@shared/privateMessaging";
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

function receiptForMessage(message: PrivateMessageView, lang: "fr" | "en" | "ar") {
  return message.authorRole === "admin"
    ? privateMessageReceiptLabel({ deliveredAt: message.learnerDeliveredAt, readAt: message.learnerReadAt }, lang)
    : privateMessageReceiptLabel({ deliveredAt: message.adminDeliveredAt, readAt: message.adminReadAt }, lang);
}

function Receipt({ message }: { message: PrivateMessageView }) {
  const { lang, t } = useLanguage();
  const status = receiptForMessage(message, lang);
  const viewed = Boolean(message.authorRole === "admin" ? message.learnerReadAt : message.adminReadAt);
  const delivered = Boolean(message.authorRole === "admin" ? message.learnerDeliveredAt : message.adminDeliveredAt);
  const iconClass = viewed ? "text-sky-200" : "text-primary-foreground/75";
  return <span className="inline-flex items-center gap-1" title={status} aria-label={`${t({ fr: "Statut du message", en: "Message status", ar: "حالة الرسالة" })} : ${status}`}>
    {!delivered ? <Check className={iconClass} aria-hidden="true" /> : <CheckCheck className={iconClass} aria-hidden="true" />}
    <span className="sr-only">{status}</span>
  </span>;
}

export function PrivateMessageBubble({
  message,
  mine,
  author,
  dateLabel,
}: {
  message: PrivateMessageView;
  mine: boolean;
  author: string;
  dateLabel: (value: Date | string) => string;
}) {
  const { lang, t } = useLanguage();
  const attachments = message.attachments || [];
  return <article className={`max-w-[88%] rounded-xl px-3 py-2.5 text-sm ${mine ? "ml-auto bg-primary text-primary-foreground" : "bg-slate-100 text-slate-800"}`}>
    <p className={`mb-1 text-[11px] font-semibold ${mine ? "text-primary-foreground/80" : "text-slate-500"}`}>{author}</p>
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
      {mine ? <Receipt message={message} /> : null}
    </p>
  </article>;
}
