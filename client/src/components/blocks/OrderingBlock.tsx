import { useState, useMemo } from "react";
import { ListOrdered, CheckCircle2, XCircle, RotateCcw, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderingBlockProps {
  block: any;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  onComplete?: (id: string) => void;
  blockIdx: number;
}

export function OrderingBlock({ block, lang, t, onComplete, blockIdx }: OrderingBlockProps) {
  const title = typeof block.title === "object" ? (block.title[lang] || block.title.en || "") : (block.title || "");
  const instructions = typeof block.instructions === "object" ? (block.instructions[lang] || block.instructions.en || "") : (block.instructions || "");
  const feedback = typeof block.feedback === "object" ? (block.feedback[lang] || block.feedback.en || "") : (block.feedback || "");

  const correctOrder = useMemo(() => {
    return (block.items || []).map((item: any) => ({
      id: item.id,
      text: typeof item.text === "object" ? (item.text[lang] || item.text.en || "") : (item.text || ""),
    }));
  }, [block.items, lang]);

  // Shuffle items initially
  const [items, setItems] = useState(() => {
    const shuffled = [...correctOrder];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const handleDragStart = (idx: number) => {
    setDragIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newItems = [...items];
    const [dragged] = newItems.splice(dragIdx, 1);
    newItems.splice(idx, 0, dragged);
    setItems(newItems);
    setDragIdx(idx);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
  };

  const moveItem = (fromIdx: number, direction: "up" | "down") => {
    if (submitted) return;
    const toIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= items.length) return;
    const newItems = [...items];
    [newItems[fromIdx], newItems[toIdx]] = [newItems[toIdx], newItems[fromIdx]];
    setItems(newItems);
  };

  const handleSubmit = () => {
    const res = items.map((item, i) => item.id === correctOrder[i].id);
    setResults(res);
    setSubmitted(true);
    if (res.every(Boolean) && onComplete) {
      onComplete(block.id || `ordering_${blockIdx}`);
    }
  };

  const handleReset = () => {
    const shuffled = [...correctOrder];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setItems(shuffled);
    setSubmitted(false);
    setResults([]);
  };

  const allCorrect = submitted && results.every(Boolean);

  return (
    <div className="my-6 rounded-xl border border-border overflow-hidden bg-card">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-lime-50 dark:bg-lime-950/20">
        <ListOrdered className="w-5 h-5 text-lime-600" />
        <span className="font-semibold text-foreground">{title || t({ en: "Put in order", fr: "Remettez dans l'ordre" })}</span>
      </div>
      {instructions && <p className="px-4 pt-3 text-sm text-muted-foreground">{instructions}</p>}
      <div className="p-4 space-y-2">
        {items.map((item, idx) => {
          const isCorrect = submitted && results[idx];
          const isWrong = submitted && !results[idx];
          return (
            <div
              key={item.id}
              draggable={!submitted}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                isCorrect ? "border-green-400 bg-green-50 dark:bg-green-950/30" :
                isWrong ? "border-red-400 bg-red-50 dark:bg-red-950/30" :
                dragIdx === idx ? "border-lime-500 bg-lime-50 dark:bg-lime-950/30 shadow-md" :
                "border-border hover:border-lime-300 cursor-grab active:cursor-grabbing"
              }`}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm font-medium">{item.text}</span>
              {!submitted && (
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveItem(idx, "up")} disabled={idx === 0} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">▲</button>
                  <button onClick={() => moveItem(idx, "down")} disabled={idx === items.length - 1} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">▼</button>
                </div>
              )}
              {isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
              {isWrong && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
            </div>
          );
        })}
      </div>
      <div className="px-4 pb-4 flex items-center gap-3">
        {!submitted ? (
          <Button onClick={handleSubmit} className="bg-lime-600 hover:bg-lime-700">
            {t({ en: "Check order", fr: "Vérifier l'ordre" })}
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
              ? t({ en: "Perfect order!", fr: "Ordre parfait !" })
              : t({ en: `${results.filter(Boolean).length}/${items.length} in correct position`, fr: `${results.filter(Boolean).length}/${items.length} bien placé(s)` })}
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
