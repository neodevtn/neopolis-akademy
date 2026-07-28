import { useState, useCallback } from 'react';
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

  const unplacedCards = exercise.cards.filter(c => !placements[c.id]);
  const allPlaced = unplacedCards.length === 0;

  const handleCardClick = useCallback((cardId: string) => {
    if (submitted) return;
    if (placements[cardId]) {
      const newPlacements = { ...placements };
      delete newPlacements[cardId];
      setPlacements(newPlacements);
      setSelectedCard(null);
      return;
    }
    setSelectedCard(prev => prev === cardId ? null : cardId);
  }, [submitted, placements]);

  const handleBucketClick = useCallback((bucketId: string) => {
    if (submitted || !selectedCard) return;
    const newPlacements = { ...placements, [selectedCard]: bucketId };
    setPlacements(newPlacements);
    setSelectedCard(null);
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
          {unplacedCards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`px-4 py-3 rounded-lg border text-sm text-left transition-all duration-150 ${
                selectedCard === card.id
                  ? 'border-[#c75b3a] bg-[#fef3f0] text-[#c75b3a] ring-2 ring-[#c75b3a]/30 scale-[1.02]'
                  : 'border-gray-200 bg-white hover:border-[#c75b3a]/50 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#c75b3a]/50'
              }`}
            >
              {getText(card.text)}
            </button>
          ))}
        </div>
      )}

      {/* Buckets - colored dashed borders like Skilljar */}
      <div className="grid gap-4 sm:grid-cols-2">
        {exercise.buckets.map((bucket, bucketIdx) => {
          const color = BUCKET_COLORS[bucketIdx % BUCKET_COLORS.length];
          const cardsInBucket = exercise.cards.filter(c => placements[c.id] === bucket.id);
          const isTarget = selectedCard && !submitted;
          
          return (
            <div
              key={bucket.id}
              onClick={() => handleBucketClick(bucket.id)}
              className={`rounded-lg p-4 transition-all duration-150 min-h-[100px] ${
                isTarget ? 'cursor-pointer hover:opacity-80' : ''
              }`}
              style={{
                border: `2px dashed ${color.border}`,
                backgroundColor: submitted ? 'transparent' : (isTarget ? color.bg : 'transparent'),
              }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: color.text }}>
                {getText(bucket.label)}
              </p>
              <div className="flex flex-wrap gap-2">
                {cardsInBucket.map(card => {
                  const result = getCardResult(card.id);
                  return (
                    <button
                      key={card.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(card.id);
                      }}
                      disabled={submitted}
                      className={`px-3 py-2 rounded-md border text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                        result === 'correct'
                          ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : result === 'incorrect'
                          ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {result === 'correct' && <CheckCircle2 className="h-3 w-3" />}
                      {result === 'incorrect' && <XCircle className="h-3 w-3" />}
                      {!submitted && <Undo2 className="h-3 w-3 opacity-50" />}
                      {getText(card.text)}
                    </button>
                  );
                })}
                {cardsInBucket.length === 0 && !submitted && (
                  <span className="text-xs italic" style={{ color: color.text, opacity: 0.6 }}>
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
        <div className={`rounded-lg p-4 flex items-center justify-between ${
          isAllCorrect
            ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
            : 'bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
        }`}>
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
    </div>
  );
}

export default MatchingExercise;
