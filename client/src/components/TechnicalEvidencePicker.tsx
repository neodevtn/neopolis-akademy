import { Camera, Paperclip, Square, Video, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  TECHNICAL_SUPPORT_EVIDENCE_LIMITS,
  validateTechnicalSupportEvidence,
  type TechnicalSupportEvidence,
} from "@/lib/technicalSupportEvidence";
import { useLanguage } from "@/contexts/LanguageContext";

export type EvidenceFile = File & TechnicalSupportEvidence;

function captureDisplayStream() {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("SCREEN_CAPTURE_UNSUPPORTED");
  }
  return navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
}

function mediaRecorderOptions(): MediaRecorderOptions | undefined {
  const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  const mimeType = candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
  return mimeType ? { mimeType } : undefined;
}

function toFriendlyFilename(value: string) {
  return value.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "") || "preuve-technique";
}

/**
 * Collects only user-authorized visual evidence. It does not start a capture or
 * recording until the learner explicitly chooses a browser tab, window or screen.
 */
export function TechnicalEvidencePicker({
  evidence,
  onChange,
  disabled = false,
}: {
  evidence: EvidenceFile[];
  onChange: (evidence: EvidenceFile[]) => void;
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const [recording, setRecording] = useState(false);

  const describeError = (error: unknown) => {
    const code = error instanceof Error ? error.message : "";
    if (code === "SCREEN_CAPTURE_UNSUPPORTED") {
      return t({ fr: "Votre navigateur ne permet pas cette capture. Ajoutez une image ou une vidéo manuellement.", en: "Your browser does not support this capture. Add an image or video manually.", ar: "لا يدعم متصفحك هذا الالتقاط. أضف صورة أو فيديو يدويًا." });
    }
    if (code === "NotAllowedError" || code === "PermissionDeniedError") {
      return t({ fr: "La capture a été annulée ou refusée.", en: "The capture was cancelled or denied.", ar: "تم إلغاء الالتقاط أو رفضه." });
    }
    return error instanceof Error ? error.message : t({ fr: "Impossible d’ajouter cette preuve.", en: "Unable to add this evidence.", ar: "تعذر إضافة هذا الدليل." });
  };

  const append = (files: EvidenceFile[]) => {
    try {
      const next = [...evidence, ...files];
      validateTechnicalSupportEvidence(next);
      onChange(next);
      return true;
    } catch (error) {
      toast.error(describeError(error));
      return false;
    }
  };

  const releaseCapture = () => {
    if (stopTimerRef.current !== null) window.clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setRecording(false);
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    else releaseCapture();
  };

  useEffect(() => () => releaseCapture(), []);

  const chooseFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as EvidenceFile[];
    event.target.value = "";
    if (!files.length) return;
    append(files);
  };

  const captureScreenshot = async () => {
    try {
      const stream = await captureDisplayStream();
      const [track] = stream.getVideoTracks();
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      await video.play();
      await new Promise<void>((resolve) => {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) resolve();
        else video.addEventListener("loadeddata", () => resolve(), { once: true });
      });

      const maximumWidth = 1920;
      const width = Math.min(video.videoWidth || maximumWidth, maximumWidth);
      const height = Math.max(1, Math.round((video.videoHeight || 1080) * (width / Math.max(video.videoWidth || width, 1))));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")?.drawImage(video, 0, 0, width, height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.84));
      stream.getTracks().forEach((currentTrack) => currentTrack.stop());
      video.srcObject = null;
      if (!blob) throw new Error("Impossible de créer la capture.");
      append([new File([blob], `neopolis-capture-${Date.now()}.jpg`, { type: "image/jpeg" }) as EvidenceFile]);
    } catch (error) {
      toast.error(describeError(error));
    }
  };

  const startRecording = async () => {
    try {
      if (typeof MediaRecorder === "undefined") throw new Error("SCREEN_CAPTURE_UNSUPPORTED");
      const stream = await captureDisplayStream();
      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream, mediaRecorderOptions());
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onerror = () => {
        toast.error(t({ fr: "L’enregistrement a rencontré un problème.", en: "The recording encountered a problem.", ar: "واجه التسجيل مشكلة." }));
        releaseCapture();
      };
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "video/webm";
        const blob = new Blob(chunks, { type: mimeType });
        releaseCapture();
        if (!blob.size) return;
        const extension = mimeType.includes("mp4") ? "mp4" : "webm";
        append([new File([blob], `neopolis-enregistrement-${Date.now()}.${extension}`, { type: mimeType }) as EvidenceFile]);
      };
      stream.getTracks().forEach((track) => track.addEventListener("ended", stopRecording, { once: true }));
      recorder.start(1_000);
      setRecording(true);
      stopTimerRef.current = window.setTimeout(() => {
        toast.info(t({ fr: "La durée maximale d’une minute est atteinte : l’enregistrement est joint.", en: "The one-minute maximum has been reached: the recording is attached.", ar: "تم بلوغ الحد الأقصى لدقيقة واحدة: تم إرفاق التسجيل." }));
        stopRecording();
      }, TECHNICAL_SUPPORT_EVIDENCE_LIMITS.maxRecordingDurationMs);
    } catch (error) {
      releaseCapture();
      toast.error(describeError(error));
    }
  };

  return <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-3" aria-label={t({ fr: "Preuves visuelles facultatives", en: "Optional visual evidence", ar: "دليل مرئي اختياري" })}>
    <div className="flex flex-wrap items-center gap-2">
      <input ref={fileInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,video/webm,video/mp4" multiple onChange={chooseFiles} disabled={disabled || recording} />
      <Button type="button" size="sm" variant="outline" className="gap-1.5 bg-white" onClick={() => fileInputRef.current?.click()} disabled={disabled || recording || evidence.length >= TECHNICAL_SUPPORT_EVIDENCE_LIMITS.maxFiles}>
        <Paperclip className="size-3.5" aria-hidden="true" />{t({ fr: "Joindre", en: "Attach", ar: "إرفاق" })}
      </Button>
      <Button type="button" size="sm" variant="outline" className="gap-1.5 bg-white" onClick={captureScreenshot} disabled={disabled || recording || evidence.length >= TECHNICAL_SUPPORT_EVIDENCE_LIMITS.maxFiles}>
        <Camera className="size-3.5" aria-hidden="true" />{t({ fr: "Capturer l’écran", en: "Capture screen", ar: "التقاط الشاشة" })}
      </Button>
      {recording ? <Button type="button" size="sm" variant="destructive" className="gap-1.5" onClick={stopRecording} disabled={disabled}>
        <Square className="size-3.5 fill-current" aria-hidden="true" />{t({ fr: "Arrêter l’enregistrement", en: "Stop recording", ar: "إيقاف التسجيل" })}
      </Button> : <Button type="button" size="sm" variant="outline" className="gap-1.5 bg-white" onClick={startRecording} disabled={disabled || evidence.length >= TECHNICAL_SUPPORT_EVIDENCE_LIMITS.maxFiles}>
        <Video className="size-3.5" aria-hidden="true" />{t({ fr: "Enregistrer l’écran", en: "Record screen", ar: "تسجيل الشاشة" })}
      </Button>}
    </div>
    <p className="mt-2 text-[11px] leading-4 text-slate-600">{t({ fr: "Facultatif : choisissez exactement la fenêtre ou l’onglet à partager. Rien n’est capturé avant votre accord. Images ou vidéo ≤ 15 Mo chacune, 20 Mo au total, enregistrement limité à 1 minute.", en: "Optional: choose exactly which window or tab to share. Nothing is captured before your permission. Images or video up to 15 MB each, 20 MB total, with recordings limited to 1 minute.", ar: "اختياري: اختر النافذة أو علامة التبويب التي تريد مشاركتها بالضبط. لا يتم التقاط أي شيء قبل موافقتك. صور أو فيديو حتى 15 ميغابايت لكل منها، و20 ميغابايت إجمالاً، مع تسجيلات محددة بدقيقة واحدة." })}</p>
    {evidence.length ? <div className="mt-2 flex flex-wrap gap-1.5" aria-label={t({ fr: "Preuves sélectionnées", en: "Selected evidence", ar: "الأدلة المحددة" })}>
      {evidence.map((item, index) => <span key={`${item.name}-${index}`} className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-white py-1 pl-2 pr-1 text-[11px] text-slate-700"><span className="max-w-52 truncate">{toFriendlyFilename(item.name)}</span><Button type="button" variant="ghost" size="icon" className="size-5" disabled={disabled || recording} aria-label={`${t({ fr: "Retirer", en: "Remove", ar: "إزالة" })} ${item.name}`} onClick={() => onChange(evidence.filter((_, currentIndex) => currentIndex !== index))}><X className="size-3" /></Button></span>)}
    </div> : null}
  </section>;
}
