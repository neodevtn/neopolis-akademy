
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight, Trophy, Brain, CheckCircle2, Eye, ChevronLeft, ChevronRight, Filter, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { resolveI18n } from "./contentDetectors";
import { Link } from "wouter";
import trainingIndex from "@/data/trainingIndex.json";

export default function LessonQuiz({
  certId,
  courseId,
  lessonIndex,
  lang,
  t,
  onPass,
}: {
  certId: string;
  courseId: string;
  lessonIndex: number;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  onPass: () => void;
}) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [answers, setAnswers] = useState<Array<{ correct: boolean; questionIdx: number; selectedId: string | null }>>([]);
  const [shakeError, setShakeError] = useState(false);
  const [showErrorReview, setShowErrorReview] = useState(false);

  useEffect(() => {
    // Try lesson-specific quizzes first, fall back to cert-level questions
    fetch("/data/lessonQuizzes.json")
      .then((r) => r.json())
      .then((allQuizzes: any) => {
        const courseQuizzes = allQuizzes[courseId];
        // Gather all questions for this lesson (keys may be compound "lessonIdx_chapterIdx" or simple "chapterIdx")
        let lessonQs: any[] = [];
        if (courseQuizzes) {
          const prefix = `${lessonIndex}_`;
          for (const [key, qs] of Object.entries(courseQuizzes)) {
            if (key.startsWith(prefix) || (key === String(lessonIndex) && !key.includes('_'))) {
              lessonQs = lessonQs.concat(qs as any[]);
            }
          }
          // For single-lesson courses, all keys are just chapterIndex (no underscore)
          if (lessonQs.length === 0) {
            for (const [key, qs] of Object.entries(courseQuizzes)) {
              if (!key.includes('_')) {
                lessonQs = lessonQs.concat(qs as any[]);
              }
            }
          }
        }
        if (lessonQs.length > 0) {
          // Shuffle and pick 5 questions from the pool
          const shuffled = [...lessonQs].sort(() => Math.random() - 0.5);
          const selected = shuffled.slice(0, 5);
          const lessonQsSelected = selected;
          // Map to expected format - handle both plain string and bilingual {en, fr} objects
          const mapped = lessonQsSelected.map((q: any, idx: number) => ({
            id: `lq_${courseId}_${lessonIndex}_${idx}`,
            question: typeof q.question === 'object' ? q.question : { en: q.question, fr: q.question },
            choices: q.choices.map((c: any) => ({ id: c.id, text: typeof c.text === 'object' ? c.text : { en: c.text, fr: c.text } })),
            correctChoiceIds: [q.correctId],
            explanation: typeof q.explanation === 'object' ? q.explanation : { en: q.explanation, fr: q.explanation },
          }));
          setQuestions(mapped);
        } else {
          // Fallback to cert-level questions
          fetch("/data/mockExamQuestions.json")
            .then((r2) => r2.json())
            .then((allQ: any[]) => {
              const certQuestions = allQ.filter((q: any) => q.certificationId === certId);
              const shuffled = [...certQuestions].sort(() => Math.random() - 0.5);
              setQuestions(shuffled.slice(0, 3));
            })
            .catch(() => setQuestions([]));
        }
      })
      .catch(() => {
        // Fallback to cert-level questions
        fetch("/data/mockExamQuestions.json")
          .then((r) => r.json())
          .then((allQ: any[]) => {
            const certQuestions = allQ.filter((q: any) => q.certificationId === certId);
            const shuffled = [...certQuestions].sort(() => Math.random() - 0.5);
            setQuestions(shuffled.slice(0, 3));
          })
          .catch(() => setQuestions([]));
      });
    }, [certId, courseId, lessonIndex]);

  // MUST declare all hooks before any early return to respect React rules
  const q = questions[currentQ];
  const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const shuffledChoices = useMemo(() => {
    if (!q || !q.choices) return [];
    const choices = [...q.choices];
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return choices;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.id, currentQ, attemptCount]); // q is questions[currentQ], q?.id is sufficient

  if (questions.length === 0) return null;
  if (quizComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-2xl p-6 border bg-card border-border"
      >
        <div className="text-center">
          {quizPassed ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
              >
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-bold mb-2 text-foreground">
                {t({ en: "Quiz Passed!", fr: "Quiz r\u00e9ussi !" })}
              </h3>
              <p className="text-sm mb-2 text-muted-foreground">
                {t({ en: `You got ${correctCount}/3 correct. You can now complete this lesson.`, fr: `Vous avez obtenu ${correctCount}/3 correct. Vous pouvez maintenant terminer cette le\u00e7on.` })}
              </p>
              {attemptCount > 1 && (
                <p className="text-xs mb-4 text-muted-foreground">
                  {t({ en: `Passed on attempt #${attemptCount}`, fr: `R\u00e9ussi \u00e0 la tentative n\u00b0${attemptCount}` })}
                </p>
              )}
              {/* Visual score dots */}
              <div className="flex items-center justify-center gap-2 mb-5">
                {answers.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      a.correct ? "bg-emerald-500" : "bg-red-400"
                    }`}
                  >
                    {a.correct ? "\u2713" : "\u2717"}
                  </motion.div>
                ))}
              </div>
              <Button onClick={onPass} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {t({ en: "Complete Lesson", fr: "Terminer la le\u00e7on" })}
              </Button>
            </>
          ) : !showErrorReview ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <X className="w-14 h-14 text-red-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-bold mb-2 text-foreground">
                {t({ en: "Not quite!", fr: "Pas tout \u00e0 fait !" })}
              </h3>
              <p className="text-sm mb-2 text-muted-foreground">
                {t({ en: `You got ${correctCount}/3. You need at least 2/3 to pass.`, fr: `Vous avez obtenu ${correctCount}/3. Il faut au moins 2/3 pour r\u00e9ussir.` })}
              </p>
              <p className="text-xs mb-4 text-muted-foreground/70">
                {t({ en: `Attempt #${attemptCount}`, fr: `Tentative n\u00b0${attemptCount}` })}
              </p>
              {/* Visual score dots */}
              <div className="flex items-center justify-center gap-2 mb-5">
                {answers.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      a.correct ? "bg-emerald-500" : "bg-red-400"
                    }`}
                  >
                    {a.correct ? "\u2713" : "\u2717"}
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-2"
              >
                <Button
                  onClick={() => setShowErrorReview(true)}
                  variant="outline"
                  className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
                >
                  <Eye className="w-4 h-4" />
                  {t({ en: "Review my errors", fr: "Revoir mes erreurs" })}
                </Button>
                <Button
                  onClick={() => {
                    setAttemptCount((c) => c + 1);
                    setCurrentQ(0);
                    setSelected(null);
                    setShowResult(false);
                    setCorrectCount(0);
                    setQuizComplete(false);
                    setQuizPassed(false);
                    setAnswers([]);
                    setShowErrorReview(false);
                    fetch("/data/lessonQuizzes.json")
                      .then((r) => r.json())
                      .then((allQuizzes: any) => {
                        const cq = allQuizzes[courseId];
                        if (cq) {
                          let retryQs: any[] = [];
                          const prefix = `${lessonIndex}_`;
                          for (const [key, qs] of Object.entries(cq)) {
                            if (key.startsWith(prefix) || (key === String(lessonIndex) && !key.includes('_'))) {
                              retryQs = retryQs.concat(qs as any[]);
                            }
                          }
                          if (retryQs.length === 0) {
                            for (const [key, qs] of Object.entries(cq)) {
                              if (!key.includes('_')) {
                                retryQs = retryQs.concat(qs as any[]);
                              }
                            }
                          }
                          if (retryQs.length > 0) {
                            const shuffled = [...retryQs].sort(() => Math.random() - 0.5);
                            const selected = shuffled.slice(0, 5);
                            const mapped = selected.map((q: any, idx: number) => ({
                              id: `lq_${courseId}_${lessonIndex}_${idx}_${Date.now()}`,
                              question: typeof q.question === 'object' ? q.question : { en: q.question, fr: q.question },
                              choices: q.choices.map((c: any) => ({ id: c.id, text: typeof c.text === 'object' ? c.text : { en: c.text, fr: c.text } })),
                              correctChoiceIds: [q.correctId],
                              explanation: typeof q.explanation === 'object' ? q.explanation : { en: q.explanation, fr: q.explanation },
                            }));
                            setQuestions(mapped);
                          }
                        }
                      })
                      .catch(() => {});
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white gap-2 w-full py-3 text-base font-semibold"
                >
                  <ArrowRight className="w-4 h-4" />
                  {t({ en: `Retry directly (Attempt #${attemptCount + 1})`, fr: `R\u00e9essayer directement (Tentative n\u00b0${attemptCount + 1})` })}
                </Button>
              </motion.div>
            </>
          ) : (
            /* Detailed error review screen */
            <div className="text-left">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setShowErrorReview(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
                  {t({ en: "Error Review", fr: "Révision des erreurs" })}
                </h3>
                <span className="text-xs ml-auto px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium">
                  {answers.filter(a => !a.correct).length} {t({ en: "error(s)", fr: "erreur(s)" })}
                </span>
              </div>

              {/* Domain progress indicator */}
              {(() => {
                const domainStats: Record<string, { total: number; correct: number }> = {};
                questions.forEach((question, idx) => {
                  const answer = answers[idx];
                  if (!answer) return;
                  const domainName = resolveI18n(question.domain, lang);
                  if (!domainStats[domainName]) domainStats[domainName] = { total: 0, correct: 0 };
                  domainStats[domainName].total++;
                  if (answer.correct) domainStats[domainName].correct++;
                });
                return (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3 rounded-xl bg-secondary/50 border border-border"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5">
                      {t({ en: "Performance by domain", fr: "Performance par domaine" })}
                    </p>
                    <div className="space-y-2">
                      {Object.entries(domainStats).map(([domain, stats]) => {
                        const pct = Math.round((stats.correct / stats.total) * 100);
                        const isWeak = pct < 50;
                        return (
                          <div key={domain}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={`text-xs font-medium ${isWeak ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                {domain}
                              </span>
                              <span className={`text-[10px] font-bold ${isWeak ? "text-red-500" : "text-emerald-500"}`}>
                                {stats.correct}/{stats.total}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className={`h-full rounded-full ${isWeak ? "bg-red-400" : "bg-emerald-400"}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {Object.entries(domainStats).some(([, s]) => s.correct / s.total < 0.5) && (
                      <p className="text-[10px] mt-2.5 text-red-600 dark:text-red-400 flex items-center gap-1">
                        <Filter className="w-3 h-3" />
                        {t({ en: "Focus on red domains to improve your score", fr: "Concentrez-vous sur les domaines en rouge pour am\u00e9liorer votre score" })}
                      </p>
                    )}
                  </motion.div>
                );
              })()}

              <div className="space-y-4 mb-5">
                {questions.map((question, idx) => {
                  const answer = answers[idx];
                  if (!answer) return null;
                  const isQCorrect = answer.correct;
                  // Find matching course for this domain to build review link
                  const domainEn = typeof question.domain === "object" ? question.domain.en : question.domain;
                  const matchingCourse = (trainingIndex as any).courses.find((c: any) => {
                    if (!c.id.startsWith(certId)) return false;
                    const titleEn = typeof c.title === "object" ? c.title.en : c.title;
                    // Match by keyword overlap between domain and course title
                    const domainWords = (domainEn || "").toLowerCase().split(/[\s,&]+/).filter((w: string) => w.length > 3);
                    const titleLower = (titleEn || "").toLowerCase();
                    return domainWords.some((w: string) => titleLower.includes(w));
                  });
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`rounded-xl border p-4 ${
                        isQCorrect
                          ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10"
                          : "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-xs font-bold text-white ${
                          isQCorrect ? "bg-emerald-500" : "bg-red-400"
                        }`}>
                          {isQCorrect ? "\u2713" : "\u2717"}
                        </span>
                        <div className="flex-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            {resolveI18n(question.domain, lang)}
                          </span>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {resolveI18n(question.question, lang)}
                          </p>
                        </div>
                      </div>

                      <div className="ml-8 space-y-1.5">
                        {question.choices.map((choice: any) => {
                          const wasSelected = answer.selectedId === choice.id;
                          const isCorrectChoice = question.correctChoiceIds.includes(choice.id);
                          let style = "bg-secondary/50 text-muted-foreground";
                          if (isCorrectChoice) style = "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700";
                          else if (wasSelected && !isCorrectChoice) style = "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 line-through";
                          return (
                            <div key={choice.id} className={`text-xs p-2 rounded-lg ${style}`}>
                              <span className="font-bold mr-1.5">{choice.id.toUpperCase()}.</span>
                              {resolveI18n(choice.text, lang)}
                              {isCorrectChoice && <span className="ml-2 font-medium">\u2713</span>}
                              {wasSelected && !isCorrectChoice && <span className="ml-2 font-medium">\u2717</span>}
                            </div>
                          );
                        })}
                      </div>

                      {!isQCorrect && question.explanation && (
                        <div className="ml-8 mt-2.5 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                          <span className="font-semibold">{t({ en: "Explanation:", fr: "Explication :" })}</span>{" "}
                          {resolveI18n(question.explanation, lang)}
                        </div>
                      )}

                      {!isQCorrect && matchingCourse && (
                        <div className="ml-8 mt-2">
                          <Link
                            href={`/training/${certId}/${matchingCourse.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors hover:underline"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            {t({ en: "Review this section", fr: "Revoir cette section" })}
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <Button
                onClick={() => {
                  setAttemptCount((c) => c + 1);
                  setCurrentQ(0);
                  setSelected(null);
                  setShowResult(false);
                  setCorrectCount(0);
                  setQuizComplete(false);
                  setQuizPassed(false);
                  setAnswers([]);
                  setShowErrorReview(false);
                  fetch("/data/lessonQuizzes.json")
                    .then((r) => r.json())
                    .then((allQuizzes: any) => {
                      const cq = allQuizzes[courseId];
                      if (cq && cq[String(lessonIndex)]) {
                        const lessonQs = cq[String(lessonIndex)];
                        const mapped = lessonQs.map((q: any, idx: number) => ({
                          id: `lq_${courseId}_${lessonIndex}_${idx}_${Date.now()}`,
                          question: typeof q.question === 'object' ? q.question : { en: q.question, fr: q.question },
                          choices: q.choices.map((c: any) => ({ id: c.id, text: typeof c.text === 'object' ? c.text : { en: c.text, fr: c.text } })),
                          correctChoiceIds: [q.correctId],
                          explanation: typeof q.explanation === 'object' ? q.explanation : { en: q.explanation, fr: q.explanation },
                        }));
                        setQuestions(mapped);
                      }
                    })
                    .catch(() => {});
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-2 w-full py-3 text-base font-semibold"
              >
                <ArrowRight className="w-4 h-4" />
                {t({ en: `I understand, retry (Attempt #${attemptCount + 1})`, fr: `J'ai compris, r\u00e9essayer (Tentative n\u00b0${attemptCount + 1})` })}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (!q) return null;

  const _isCorrect = selected && q.correctChoiceIds.includes(selected);

  return (
    <motion.div
      key={`q-${currentQ}-${attemptCount}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className={`rounded-lg p-5 mt-6 bg-[#f8f8f6] dark:bg-card ${shakeError ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
    >
      {/* Question label - Skilljar style "Q1" grey */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-400 uppercase">
            Q{currentQ + 1}
          </span>
          {attemptCount > 1 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
              #{attemptCount}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">
          {currentQ + 1}/3
        </span>
      </div>

      {/* Question text - serif */}
      <p className="text-base font-medium mb-5 text-gray-900 dark:text-foreground" style={{ fontFamily: 'Lora, Georgia, serif' }}>
        {resolveI18n(q.question, lang)}
      </p>

      {/* Choices - Skilljar style: A/B/C letter in coral */}
      <div className="space-y-3 mb-5">
        {shuffledChoices.map((choice: any, idx: number) => {
          const isSelected = selected === choice.id;
          const isCorrectChoice = q.correctChoiceIds.includes(choice.id);
          const letter = OPTION_LETTERS[idx] || choice.id.toUpperCase();

          let containerClass = "bg-white dark:bg-card border-gray-200 dark:border-border hover:border-[#c75b3a]/50";
          let letterColor = "text-[#c75b3a]";

          if (showResult) {
            if (isCorrectChoice) {
              containerClass = "bg-green-50 dark:bg-emerald-900/20 border-green-400 dark:border-emerald-600";
              letterColor = "text-green-600";
            } else if (isSelected && !isCorrectChoice) {
              containerClass = "bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600";
              letterColor = "text-red-500";
            } else {
              containerClass = "bg-white dark:bg-card border-gray-200 dark:border-border opacity-60";
            }
          } else if (isSelected) {
            containerClass = "bg-[#fef3f0] dark:bg-[#c75b3a]/10 border-[#c75b3a]";
          }

          return (
            <button
              key={choice.id}
              onClick={() => !showResult && setSelected(choice.id)}
              disabled={showResult}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center gap-3 ${containerClass} ${showResult ? "cursor-default" : "cursor-pointer"}`}
            >
              <span className={`text-sm font-bold ${letterColor}`}>{letter}</span>
              <span className="text-sm text-gray-800 dark:text-foreground flex-1">{resolveI18n(choice.text, lang)}</span>
              {showResult && isCorrectChoice && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
              {showResult && isSelected && !isCorrectChoice && <X className="w-4 h-4 text-red-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explanation after answer */}
      {showResult && q.explanation && (
        <div className="text-sm p-3 rounded-lg mb-4 bg-white dark:bg-secondary border border-gray-200 dark:border-border text-gray-700 dark:text-muted-foreground italic">
          {resolveI18n(q.explanation, lang)}
        </div>
      )}

      {/* Action button - coral */}
      {!showResult ? (
        <Button
          onClick={() => {
            setShowResult(true);
            const correct = !!(selected && q.correctChoiceIds.includes(selected));
            if (!correct) {
              setShakeError(true);
              setTimeout(() => setShakeError(false), 400);
            }
          }}
          disabled={!selected}
          className="bg-[#c75b3a] hover:bg-[#a84a2e] text-white w-full"
          size="sm"
        >
          {t({ en: "Check Answer", fr: "Vérifier" })}
        </Button>
      ) : (
        <Button
          onClick={() => {
            const correct = !!(selected && q.correctChoiceIds.includes(selected));
            const newCorrect = correctCount + (correct ? 1 : 0);
            setCorrectCount(newCorrect);
            setAnswers((prev) => [...prev, { correct, questionIdx: currentQ, selectedId: selected }]);
            if (currentQ >= 2) {
              setQuizComplete(true);
              setQuizPassed(newCorrect >= 2);
            } else {
              setCurrentQ((p) => p + 1);
              setSelected(null);
              setShowResult(false);
            }
          }}
          className="bg-[#c75b3a] hover:bg-[#a84a2e] text-white w-full"
          size="sm"
        >
          {currentQ >= 2
            ? t({ en: "See Results", fr: "Voir les résultats" })
            : t({ en: "Next Question", fr: "Question suivante" })} →
        </Button>
      )}
    </motion.div>
  );
}

// Chapter-based lesson viewer for V2 structure (chapters with blocks)
