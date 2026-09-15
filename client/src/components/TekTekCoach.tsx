import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpenCheck, Bot, CircleHelp, ExternalLink, Loader2, MessageCircleQuestion, Send, ShieldCheck, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { parseTekTekAnswerLines } from "@/lib/tektekPresentation";
import { formatTekTekCitation, normalizeTekTekLanguage, type TekTekCitation } from "@shared/tektek";
import { SUPPORT_HUB_EVENT, type SupportHubEventDetail } from "@/lib/supportHub";

type TekTekCoachProps = {
  certificationId: string;
  courseId: string;
  lessonIndex: number;
  chapterIndex: number;
  blockId?: string | null;
  videoTimeSeconds?: number | null;
  onNavigateToCitation: (citation: TekTekCitation) => void;
};

const COPY = {
  fr: {
    eyebrow: "Coach IA de la formation",
    title: "TekTek",
    subtitle: "Je vous aide à comprendre sans sortir de votre parcours.",
    open: "Demander à TekTek",
    prompt: "Qu’est-ce que je peux expliquer sur cet écran ?",
    input: "Posez une question sur ce cours ou cette formation…",
    send: "Envoyer",
    source: "Ouvrir la source",
    grounded: "Réponses fondées sur vos cours",
    nudge: "Une notion vous paraît floue ? TekTek peut l’expliquer à partir du cours.",
    dismiss: "Fermer ce rappel",
    current: "Contexte actuel",
    programme: "Formation ouverte",
    empty: "Je connais le cours ouvert, ses vidéos et les autres cours accessibles de cette formation. Que souhaitez-vous éclaircir ?",
    suggested: ["Explique-moi cet écran", "Résume cette séquence", "Où cette notion est-elle approfondie ?"],
    safety: "Je cite toujours mes sources et je ne fournis pas de réponse prête à soumettre pour un exercice évalué.",
  },
  en: {
    eyebrow: "AI coach for this training",
    title: "TekTek",
    subtitle: "I help you understand without leaving your learning path.",
    open: "Ask TekTek",
    prompt: "What can I explain about this screen?",
    input: "Ask about this course or training programme…",
    send: "Send",
    source: "Open source",
    grounded: "Answers grounded in your courses",
    nudge: "Is a concept unclear? TekTek can explain it from your course.",
    dismiss: "Dismiss this reminder",
    current: "Current context",
    programme: "Open training programme",
    empty: "I know the open course, its videos, and the other accessible courses in this training programme. What would you like to clarify?",
    suggested: ["Explain this screen", "Summarise this sequence", "Where is this topic explored further?"],
    safety: "I always cite my sources and do not provide ready-to-submit answers for assessed activities.",
  },
  ar: {
    eyebrow: "مدرب الذكاء الاصطناعي لهذا المسار",
    title: "TekTek",
    subtitle: "أساعدك على الفهم دون مغادرة مسار تعلمك.",
    open: "اسأل TekTek",
    prompt: "ما الذي يمكنني شرحه في هذه الشاشة؟",
    input: "اطرح سؤالاً حول هذه الدورة أو المسار التدريبي…",
    send: "إرسال",
    source: "فتح المصدر",
    grounded: "إجابات مستندة إلى دوراتك",
    nudge: "هل هناك مفهوم غير واضح؟ يمكن لـ TekTek شرحه من محتوى الدورة.",
    dismiss: "إغلاق هذا التذكير",
    current: "السياق الحالي",
    programme: "المسار التدريبي المفتوح",
    empty: "أعرف الدورة المفتوحة وفيديوهاتها والدورات الأخرى المتاحة في هذا المسار. ما الذي تريد توضيحه؟",
    suggested: ["اشرح هذه الشاشة", "لخّص هذا المقطع", "أين يتم التعمق في هذا الموضوع؟"],
    safety: "أستشهد دائماً بالمصادر ولا أقدم إجابات جاهزة للتسليم في الأنشطة التقييمية.",
  },
} as const;

function TekTekAnswer({ content }: { content: string }) {
  return (
    <div className="space-y-1.5 leading-relaxed">
      {parseTekTekAnswerLines(content).map((line, lineIndex) => (
        <p key={`${lineIndex}-${line.segments.map((segment) => segment.text).join("")}`} className={cn(line.bullet && "pl-4") }>
          {line.bullet && <span aria-hidden="true" className="-ml-4 mr-2">•</span>}
          {line.segments.map((segment, segmentIndex) => segment.emphasis
            ? <strong key={`${segmentIndex}-${segment.text}`} className="font-semibold">{segment.text}</strong>
            : <span key={`${segmentIndex}-${segment.text}`}>{segment.text}</span>)}
        </p>
      ))}
    </div>
  );
}

