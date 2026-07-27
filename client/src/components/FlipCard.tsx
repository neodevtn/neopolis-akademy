import { useState, useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface FlipCardProps {
  front: string;
  back: string;
  index: number;
}

export function FlipCard({ front, back, index }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(200);

  useEffect(() => {
    const frontH = frontRef.current?.scrollHeight || 0;
    const backH = backRef.current?.scrollHeight || 0;
    const maxH = Math.max(frontH, backH, 160);
    setCardHeight(maxH + 32); // 32px extra padding
  }, [front, back]);

  return (
    <div
      className="group cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="relative w-full transition-transform duration-500 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          height: `${cardHeight}px`,
        }}
      >
        {/* Front */}
        <div
          ref={frontRef}
          className="absolute inset-0 flex flex-col items-center justify-center p-5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">
            Carte {index + 1}
          </div>
          <p className="text-center text-sm font-medium text-gray-800 leading-snug">
            {front}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-500">
            <RotateCcw className="w-3 h-3" />
            <span>Cliquez pour retourner</span>
          </div>
        </div>

        {/* Back */}
        <div
          ref={backRef}
          className="absolute inset-0 flex flex-col items-start justify-start p-5 rounded-xl border border-gray-200 bg-white shadow-sm overflow-y-auto"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
            {back}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-400 self-center shrink-0">
            <RotateCcw className="w-3 h-3" />
            <span>Cliquez pour revenir</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FlipCardsGridProps {
  cards: Array<{
    front: { en: string; fr: string };
    back: { en: string; fr: string };
  }>;
  lang: 'en' | 'fr';
}

export function FlipCardsGrid({ cards, lang }: FlipCardsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
      {cards.map((card, idx) => (
        <FlipCard
          key={idx}
          index={idx}
          front={card.front[lang] || card.front.en}
          back={card.back[lang] || card.back.en}
        />
      ))}
    </div>
  );
}
