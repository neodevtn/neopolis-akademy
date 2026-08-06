import { useState, useMemo } from "react";
import { Link2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatchingBlockProps {
  block: any;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  onComplete?: (id: string) => void;
  blockIdx: number;
}

export function MatchingBlock({ block, lang, t, onComplete, blockIdx }: MatchingBlockProps) {
  const title = typeof block.title === "object" ? (block.title[lang] || block.title.en || "") : (block.title || "");
  const instructions = typeof block.instructions === "object" ? (block.instructions[lang] || block.instructions.en || "") : (block.instructions || "");
  const feedback = typeof block.feedback === "object" ? (block.feedback[lang] || block.feedback.en || "") : (block.feedback || "");

  const pairs: { left: string; right: string }[] = useMemo(() => {
    return (block.pairs || []).map((p: any) => ({
      left: typeof p.left === "object" ? (p.left[lang] || p.left.en || "") : (p.left || ""),
      right: typeof p.right === "object" ? (p.right[lang] || p.right.en || "") : (p.right || ""),
    }));
  }, [block.pairs, lang]);

  // Shuffle right side
  const shuffledRight = useMemo(() => {
    const arr = pairs.map((p, i) => ({ text: p.right, correctIdx: i }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs.length]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({}); // leftIdx -> rightShuffledIdx
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const handleLeftClick = (idx: number) => {
    if (submitted) return;
    setSelectedLeft(idx === selectedLeft ? null : idx);
  };

  const handleRightClick = (shuffledIdx: number) => {
    if (submitted || selectedLeft === null) return;
    const newMatches = { ...matches, [selectedLeft]: shuffledIdx };
    setMatches(newMatches);
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    const res = pairs.map((_, leftIdx) => {
      const matchedShuffledIdx = matches[leftIdx];
      if (matchedShuffledIdx === undefined) return false;
      return shuffledRight[matchedShuffledIdx].correctIdx === leftIdx;
    });
    setResults(res);
    setSubmitted(true);
    if (res.every(Boolean) && onComplete) {
      onComplete(block.id || `matching_${blockIdx}`);
    }
  };

  const handleReset = () => {
    setMatches({});
    setSelectedLeft(null);
    setSubmitted(false);
    setResults([]);
  };

  const allMatched = Object.keys(matches).length === pairs.length;
  const allCorrect = submitted && results.every(Boolean);

  return (
    <div className="my-6 rounded-xl border border-border overflow-hidden bg-card">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-pink-50 dark:bg-pink-950/20">
        <Link2 className="w-5 h-5 text-pink-600" />
        <span className="font-semibold text-foreground">{title || t({ en: "Match the pairs", fr: "Associer les paires" })}</span>
      </div>
      {instructions && <p className="px-4 pt-3 text-sm text-muted-foreground">{instructions}</p>}
      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-2">
          {pairs.map((p, i) => {
            const isSelected = selectedLeft === i;
            const isMatched = matches[i] !== undefined;
            const isCorrect = submitted && results[i];
            const isWrong = submitted && !results[i];
            return (
              <button
                key={`left-${i}`}
                onClick={() => handleLeftClick(i)}
                disabled={submitted}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                  isCorrect ? "border-green-400 bg-green-50 dark:bg-green-950/30" :
                  isWrong ? "border-red-400 bg-red-50 dark:bg-red-950/30" :
                  isSelected ? "border-pink-500 bg-pink-50 dark:bg-pink-950/30 ring-2 ring-pink-300" :
                  isMatched ? "border-pink-300 bg-pink-50/50 dark:bg-pink-950/10" :
                  "border-border hover:border-pink-300 hover:bg-pink-50/30"
                }`}
              >
                <span className="font-medium">{p.left}</span>
                {isMatched && !submitted && (
                  <span className="ml-2 text-xs text-pink-500">→ {shuffledRight[matches[i]].text.slice(0, 30)}...</span>
                )}
              </button>
            );
          })}
        </div>
        {/* Right column */}
        <div className="space-y-2">
          {shuffledRight.map((item, i) => {
            const isMatchedTo = Object.values(matches).includes(i);
            const matchedLeftIdx = Object.entries(matches).find(([, v]) => v === i)?.[0];
            const isCorrect = submitted && matchedLeftIdx !== undefined && results[Number(matchedLeftIdx)];
            const isWrong = submitted && matchedLeftIdx !== undefined && !results[Number(matchedLeftIdx)];
            return (
              <button
                key={`right-${i}`}
                onClick={() => handleRightClick(i)}
                disabled={submitted || selectedLeft === null}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                  isCorrect ? "border-green-400 bg-green-50 dark:bg-green-950/30" :
                  isWrong ? "border-red-400 bg-red-50 dark:bg-red-950/30" :
                  isMatchedTo ? "border-pink-300 bg-pink-50/50 dark:bg-pink-950/10 opacity-60" :
                  selectedLeft !== null ? "border-border hover:border-pink-300 hover:bg-pink-50/30 cursor-pointer" :
                  "border-border opacity-60"
                }`}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>
      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-3">
        {!submitted ? (
          <Button onClick={handleSubmit} disabled={!allMatched} className="bg-pink-600 hover:bg-pink-700">
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
              : t({ en: `${results.filter(Boolean).length}/${pairs.length} correct`, fr: `${results.filter(Boolean).length}/${pairs.length} correct(s)` })}
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
