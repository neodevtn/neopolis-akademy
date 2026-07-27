import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface FlipCardProps {
  front: string;
  back: string;
  index: number;
}

export function FlipCard({ front, back, index }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group perspective-1000 cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="relative w-full min-h-[180px] transition-transform duration-500 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
            Carte {index + 1}
          </div>
          <p className="text-center text-base font-medium text-gray-800 leading-relaxed">
            {front}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-500">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cliquez pour retourner</span>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-start justify-center p-6 rounded-xl border border-gray-200 bg-white shadow-sm"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-sm text-gray-700 leading-relaxed">
            {back}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 self-center">
            <RotateCcw className="w-3.5 h-3.5" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
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
