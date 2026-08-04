import React, { useState, useMemo } from "react";
import { CheckCircle2, XCircle, Send, RotateCcw, Trophy, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

interface Question {
  id: string;
  text: { en: string; fr: string };
  expected_value: number | string;
  unit: string;
  tolerance: number;
}

interface NumericAnswerExerciseProps {
  questions: Question[];
  title: { en: string; fr: string };
  instructions: { en: string; fr: string };
  lang: "en" | "fr";
  courseId: string;
  moduleId: string;
  onAllCorrect?: () => void;
}

export default function NumericAnswerExercise({
  questions,
  title,
  instructions,
  lang,
  courseId,
  moduleId,
  onAllCorrect,
}: NumericAnswerExerciseProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, "correct" | "incorrect" | null>>({});
  const [submitted, setSubmitted] = useState(false);

  // Save exercise result mutation
  const saveResult = trpc.exerciseResult.save.useMutation();

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // Clear result for this question when user types
    if (results[questionId]) {
      setResults((prev) => ({ ...prev, [questionId]: null }));
    }
  };

  const validateAnswer = (question: Question, userAnswer: string): boolean => {
    if (typeof question.expected_value === "string") {
      return userAnswer.trim().toLowerCase() === question.expected_value.toLowerCase();
    }
    const numericAnswer = parseFloat(userAnswer.replace(/[,\s]/g, "").replace(",", "."));
    if (isNaN(numericAnswer)) return false;
    const expected = question.expected_value as number;
    const tolerance = question.tolerance || 0;
    if (tolerance === 0) {
      return numericAnswer === expected;
    }
    // For percentage tolerance
    if (question.unit === "%") {
      return Math.abs(numericAnswer - expected) <= tolerance;
    }
    // For EUR tolerance (relative: 0.01 means ±1%)
    if (question.unit === "EUR" && tolerance === 0.01) {
      // Allow 1% relative tolerance for large EUR amounts
      const relTolerance = Math.abs(expected) * 0.01;
      return Math.abs(numericAnswer - expected) <= relTolerance;
    }
    return Math.abs(numericAnswer - expected) <= tolerance;
  };

  const handleSubmitAll = () => {
    const newResults: Record<string, "correct" | "incorrect" | null> = {};
    let allCorrect = true;

    questions.forEach((q) => {
      const userAnswer = answers[q.id] || "";
      if (!userAnswer.trim()) {
        newResults[q.id] = null;
        allCorrect = false;
      } else {
        const isCorrect = validateAnswer(q, userAnswer);
        newResults[q.id] = isCorrect ? "correct" : "incorrect";
        if (!isCorrect) allCorrect = false;
      }
    });

    setResults(newResults);
    setSubmitted(true);

    // Save results to server
    const score = Object.values(newResults).filter((r) => r === "correct").length;
    saveResult.mutate({
      courseId,
      moduleId,
      score,
      totalQuestions: questions.length,
      answers: Object.entries(answers).map(([qId, value]) => ({
        questionId: qId,
        userAnswer: value,
        isCorrect: newResults[qId] === "correct",
      })),
    });

    if (allCorrect && onAllCorrect) {
      onAllCorrect();
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResults({});
    setSubmitted(false);
  };

  const correctCount = useMemo(
    () => Object.values(results).filter((r) => r === "correct").length,
    [results]
  );

  const allCorrect = correctCount === questions.length && submitted;

  return (
    <div className="my-6 rounded-2xl border border-border bg-card/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-bold text-foreground">
            {title[lang]}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {instructions[lang]}
        </p>
      </div>

      {/* Questions */}
      <div className="px-6 py-4 space-y-4">
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className={`p-4 rounded-xl border transition-colors ${
              results[q.id] === "correct"
                ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/20"
                : results[q.id] === "incorrect"
                ? "border-red-300 bg-red-50/50 dark:border-red-700 dark:bg-red-950/20"
                : "border-border bg-background"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-2">
                  {q.text[lang]}
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder={
                      q.unit === "%"
                        ? lang === "fr" ? "Ex: 12.5" : "Ex: 12.5"
                        : q.unit === "EUR"
                        ? lang === "fr" ? "Ex: 1234567.89" : "Ex: 1234567.89"
                        : lang === "fr" ? "Votre réponse" : "Your answer"
                    }
                    value={answers[q.id] || ""}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    disabled={results[q.id] === "correct"}
                    className={`max-w-[200px] text-sm ${
                      results[q.id] === "correct"
                        ? "border-emerald-400 text-emerald-700 dark:text-emerald-300"
                        : results[q.id] === "incorrect"
                        ? "border-red-400"
                        : ""
                    }`}
                  />
                  {q.unit && (
                    <span className="text-xs text-muted-foreground font-medium">
                      {q.unit}
                    </span>
                  )}
                  <AnimatePresence>
                    {results[q.id] === "correct" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </motion.div>
                    )}
                    {results[q.id] === "incorrect" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <XCircle className="w-5 h-5 text-red-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {results[q.id] === "incorrect" && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                    {lang === "fr"
                      ? `Réponse incorrecte. Vérifiez votre calcul.${q.tolerance > 0 ? ` (tolérance : ±${q.tolerance} ${q.unit})` : ""}`
                      : `Incorrect answer. Check your calculation.${q.tolerance > 0 ? ` (tolerance: ±${q.tolerance} ${q.unit})` : ""}`}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer with submit/reset */}
      <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {submitted && (
            <span className="flex items-center gap-2">
              <span className={`font-semibold ${allCorrect ? "text-emerald-600" : "text-foreground"}`}>
                {correctCount}/{questions.length}
              </span>
              {lang === "fr" ? "réponses correctes" : "correct answers"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {submitted && !allCorrect && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {lang === "fr" ? "Réessayer" : "Retry"}
            </Button>
          )}
          {!allCorrect && (
            <Button
              size="sm"
              onClick={handleSubmitAll}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="w-3.5 h-3.5" />
              {lang === "fr" ? "Valider mes réponses" : "Submit answers"}
            </Button>
          )}
          {allCorrect && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
            >
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {lang === "fr" ? "Parfait ! Toutes les réponses sont correctes." : "Perfect! All answers are correct."}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
