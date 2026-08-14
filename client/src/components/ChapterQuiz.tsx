import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeQuestionBank, type QuestionSelectionSettings } from "@shared/questionBank";

// Helper to resolve {en, fr} objects or plain strings
function resolveI18n(val: any, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && (val.en || val.fr)) {
    return lang === "fr" ? (val.fr || val.en || "") : (val.en || val.fr || "");
  }
  return String(val);
}

interface ChapterQuizProps {
  courseId: string;
  chapterIndex: number;
  lessonIndex: number;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  onPass: () => void;
  onSkip?: () => void;
}

// Option letters
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function ChapterQuiz({ courseId, chapterIndex, lessonIndex, lang, t, onPass, onSkip }: ChapterQuizProps) {
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [selectionSettings, setSelectionSettings] = useState<QuestionSelectionSettings>({ mode: "random", questionCount: 3, passThreshold: 2, shuffleChoices: true });
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);

  // Load questions from lessonQuizzes.json
  useEffect(() => {
    setLoading(true);
    fetch("/data/lessonQuizzes.json")
      .then((r) => r.json())
      .then((allQuizzes: any) => {
        const courseQuizzes = allQuizzes[courseId];
        if (!courseQuizzes) {
          setAllQuestions([]);
          setLoading(false);
          return;
        }
        const compoundKey = `${lessonIndex}_${chapterIndex}`;
        const rawBank = courseQuizzes[compoundKey] || courseQuizzes[String(chapterIndex)] || [];
        const bank = normalizeQuestionBank(rawBank);
        setAllQuestions(bank.questions);
        setSelectionSettings(bank.selection);
        setLoading(false);
      })
      .catch(() => {
        setAllQuestions([]);
        setLoading(false);
      });
  }, [courseId, chapterIndex, lessonIndex]);

  // Randomly select QUESTIONS_TO_SHOW questions from the pool
  const questions = useMemo(() => {
    if (selectionSettings.mode === "all" || allQuestions.length <= selectionSettings.questionCount) return allQuestions;
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, selectionSettings.questionCount);
  }, [allQuestions, attemptCount, selectionSettings.mode, selectionSettings.questionCount]);
  const shownQuestionCount = questions.length;

  // If no questions available, auto-pass
  useEffect(() => {
    if (!loading && allQuestions.length === 0) {
      onPass();
    }
  }, [loading, allQuestions.length]);

  // MUST declare all hooks before any early return to respect React rules
  const q = useMemo(() => {
    const question = questions[currentQ];
    if (!question) return null;
    const shuffledChoices = [...(question.choices || [])];
    if (selectionSettings.shuffleChoices) {
      for (let i = shuffledChoices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledChoices[i], shuffledChoices[j]] = [shuffledChoices[j], shuffledChoices[i]];
      }
    }
    return { ...question, choices: shuffledChoices };
  }, [questions, currentQ, attemptCount, selectionSettings.shuffleChoices]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-[#c75b3a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (allQuestions.length === 0) return null;

  // Quiz complete screen
  if (quizComplete) {
    return (
      <div className="rounded-lg p-6 mt-6 bg-[#f8f8f6]">
        <div className="text-center">
          {quizPassed ? (
            <>
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-1 text-gray-900" style={{ fontFamily: 'Lora, Georgia, serif' }}>
                {t({ en: "Chapter validated!", fr: "Chapitre validé !" })}
              </h3>
              <p className="text-sm mb-4 text-gray-600">
                {t({
                  en: `You got ${correctCount}/${shownQuestionCount} correct.`,
                  fr: `Vous avez obtenu ${correctCount}/${shownQuestionCount} correct.`
                })}
              </p>
              <Button onClick={onPass} className="gap-1.5 bg-[#c75b3a] hover:bg-[#a84a2e] text-white">
                {t({ en: "Continue", fr: "Continuer" })} →
              </Button>
            </>
          ) : (
            <>
              <X className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-1 text-gray-900" style={{ fontFamily: 'Lora, Georgia, serif' }}>
                {t({ en: "Not quite!", fr: "Pas tout à fait !" })}
              </h3>
              <p className="text-sm mb-4 text-gray-600">
                {t({
                  en: `You got ${correctCount}/${shownQuestionCount}. You need at least ${selectionSettings.passThreshold}/${shownQuestionCount}.`,
                  fr: `Vous avez obtenu ${correctCount}/${shownQuestionCount}. Il faut au moins ${selectionSettings.passThreshold}/${shownQuestionCount}.`
                })}
              </p>
              <Button
                onClick={() => {
                  setAttemptCount((c) => c + 1);
                  setCurrentQ(0);
                  setSelected(null);
                  setShowResult(false);
                  setCorrectCount(0);
                  setQuizComplete(false);
                  setQuizPassed(false);
                }}
                className="gap-1.5 bg-[#c75b3a] hover:bg-[#a84a2e] text-white"
              >
                {t({
                  en: `Try Again (Attempt #${attemptCount + 1})`,
                  fr: `Réessayer (Tentative n°${attemptCount + 1})`
                })}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="rounded-lg p-5 mt-6 bg-[#f8f8f6]">
      {/* Question label - Skilljar style "Q1" grey */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-400 uppercase">
          Q{currentQ + 1}
        </span>
        <span className="text-xs text-gray-400">
          {currentQ + 1}/{shownQuestionCount}
        </span>
      </div>

      {/* Question text */}
      <p className="text-base font-medium mb-5 text-gray-900" style={{ fontFamily: 'Lora, Georgia, serif' }}>
        {resolveI18n(q.question, lang)}
      </p>

      {/* Choices - Skilljar style: A/B/C letter in orange */}
      <div className="space-y-3 mb-5">
        {q.choices.map((choice: any, idx: number) => {
          const isSelected = selected === choice.id;
          const isCorrectChoice = choice.id === q.correctId;
          const letter = OPTION_LETTERS[idx] || choice.id.toUpperCase();

          let containerClass = "bg-white border-gray-200 hover:border-[#c75b3a]/50";
          let letterColor = "text-[#c75b3a]";

          if (showResult) {
            if (isCorrectChoice) {
              containerClass = "bg-green-50 border-green-400";
              letterColor = "text-green-600";
            } else if (isSelected && !isCorrectChoice) {
              containerClass = "bg-red-50 border-red-400";
              letterColor = "text-red-500";
            } else {
              containerClass = "bg-white border-gray-200 opacity-60";
            }
          } else if (isSelected) {
            containerClass = "bg-[#fef3f0] border-[#c75b3a]";
          }

          return (
            <button
              key={choice.id}
              onClick={() => !showResult && setSelected(choice.id)}
              disabled={showResult}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center gap-3 ${containerClass} ${showResult ? "cursor-default" : "cursor-pointer"}`}
            >
              <span className={`text-sm font-bold ${letterColor}`}>{letter}</span>
              <span className="text-sm text-gray-800 flex-1">{resolveI18n(choice.text, lang)}</span>
              {showResult && isCorrectChoice && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
              {showResult && isSelected && !isCorrectChoice && <X className="w-4 h-4 text-red-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Immediate feedback banner */}
      {showResult && (
        <div className={`flex items-center gap-3 p-3.5 rounded-lg mb-3 border ${
          selected === q.correctId
            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          {selected === q.correctId ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                {t({ en: "Correct!", fr: "Correct !" })}
              </span>
            </>
          ) : (
            <>
              <X className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <span className="text-sm font-semibold text-red-800 dark:text-red-300">
                {t({ en: "Incorrect", fr: "Incorrect" })}
              </span>
            </>
          )}
        </div>
      )}

      {/* Explanation after answer */}
      {showResult && q.explanation && (
        <div className="text-sm p-4 rounded-lg mb-4 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-gray-800 dark:text-gray-200">
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5 shrink-0">💡</span>
            <p className="leading-relaxed">{resolveI18n(q.explanation, lang)}</p>
          </div>
        </div>
      )}

      {/* Action button */}
      {!showResult ? (
        <Button
          onClick={() => setShowResult(true)}
          disabled={!selected}
          className="bg-[#c75b3a] hover:bg-[#a84a2e] text-white w-full"
          size="sm"
        >
          {t({ en: "Check Answer", fr: "Vérifier" })}
        </Button>
      ) : (
        <Button
          onClick={() => {
            const correct = selected === q.correctId;
            const newCorrect = correctCount + (correct ? 1 : 0);
            setCorrectCount(newCorrect);
            if (currentQ >= shownQuestionCount - 1) {
              setQuizComplete(true);
              setQuizPassed(newCorrect >= selectionSettings.passThreshold);
            } else {
              setCurrentQ((p) => p + 1);
              setSelected(null);
              setShowResult(false);
            }
          }}
          className="bg-[#c75b3a] hover:bg-[#a84a2e] text-white w-full"
          size="sm"
        >
          {currentQ >= shownQuestionCount - 1
            ? t({ en: "See Results", fr: "Voir les résultats" })
            : t({ en: "Next Question", fr: "Question suivante" })} →
        </Button>
      )}
    </div>
  );
}
