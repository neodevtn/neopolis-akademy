import { useState } from "react";
import { CheckSquare, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MultiChoiceBlockProps {
  block: any;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  onComplete?: (id: string) => void;
  blockIdx: number;
}

export function MultiChoiceBlock({ block, lang, t, onComplete, blockIdx }: MultiChoiceBlockProps) {
  const question = typeof block.question === "object" ? (block.question[lang] || block.question.en || "") : (block.question || "");
  const explanation = typeof block.explanation === "object" ? (block.explanation[lang] || block.explanation.en || "") : (block.explanation || "");
  const correctAnswers = (block.correctAnswers || "").split(",").map((s: string) => s.trim()).filter(Boolean);

  const options: { id: string; text: string }[] = (block.options || []).map((opt: any) => ({
    id: opt.id,
    text: typeof opt.text === "object" ? (opt.text[lang] || opt.text.en || "") : (opt.text || ""),
  }));

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const toggleOption = (id: string) => {
    if (submitted) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const isCorrect = correctAnswers.length === selected.size && correctAnswers.every((id: string) => selected.has(id));
    if (isCorrect && onComplete) {
      onComplete(block.id || `multi_choice_${blockIdx}`);
    }
  };

  const handleReset = () => {
    setSelected(new Set());
    setSubmitted(false);
  };

  const isAllCorrect = submitted && correctAnswers.length === selected.size && correctAnswers.every((id: string) => selected.has(id));

  return (
    <div className="my-6 rounded-xl border border-border overflow-hidden bg-card">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-green-50 dark:bg-green-950/20">
        <CheckSquare className="w-5 h-5 text-green-600" />
        <span className="font-semibold text-foreground">{t({ en: "Multiple Choice", fr: "Choix multiples" })}</span>
        <span className="text-xs text-muted-foreground ml-auto">{t({ en: "Select all that apply", fr: "Sélectionnez toutes les bonnes réponses" })}</span>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">{question}</p>
        <div className="space-y-2">
          {options.map((opt) => {
            const isSelected = selected.has(opt.id);
            const isCorrectAnswer = correctAnswers.includes(opt.id);
            const showCorrect = submitted && isCorrectAnswer;
            const showWrong = submitted && isSelected && !isCorrectAnswer;
            return (
              <button
                key={opt.id}
                onClick={() => toggleOption(opt.id)}
                disabled={submitted}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm transition-all ${
                  showCorrect ? "border-green-400 bg-green-50 dark:bg-green-950/30" :
                  showWrong ? "border-red-400 bg-red-50 dark:bg-red-950/30" :
                  isSelected ? "border-green-500 bg-green-50/50 dark:bg-green-950/10" :
                  "border-border hover:border-green-300"
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${
                  isSelected ? "border-green-500 bg-green-500" : "border-muted-foreground"
                }`}>
                  {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <span className="flex-1">{opt.text}</span>
                {showCorrect && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                {showWrong && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
              </button>
            );
          })}
        </div>
        {submitted && explanation && (
          <div className={`rounded-lg p-3 text-sm ${isAllCorrect ? "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200 border border-green-200" : "bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-200 border border-blue-200"}`}>
            {explanation}
          </div>
        )}
        <div className="flex items-center gap-3">
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={selected.size === 0} className="bg-green-600 hover:bg-green-700">
              {t({ en: "Check answers", fr: "Vérifier" })}
            </Button>
          ) : (
            <Button onClick={handleReset} variant="outline" className="gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
              {t({ en: "Try again", fr: "Réessayer" })}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

