import { useState, useRef, useEffect } from 'react';

interface FlipCardProps {
  front: string;
  back: string;
  index: number;
  isFlipped: boolean;
  onFlip: () => void;
  isLastFlipped: boolean;
}

export function FlipCard({ front, back, index, isFlipped, onFlip, isLastFlipped }: FlipCardProps) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(180);

  useEffect(() => {
    const frontH = frontRef.current?.scrollHeight || 0;
    const backH = backRef.current?.scrollHeight || 0;
    const maxH = Math.max(frontH, backH, 140);
    setCardHeight(maxH + 40);
  }, [front, back]);

  return (
    <div
      className="group cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={onFlip}
    >
      <div
        className="relative w-full transition-transform duration-500 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          height: `${cardHeight}px`,
        }}
      >
        {/* Front - dashed blue border */}
        <div
          ref={frontRef}
          className={`absolute inset-0 flex flex-col justify-between p-5 rounded-lg overflow-hidden ${
            isLastFlipped && !isFlipped
              ? 'border-2 border-dashed border-[#c75b3a]'
              : 'border-2 border-dashed border-[#4a90d9]'
          }`}
          style={{ backfaceVisibility: 'hidden', backgroundColor: '#fff' }}
        >
        <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#c75b3a] mb-2">
              {(() => {
                // Extract a short label from the front text (e.g. "Property 1: Responses vary" -> "Property 1")
                const colonIdx = front.indexOf(':');
                if (colonIdx > 0 && colonIdx < 40) {
                  return front.substring(0, colonIdx).trim();
                }
                // Fallback: just show card number
                return `Card ${index + 1}`;
              })()}
            </div>
            <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Lora, Georgia, serif' }}>
              {(() => {
                // Show only the part after the colon if the label was extracted
                const colonIdx = front.indexOf(':');
                if (colonIdx > 0 && colonIdx < 40) {
                  return front.substring(colonIdx + 1).trim();
                }
                return front;
              })()}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4a90d9] mt-3">
            <span>FLIP</span>
            <span className="text-base">↻</span>
          </div>
        </div>

        {/* Back - solid blue border, light blue background */}
        <div
          ref={backRef}
          className="absolute inset-0 flex flex-col justify-between p-5 rounded-lg border-2 border-solid border-[#4a90d9] overflow-y-auto"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', backgroundColor: '#e8f4fd' }}
        >
          <p className="text-sm text-gray-800 leading-relaxed italic" style={{ fontFamily: 'Lora, Georgia, serif' }}>
            {back}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4a90d9] mt-3">
            <span>FLIP</span>
            <span className="text-base">↻</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FlipCardsGridProps {
  cards: Array<{
    front: { en: string; fr: string } | string;
    back: { en: string; fr: string } | string;
  }>;
  lang: string;
  onAllFlipped?: () => void;
}

export function FlipCardsGrid({ cards, lang, onAllFlipped }: FlipCardsGridProps) {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  // Track cards that have been flipped at least once (even if flipped back)
  const [seenCards, setSeenCards] = useState<Set<number>>(new Set());
  const [lastFlipped, setLastFlipped] = useState<number | null>(null);
  const allFlippedRef = useRef(false);

  const handleFlip = (idx: number) => {
    setFlippedCards((prev) => {
      const next = new Set(Array.from(prev));
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
    setLastFlipped(idx);
    // Track that this card has been seen at least once
    setSeenCards((prev) => {
      const next = new Set(Array.from(prev));
      next.add(idx);
      // Check if all cards have been seen
      if (next.size >= cards.length && !allFlippedRef.current) {
        allFlippedRef.current = true;
        onAllFlipped?.();
      }
      return next;
    });
  };

  const resolveLang = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return lang === 'fr' ? (val.fr || val.en || '') : (val.en || val.fr || '');
  };

  // Use 3 columns for 5 cards (3+2), 2 columns for 4 cards (2+2), etc.
  const gridCols = cards.length >= 5 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                   cards.length >= 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                   'grid-cols-1 sm:grid-cols-2';

  return (
    <div className={`grid ${gridCols} gap-4 my-6`}>
      {cards.map((card, idx) => (
        <FlipCard
          key={idx}
          index={idx}
          front={resolveLang(card.front)}
          back={resolveLang(card.back)}
          isFlipped={flippedCards.has(idx)}
          onFlip={() => handleFlip(idx)}
          isLastFlipped={lastFlipped === idx && !flippedCards.has(idx)}
        />
      ))}
    </div>
  );
}
