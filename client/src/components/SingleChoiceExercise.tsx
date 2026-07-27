import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

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

  const getOptionStyle = (optionId: string) => {
    if (!isSubmitted) {
      if (selectedAnswer === optionId) {
        return "border-primary bg-primary/10 ring-2 ring-primary/30";
      }
      return "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
    }

    // After submission
    if (optionId === correctAnswer) {
      return "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-300";
    }
    if (selectedAnswer === optionId && !isCorrect) {
      return "border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-300";
    }
    return "border-border/50 opacity-50";
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      {/* Question */}
      <div className="flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-foreground leading-relaxed">
          {question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2.5 pl-8">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            disabled={isSubmitted}
            className={`w-full text-left p-3.5 rounded-lg border transition-all duration-150 flex items-start gap-3 ${getOptionStyle(option.id)}`}
          >
            <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold uppercase mt-0.5
              ${isSubmitted && option.id === correctAnswer ? 'border-emerald-500 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40' : 
                isSubmitted && selectedAnswer === option.id && !isCorrect ? 'border-red-500 text-red-600 bg-red-100 dark:bg-red-900/40' :
                selectedAnswer === option.id ? 'border-primary text-primary bg-primary/10' : 'border-muted-foreground/40 text-muted-foreground'}">
              {option.id.toUpperCase()}
            </span>
            <span className="text-sm text-foreground/90 leading-relaxed flex-1">
              {option.text}
            </span>
            {isSubmitted && option.id === correctAnswer && (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            )}
            {isSubmitted && selectedAnswer === option.id && !isCorrect && option.id !== correctAnswer && (
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Submit / Result */}
      <div className="pl-8">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            Vérifier
          </button>
        ) : (
          <div className="space-y-3">
            <div className={`flex items-center gap-2 text-sm font-semibold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Correct !
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Incorrect
                </>
              )}
            </div>
            {explanation && (
              <p className="text-xs text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
                {explanation}
              </p>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
