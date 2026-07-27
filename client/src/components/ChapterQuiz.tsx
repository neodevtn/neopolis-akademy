import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, X, ArrowRight, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const QUESTIONS_TO_SHOW = 3;
const PASS_THRESHOLD = 2;

export function ChapterQuiz({ courseId, chapterIndex, lessonIndex, lang, t, onPass, onSkip }: ChapterQuizProps) {
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [shakeError, setShakeError] = useState(false);

  // Load questions from lessonQuizzes.json
  // Try compound key "lessonIndex_chapterIndex" first, then fall back to just chapterIndex
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
        // Try compound key first (for multi-lesson courses)
        const compoundKey = `${lessonIndex}_${chapterIndex}`;
        if (courseQuizzes[compoundKey]) {
          setAllQuestions(courseQuizzes[compoundKey]);
        } else if (courseQuizzes[String(chapterIndex)]) {
          // Fall back to simple chapter index (for single-lesson courses)
          setAllQuestions(courseQuizzes[String(chapterIndex)]);
        } else {
          setAllQuestions([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setAllQuestions([]);
        setLoading(false);
      });
  }, [courseId, chapterIndex, lessonIndex]);

  // Randomly select QUESTIONS_TO_SHOW questions from the pool
  const questions = useMemo(() => {
    if (allQuestions.length <= QUESTIONS_TO_SHOW) return allQuestions;
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, QUESTIONS_TO_SHOW);
  }, [allQuestions, attemptCount]); // Re-shuffle on retry

  // If no questions available, auto-pass
  useEffect(() => {
    if (!loading && allQuestions.length === 0) {
      onPass();
    }
  }, [loading, allQuestions.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (allQuestions.length === 0) return null;

  // Quiz complete screen
  if (quizComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-2xl p-6 border bg-card border-border mt-6"
      >
        <div className="text-center">
          {quizPassed ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              </motion.div>
              <h3 className="text-base font-bold mb-1 text-foreground">
                {t({ en: "Chapter validated!", fr: "Chapitre validé !" })}
              </h3>
              <p className="text-sm mb-4 text-muted-foreground">
                {t({
                  en: `You got ${correctCount}/${QUESTIONS_TO_SHOW} correct. You can proceed to the next chapter.`,
                  fr: `Vous avez obtenu ${correctCount}/${QUESTIONS_TO_SHOW} correct. Vous pouvez passer au chapitre suivant.`
                })}
              </p>
              <Button onClick={onPass} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5">
                <ArrowRight className="w-4 h-4" />
                {t({ en: "Continue", fr: "Continuer" })}
              </Button>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <X className="w-12 h-12 text-red-500 mx-auto mb-3" />
              </motion.div>
              <h3 className="text-base font-bold mb-1 text-foreground">
                {t({ en: "Not quite!", fr: "Pas tout à fait !" })}
              </h3>
              <p className="text-sm mb-4 text-muted-foreground">
                {t({
                  en: `You got ${correctCount}/${QUESTIONS_TO_SHOW}. You need at least ${PASS_THRESHOLD}/${QUESTIONS_TO_SHOW} to continue.`,
                  fr: `Vous avez obtenu ${correctCount}/${QUESTIONS_TO_SHOW}. Il faut au moins ${PASS_THRESHOLD}/${QUESTIONS_TO_SHOW} pour continuer.`
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
                  setShakeError(false);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                {t({
                  en: `Retry (Attempt #${attemptCount + 1})`,
                  fr: `Réessayer (Tentative n°${attemptCount + 1})`
                })}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  // Current question
  const q = questions[currentQ];
  if (!q) return null;

  const isCorrect = selected === q.correctId;

  return (
    <motion.div
      key={`chq-${currentQ}-${attemptCount}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className={`rounded-2xl p-5 border bg-card border-border mt-6 ${shakeError ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-500" />
          <h3 className="text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">
            {t({ en: "Chapter Quiz", fr: "Quiz de chapitre" })}
          </h3>
          {attemptCount > 1 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
              #{attemptCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: QUESTIONS_TO_SHOW }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < currentQ
                  ? "bg-emerald-500"
                  : i === currentQ
                  ? "bg-violet-500 w-4"
                  : "bg-secondary"
              }`}
            />
          ))}
          <span className="text-xs font-medium ml-1 text-muted-foreground">
            {currentQ + 1}/{QUESTIONS_TO_SHOW}
          </span>
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-medium mb-3 text-foreground">
        {q.question}
      </p>

      {/* Choices */}
      <div className="space-y-2 mb-3">
        {q.choices.map((choice: any) => {
          const isSelected = selected === choice.id;
          const isCorrectChoice = choice.id === q.correctId;
          let choiceClass = "border-border hover:border-violet-300 dark:hover:border-violet-700 bg-card";
          let feedbackIcon: React.ReactNode = null;

          if (showResult) {
            if (isCorrectChoice) {
              choiceClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
              feedbackIcon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
            } else if (isSelected && !isCorrectChoice) {
              choiceClass = "border-red-400 bg-red-50 dark:bg-red-900/20";
              feedbackIcon = <X className="w-4 h-4 text-red-500 shrink-0" />;
            }
          } else if (isSelected) {
            choiceClass = "border-violet-500 bg-violet-50 dark:bg-violet-900/20";
          }

          return (
            <motion.button
              key={choice.id}
              onClick={() => !showResult && setSelected(choice.id)}
              disabled={showResult}
              layout
              className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center gap-2 ${choiceClass} ${showResult ? "cursor-default" : "cursor-pointer"}`}
            >
              <span className="font-medium mr-1 text-muted-foreground">{choice.id.toUpperCase()}.</span>
              <span className="text-foreground flex-1">{choice.text}</span>
              {feedbackIcon}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation after answer */}
      {showResult && q.explanation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-xs p-3 rounded-lg mb-3 bg-secondary text-muted-foreground"
        >
          {q.explanation}
        </motion.div>
      )}

      {/* Action button */}
      {!showResult ? (
        <Button
          onClick={() => {
            setShowResult(true);
            if (selected !== q.correctId) {
              setShakeError(true);
              setTimeout(() => setShakeError(false), 400);
            }
          }}
          disabled={!selected}
          className="bg-violet-600 hover:bg-violet-700 text-white w-full"
          size="sm"
        >
          {t({ en: "Check Answer", fr: "Vérifier la réponse" })}
        </Button>
      ) : (
        <Button
          onClick={() => {
            const correct = selected === q.correctId;
            const newCorrect = correctCount + (correct ? 1 : 0);
            setCorrectCount(newCorrect);
            if (currentQ >= QUESTIONS_TO_SHOW - 1) {
              setQuizComplete(true);
              setQuizPassed(newCorrect >= PASS_THRESHOLD);
            } else {
              setCurrentQ((p) => p + 1);
              setSelected(null);
              setShowResult(false);
              setShakeError(false);
            }
          }}
          className="bg-violet-600 hover:bg-violet-700 text-white w-full"
          size="sm"
        >
          {currentQ >= QUESTIONS_TO_SHOW - 1
            ? t({ en: "See Results", fr: "Voir les résultats" })
            : t({ en: "Next Question", fr: "Question suivante" })}
        </Button>
      )}
    </motion.div>
  );
}
