import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Undo2,
} from 'lucide-react';

interface LocalizedText {
  en: string;
  fr: string;
}

interface BucketSortExercise {
  id: string;
  title?: LocalizedText;
  instructions?: LocalizedText;
  buckets: { id: string; label: LocalizedText }[];
  cards: { id: string; text: LocalizedText; correctBucket: string }[];
  correction?: LocalizedText;
}

interface MatchingExerciseProps {
  exercise: BucketSortExercise;
  lang: 'en' | 'fr';
  onComplete?: () => void;
}

// Bucket colors (Skilljar style - colored dashed borders)
const BUCKET_COLORS = [
  { border: '#c75b3a', bg: '#fef3f0', text: '#c75b3a' }, // coral/orange
  { border: '#4a90d9', bg: '#f0f7ff', text: '#4a90d9' }, // blue
  { border: '#6b8e5e', bg: '#f2f8f0', text: '#6b8e5e' }, // green
  { border: '#9b59b6', bg: '#f8f0ff', text: '#9b59b6' }, // purple
  { border: '#e67e22', bg: '#fff8f0', text: '#e67e22' }, // orange
  { border: '#16a085', bg: '#f0faf8', text: '#16a085' }, // teal
];

// Storage helpers
const STORAGE_KEY = 'neopolis_matching_attempts';

function loadAttempt(exerciseId: string): Record<string, string> | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const attempts = JSON.parse(data);
    return attempts[exerciseId] || null;
  } catch { return null; }
}

function saveAttempt(exerciseId: string, placements: Record<string, string>) {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const attempts = data ? JSON.parse(data) : {};
    attempts[exerciseId] = placements;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  } catch { /* ignore */ }
}

function clearAttempt(exerciseId: string) {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;
    const attempts = JSON.parse(data);
    delete attempts[exerciseId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  } catch { /* ignore */ }
}

// Custom easing for snappy animations
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

