import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Send,
  Eye,
  Code2,
  FileText,
  ListChecks,
  CircleDot,
  CheckSquare,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Save,
  CloudOff,
} from 'lucide-react';

// Types
interface LocalizedText {
  en: string;
  fr: string;
}

interface ExerciseOption {
  id: string;
  text: LocalizedText;
  correct: boolean;
}

interface ExerciseRubric {
  keyPoints: LocalizedText[];
  commonMistakes: LocalizedText[];
}

interface Exercise {
  id: string;
  interactionType?: 'free_text' | 'single_choice' | 'multi_choice' | 'code' | 'checklist' | 'scenario';
  title?: LocalizedText;
  prompt?: LocalizedText;
  instructions?: LocalizedText;
  options?: ExerciseOption[] | null;
  inputSchema?: { minWords?: number; maxWords?: number; language?: string } | null;
  rubric?: ExerciseRubric;
  sampleAnswer?: LocalizedText;
  correction?: LocalizedText;
  difficulty?: 'foundation' | 'intermediate' | 'advanced';
  skillTags?: string[];
  // Additional fields from course JSON that may not match the strict interface
  [key: string]: any;
}

interface ExerciseRendererProps {
  exercise: Exercise;
  index: number;
  lang: 'en' | 'fr';
  onComplete?: (exerciseId: string, answer: string) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  foundation: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const DIFFICULTY_LABELS: Record<string, { en: string; fr: string }> = {
  foundation: { en: 'Foundation', fr: 'Fondation' },
  intermediate: { en: 'Intermediate', fr: 'Intermédiaire' },
  advanced: { en: 'Advanced', fr: 'Avancé' },
};

const TYPE_ICONS: Record<string, any> = {
  free_text: FileText,
  single_choice: CircleDot,
  multi_choice: CheckSquare,
  code: Code2,
  checklist: ListChecks,
  scenario: Lightbulb,
};

const TYPE_LABELS: Record<string, { en: string; fr: string }> = {
  free_text: { en: 'Written Response', fr: 'Réponse écrite' },
  single_choice: { en: 'Single Choice', fr: 'Choix unique' },
  multi_choice: { en: 'Multiple Choice', fr: 'Choix multiple' },
  code: { en: 'Code Exercise', fr: 'Exercice de code' },
  checklist: { en: 'Checklist', fr: 'Liste de vérification' },
  scenario: { en: 'Scenario Analysis', fr: 'Analyse de scénario' },
};

// --- Storage helpers ---
const STORAGE_KEY = 'neopolis_exercise_attempts';
const DRAFT_STORAGE_KEY = 'neopolis_exercise_drafts';

interface SavedAttempt {
  answer: string;
  options: string[];
  submittedAt: string;
}

interface SavedDraft {
  answer: string;
  options: string[];
  savedAt: string;
}

function loadAttempt(exerciseId: string): SavedAttempt | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const attempts = JSON.parse(data);
    return attempts[exerciseId] || null;
  } catch { return null; }
}

function saveAttempt(exerciseId: string, answer: string, options: string[]) {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const attempts = data ? JSON.parse(data) : {};
    attempts[exerciseId] = { answer, options, submittedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
    // Clear draft on submit
    clearDraft(exerciseId);
  } catch { /* ignore quota errors */ }
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

// --- Draft auto-save helpers ---
function loadDraft(exerciseId: string): SavedDraft | null {
  try {
    const data = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!data) return null;
    const drafts = JSON.parse(data);
    return drafts[exerciseId] || null;
  } catch { return null; }
}

function saveDraft(exerciseId: string, answer: string, options: string[]): string {
  try {
    const data = localStorage.getItem(DRAFT_STORAGE_KEY);
    const drafts = data ? JSON.parse(data) : {};
    const savedAt = new Date().toISOString();
    drafts[exerciseId] = { answer, options, savedAt };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
    return savedAt;
  } catch { return ''; }
}

function clearDraft(exerciseId: string) {
  try {
    const data = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!data) return;
    const drafts = JSON.parse(data);
    delete drafts[exerciseId];
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  } catch { /* ignore */ }
}

