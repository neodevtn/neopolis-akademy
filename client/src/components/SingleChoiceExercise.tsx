import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, HelpCircle } from "lucide-react";

interface Option {
  id: string;
  text: string;
}

interface SingleChoiceExerciseProps {
  id: string;
  question: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
  lang?: 'en' | 'fr';
  onCorrect?: (id: string) => void;
  questionNumber?: number;
}

export function SingleChoiceExercise({
  id,
  question,
  options,
  correctAnswer,
  explanation,
  hint = "",
  lang = 'fr',
  onCorrect,
  questionNumber,
}: SingleChoiceExerciseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<Option[]>(options);

  const isCorrect = selectedAnswer === correctAnswer;

  const t = (en: string, fr: string) => lang === 'fr' ? fr : en;

  const handleSelect = (optionId: string) => {
    if (isSubmitted) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setIsSubmitted(true);
    if (selectedAnswer === correctAnswer && onCorrect) {
      onCorrect(id);
    }
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    // Shuffle the options order on retry to prevent memorization
    setShuffledOptions(prev => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  };

  const getLetterLabel = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="rounded-2xl bg-[#faf9f7] dark:bg-slate-800/60 border border-[#e8e5e0] dark:border-slate-700 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Question header */}
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#c75b3a]/10 shrink-0">
          <HelpCircle className="w-5 h-5 text-[#c75b3a]" />
        </div>
        <div className="flex-1 min-w-0 pt-1.5">
          {questionNumber && (
            <span className="text-[11px] font-bold text-[#c75b3a] uppercase tracking-wider mb-1.5 block">
              Question {questionNumber}
            </span>
          )}
          <p className="text-base font-semibold text-foreground leading-relaxed" style={{ fontFamily: 'Lora, Georgia, serif' }}>
            {question}
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3 pl-1">
        {shuffledOptions.map((option, idx) => {
          const letter = getLetterLabel(idx);
          const isSelected = selectedAnswer === option.id;
          const isThisCorrect = option.id === correctAnswer;

          let containerClass = "border border-[#e8e5e0] dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-[#c75b3a]/40 hover:shadow-sm cursor-pointer";
          let letterClass = "bg-[#c75b3a]/10 text-[#c75b3a] border-[#c75b3a]/20";

          if (isSelected && !isSubmitted) {
            containerClass = "border-2 border-[#c75b3a] bg-[#c75b3a]/5 dark:bg-[#c75b3a]/10 shadow-sm ring-2 ring-[#c75b3a]/10";
            letterClass = "bg-[#c75b3a] text-white border-[#c75b3a]";
          }

          if (isSubmitted) {
            if (isThisCorrect) {
              containerClass = "border-2 border-emerald-400 bg-emerald-50/80 dark:bg-emerald-900/20 shadow-sm";
              letterClass = "bg-emerald-500 text-white border-emerald-500";
            } else if (isSelected && !isCorrect) {
              containerClass = "border-2 border-red-300 bg-red-50/80 dark:bg-red-900/20";
              letterClass = "bg-red-500 text-white border-red-500";
            } else {
              containerClass = "border border-[#e8e5e0]/60 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 opacity-50";
              letterClass = "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600";
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={isSubmitted}
              className={`w-full text-left px-5 py-4 rounded-xl flex items-center gap-4 transition-all duration-200 ${containerClass}`}
            >
              <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold transition-all ${letterClass}`}>
                {letter}
              </span>
              <span className="text-sm text-foreground/90 leading-relaxed flex-1">
                {option.text}
              </span>
              {isSubmitted && isThisCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              {isSubmitted && isSelected && !isCorrect && !isThisCorrect && (
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {hint && !isSubmitted && (
        <details className="ml-1 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-900">
          <summary className="cursor-pointer font-medium">{t("Show hint", "Afficher l’indice")}</summary>
          <p className="mt-2 leading-relaxed">{hint}</p>
        </details>
      )}

      {/* Submit / Result */}
      <div className="pl-1 pt-1">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="px-8 py-3 rounded-xl bg-[#c75b3a] hover:bg-[#a84a2e] text-white text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.97]"
          >
            {t("Check Answer", "Vérifier la réponse")}
          </button>
        ) : (
          <div className="space-y-4">
            {/* Result banner */}
            <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl ${
              isCorrect 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {t("Correct!", "Correct !")}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                    {t("Incorrect — the correct answer is highlighted above", "Incorrect — la bonne réponse est indiquée ci-dessus")}
                  </span>
                </>
              )}
            </div>
            {/* Explanation */}
            {explanation && (
              <div className="bg-white dark:bg-slate-800 border border-[#e8e5e0] dark:border-slate-600 rounded-xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  {t("Explanation", "Explication")}
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {explanation}
                </p>
              </div>
            )}
            {/* Retry button */}
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#e8e5e0] dark:border-slate-600 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-200 hover:shadow-sm active:scale-[0.97]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t("Try again", "Réessayer")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
