import { useEffect, useState, useMemo } from "react";
import { Link2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpectedAnswerCount } from "@/components/ExpectedAnswerCount";

interface MatchingBlockProps {
  block: any;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  onComplete?: (id: string) => void;
  blockIdx: number;
}

const normalizeTarget = (value: string) => value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase();

export function buildUniqueMatchingTargets(
  pairs: Array<{ right: string }>,
  random: () => number = Math.random,
) {
  const unique = new Map<string, string>();
  pairs.forEach((pair) => {
    const key = normalizeTarget(pair.right);
    if (key && !unique.has(key)) unique.set(key, pair.right);
  });
  const targets = Array.from(unique, ([key, text]) => ({ key, text }));
  for (let index = targets.length - 1; index > 0; index--) {
    const destination = Math.floor(random() * (index + 1));
    [targets[index], targets[destination]] = [targets[destination], targets[index]];
  }
  return targets;
}

export function MatchingBlock({ block, lang, t, onComplete, blockIdx }: MatchingBlockProps) {
  const ui = (copy: { en: string; fr: string; ar: string }) => lang === "ar" ? copy.ar : t(copy);
  const title = typeof block.title === "object" ? (block.title[lang] || block.title.en || "") : (block.title || "");
  const instructions = typeof block.instructions === "object" ? (block.instructions[lang] || block.instructions.en || "") : (block.instructions || "");
  const feedback = typeof block.feedback === "object" ? (block.feedback[lang] || block.feedback.en || "") : (block.feedback || "");

  const pairs: { left: string; right: string }[] = useMemo(() => {
    return (block.pairs || []).map((p: any) => ({
      left: typeof p.left === "object" ? (p.left[lang] || p.left.en || "") : (p.left || ""),
      right: typeof p.right === "object" ? (p.right[lang] || p.right.en || "") : (p.right || ""),
    }));
  }, [block.pairs, lang]);

  // A matching exercise can intentionally map several prompts to the same
  // category (for example two activities both belong to "Deploy"). Display
  // each category once so identical labels never look like contradictory
  // answers, and let that category be reused by several prompts.
  const shuffledRight = useMemo(() => {
    return buildUniqueMatchingTargets(pairs);
  }, [pairs]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({}); // leftIdx -> rightShuffledIdx
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  useEffect(() => {
    setSelectedLeft(null);
    setMatches({});
    setSubmitted(false);
    setResults([]);
  }, [shuffledRight]);

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
      return shuffledRight[matchedShuffledIdx]?.key === normalizeTarget(pairs[leftIdx].right);
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
        <span className="font-semibold text-foreground">{title || ui({ en: "Match the pairs", fr: "Associer les paires", ar: "طابق العناصر" })}</span>
      </div>
      {instructions && <p className="px-4 pt-3 text-sm text-muted-foreground">{instructions}</p>}
      <div className="px-4 pt-3"><ExpectedAnswerCount count={pairs.length || 1} lang={lang} selected={Object.keys(matches).length} /></div>
      <div className="p-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
                aria-pressed={isSelected}
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
            const matchedLeftIndexes = Object.entries(matches)
              .filter(([, value]) => value === i)
              .map(([leftIndex]) => Number(leftIndex));
            const isMatchedTo = matchedLeftIndexes.length > 0;
            const isCorrect = submitted && isMatchedTo && matchedLeftIndexes.every((leftIndex) => results[leftIndex]);
            const isWrong = submitted && isMatchedTo && matchedLeftIndexes.some((leftIndex) => !results[leftIndex]);
            return (
              <button
                key={`right-${i}`}
                onClick={() => handleRightClick(i)}
                disabled={submitted || selectedLeft === null}
                aria-pressed={selectedLeft !== null && matches[selectedLeft] === i}
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
            {ui({ en: "Check answers", fr: "Vérifier", ar: "تحقق من الإجابات" })}
          </Button>
        ) : (
          <Button onClick={handleReset} variant="outline" className="gap-1">
            <RotateCcw className="w-3.5 h-3.5" />
            {ui({ en: "Try again", fr: "Réessayer", ar: "حاول مرة أخرى" })}
          </Button>
        )}
        {submitted && (
          <div className={`flex items-center gap-2 text-sm font-medium ${allCorrect ? "text-green-600" : "text-red-600"}`}>
            {allCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {allCorrect
              ? ui({ en: "All correct!", fr: "Tout est correct !", ar: "كل الإجابات صحيحة!" })
              : ui({ en: `${results.filter(Boolean).length}/${pairs.length} correct`, fr: `${results.filter(Boolean).length}/${pairs.length} correct(s)`, ar: `${results.filter(Boolean).length}/${pairs.length} صحيحة` })}
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
