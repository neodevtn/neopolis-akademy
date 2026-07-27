import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  GripVertical,
  ArrowRight,
  Undo2,
} from 'lucide-react';

interface LocalizedText {
  en: string;
  fr: string;
}

interface MatchingPair {
  item: LocalizedText;
  bucket: LocalizedText;
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
  
  // placements: cardId → bucketId
  const [placements, setPlacements] = useState<Record<string, string>>(savedAttempt || {});
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(!!savedAttempt);
  const [showCorrection, setShowCorrection] = useState(false);

  const unplacedCards = exercise.cards.filter(c => !placements[c.id]);
  const allPlaced = unplacedCards.length === 0;

  const handleCardClick = useCallback((cardId: string) => {
    if (submitted) return;
    
    // If card is already placed, return it to pool
    if (placements[cardId]) {
      const newPlacements = { ...placements };
      delete newPlacements[cardId];
      setPlacements(newPlacements);
      setSelectedCard(null);
      return;
    }
    
    // Toggle selection
    setSelectedCard(prev => prev === cardId ? null : cardId);
  }, [submitted, placements]);

  const handleBucketClick = useCallback((bucketId: string) => {
    if (submitted || !selectedCard) return;
    
    // Place the selected card in this bucket
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

  return (
    <Card className="overflow-hidden border-border/60">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/50">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">
            {getText(exercise.title) || (lang === 'fr' ? 'Exercice de classement' : 'Sorting Exercise')}
          </span>
        </div>
        {submitted && (
          <Badge className={correctCount === exercise.cards.length ? 'bg-green-600 text-white' : 'bg-amber-600 text-white'}>
            {correctCount}/{exercise.cards.length}
          </Badge>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Instructions */}
        {getText(exercise.instructions) && (
          <p className="text-sm text-muted-foreground">
            {getText(exercise.instructions)}
          </p>
        )}

        {!submitted && (
          <p className="text-xs text-muted-foreground italic">
            {lang === 'fr'
              ? 'Cliquez sur une carte pour la sélectionner, puis cliquez sur une catégorie pour la placer. Cliquez sur une carte placée pour la remettre dans le pool.'
              : 'Click a card to select it, then click a bucket to place it. Click a placed card to return it to the pool.'}
          </p>
        )}

        {/* Unplaced cards pool */}
        {!submitted && unplacedCards.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {lang === 'fr' ? 'Cartes à placer' : 'Cards to place'}
            </p>
            <div className="flex flex-wrap gap-2">
              {unplacedCards.map(card => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-all duration-150 ${
                    selectedCard === card.id
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/30 scale-[1.02]'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  {getText(card.text)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buckets */}
        <div className="grid gap-3 sm:grid-cols-2">
          {exercise.buckets.map(bucket => {
            const cardsInBucket = exercise.cards.filter(c => placements[c.id] === bucket.id);
            const isTarget = selectedCard && !submitted;
            
            return (
              <div
                key={bucket.id}
                onClick={() => handleBucketClick(bucket.id)}
                className={`rounded-lg border-2 p-3 transition-all duration-150 min-h-[80px] ${
                  isTarget
                    ? 'border-dashed border-primary/60 bg-primary/5 cursor-pointer hover:bg-primary/10'
                    : 'border-border/60 bg-muted/20'
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {getText(bucket.label)}
                </p>
                <div className="flex flex-wrap gap-1.5">
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
                        className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                          result === 'correct'
                            ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : result === 'incorrect'
                            ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20'
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
                    <span className="text-xs text-muted-foreground/50 italic">
                      {isTarget
                        ? (lang === 'fr' ? 'Cliquez pour placer ici' : 'Click to place here')
                        : (lang === 'fr' ? 'Vide' : 'Empty')}
                    </span>
                  )}
                </div>
                {/* Show correct answers for incorrect cards */}
                {submitted && cardsInBucket.some(c => getCardResult(c.id) === 'incorrect') && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    {cardsInBucket
                      .filter(c => getCardResult(c.id) === 'incorrect')
                      .map(card => {
                        const correctBucket = exercise.buckets.find(b => b.id === card.correctBucket);
                        return (
                          <p key={card.id} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" />
                            {getText(card.text)} → {correctBucket ? getText(correctBucket.label) : '?'}
                          </p>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          {!submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={!allPlaced}
              size="sm"
              className="gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {lang === 'fr' ? 'Vérifier' : 'Check'}
            </Button>
          ) : (
            <>
              {getText(exercise.correction) && (
                <Button
                  onClick={() => setShowCorrection(!showCorrection)}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  {showCorrection
                    ? (lang === 'fr' ? 'Masquer' : 'Hide')
                    : (lang === 'fr' ? 'Explication' : 'Explanation')}
                </Button>
              )}
              <Button
                onClick={handleReset}
                variant="ghost"
                size="sm"
                className="gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {lang === 'fr' ? 'Recommencer' : 'Restart'}
              </Button>
            </>
          )}
        </div>

        {/* Correction */}
        {showCorrection && getText(exercise.correction) && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3 border border-green-200 dark:border-green-800 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
              {lang === 'fr' ? 'Explication' : 'Explanation'}
            </p>
            <p className="text-sm whitespace-pre-wrap">{getText(exercise.correction)}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

export default MatchingExercise;
