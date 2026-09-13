import { Paperclip, X } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PRIVATE_MESSAGE_ATTACHMENT_LIMITS, PRIVATE_MESSAGE_ATTACHMENT_MIME_TYPES, type PrivateMessageAttachmentMimeType } from "@shared/privateMessaging";
import { useLanguage } from "@/contexts/LanguageContext";

export type PendingPrivateMessageAttachment = {
  filename: string;
  mimeType: PrivateMessageAttachmentMimeType;
  base64: string;
  sizeBytes: number;
};

const acceptedTypes = new Set<string>(PRIVATE_MESSAGE_ATTACHMENT_MIME_TYPES);

function readBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read this file."));
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.split(",", 2)[1];
      if (!base64) reject(new Error("Le fichier est invalide."));
      else resolve(base64);
    };
    reader.readAsDataURL(file);
  });
}

export function PrivateMessageAttachmentPicker({
  attachments,
  onChange,
  disabled = false,
}: {
  attachments: PendingPrivateMessageAttachment[];
  onChange: (attachments: PendingPrivateMessageAttachment[]) => void;
  disabled?: boolean;
}) {
  const { lang, t } = useLanguage();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chooseFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    const available = PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxFilesPerMessage - attachments.length;
    if (files.length > available) {
      toast.error(t({ fr: `Vous pouvez joindre au maximum ${PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxFilesPerMessage} fichiers.`, en: `You can attach up to ${PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxFilesPerMessage} files.`, ar: `يمكنك إرفاق ما يصل إلى ${PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxFilesPerMessage} ملفات.` }));
      return;
    }
    try {
      const next = await Promise.all(files.map(async (file) => {
        if (!acceptedTypes.has(file.type)) throw new Error(t({ fr: "Seules les images JPEG, PNG, GIF, WebP et les PDF sont autorisés.", en: "Only JPEG, PNG, GIF, WebP images and PDFs are allowed.", ar: "يسمح فقط بصور JPEG وPNG وGIF وWebP وملفات PDF." }));
        if (file.size > PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxBytes) throw new Error(t({ fr: "Chaque pièce jointe doit peser au maximum 10 Mo.", en: "Each attachment must be 10 MB or less.", ar: "يجب ألا يتجاوز حجم كل مرفق 10 ميغابايت." }));
        return { filename: file.name, mimeType: file.type as PrivateMessageAttachmentMimeType, base64: await readBase64(file), sizeBytes: file.size };
      }));
      onChange([...attachments, ...next]);
    } catch (error) {
      toast.error(error instanceof Error ? (error.message === "Unable to read this file." ? t({ fr: "Impossible de lire ce fichier.", en: "Unable to read this file.", ar: "تعذر قراءة هذا الملف." }) : error.message) : t({ fr: "Impossible d’ajouter ce fichier.", en: "Unable to add this file.", ar: "تعذر إضافة هذا الملف." }));
    }
  };
  return <div className="space-y-2">
    <input ref={inputRef} type="file" className="sr-only" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf" multiple onChange={chooseFiles} disabled={disabled} />
    <Button type="button" size="sm" variant="ghost" className="gap-1.5 text-slate-600" disabled={disabled || attachments.length >= PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxFilesPerMessage} onClick={() => inputRef.current?.click()}>
      <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />{t({ fr: "Joindre", en: "Attach", ar: "إرفاق" })}
    </Button>
    {attachments.length ? <div className="flex flex-wrap gap-1.5" aria-label={t({ fr: "Pièces jointes sélectionnées", en: "Selected attachments", ar: "المرفقات المحددة" })}>
      {attachments.map((attachment, index) => <span key={`${attachment.filename}-${index}`} className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-700"><span className="max-w-40 truncate">{attachment.filename}</span><Button type="button" variant="ghost" size="icon" className="h-4 w-4" aria-label={`${t({ fr: "Retirer", en: "Remove", ar: "إزالة" })} ${attachment.filename}`} onClick={() => onChange(attachments.filter((_, currentIndex) => currentIndex !== index))}><X className="h-3 w-3" /></Button></span>)}
    </div> : null}
    <p className="text-[10px] text-slate-500">{t({ fr: "Images ou PDF uniquement · 10 Mo maximum par fichier.", en: "Images or PDFs only · 10 MB maximum per file.", ar: "الصور أو ملفات PDF فقط · بحد أقصى 10 ميغابايت لكل ملف." })}</p>
  </div>;
}
