import React from "react";
import { Bot, MessageCircleQuestion, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dispatchSupportHubAction } from "@/lib/supportHub";
import { cn } from "@/lib/utils";

type TekTekCourseCtaProps = {
  lang: string;
  placement: "header" | "footer" | "introduction";
  className?: string;
};

const COPY = {
  fr: {
    label: "Demander l’assistance de TekTek",
    short: "Demander à TekTek",
    title: "Une question sur le cours ?",
    description: "TekTek peut expliquer cet écran, clarifier une consigne et vous guider vers les passages utiles sans faire l’évaluation à votre place.",
  },
  en: {
    label: "Ask TekTek for help",
    short: "Ask TekTek",
    title: "A question about this course?",
    description: "TekTek can explain this screen, clarify an instruction, and guide you to useful passages without completing an assessment for you.",
  },
  ar: {
    label: "اطلب مساعدة TekTek",
    short: "اسأل TekTek",
    title: "هل لديك سؤال حول الدورة؟",
    description: "يمكن لـ TekTek شرح هذه الشاشة وتوضيح التعليمات وإرشادك إلى المقاطع المفيدة دون إنجاز التقييم بدلاً منك.",
  },
} as const;

export function TekTekCourseCta({ lang, placement, className }: TekTekCourseCtaProps) {
  const language = lang === "ar" ? "ar" : lang === "en" ? "en" : "fr";
  const copy = COPY[language];
  const openTekTek = () => dispatchSupportHubAction({ action: "open-tektek" });

  if (placement === "introduction") {
    return (
      <aside className={cn("rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-amber-50/70 p-4 dark:to-amber-950/20", className)} aria-label={copy.label}>
        <div className="flex items-start gap-3">
          <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Bot className="size-5" aria-hidden="true" />
            <Sparkles className="absolute -right-1.5 -top-1.5 size-3.5 text-amber-500" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">{copy.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy.description}</p>
            <Button type="button" size="sm" className="mt-3 gap-2" onClick={openTekTek} aria-label={copy.label} title={copy.label}>
              <MessageCircleQuestion className="size-4" aria-hidden="true" />
              {copy.short}
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={placement === "header" ? "outline" : "secondary"}
      className={cn("gap-2 whitespace-nowrap", placement === "header" && "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary", className)}
      onClick={openTekTek}
      aria-label={copy.label}
      title={copy.label}
    >
      <Bot className="size-4" aria-hidden="true" />
      <span>{copy.short}</span>
    </Button>
  );
}