export function MatchingExercise({ exercise, lang, onComplete }: MatchingExerciseProps) {
  const getText = (text?: LocalizedText | string) => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[lang] || text.en || '';
  };

  const savedAttempt = loadAttempt(exercise.id);
  
  const [placements, setPlacements] = useState<Record<string, string>>(savedAttempt || {});
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(!!savedAttempt);
  const [showCorrection, setShowCorrection] = useState(false);
  // Track recently placed cards for entrance animation
  const [recentlyPlaced, setRecentlyPlaced] = useState<Set<string>>(new Set());
  // Track recently returned cards for entrance animation
  const [recentlyReturned, setRecentlyReturned] = useState<Set<string>>(new Set());
  // Track hovered bucket
  const [hoveredBucket, setHoveredBucket] = useState<string | null>(null);
  // Timeout refs for clearing animation states
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unplacedCards = exercise.cards.filter(c => !placements[c.id]);
  const allPlaced = unplacedCards.length === 0;

  // If exercise was already completed (from localStorage), notify parent on mount
  useEffect(() => {
    if (savedAttempt && submitted) {
      onComplete?.();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCardClick = useCallback((cardId: string) => {
    if (submitted) return;
    if (placements[cardId]) {
      // Return card to pool with animation
      const newPlacements = { ...placements };
      delete newPlacements[cardId];
      setPlacements(newPlacements);
      setSelectedCard(null);
      // Mark as recently returned for entrance animation
      setRecentlyReturned(prev => new Set(prev).add(cardId));
      setTimeout(() => {
        setRecentlyReturned(prev => {
          const next = new Set(prev);
          next.delete(cardId);
          return next;
        });
      }, 300);
      return;
    }
    setSelectedCard(prev => prev === cardId ? null : cardId);
  }, [submitted, placements]);

  const handleBucketClick = useCallback((bucketId: string) => {
    if (submitted || !selectedCard) return;
    const newPlacements = { ...placements, [selectedCard]: bucketId };
    setPlacements(newPlacements);
    // Mark as recently placed for entrance animation
    const placedCard = selectedCard;
    setRecentlyPlaced(prev => new Set(prev).add(placedCard));
    setSelectedCard(null);
    // Clear animation state after transition completes
    setTimeout(() => {
      setRecentlyPlaced(prev => {
        const next = new Set(prev);
        next.delete(placedCard);
        return next;
      });
    }, 350);
  }, [submitted, selectedCard, placements]);

  const handleSubmit = () => {
    if (!allPlaced) return;
    setSubmitted(true);
    saveAttempt(exercise.id, placements);
    onComplete?.();
  };

  const handleReset = () => {
    setPlacements({});
    setSelectedCard(null);
    setSubmitted(false);
    setShowCorrection(false);
    setRecentlyPlaced(new Set());
    setRecentlyReturned(new Set());
    clearAttempt(exercise.id);
  };

  const getCardResult = (cardId: string): 'correct' | 'incorrect' | null => {
    if (!submitted) return null;
    const card = exercise.cards.find(c => c.id === cardId);
    if (!card) return null;
    return placements[cardId] === card.correctBucket ? 'correct' : 'incorrect';
  };

  const correctCount = submitted
    ? exercise.cards.filter(c => placements[c.id] === c.correctBucket).length
    : 0;

  const totalCards = exercise.cards.length;
  const isAllCorrect = correctCount === totalCards;

  return (
    <div className="my-6 space-y-5">
      {/* Title */}
      {getText(exercise.title) && (
        <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Lora, Georgia, serif' }}>
          {getText(exercise.title)}
        </h3>
      )}

      {/* Instructions */}
      {getText(exercise.instructions) && (
        <p className="text-sm text-muted-foreground italic">
          {getText(exercise.instructions)}
        </p>
      )}

      {!submitted && (
        <p className="text-xs text-muted-foreground">
          {lang === 'fr'
            ? 'Cliquez sur une carte pour la sélectionner, puis cliquez sur une catégorie pour la placer.'
            : 'Click a card to select it, then click a bucket to place it.'}
        </p>
      )}

      {/* Cards pool - grid 2 columns like Skilljar */}
      {!submitted && unplacedCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {unplacedCards.map(card => {
            const isSelected = selectedCard === card.id;
            const isRecentlyReturned = recentlyReturned.has(card.id);
            
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className="px-4 py-3 rounded-lg border text-sm text-left"
                style={{
                  transition: `all 200ms ${EASE_OUT}`,
                  transform: isSelected ? 'scale(1.03)' : (isRecentlyReturned ? 'scale(0.95)' : 'scale(1)'),
                  opacity: isRecentlyReturned ? 0.7 : 1,
                  borderColor: isSelected ? '#c75b3a' : undefined,
                  backgroundColor: isSelected ? '#fef3f0' : undefined,
                  color: isSelected ? '#c75b3a' : undefined,
                  boxShadow: isSelected
                    ? '0 4px 12px rgba(199, 91, 58, 0.2), 0 0 0 3px rgba(199, 91, 58, 0.15)'
                    : '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {getText(card.text)}
              </button>
            );
          })}
        </div>
      )}

      {/* Buckets - colored dashed borders like Skilljar */}
      <div className="grid gap-4 sm:grid-cols-2">
        {exercise.buckets.map((bucket, bucketIdx) => {
          const color = BUCKET_COLORS[bucketIdx % BUCKET_COLORS.length];
          const cardsInBucket = exercise.cards.filter(c => placements[c.id] === bucket.id);
          const isTarget = !!selectedCard && !submitted;
          const isHovered = hoveredBucket === bucket.id && isTarget;
          
          return (
            <div
              key={bucket.id}
              onClick={() => handleBucketClick(bucket.id)}
              onMouseEnter={() => isTarget && setHoveredBucket(bucket.id)}
              onMouseLeave={() => setHoveredBucket(null)}
              className="rounded-lg p-4 min-h-[100px]"
              style={{
                border: `2px dashed ${color.border}`,
                backgroundColor: submitted ? 'transparent' : (isHovered ? color.bg : (isTarget ? `${color.bg}80` : 'transparent')),
                transition: `all 250ms ${EASE_OUT}`,
                transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isHovered ? `0 0 0 3px ${color.border}30, 0 4px 12px ${color.border}15` : 'none',
                cursor: isTarget ? 'pointer' : 'default',
              }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: color.text }}>
                {getText(bucket.label)}
              </p>
              <div className="flex flex-wrap gap-2">
                {cardsInBucket.map(card => {
                  const result = getCardResult(card.id);
                  const isRecentlyPlacedCard = recentlyPlaced.has(card.id);
                  
                  return (
                    <button
                      key={card.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(card.id);
                      }}
                      disabled={submitted}
                      className="px-3 py-2 rounded-md border text-xs font-medium flex items-center gap-1.5"
                      style={{
                        transition: `all 250ms ${EASE_OUT}`,
                        transform: isRecentlyPlacedCard ? 'scale(0.95)' : 'scale(1)',
                        opacity: isRecentlyPlacedCard ? 0.8 : 1,
                        animation: isRecentlyPlacedCard ? 'cardPlaceIn 300ms ease-out forwards' : undefined,
                        borderColor: result === 'correct' ? '#22c55e' : result === 'incorrect' ? '#ef4444' : '#d1d5db',
                        backgroundColor: result === 'correct' ? '#f0fdf4' : result === 'incorrect' ? '#fef2f2' : '#ffffff',
                        color: result === 'correct' ? '#15803d' : result === 'incorrect' ? '#b91c1c' : '#1f2937',
                      }}
                    >
                      {result === 'correct' && <CheckCircle2 className="h-3 w-3" />}
                      {result === 'incorrect' && <XCircle className="h-3 w-3" />}
                      {!submitted && <Undo2 className="h-3 w-3 opacity-50" />}
                      {getText(card.text)}
                    </button>
                  );
                })}
                {cardsInBucket.length === 0 && !submitted && (
                  <span
                    className="text-xs italic"
                    style={{
                      color: color.text,
                      opacity: isHovered ? 0.9 : 0.6,
                      transition: `opacity 200ms ${EASE_OUT}`,
                    }}
                  >
                    {isTarget
                      ? (lang === 'fr' ? 'Cliquez pour placer ici' : 'Click to place here')
                      : (lang === 'fr' ? 'Glissez les cartes ici' : 'Drop cards here')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback banner - Skilljar style */}
      {submitted && (
        <div
          className={`rounded-lg p-4 flex items-center justify-between ${
            isAllCorrect
              ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
              : 'bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
          }`}
          style={{
            animation: 'fadeSlideIn 300ms ease-out forwards',
          }}
        >
          <div className="flex items-center gap-3">
            {isAllCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-amber-600" />
            )}
            <div>
              <p className={`text-sm font-semibold ${isAllCorrect ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {correctCount}/{totalCards} {isAllCorrect
                  ? (lang === 'fr' ? '· Parfait !' : '· Perfect!')
                  : (lang === 'fr' ? '· Réessayez' : '· TRY AGAIN')}
              </p>
              {!isAllCorrect && getText(exercise.correction) && (
                <p className="text-xs text-muted-foreground mt-1">
                  {getText(exercise.correction)}
                </p>
              )}
            </div>
          </div>
          {!isAllCorrect && (
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-100"
              style={{ transition: `transform 160ms ${EASE_OUT}` }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {lang === 'fr' ? 'Réessayer' : 'Try Again'}
            </Button>
          )}
        </div>
      )}

      {/* Submit button */}
      {!submitted && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!allPlaced}
            size="sm"
            className="gap-1.5 bg-[#c75b3a] hover:bg-[#a84a2e] text-white"
            style={{ transition: `transform 160ms ${EASE_OUT}` }}
          >
            {lang === 'fr' ? 'Soumettre' : 'Submit'}
          </Button>
          {Object.keys(placements).length > 0 && (
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {lang === 'fr' ? 'Réinitialiser' : 'Reset'}
            </Button>
          )}
        </div>
      )}

      {/* CSS keyframes for animations - respects prefers-reduced-motion */}
      <style>{`
        @keyframes cardPlaceIn {
          0% { transform: scale(0.85); opacity: 0.5; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeSlideIn {
          0% { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

export default MatchingExercise;