// --- Auto-save status type ---
type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function ExerciseRenderer({ exercise, index, lang, onComplete }: ExerciseRendererProps) {
  // Restore from localStorage on mount: prioritize submitted attempt, then draft
  const savedAttempt = useMemo(() => loadAttempt(exercise.id), [exercise.id]);
  const savedDraft = useMemo(() => loadDraft(exercise.id), [exercise.id]);

  const [userAnswer, setUserAnswer] = useState(savedAttempt?.answer || savedDraft?.answer || '');
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set(savedAttempt?.options || savedDraft?.options || [])
  );
  const [submitted, setSubmitted] = useState(!!savedAttempt);
  const [showCorrection, setShowCorrection] = useState(false);
  const [showRubric, setShowRubric] = useState(false);

  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>(savedDraft ? 'saved' : 'idle');
  const [lastSavedAt, setLastSavedAt] = useState<string>(savedDraft?.savedAt || '');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevAnswerRef = useRef(userAnswer);
  const prevOptionsRef = useRef(selectedOptions);

  const interactionType = exercise.interactionType || 'free_text';
  const TypeIcon = TYPE_ICONS[interactionType] || FileText;

  // Shuffle options on retry to prevent memorization
  const [shuffledOptions, setShuffledOptions] = useState<ExerciseOption[]>(
    () => {
      if (!exercise.options) return [];
      const opts = [...exercise.options];
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      return opts;
    }
  );

  const getText = (field: LocalizedText | undefined | null): string => {
    if (!field) return '';
    return field[lang] || field.en || '';
  };

  // --- Auto-save logic (debounced 1.5s) ---
  const performAutoSave = useCallback(() => {
    if (submitted) return;
    const answer = userAnswer;
    const options = Array.from(selectedOptions);
    // Only save if there's actual content
    if (!answer.trim() && options.length === 0) return;
    setAutoSaveStatus('saving');
    try {
      const savedAt = saveDraft(exercise.id, answer, options);
      if (savedAt) {
        setLastSavedAt(savedAt);
        setAutoSaveStatus('saved');
      } else {
        setAutoSaveStatus('error');
      }
    } catch {
      setAutoSaveStatus('error');
    }
  }, [exercise.id, userAnswer, selectedOptions, submitted]);

  // Trigger auto-save on content change (debounced)
  useEffect(() => {
    if (submitted) return;
    // Check if content actually changed
    const answerChanged = userAnswer !== prevAnswerRef.current;
    const optionsChanged = selectedOptions !== prevOptionsRef.current;
    if (!answerChanged && !optionsChanged) return;

    prevAnswerRef.current = userAnswer;
    prevOptionsRef.current = selectedOptions;

    // Don't auto-save empty content
    if (!userAnswer.trim() && selectedOptions.size === 0) return;

    // Debounce: wait 1.5s after last change
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setAutoSaveStatus('idle');
    debounceTimerRef.current = setTimeout(() => {
      performAutoSave();
    }, 1500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [userAnswer, selectedOptions, submitted, performAutoSave]);

  // Save on page unload (beforeunload)
  useEffect(() => {
    if (submitted) return;
    const handleBeforeUnload = () => {
      if (userAnswer.trim() || selectedOptions.size > 0) {
        saveDraft(exercise.id, userAnswer, Array.from(selectedOptions));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [exercise.id, userAnswer, selectedOptions, submitted]);

  const wordCount = useMemo(() => {
    return userAnswer.trim().split(/\s+/).filter(Boolean).length;
  }, [userAnswer]);

  const canSubmit = useMemo(() => {
    if (submitted) return false;
    switch (interactionType) {
      case 'free_text':
      case 'scenario':
        return wordCount >= (exercise.inputSchema?.minWords || 5);
      case 'code':
        return userAnswer.trim().length > 10;
      case 'single_choice':
        return selectedOptions.size === 1;
      case 'multi_choice':
      case 'checklist':
        return selectedOptions.size > 0;
      default:
        return userAnswer.trim().length > 0;
    }
  }, [submitted, exercise, wordCount, userAnswer, selectedOptions, interactionType]);

  const handleSubmit = () => {
    setSubmitted(true);
    const answer = interactionType === 'single_choice' || interactionType === 'multi_choice' || interactionType === 'checklist'
      ? Array.from(selectedOptions).join(',')
      : userAnswer;
    saveAttempt(exercise.id, userAnswer, Array.from(selectedOptions));
    setAutoSaveStatus('idle');
    onComplete?.(exercise.id, answer);
  };

  const handleReset = () => {
    setUserAnswer('');
    setSelectedOptions(new Set());
    setSubmitted(false);
    setShowCorrection(false);
    setShowRubric(false);
    clearAttempt(exercise.id);
    clearDraft(exercise.id);
    setAutoSaveStatus('idle');
    setLastSavedAt('');
    // Shuffle options order on retry to prevent memorization
    if (exercise.options) {
      const opts = [...exercise.options];
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      setShuffledOptions(opts);
    }
  };

  const toggleOption = (optionId: string) => {
    if (submitted) return;
    const newSet = new Set(selectedOptions);
    if (interactionType === 'single_choice') {
      newSet.clear();
      newSet.add(optionId);
    } else {
      if (newSet.has(optionId)) {
        newSet.delete(optionId);
      } else {
        newSet.add(optionId);
      }
    }
    setSelectedOptions(newSet);
  };

  const getOptionResult = (option: ExerciseOption) => {
    if (!submitted) return null;
    const isSelected = selectedOptions.has(option.id);
    if (isSelected && option.correct) return 'correct';
    if (isSelected && !option.correct) return 'incorrect';
    if (!isSelected && option.correct) return 'missed';
    return null;
  };

  // Format time for display
  const formatSavedTime = (isoString: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch { return ''; }
  };

  // Auto-save indicator component
  const AutoSaveIndicator = () => {
    if (submitted) return null;
    if (autoSaveStatus === 'idle' && !lastSavedAt) return null;

    return (
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        {autoSaveStatus === 'saving' && (
          <>
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{lang === 'fr' ? 'Sauvegarde...' : 'Saving...'}</span>
          </>
        )}
        {autoSaveStatus === 'saved' && lastSavedAt && (
          <>
            <Save className="w-3 h-3 text-green-500" />
            <span>{lang === 'fr' ? 'Brouillon sauvegardé' : 'Draft saved'} {formatSavedTime(lastSavedAt)}</span>
          </>
        )}
        {autoSaveStatus === 'error' && (
          <>
            <CloudOff className="w-3 h-3 text-red-400" />
            <span>{lang === 'fr' ? 'Erreur de sauvegarde' : 'Save error'}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="my-6 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header - Skilljar style: Exercise · Title */}
      <div className="px-5 py-3 bg-[#f8f8f6] border-b border-gray-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-[#c75b3a]">
            Exercise
          </span>
          {getText(exercise.title) && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-sm font-medium text-gray-700 truncate" style={{ fontFamily: 'Lora, Georgia, serif' }}>
                {getText(exercise.title)}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {submitted && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
              {lang === 'fr' ? '✓ Soumis' : '✓ Submitted'}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Prompt */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{getText(exercise.prompt)}</p>
        </div>

        {/* Instructions */}
        {getText(exercise.instructions) && (
          <p className="text-xs text-muted-foreground italic">
            {getText(exercise.instructions)}
          </p>
        )}

        {/* Input Area */}
        {!submitted ? (
          <div className="space-y-3">
            {/* Free text / Scenario */}
            {(interactionType === 'free_text' || interactionType === 'scenario') && (
              <div>
                <Textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={lang === 'fr' ? 'Écrivez votre réponse ici...' : 'Write your answer here...'}
                  className="min-h-[120px] text-sm"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {wordCount} {lang === 'fr' ? 'mots' : 'words'}
                    {exercise.inputSchema?.minWords && (
                      <span className={wordCount < exercise.inputSchema.minWords ? ' text-red-500' : ' text-green-500'}>
                        {' '}(min: {exercise.inputSchema.minWords})
                      </span>
                    )}
                  </span>
                  {exercise.inputSchema?.maxWords && (
                    <span className="text-xs text-muted-foreground">
                      max: {exercise.inputSchema.maxWords}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Code */}
            {interactionType === 'code' && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Code2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {exercise.inputSchema?.language || 'python'}
                  </span>
                </div>
                <Textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={`// ${lang === 'fr' ? 'Écrivez votre code ici...' : 'Write your code here...'}`}
                  className="min-h-[160px] font-mono text-sm bg-zinc-950 text-zinc-100 dark:bg-zinc-900"
                />
              </div>
            )}

            {/* Single/Multi Choice */}
            {(interactionType === 'single_choice' || interactionType === 'multi_choice') && shuffledOptions.length > 0 && (
              <div className="space-y-2">
                {shuffledOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                      selectedOptions.has(option.id)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <span className="font-medium mr-2">{option.id.toUpperCase()}.</span>
                    {getText(option.text)}
                  </button>
                ))}
              </div>
            )}

            {/* Checklist */}
            {interactionType === 'checklist' && shuffledOptions.length > 0 && (
              <div className="space-y-2">
                {shuffledOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-start gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted/50 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={selectedOptions.has(option.id)}
                      onCheckedChange={() => toggleOption(option.id)}
                      className="mt-0.5"
                    />
                    <span>{getText(option.text)}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Auto-save indicator */}
            <AutoSaveIndicator />
          </div>
        ) : (
          /* Submitted state - show answer summary */
          <div className="space-y-3">
            {/* Show user's answer */}
            {(interactionType === 'free_text' || interactionType === 'scenario' || interactionType === 'code') && (
              <div className="bg-muted/30 rounded-md p-3 border border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {lang === 'fr' ? 'Votre réponse :' : 'Your answer:'}
                </p>
                <p className={`text-sm whitespace-pre-wrap ${interactionType === 'code' ? 'font-mono' : ''}`}>
                  {userAnswer}
                </p>
              </div>
            )}

            {/* Show option results */}
            {(interactionType === 'single_choice' || interactionType === 'multi_choice') && shuffledOptions.length > 0 && (
              <div className="space-y-2">
                {shuffledOptions.map((option) => {
                  const result = getOptionResult(option);
                  return (
                    <div
                      key={option.id}
                      className={`px-3 py-2 rounded-md border text-sm flex items-center gap-2 ${
                        result === 'correct'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : result === 'incorrect'
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : result === 'missed'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                          : 'border-border'
                      }`}
                    >
                      {result === 'correct' && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                      {result === 'incorrect' && <XCircle className="h-4 w-4 text-red-600 shrink-0" />}
                      {result === 'missed' && <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />}
                      <span className="font-medium mr-1">{option.id.toUpperCase()}.</span>
                      {getText(option.text)}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Checklist results */}
            {interactionType === 'checklist' && shuffledOptions.length > 0 && (
              <div className="space-y-2">
                {shuffledOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-start gap-2 px-3 py-2 rounded-md border text-sm ${
                      selectedOptions.has(option.id)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-border'
                    }`}
                  >
                    <Checkbox checked={selectedOptions.has(option.id)} disabled className="mt-0.5" />
                    <span>{getText(option.text)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          {!submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              size="sm"
              className="gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {lang === 'fr' ? 'Soumettre' : 'Submit'}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setShowCorrection(!showCorrection)}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" />
                {showCorrection
                  ? (lang === 'fr' ? 'Masquer correction' : 'Hide correction')
                  : (lang === 'fr' ? 'Voir la correction' : 'Show correction')}
              </Button>
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

          {/* Skill tags */}
          <div className="ml-auto flex gap-1 flex-wrap">
            {exercise.skillTags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Correction Panel */}
        {showCorrection && (
          <div className="space-y-3 pt-3 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Correction text */}
            {getText(exercise.correction) && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3 border border-green-200 dark:border-green-800">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                  {lang === 'fr' ? 'Correction' : 'Correction'}
                </p>
                <p className="text-sm whitespace-pre-wrap">{getText(exercise.correction)}</p>
              </div>
            )}

            {/* Sample answer */}
            {getText(exercise.sampleAnswer) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                  {lang === 'fr' ? 'Réponse modèle' : 'Sample Answer'}
                </p>
                <p className="text-sm whitespace-pre-wrap">{getText(exercise.sampleAnswer)}</p>
              </div>
            )}

            {/* Rubric */}
            {((exercise.rubric?.keyPoints?.length ?? 0) > 0 || (exercise.rubric?.commonMistakes?.length ?? 0) > 0) && (
              <div>
                <button
                  onClick={() => setShowRubric(!showRubric)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showRubric ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {lang === 'fr' ? 'Grille d\'évaluation' : 'Evaluation rubric'}
                </button>
                {showRubric && (
                  <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    {exercise.rubric?.keyPoints && exercise.rubric.keyPoints.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-600 mb-1">
                          {lang === 'fr' ? 'Points clés :' : 'Key Points:'}
                        </p>
                        <ul className="text-xs space-y-0.5 pl-4 list-disc text-muted-foreground">
                          {exercise.rubric.keyPoints.map((kp, i) => (
                            <li key={i}>{getText(kp)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {exercise.rubric?.commonMistakes && exercise.rubric.commonMistakes.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-red-600 mb-1">
                          {lang === 'fr' ? 'Erreurs fréquentes :' : 'Common Mistakes:'}
                        </p>
                        <ul className="text-xs space-y-0.5 pl-4 list-disc text-muted-foreground">
                          {exercise.rubric.commonMistakes.map((cm, i) => (
                            <li key={i}>{getText(cm)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExerciseRenderer;
