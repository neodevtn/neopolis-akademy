import { useState, useMemo } from "react";
import { TextCursorInput, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FillBlankBlockProps {
  block: any;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  onComplete?: (id: string) => void;
  blockIdx: number;
}

interface BlankDef {
  id: string;
  answer: string;
  alternatives: string[];
}

export function FillBlankBlock({ block, lang, t, onComplete, blockIdx }: FillBlankBlockProps) {
  const instructions = typeof block.instructions === "object" ? (block.instructions[lang] || block.instructions.en || "") : (block.instructions || "");
  const feedback = typeof block.feedback === "object" ? (block.feedback[lang] || block.feedback.en || "") : (block.feedback || "");

  const blanks: BlankDef[] = useMemo(() => {
    return (block.blanks || []).map((b: any) => ({
      id: b.id || "",
      answer: b.answer || "",
      alternatives: b.alternatives ? b.alternatives.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
    }));
  }, [block.blanks]);

  // Parse template into segments
  const segments = useMemo(() => {
    const template = block.template || "";
    const parts: { type: "text" | "blank"; content: string; blankIdx?: number }[] = [];
    // Match {{blank:answer}} or {{blank}} patterns
    const regex = /\{\{blank(?::([^}]*))?\}\}/g;
    let lastIdx = 0;
    let blankCounter = 0;
    let match;
    while ((match = regex.exec(template)) !== null) {
      if (match.index > lastIdx) {
        parts.push({ type: "text", content: template.slice(lastIdx, match.index) });
      }
      parts.push({ type: "blank", content: "", blankIdx: blankCounter });
      blankCounter++;
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < template.length) {
      parts.push({ type: "text", content: template.slice(lastIdx) });
    }
    return parts;
  }, [block.template]);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const handleChange = (blankIdx: number, value: string) => {
    setAnswers(prev => ({ ...prev, [blankIdx]: value }));
  };

  const handleSubmit = () => {
    const res = blanks.map((blank, i) => {
      const userAnswer = (answers[i] || "").trim().toLowerCase();
      const correct = blank.answer.toLowerCase();
      if (userAnswer === correct) return true;
      return blank.alternatives.some(alt => userAnswer === alt.toLowerCase());
    });
    setResults(res);
    setSubmitted(true);
    if (res.every(Boolean) && onComplete) {
      onComplete(block.id || `fill_blank_${blockIdx}`);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setResults([]);
  };

  const allFilled = blanks.length > 0 && blanks.every((_, i) => (answers[i] || "").trim().length > 0);
  const allCorrect = submitted && results.every(Boolean);

  return (
    <div className="my-6 rounded-xl border border-border overflow-hidden bg-card">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-yellow-50 dark:bg-yellow-950/20">
        <TextCursorInput className="w-5 h-5 text-yellow-600" />
        <span className="font-semibold text-foreground">{t({ en: "Fill in the Blanks", fr: "Texte à trous" })}</span>
      </div>
      {instructions && <p className="px-4 pt-3 text-sm text-muted-foreground">{instructions}</p>}
      <div className="p-4">
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {segments.map((seg, i) => {
            if (seg.type === "text") {
              return <span key={i}>{seg.content}</span>;
            }
            const blankIdx = seg.blankIdx!;
            const isCorrect = submitted && results[blankIdx];
            const isWrong = submitted && !results[blankIdx];
            return (
              <span key={i} className="inline-block mx-1">
                <input
                  type="text"
                  value={answers[blankIdx] || ""}
                  onChange={(e) => handleChange(blankIdx, e.target.value)}
                  disabled={submitted}
                  placeholder="___"
                  className={`inline-block w-auto min-w-[80px] max-w-[200px] px-2 py-0.5 rounded border text-sm font-mono ${
                    isCorrect ? "border-green-400 bg-green-900/30 text-green-300" :
                    isWrong ? "border-red-400 bg-red-900/30 text-red-300" :
                    "border-yellow-500/50 bg-slate-800 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50"
                  }`}
                  style={{ width: `${Math.max(80, (answers[blankIdx] || "").length * 9 + 20)}px` }}
                />
                {isWrong && (
                  <span className="text-xs text-green-400 ml-1">({blanks[blankIdx]?.answer})</span>
                )}
              </span>
            );
          })}
        </pre>
      </div>
      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-3">
        {!submitted ? (
          <Button onClick={handleSubmit} disabled={!allFilled} className="bg-yellow-600 hover:bg-yellow-700">
            {t({ en: "Check answers", fr: "Vérifier" })}
          </Button>
        ) : (
          <Button onClick={handleReset} variant="outline" className="gap-1">
            <RotateCcw className="w-3.5 h-3.5" />
            {t({ en: "Try again", fr: "Réessayer" })}
          </Button>
        )}
        {submitted && (
          <div className={`flex items-center gap-2 text-sm font-medium ${allCorrect ? "text-green-600" : "text-red-600"}`}>
            {allCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {allCorrect
              ? t({ en: "All correct!", fr: "Tout est correct !" })
              : t({ en: `${results.filter(Boolean).length}/${blanks.length} correct`, fr: `${results.filter(Boolean).length}/${blanks.length} correct(s)` })}
          </div>
        )}
      </div>
      {submitted && allCorrect && feedback && (
        <div className="px-4 pb-4">
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-800 dark:text-green-200">
            {feedback}
          </div>
        </div>
      )}
    </div>
  );
}

