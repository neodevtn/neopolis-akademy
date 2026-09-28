import { useEffect, useState, useMemo } from "react";
import { ListOrdered, CheckCircle2, XCircle, RotateCcw, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpectedAnswerCount } from "@/components/ExpectedAnswerCount";

interface OrderingBlockProps {
  block: any;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  onComplete?: (id: string) => void;
  blockIdx: number;
}

type OrderingItem = { id: string; text: string };

function shuffledCopy<T>(values: T[]): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const destination = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[destination]] = [shuffled[destination], shuffled[index]];
  }
  return shuffled;
}

export function OrderingBlock({ block, lang, t, onComplete, blockIdx }: OrderingBlockProps) {
  const ui = (copy: { en: string; fr: string; ar: string }) => lang === "ar" ? copy.ar : t(copy);
  const title = typeof block.title === "object" ? (block.title[lang] || block.title.en || "") : (block.title || "");
  const instructions = typeof block.instructions === "object" ? (block.instructions[lang] || block.instructions.en || "") : (block.instructions || "");
  const feedback = typeof block.feedback === "object" ? (block.feedback[lang] || block.feedback.en || "") : (block.feedback || "");

  const correctOrder = useMemo<OrderingItem[]>(() => {
    return (block.items || []).map((item: any) => ({
      id: String(item.id),
      text: typeof item.text === "object" ? (item.text[lang] || item.text.en || "") : (item.text || ""),
    }));
  }, [block.items, lang]);

  // Shuffle items initially
  const [items, setItems] = useState<OrderingItem[]>(() => shuffledCopy(correctOrder));

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  useEffect(() => {
    setItems(shuffledCopy(correctOrder));
    setDragIdx(null);
    setSubmitted(false);
    setResults([]);
  }, [correctOrder]);

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
    setItems(shuffledCopy(correctOrder));
    setSubmitted(false);
    setResults([]);
  };

  const allCorrect = submitted && results.every(Boolean);

  return (
    <div className="my-6 rounded-xl border border-border overflow-hidden bg-card">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-lime-50 dark:bg-lime-950/20">
        <ListOrdered className="w-5 h-5 text-lime-600" />
        <span className="font-semibold text-foreground">{title || ui({ en: "Put in order", fr: "Remettez dans l'ordre", ar: "رتّب العناصر" })}</span>
      </div>
      {instructions && <p className="px-4 pt-3 text-sm text-muted-foreground">{instructions}</p>}
      <div className="px-4 pt-3"><ExpectedAnswerCount count={items.length || 1} lang={lang} /></div>
      <div className="p-4 space-y-2" role="list" aria-label={ui({ en: "Items to reorder", fr: "Éléments à réordonner", ar: "العناصر المطلوب ترتيبها" })}>
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
              role="listitem"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                isCorrect ? "border-green-400 bg-green-50 dark:bg-green-950/30" :
                isWrong ? "border-red-400 bg-red-50 dark:bg-red-950/30" :
                dragIdx === idx ? "border-lime-500 bg-lime-50 dark:bg-lime-950/30 shadow-md" :
                "border-border hover:border-lime-300 cursor-grab active:cursor-grabbing"
              }`}
            >
              <GripVertical aria-hidden="true" className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm font-medium">{item.text}</span>
              {!submitted && (
                <div className="flex flex-col gap-0.5">
                  <button type="button" aria-label={ui({ en: `Move ${item.text} up`, fr: `Monter ${item.text}`, ar: `حرّك ${item.text} إلى الأعلى` })} onClick={() => moveItem(idx, "up")} disabled={idx === 0} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">▲</button>
                  <button type="button" aria-label={ui({ en: `Move ${item.text} down`, fr: `Descendre ${item.text}`, ar: `حرّك ${item.text} إلى الأسفل` })} onClick={() => moveItem(idx, "down")} disabled={idx === items.length - 1} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">▼</button>
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
            {ui({ en: "Check order", fr: "Vérifier l'ordre", ar: "تحقق من الترتيب" })}
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
              ? ui({ en: "Perfect order!", fr: "Ordre parfait !", ar: "ترتيب صحيح بالكامل!" })
              : ui({ en: `${results.filter(Boolean).length}/${items.length} in correct position`, fr: `${results.filter(Boolean).length}/${items.length} bien placé(s)`, ar: `${results.filter(Boolean).length}/${items.length} في الموضع الصحيح` })}
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
