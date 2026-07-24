import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  interactionType: 'free_text' | 'single_choice' | 'multi_choice' | 'code' | 'checklist' | 'scenario';
  title: LocalizedText;
  prompt: LocalizedText;
  instructions: LocalizedText;
  options: ExerciseOption[] | null;
  inputSchema: { minWords?: number; maxWords?: number; language?: string } | null;
  rubric: ExerciseRubric;
  sampleAnswer: LocalizedText;
  correction: LocalizedText;
  difficulty: 'foundation' | 'intermediate' | 'advanced';
  skillTags: string[];
}

interface ExerciseRendererProps {
  exercise: Exercise;
  index: number;
  lang: 'en' | 'fr';
  onComplete?: (exerciseId: string, answer: string) => void;
}

const DIFFICULTY_COLORS = {
  foundation: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const DIFFICULTY_LABELS = {
  foundation: { en: 'Foundation', fr: 'Fondation' },
  intermediate: { en: 'Intermediate', fr: 'Intermédiaire' },
  advanced: { en: 'Advanced', fr: 'Avancé' },
};

const TYPE_ICONS = {
  free_text: FileText,
  single_choice: CircleDot,
  multi_choice: CheckSquare,
  code: Code2,
  checklist: ListChecks,
  scenario: Lightbulb,
};

const TYPE_LABELS = {
  free_text: { en: 'Written Response', fr: 'Réponse écrite' },
  single_choice: { en: 'Single Choice', fr: 'Choix unique' },
  multi_choice: { en: 'Multiple Choice', fr: 'Choix multiple' },
  code: { en: 'Code Exercise', fr: 'Exercice de code' },
  checklist: { en: 'Checklist', fr: 'Liste de vérification' },
  scenario: { en: 'Scenario Analysis', fr: 'Analyse de scénario' },
};

const STORAGE_KEY = 'neopolis_exercise_attempts';

function loadAttempt(exerciseId: string): { answer: string; options: string[]; submittedAt: string } | null {
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

export function ExerciseRenderer({ exercise, index, lang, onComplete }: ExerciseRendererProps) {
  // Restore from localStorage on mount
  const savedAttempt = useMemo(() => loadAttempt(exercise.id), [exercise.id]);
  const [userAnswer, setUserAnswer] = useState(savedAttempt?.answer || '');
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set(savedAttempt?.options || []));
  const [submitted, setSubmitted] = useState(!!savedAttempt);
  const [showCorrection, setShowCorrection] = useState(false);
  const [showRubric, setShowRubric] = useState(false);

  const TypeIcon = TYPE_ICONS[exercise.interactionType] || FileText;

  const getText = (field: LocalizedText | undefined | null): string => {
    if (!field) return '';
    return field[lang] || field.en || '';
  };

  const wordCount = useMemo(() => {
    return userAnswer.trim().split(/\s+/).filter(Boolean).length;
  }, [userAnswer]);

  const canSubmit = useMemo(() => {
    if (submitted) return false;
    switch (exercise.interactionType) {
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
  }, [submitted, exercise, wordCount, userAnswer, selectedOptions]);

  const handleSubmit = () => {
    setSubmitted(true);
    const answer = exercise.interactionType === 'single_choice' || exercise.interactionType === 'multi_choice' || exercise.interactionType === 'checklist'
      ? Array.from(selectedOptions).join(',')
      : userAnswer;
    saveAttempt(exercise.id, userAnswer, Array.from(selectedOptions));
    onComplete?.(exercise.id, answer);
  };

  const handleReset = () => {
    setUserAnswer('');
    setSelectedOptions(new Set());
    setSubmitted(false);
    setShowCorrection(false);
    setShowRubric(false);
    clearAttempt(exercise.id);
  };

  const toggleOption = (optionId: string) => {
    if (submitted) return;
    const newSet = new Set(selectedOptions);
    if (exercise.interactionType === 'single_choice') {
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

  return (
    <Card className="border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">
            {index + 1}. {getText(exercise.title)}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className={`text-xs ${DIFFICULTY_COLORS[exercise.difficulty]}`}>
            {DIFFICULTY_LABELS[exercise.difficulty][lang]}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {TYPE_LABELS[exercise.interactionType][lang]}
          </Badge>
          {submitted && (
            <Badge className="bg-green-600 text-white text-xs">
              {lang === 'fr' ? 'Soumis' : 'Submitted'}
            </Badge>
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
            {(exercise.interactionType === 'free_text' || exercise.interactionType === 'scenario') && (
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
            {exercise.interactionType === 'code' && (
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
            {(exercise.interactionType === 'single_choice' || exercise.interactionType === 'multi_choice') && exercise.options && (
              <div className="space-y-2">
                {exercise.options.map((option) => (
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
            {exercise.interactionType === 'checklist' && exercise.options && (
              <div className="space-y-2">
                {exercise.options.map((option) => (
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
          </div>
        ) : (
          /* Submitted state - show answer summary */
          <div className="space-y-3">
            {/* Show user's answer */}
            {(exercise.interactionType === 'free_text' || exercise.interactionType === 'scenario' || exercise.interactionType === 'code') && (
              <div className="bg-muted/30 rounded-md p-3 border border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {lang === 'fr' ? 'Votre réponse :' : 'Your answer:'}
                </p>
                <p className={`text-sm whitespace-pre-wrap ${exercise.interactionType === 'code' ? 'font-mono' : ''}`}>
                  {userAnswer}
                </p>
              </div>
            )}

            {/* Show option results */}
            {(exercise.interactionType === 'single_choice' || exercise.interactionType === 'multi_choice') && exercise.options && (
              <div className="space-y-2">
                {exercise.options.map((option) => {
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
            {exercise.interactionType === 'checklist' && exercise.options && (
              <div className="space-y-2">
                {exercise.options.map((option) => (
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
            {(exercise.rubric?.keyPoints?.length > 0 || exercise.rubric?.commonMistakes?.length > 0) && (
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
                    {exercise.rubric.keyPoints?.length > 0 && (
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
                    {exercise.rubric.commonMistakes?.length > 0 && (
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
    </Card>
  );
}

export default ExerciseRenderer;