export function TekTekCoach({ certificationId, courseId, lessonIndex, chapterIndex, blockId, videoTimeSeconds, onNavigateToCitation }: TekTekCoachProps) {
  const { lang } = useLanguage();
  const language = normalizeTekTekLanguage(lang);
  const copy = COPY[language];
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const context = useMemo(() => ({ certificationId, courseId, lessonIndex, chapterIndex, blockId: blockId || null, videoTimeSeconds: videoTimeSeconds ?? null, language }), [certificationId, courseId, lessonIndex, chapterIndex, blockId, videoTimeSeconds, language]);
  const historyQuery = trpc.tektek.getHistory.useQuery({ certificationId, courseId, language }, { enabled: open });
  const contextHint = trpc.tektek.getContextHint.useQuery(context, { staleTime: 30_000 });
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!open) return;
    const viewport = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLDivElement | null;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [open, historyQuery.data?.length]);

  const askMutation = trpc.tektek.ask.useMutation({
    onSuccess: async () => {
      setQuestion("");
      await utils.tektek.getHistory.invalidate({ certificationId, courseId, language });
    },
  });

  const openCoach = (suggestedQuestion?: string) => {
    if (suggestedQuestion) setQuestion(suggestedQuestion);
    setOpen(true);
  };

  useEffect(() => {
    const handleSupportAction = (event: Event) => {
      const detail = (event as CustomEvent<SupportHubEventDetail>).detail;
      if (detail?.action === "open-tektek") openCoach();
    };
    window.addEventListener(SUPPORT_HUB_EVENT, handleSupportAction);
    return () => window.removeEventListener(SUPPORT_HUB_EVENT, handleSupportAction);
  }, [certificationId, courseId, language]);

  const submit = () => {
    const trimmed = question.trim();
    if (!trimmed || askMutation.isPending) return;
    askMutation.mutate({ ...context, question: trimmed });
  };

  const messages = historyQuery.data || [];
  const activeAvailable = contextHint.data?.available ?? true;

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-[29rem]" aria-describedby="tektek-description">
          <SheetHeader className="border-b bg-gradient-to-br from-primary/10 via-background to-amber-50 p-5 dark:to-amber-950/20">
            <div className="flex items-start gap-3">
              <div className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
                <Bot className="size-6" />
                <Sparkles className="absolute -right-2 -top-2 size-4 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{copy.eyebrow}</p>
                <SheetTitle className="mt-0.5 text-xl">{copy.title}</SheetTitle>
                <p id="tektek-description" className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-background/80 px-2.5 py-1 text-xs text-primary"><BookOpenCheck className="size-3.5" />{copy.current}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-50 px-2.5 py-1 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200"><ShieldCheck className="size-3.5" />{copy.grounded}</span>
              {!activeAvailable && <span className="inline-flex items-center gap-1 rounded-full border border-muted-foreground/20 px-2.5 py-1 text-xs text-muted-foreground">{copy.programme}</span>}
            </div>
          </SheetHeader>

          <ScrollArea ref={scrollRef} className="min-h-0 flex-1 bg-muted/20 px-4 py-5">
            {historyQuery.isLoading ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground"><Loader2 className="mr-2 size-4 animate-spin" />{copy.title}…</div>
            ) : messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-primary/25 bg-background p-4 text-sm text-muted-foreground">
                <MessageCircleQuestion className="mb-3 size-6 text-primary" />
                <p>{copy.empty}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {copy.suggested.map((suggestion) => <Button key={suggestion} type="button" variant="outline" size="sm" onClick={() => setQuestion(suggestion)} className="h-auto whitespace-normal text-left text-xs">{suggestion}</Button>)}
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-2">
                {messages.map((message) => (
                  <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[92%] rounded-2xl px-3.5 py-3 text-sm shadow-sm", message.role === "user" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border bg-background text-foreground")}>
                      {message.role === "assistant" && <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary"><Bot className="size-3.5" />{copy.title}</div>}
                      <TekTekAnswer content={message.content} />
                      {message.citations.length > 0 && (
                        <div className="mt-3 space-y-1.5 border-t border-border/70 pt-2.5">
                          {message.citations.map((citation) => (
                            <button key={citation.id} type="button" onClick={() => onNavigateToCitation(citation)} className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                              <ExternalLink className="size-3 shrink-0" />
                              <span className="min-w-0 flex-1 truncate">{formatTekTekCitation(citation, language)}</span>
                              <span className="shrink-0 opacity-75">{copy.source}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {askMutation.isPending && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />{copy.title}…</div>}
              </div>
            )}
          </ScrollArea>

          <div className="border-t bg-background p-4">
            <p className="mb-2 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground"><CircleHelp className="mt-0.5 size-3.5 shrink-0 text-primary" />{copy.safety}</p>
            {askMutation.error && <p role="alert" className="mb-2 text-xs text-destructive">{askMutation.error.message}</p>}
            <div className="flex items-end gap-2">
              <Textarea value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} placeholder={copy.input} maxLength={1000} rows={3} className="min-h-[76px] resize-none" aria-label={copy.input} />
              <Button type="button" size="icon" onClick={submit} disabled={!question.trim() || askMutation.isPending} aria-label={copy.send} className="mb-0.5 size-10 shrink-0"><Send className="size-4" /></Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
