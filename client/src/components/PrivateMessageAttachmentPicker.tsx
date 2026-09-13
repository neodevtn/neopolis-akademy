import { Paperclip, X } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PRIVATE_MESSAGE_ATTACHMENT_LIMITS, PRIVATE_MESSAGE_ATTACHMENT_MIME_TYPES, type PrivateMessageAttachmentMimeType } from "@shared/privateMessaging";

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
    reader.onerror = () => reject(new Error("Impossible de lire ce fichier."));
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chooseFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    const available = PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxFilesPerMessage - attachments.length;
    if (files.length > available) {
      toast.error(`Vous pouvez joindre au maximum ${PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxFilesPerMessage} fichiers.`);
      return;
    }
    try {
      const next = await Promise.all(files.map(async (file) => {
        if (!acceptedTypes.has(file.type)) throw new Error("Seules les images JPEG, PNG, GIF, WebP et les PDF sont autorisés.");
        if (file.size > PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxBytes) throw new Error("Chaque pièce jointe doit peser au maximum 10 Mo.");
        return { filename: file.name, mimeType: file.type as PrivateMessageAttachmentMimeType, base64: await readBase64(file), sizeBytes: file.size };
      }));
      onChange([...attachments, ...next]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d’ajouter ce fichier.");
    }
  };
  return <div className="space-y-2">
    <input ref={inputRef} type="file" className="sr-only" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf" multiple onChange={chooseFiles} disabled={disabled} />
    <Button type="button" size="sm" variant="ghost" className="gap-1.5 text-slate-600" disabled={disabled || attachments.length >= PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxFilesPerMessage} onClick={() => inputRef.current?.click()}>
      <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />Joindre
    </Button>
    {attachments.length ? <div className="flex flex-wrap gap-1.5" aria-label="Pièces jointes sélectionnées">
      {attachments.map((attachment, index) => <span key={`${attachment.filename}-${index}`} className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-700"><span className="max-w-40 truncate">{attachment.filename}</span><Button type="button" variant="ghost" size="icon" className="h-4 w-4" aria-label={`Retirer ${attachment.filename}`} onClick={() => onChange(attachments.filter((_, currentIndex) => currentIndex !== index))}><X className="h-3 w-3" /></Button></span>)}
    </div> : null}
    <p className="text-[10px] text-slate-500">Images ou PDF uniquement · 10 Mo maximum par fichier.</p>
  </div>;
}
