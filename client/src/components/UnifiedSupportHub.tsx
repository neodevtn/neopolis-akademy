import { type ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Bot, Bug, ChevronRight, GripVertical, LifeBuoy, Maximize2, MessageCircle, MessagesSquare, Minimize2, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { isAdministrativeRole } from "@shared/roles";
import { dispatchSupportHubAction } from "@/lib/supportHub";
import { PrivateMessagingNotificationCenter } from "@/components/PrivateMessagingNotificationCenter";
import { validateTechnicalFeedbackInput } from "@/lib/sentryFeedback";
import { TechnicalEvidencePicker, type EvidenceFile } from "@/components/TechnicalEvidencePicker";
import { submitTechnicalSupportFeedbackToSentry } from "@/lib/technicalSupportEvidence";

type LauncherPosition = { left: number; top: number };
const SUPPORT_LAUNCHER_POSITION_KEY = "neopolis_support_launcher_position_v1";
const SUPPORT_LAUNCHER_COMPACT_KEY = "neopolis_support_launcher_compact_v1";

function loadLauncherPosition(): LauncherPosition | null {
  try {
    const raw = window.localStorage.getItem(SUPPORT_LAUNCHER_POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LauncherPosition>;
    return Number.isFinite(parsed.left) && Number.isFinite(parsed.top) ? { left: Number(parsed.left), top: Number(parsed.top) } : null;
  } catch {
    return null;
  }
}

type ActionItemProps = {
  icon: typeof MessageCircle;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: ReactNode;
};

function ActionItem({ icon: Icon, title, description, onClick, disabled, badge }: ActionItemProps) {
  return <button type="button" disabled={disabled} onClick={onClick} className="flex w-full items-start gap-3 border-b border-slate-100 px-1 py-3 text-left last:border-b-0 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
    <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="text-sm font-semibold text-slate-950">{title}</span>{badge}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span></span>
    <ChevronRight className="mt-2 size-4 shrink-0 text-slate-400" aria-hidden="true" />
  </button>;
}

/** Single, persistent entry point for human support, private conversations and contextual course coaching. */
export function UnifiedSupportHub() {
  const { isAuthenticated, user } = useAuth();
  const { lang, t } = useLanguage();
  const [pathname, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [report, setReport] = useState("");
  const [evidence, setEvidence] = useState<EvidenceFile[]>([]);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [compactLauncher, setCompactLauncher] = useState(false);
  const [launcherPosition, setLauncherPosition] = useState<LauncherPosition | null>(null);
  const launcherRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);
  const isAdmin = isAdministrativeRole(user?.role);
  const isLesson = /^\/training\/[^/]+\/[^/]+/.test(pathname);
  const reportMutation = trpc.system.reportError.useMutation();
  const sentryFeedbackMutation = trpc.system.submitTechnicalFeedback.useMutation();

  useEffect(() => {
    setLauncherPosition(loadLauncherPosition());
    try {
      setCompactLauncher(window.localStorage.getItem(SUPPORT_LAUNCHER_COMPACT_KEY) === "true");
    } catch {
      // The support entry point remains available when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const offset = dragOffsetRef.current;
      const launcher = launcherRef.current;
      if (!offset || !launcher) return;
      const rect = launcher.getBoundingClientRect();
      const position = {
        left: Math.max(12, Math.min(event.clientX - offset.x, window.innerWidth - rect.width - 12)),
        top: Math.max(12, Math.min(event.clientY - offset.y, window.innerHeight - rect.height - 12)),
      };
      setLauncherPosition(position);
      try { window.localStorage.setItem(SUPPORT_LAUNCHER_POSITION_KEY, JSON.stringify(position)); } catch { /* Non-essential preference. */ }
    };
    const end = () => { dragOffsetRef.current = null; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
  }, []);

  const startLauncherDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const rect = launcherRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragOffsetRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const setLauncherCompact = (compact: boolean) => {
    setCompactLauncher(compact);
    try { window.localStorage.setItem(SUPPORT_LAUNCHER_COMPACT_KEY, String(compact)); } catch { /* Non-essential preference. */ }
  };

  const submitTechnicalReport = async () => {
    const message = report.trim();
    if (message.length < 6) return;
    setIsSubmittingReport(true);
    try {
      validateTechnicalFeedbackInput({ message, url: window.location.href, name: user?.name, email: user?.email });
      const [feedbackResult, internalResult] = await Promise.allSettled([
        submitTechnicalSupportFeedbackToSentry({ message, url: window.location.href, name: user?.name || undefined, email: user?.email || undefined, evidence }),
        reportMutation.mutateAsync({ message: `Support hub: ${message}`.slice(0, 500), source: "manual", url: window.location.href, timestamp: Date.now(), stack: "", componentStack: "" }),
      ]);
      let sentryAccepted = feedbackResult.status === "fulfilled";
      if (!sentryAccepted) {
        try {
          const fallback = await sentryFeedbackMutation.mutateAsync({ message, url: window.location.href, name: user?.name || undefined, email: user?.email || undefined });
          sentryAccepted = fallback.accepted;
        } catch {
          // The Neopolis copy below remains available when both Sentry paths fail.
        }
      }
      if (internalResult.status === "rejected" && !sentryAccepted) throw internalResult.reason;
      setReport("");
      setEvidence([]);
      setReportOpen(false);
      if (!sentryAccepted || internalResult.status === "rejected") {
        toast.warning(t({ fr: "Votre signalement a été conservé par Neopolis, mais sa copie dans Sentry n’a pas pu être confirmée. L’équipe technique peut tout de même le traiter.", en: "Your report was saved by Neopolis, but its Sentry copy could not be confirmed. The technical team can still handle it.", ar: "تم حفظ البلاغ لدى نيوبوليس، لكن لم يتأكد نسخه في Sentry. لا يزال بإمكان الفريق التقني معالجته." }));
        return;
      }
      toast.success(t({ fr: "Votre signalement a été transmis à l’équipe technique.", en: "Your report was sent to the technical team.", ar: "تم إرسال البلاغ إلى الفريق التقني." }));
    } catch {
      toast.error(t({ fr: "Le signalement ne peut pas être envoyé pour le moment. Réessayez dans quelques instants.", en: "The report cannot be sent right now. Please try again shortly.", ar: "لا يمكن إرسال البلاغ حاليًا. يُرجى المحاولة لاحقًا." }));
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const closeThen = (callback: () => void) => {
    setOpen(false);
    window.setTimeout(callback, 0);
  };

  const openConversations = () => closeThen(() => {
    if (isAdmin) navigate("/admin?tab=messages");
    else dispatchSupportHubAction({ action: "open-conversations" });
  });
  const newConversation = () => closeThen(() => {
    if (isAdmin) navigate("/admin?tab=messages&compose=1");
    else dispatchSupportHubAction({ action: "new-conversation" });
  });
  const openCoach = () => closeThen(() => {
    if (isLesson) dispatchSupportHubAction({ action: "open-tektek" });
    else {
      toast.info(t({ fr: "TekTek accompagne le cours ouvert. Choisissez une formation puis ouvrez une leçon.", en: "TekTek supports the open course. Choose a training programme, then open a lesson.", ar: "يرافق TekTek الدورة المفتوحة. اختر مسارًا تدريبيًا ثم افتح درسًا." }));
      navigate("/training");
    }
  });

  const title = t({ fr: "Besoin d’aide ?", en: "Need help?", ar: "هل تحتاج إلى مساعدة؟" });
  const isPublic = !isAuthenticated;
  return <>
    <div ref={launcherRef} className="fixed bottom-5 right-5 z-[65] sm:bottom-6 sm:right-6" style={launcherPosition ? { left: launcherPosition.left, top: launcherPosition.top, right: "auto", bottom: "auto" } : undefined}>
      <div className="flex items-center overflow-hidden rounded-full bg-slate-950 text-white shadow-lg shadow-slate-900/20">
          <Button type="button" variant="ghost" size="icon" onPointerDown={startLauncherDrag} className="size-9 cursor-grab rounded-none text-slate-300 hover:bg-white/10 hover:text-white active:cursor-grabbing" aria-label={t({ fr: "Déplacer le bouton d’aide", en: "Move the help button", ar: "نقل زر المساعدة" })} title={t({ fr: "Déplacer", en: "Move", ar: "نقل" })}><GripVertical className="size-4" /></Button>
          <Button type="button" onClick={() => setOpen(true)} className={compactLauncher ? "size-11 rounded-none bg-slate-950 px-0 hover:bg-slate-800" : "h-12 gap-2 rounded-none bg-slate-950 px-4 hover:bg-slate-800"} aria-haspopup="dialog" aria-expanded={open} aria-label={compactLauncher ? title : undefined}>
            <span className="relative flex size-7 items-center justify-center rounded-full bg-white/15"><LifeBuoy className="size-4" /><span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-amber-300 ring-2 ring-slate-950" /></span>
            {!compactLauncher ? <span className="font-semibold">{title}</span> : null}
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => setLauncherCompact(!compactLauncher)} className="size-9 rounded-none text-slate-300 hover:bg-white/10 hover:text-white" aria-label={compactLauncher ? t({ fr: "Agrandir le bouton d’aide", en: "Expand the help button", ar: "توسيع زر المساعدة" }) : t({ fr: "Réduire le bouton d’aide", en: "Minimize the help button", ar: "تصغير زر المساعدة" })} title={compactLauncher ? t({ fr: "Agrandir", en: "Expand", ar: "توسيع" }) : t({ fr: "Réduire", en: "Minimize", ar: "تصغير" })}>{compactLauncher ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}</Button>
      </div>
    </div>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-6"><div><DialogTitle className="flex items-center gap-2"><LifeBuoy className="size-5 text-primary" />{t({ fr: "Centre d’assistance", en: "Support centre", ar: "مركز الدعم" })}</DialogTitle><DialogDescription className="mt-1.5">{t({ fr: "Choisissez le bon canal. Les conversations privées, les signalements techniques et TekTek restent séparés et protégés.", en: "Choose the right channel. Private conversations, technical reports and TekTek remain separate and protected.", ar: "اختر القناة المناسبة. تظل المحادثات الخاصة والبلاغات التقنية وTekTek منفصلة ومحمية." })}</DialogDescription></div>{isAuthenticated ? <PrivateMessagingNotificationCenter isAdmin={isAdmin} onOpenConversation={(conversationId) => closeThen(() => isAdmin ? navigate(`/admin?tab=messages&conversation=${conversationId}`) : dispatchSupportHubAction({ action: "open-conversation", conversationId }))} /> : null}</div>
        </DialogHeader>
        <div className="mt-2">
          <ActionItem icon={Bug} title={t({ fr: "Signaler un problème technique", en: "Report a technical problem", ar: "الإبلاغ عن مشكلة تقنية" })} description={t({ fr: "Décrivez un affichage, un chargement ou une action qui ne fonctionne pas.", en: "Describe a display, loading or action that does not work.", ar: "صف عرضًا أو تحميلًا أو إجراءً لا يعمل." })} onClick={() => closeThen(() => setReportOpen(true))} />
          <ActionItem icon={MessageCircle} title={t({ fr: "Nouvelle conversation avec Neopolis", en: "New conversation with Neopolis", ar: "محادثة جديدة مع نيوبوليس" })} description={isPublic ? t({ fr: "Connectez-vous pour demander de l’aide à l’équipe.", en: "Sign in to ask the team for help.", ar: "سجّل الدخول لطلب المساعدة من الفريق." }) : t({ fr: "Posez une question à l’équipe ou envoyez un signalement privé.", en: "Ask the team a question or send a private report.", ar: "اطرح سؤالًا على الفريق أو أرسل بلاغًا خاصًا." })} onClick={newConversation} disabled={isPublic} />
          <ActionItem icon={MessagesSquare} title={t({ fr: "Voir mes conversations ouvertes", en: "View my open conversations", ar: "عرض محادثاتي المفتوحة" })} description={isPublic ? t({ fr: "Connectez-vous pour consulter vos échanges privés.", en: "Sign in to view your private exchanges.", ar: "سجّل الدخول لعرض محادثاتك الخاصة." }) : t({ fr: "Retrouvez les fils encore actifs avec l’équipe Neopolis.", en: "Find threads that are still active with the Neopolis team.", ar: "ابحث عن المحادثات النشطة مع فريق نيوبوليس." })} onClick={openConversations} disabled={isPublic} />
          <ActionItem icon={Bot} title={t({ fr: "Demander à TekTek", en: "Ask TekTek", ar: "اسأل TekTek" })} description={isLesson ? t({ fr: "Obtenez une explication sourcée depuis le cours et ses vidéos.", en: "Get a cited explanation from the course and its videos.", ar: "احصل على شرح موثق من الدورة وفيديوهاتها." }) : t({ fr: "TekTek vous accompagne dans une leçon de formation.", en: "TekTek supports you inside a training lesson.", ar: "يرافقك TekTek داخل درس تدريبي." })} onClick={openCoach} />
        </div>
      </DialogContent>
    </Dialog>

    <Dialog open={reportOpen} onOpenChange={setReportOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t({ fr: "Signaler un problème technique", en: "Report a technical problem", ar: "الإبلاغ عن مشكلة تقنية" })}</DialogTitle><DialogDescription>{t({ fr: "Expliquez ce qui s’est passé. Vous pouvez joindre une capture ou un enregistrement d’écran : les preuves partent directement dans le signalement Sentry. N’ajoutez ni mot de passe ni information sensible.", en: "Explain what happened. You may attach a screenshot or screen recording: evidence is sent directly with the Sentry report. Do not include a password or sensitive information.", ar: "اشرح ما حدث. يمكنك إرفاق لقطة شاشة أو تسجيل للشاشة: يُرسل الدليل مباشرة مع بلاغ Sentry. لا تُدرج كلمة مرور أو معلومات حساسة." })}</DialogDescription></DialogHeader>
        <Textarea value={report} onChange={(event) => setReport(event.target.value)} maxLength={450} rows={6} placeholder={t({ fr: "Ex. Le bouton de validation reste bloqué après…", en: "E.g. The validation button remains blocked after…", ar: "مثال: يبقى زر التحقق عالقًا بعد…" })} aria-label={t({ fr: "Description du problème technique", en: "Technical problem description", ar: "وصف المشكلة التقنية" })} />
        <TechnicalEvidencePicker evidence={evidence} onChange={setEvidence} disabled={isSubmittingReport} />
        <DialogFooter><Button variant="outline" onClick={() => setReportOpen(false)} disabled={isSubmittingReport}>{t({ fr: "Annuler", en: "Cancel", ar: "إلغاء" })}</Button><Button disabled={report.trim().length < 6 || isSubmittingReport} onClick={submitTechnicalReport}>{isSubmittingReport ? t({ fr: "Envoi…", en: "Sending…", ar: "جارٍ الإرسال…" }) : <><Send className="mr-2 size-4" />{t({ fr: "Envoyer le signalement", en: "Send report", ar: "إرسال البلاغ" })}</>}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}
