import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

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
}

export function SingleChoiceExercise({
  id,
  question,
  options,
  correctAnswer,
  explanation,
}: SingleChoiceExerciseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCorrect = selectedAnswer === correctAnswer;

  const handleSelect = (optionId: string) => {
    if (isSubmitted) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
  };

  const getLetterLabel = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-6 space-y-5">
      {/* Question header */}
      <div className="flex items-start gap-3">
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide shrink-0">
          Q1
        </span>
        <p className="text-sm font-semibold text-foreground leading-relaxed">
          {question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2.5 ml-1">
        {options.map((option, idx) => {
          const letter = getLetterLabel(idx);
          const isSelected = selectedAnswer === option.id;
          const isThisCorrect = option.id === correctAnswer;

          let containerClass = "border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-500 cursor-pointer";
          let letterClass = "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700";

          if (isSelected && !isSubmitted) {
            containerClass = "border-2 border-orange-400 bg-orange-50/50 dark:bg-orange-900/20 ring-1 ring-orange-200";
            letterClass = "bg-orange-500 text-white border-orange-500";
          }

          if (isSubmitted) {
            if (isThisCorrect) {
              containerClass = "border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20";
              letterClass = "bg-emerald-500 text-white border-emerald-500";
            } else if (isSelected && !isCorrect) {
              containerClass = "border-2 border-red-400 bg-red-50 dark:bg-red-900/20";
              letterClass = "bg-red-500 text-white border-red-500";
            } else {
              containerClass = "border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 opacity-60";
              letterClass = "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600";
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={isSubmitted}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3.5 transition-all duration-150 ${containerClass}`}
            >
              <span className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${letterClass}`}>
                {letter}
              </span>
              <span className="text-sm text-foreground/90 leading-relaxed flex-1">
                {option.text}
              </span>
              {isSubmitted && isThisCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              {isSubmitted && isSelected && !isCorrect && !isThisCorrect && (
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Submit / Result */}
      <div className="ml-1">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="px-6 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Vérifier
          </button>
        ) : (
          <div className="space-y-3">
            <div className={`flex items-center gap-2 text-sm font-semibold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  Correct !
                </>
              ) : (
                <>
                  <XCircle className="w-4.5 h-4.5" />
                  Incorrect
                </>
              )}
            </div>
            {explanation && (
              <p className="text-xs text-muted-foreground leading-relaxed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-3.5">
                {explanation}
              </p>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
