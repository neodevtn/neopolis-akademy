import { Link, useParams, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import trainingIndex from "@/data/trainingIndex.json";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertTriangle, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";

type ExamState = "intro" | "active" | "review" | "loading";

interface Answer {
  questionId: string;
  selectedIds: string[];
}

export default function MockExam() {
  const { certId } = useParams<{ certId: string }>();
  const { lang, toggleLang, t } = useLanguage();
  const [, navigate] = useLocation();

  // Get exam config from static import (small file)
  const examConfig = (trainingIndex as any).examConfig?.[certId || ""];

  // Load questions dynamically from public JSON
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);

  useEffect(() => {
    fetch("/data/mockExamQuestions.json")
      .then(res => res.json())
      .then(data => {
        setAllQuestions(data);
        setQuestionsLoaded(true);
      })
      .catch(() => setQuestionsLoaded(true));
  }, []);

  const certQuestions = allQuestions.filter((q: any) => q.certificationId === certId);

  // Shuffle and select questions for this exam session
  const [examQuestions, setExamQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (questionsLoaded && certQuestions.length > 0 && examQuestions.length === 0) {
      const shuffled = [...certQuestions].sort(() => Math.random() - 0.5);
      const count = examConfig?.totalQuestions || Math.min(certQuestions.length, 20);
      setExamQuestions(shuffled.slice(0, count));
    }
  }, [questionsLoaded, certQuestions.length]);

  const [examState, setExamState] = useState<ExamState>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const timeLimit = (examConfig?.timeLimit || 90) * 60; // in seconds

  // Timer
  useEffect(() => {
    if (examState !== "active") return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setExamState("review");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examState]);

  const startExam = useCallback(() => {
    setExamState("active");
    setTimeRemaining(timeLimit);
    setStartTime(Date.now());
    setAnswers([]);
    setFlagged(new Set());
    setCurrentIndex(0);
  }, [timeLimit]);

  const submitExam = useCallback(() => {
    setExamState("review");
  }, []);

  const selectAnswer = useCallback((questionId: string, choiceId: string) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) {
        // Toggle selection
        const newSelected = existing.selectedIds.includes(choiceId)
          ? existing.selectedIds.filter((id) => id !== choiceId)
          : [...existing.selectedIds, choiceId];
        return prev.map((a) => a.questionId === questionId ? { ...a, selectedIds: newSelected } : a);
      }
      return [...prev, { questionId, selectedIds: [choiceId] }];
    });
  }, []);

  const toggleFlag = useCallback((idx: number) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  // Score calculation
  const score = useMemo(() => {
    if (examState !== "review") return null;
    let correct = 0;
    examQuestions.forEach((q: any) => {
      const answer = answers.find((a) => a.questionId === q.id);
      if (!answer) return;
      const correctIds = [...q.correctChoiceIds].sort();
      const selectedIds = [...answer.selectedIds].sort();
      if (correctIds.length === selectedIds.length && correctIds.every((id: string, i: number) => id === selectedIds[i])) {
        correct++;
      }
    });
    const total = examQuestions.length;
    const pct = Math.round((correct / total) * 100);
    // Scale to 100-1000 range
    const scaled = Math.round(100 + (pct / 100) * 900);
    const passing = examConfig?.passingScore || 720;
    return { correct, total, pct, scaled, passing, passed: scaled >= passing };
  }, [examState, answers, examQuestions, examConfig]);

  // Format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const cert = trainingIndex.certifications.find((c) => c.id === certId);

  if (!cert || !examConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <p className="text-slate-500 mb-4">{t({ en: "Mock exam not available for this certification.", fr: "Examen blanc non disponible pour cette certification." })}</p>
          <Link href="/training" className="text-emerald-600 hover:underline">
            {t({ en: "Back to training", fr: "Retour à la formation" })}
          </Link>
        </div>
      </div>
    );
  }

  // INTRO STATE
  if (examState === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/training/${certId}`} className="text-slate-400 hover:text-slate-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <span className="text-xl font-bold text-slate-800">Neopolis</span>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Mock Exam</span>
            </div>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              <span className="text-base">{lang === "en" ? "🇬🇧" : "🇫🇷"}</span>
              {lang === "en" ? "EN" : "FR"}
            </button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="text-5xl mb-4">{cert.icon}</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {t({ en: "Mock Exam", fr: "Examen Blanc" })}
            </h1>
            <h2 className="text-lg text-slate-600 mb-6">{t(cert.title)}</h2>

            <div className="bg-slate-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-slate-800 mb-3">
                {t({ en: "Exam Details", fr: "Détails de l'examen" })}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">{t({ en: "Exam Code", fr: "Code examen" })}</span>
                  <p className="font-medium text-slate-800">{examConfig.examCode}</p>
                </div>
                <div>
                  <span className="text-slate-500">{t({ en: "Questions", fr: "Questions" })}</span>
                  <p className="font-medium text-slate-800">{examConfig.totalQuestions}</p>
                </div>
                <div>
                  <span className="text-slate-500">{t({ en: "Time Limit", fr: "Durée" })}</span>
                  <p className="font-medium text-slate-800">{examConfig.timeLimit} min</p>
                </div>
                <div>
                  <span className="text-slate-500">{t({ en: "Passing Score", fr: "Score de passage" })}</span>
                  <p className="font-medium text-slate-800">{examConfig.passingScore}/1000</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">
                    {t({ en: "Important Notice", fr: "Notice importante" })}
                  </p>
                  <p>
                    {t({
                      en: "This is a practice exam generated from course material. Questions are not from the official Anthropic exam bank. Use this to assess your readiness and identify areas for improvement.",
                      fr: "Ceci est un examen blanc généré à partir du matériel de cours. Les questions ne proviennent pas de la banque officielle Anthropic. Utilisez-le pour évaluer votre préparation et identifier les axes d'amélioration.",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
              <h4 className="font-medium text-slate-700 mb-2 text-sm">
                {t({ en: "Domains Covered", fr: "Domaines couverts" })}
              </h4>
              <div className="space-y-1.5">
                {examConfig.domains.map((d: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{t(d.name)}</span>
                    <span className="text-slate-400 font-medium">{d.weight}%</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startExam}
              className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors text-lg"
            >
              {t({ en: "Start Exam", fr: "Commencer l'examen" })}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ACTIVE STATE
  if (examState === "active") {
    const currentQ = examQuestions[currentIndex];
    const currentAnswer = answers.find((a) => a.questionId === currentQ.id);
    const answeredCount = answers.filter((a) => a.selectedIds.length > 0).length;
    const isLowTime = timeRemaining < 300; // less than 5 min

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Exam Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-800">
                {t({ en: "Mock Exam", fr: "Examen Blanc" })}
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500">{examConfig.examCode}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-mono font-bold ${
                isLowTime ? "bg-red-100 text-red-700 animate-pulse" : "bg-slate-100 text-slate-700"
              }`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeRemaining)}
              </div>
              <span className="text-xs text-slate-500">
                {answeredCount}/{examQuestions.length} {t({ en: "answered", fr: "répondues" })}
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <Progress value={(answeredCount / examQuestions.length) * 100} className="h-1 rounded-none" />
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6">
          {/* Question navigation pills */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {examQuestions.map((_: any, idx: number) => {
              const answered = answers.find((a) => a.questionId === examQuestions[idx].id)?.selectedIds.length;
              const isFlagged = flagged.has(idx);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all relative ${
                    idx === currentIndex
                      ? "bg-emerald-600 text-white shadow-md"
                      : answered
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {t({ en: "Question", fr: "Question" })} {currentIndex + 1}/{examQuestions.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                  {t(currentQ.domain)}
                </span>
                <button
                  onClick={() => toggleFlag(currentIndex)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    flagged.has(currentIndex) ? "bg-amber-100 text-amber-600" : "text-slate-300 hover:text-amber-500"
                  }`}
                  title={t({ en: "Flag for review", fr: "Marquer pour révision" })}
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-slate-900 font-medium text-lg mb-6 leading-relaxed">
              {t(currentQ.question)}
            </p>

            {currentQ.correctChoiceIds.length > 1 && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg mb-4 inline-block">
                {t({ en: `Select ${currentQ.correctChoiceIds.length} answers`, fr: `Sélectionnez ${currentQ.correctChoiceIds.length} réponses` })}
              </p>
            )}

            <div className="space-y-3">
              {currentQ.choices.map((choice: any) => {
                const isSelected = currentAnswer?.selectedIds.includes(choice.id);
                return (
                  <button
                    key={choice.id}
                    onClick={() => selectAnswer(currentQ.id, choice.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-sm font-bold ${
                        isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {choice.id.toUpperCase()}
                      </span>
                      <span className={`text-sm leading-relaxed ${isSelected ? "text-emerald-900" : "text-slate-700"}`}>
                        {t(choice.text)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {t({ en: "Previous", fr: "Précédent" })}
            </button>

            {currentIndex === examQuestions.length - 1 ? (
              <button
                onClick={submitExam}
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
              >
                {t({ en: "Submit Exam", fr: "Soumettre l'examen" })}
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-colors"
              >
                {t({ en: "Next", fr: "Suivant" })}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  // REVIEW STATE
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/training/${certId}`} className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-xl font-bold text-slate-800">Neopolis</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              {t({ en: "Results", fr: "Résultats" })}
            </span>
          </div>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <span className="text-base">{lang === "en" ? "🇬🇧" : "🇫🇷"}</span>
            {lang === "en" ? "EN" : "FR"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Score Card */}
        {score && (
          <div className={`rounded-2xl border-2 p-8 mb-8 text-center ${
            score.passed ? "border-emerald-300 bg-emerald-50" : "border-red-200 bg-red-50"
          }`}>
            <div className="text-5xl mb-3">
              {score.passed ? "🎉" : "📚"}
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {score.passed
                ? t({ en: "Congratulations! You passed!", fr: "Félicitations ! Vous avez réussi !" })
                : t({ en: "Keep studying!", fr: "Continuez à étudier !" })
              }
            </h1>
            <div className="flex items-center justify-center gap-8 mt-4">
              <div>
                <div className={`text-4xl font-bold ${score.passed ? "text-emerald-700" : "text-red-600"}`}>
                  {score.scaled}
                </div>
                <div className="text-sm text-slate-500">
                  {t({ en: "Scaled Score", fr: "Score pondéré" })} ({t({ en: "passing", fr: "passage" })}: {score.passing})
                </div>
              </div>
              <div className="h-12 w-px bg-slate-200" />
              <div>
                <div className="text-4xl font-bold text-slate-800">
                  {score.correct}/{score.total}
                </div>
                <div className="text-sm text-slate-500">
                  {t({ en: "Correct Answers", fr: "Réponses correctes" })} ({score.pct}%)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Domain breakdown */}
        {score && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
            <h2 className="font-semibold text-slate-800 mb-4">
              {t({ en: "Performance by Domain", fr: "Performance par domaine" })}
            </h2>
            <div className="space-y-3">
              {examConfig.domains.map((domain: any, i: number) => {
                const domainQs = examQuestions.filter((q: any) => t(q.domain) === t(domain.name));
                const domainCorrect = domainQs.filter((q: any) => {
                  const answer = answers.find((a) => a.questionId === q.id);
                  if (!answer) return false;
                  const correctIds = [...q.correctChoiceIds].sort();
                  const selectedIds = [...answer.selectedIds].sort();
                  return correctIds.length === selectedIds.length && correctIds.every((id: string, idx: number) => id === selectedIds[idx]);
                }).length;
                const domainPct = domainQs.length > 0 ? Math.round((domainCorrect / domainQs.length) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">{t(domain.name)}</span>
                      <span className="font-medium text-slate-800">
                        {domainCorrect}/{domainQs.length} ({domainPct}%)
                      </span>
                    </div>
                    <Progress value={domainPct} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Question Review */}
        <h2 className="font-semibold text-slate-800 mb-4">
          {t({ en: "Question Review", fr: "Révision des questions" })}
        </h2>
        <div className="space-y-4">
          {examQuestions.map((q: any, idx: number) => {
            const answer = answers.find((a) => a.questionId === q.id);
            const correctIds = q.correctChoiceIds;
            const selectedIds = answer?.selectedIds || [];
            const isCorrect = correctIds.length === selectedIds.length &&
              [...correctIds].sort().every((id: string, i: number) => id === [...selectedIds].sort()[i]);

            return (
              <div key={q.id} className={`bg-white rounded-xl border p-5 ${
                isCorrect ? "border-emerald-200" : "border-red-200"
              }`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${
                    isCorrect ? "bg-emerald-100" : "bg-red-100"
                  }`}>
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400">Q{idx + 1}</span>
                      <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{t(q.domain)}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 mb-3">{t(q.question)}</p>
                    <div className="space-y-1.5">
                      {q.choices.map((choice: any) => {
                        const wasSelected = selectedIds.includes(choice.id);
                        const isCorrectChoice = correctIds.includes(choice.id);
                        let style = "bg-slate-50 text-slate-600";
                        if (isCorrectChoice) style = "bg-emerald-50 text-emerald-800 border border-emerald-200";
                        else if (wasSelected && !isCorrectChoice) style = "bg-red-50 text-red-700 border border-red-200 line-through";
                        return (
                          <div key={choice.id} className={`text-xs p-2 rounded-lg ${style}`}>
                            <span className="font-bold mr-2">{choice.id.toUpperCase()}.</span>
                            {t(choice.text)}
                            {isCorrectChoice && <span className="ml-2 text-emerald-600 font-medium">✓</span>}
                            {wasSelected && !isCorrectChoice && <span className="ml-2 text-red-500 font-medium">✗</span>}
                          </div>
                        );
                      })}
                    </div>
                    {!isCorrect && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
                        <span className="font-semibold">{t({ en: "Explanation:", fr: "Explication :" })}</span>{" "}
                        {t(q.explanation)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 mt-8 pb-8">
          <button
            onClick={startExam}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
          >
            {t({ en: "Retake Exam", fr: "Repasser l'examen" })}
          </button>
          <Link
            href={`/training/${certId}`}
            className="px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-white transition-colors"
          >
            {t({ en: "Back to Course", fr: "Retour au cours" })}
          </Link>
        </div>
      </main>
    </div>
  );
}
