import { Link, useParams, useLocation } from "wouter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import trainingIndex from "@/data/trainingIndex.json";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import confetti from "canvas-confetti";
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertTriangle, ChevronRight, Lock, LogIn, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { announceAchievement } from "@/components/AchievementCelebration";
import { BrandLogo } from "@/components/BrandLogo";
import { canRestoreExamSession, getExamSessionRemainingSeconds } from "@shared/examSession";

type ExamState = "intro" | "active" | "review" | "locked";

interface Answer {
  questionId: string;
  selectedIds: string[];
}

export default function MockExam() {
  const { certId } = useParams<{ certId: string }>();
  const { lang, t } = useLanguage();
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { isCertComplete } = useTrainingProgress();

  // Le serveur est la source de vérité : la configuration publiée peut évoluer
  // depuis l’administration sans permettre au navigateur de la falsifier.
  const examDefinitionQuery = trpc.training.getExamDefinition.useQuery(
    { certificationId: certId || "" },
    { enabled: Boolean(isAuthenticated && certId) },
  );
  const examConfig = examDefinitionQuery.data;
  const cert = trainingIndex.certifications.find((c) => c.id === certId);
  const courses = trainingIndex.courses.filter((c) => c.certId === certId);

  // Load lesson counts to check certification completion
  const [totalLessonsMap, setTotalLessonsMap] = useState<Record<string, number>>({});
  const [lessonsLoaded, setLessonsLoaded] = useState(false);

  useEffect(() => {
    const loadCounts = async () => {
      const map: Record<string, number> = {};
      for (const course of courses) {
        try {
          const res = await fetch(`/data/courses/${course.id}.json`);
          const data = await res.json();
          map[course.id] = (data.lessons || []).length;
        } catch {
          map[course.id] = 0;
        }
      }
      setTotalLessonsMap(map);
      setLessonsLoaded(true);
    };
    loadCounts();
  }, [certId]);

  const courseIds = courses.map((c) => c.id);
  const certComplete = useMemo(() => {
    if (!lessonsLoaded || Object.keys(totalLessonsMap).length === 0) return false;
    return isCertComplete(certId || "", courseIds, totalLessonsMap);
  }, [lessonsLoaded, totalLessonsMap, certId, courseIds, isCertComplete]);

  // Exam state
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [examState, setExamState] = useState<ExamState>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedForCurrent, setSelectedForCurrent] = useState<string[]>([]);
  const [sessionRestored, setSessionRestored] = useState(false);

  const [verifiedScore, setVerifiedScore] = useState<any>(null);
  const submittedAttemptRef = useRef(false);
  const confettiFired = useRef(false);

  // Submit exam attempt to server
  const submitAttemptMutation = trpc.training.submitExamAttempt.useMutation({
    onSuccess: (result: any) => {
      setVerifiedScore(result);
      if (result.achievement) announceAchievement(result.achievement);
      if (result.passed && !confettiFired.current) {
        confettiFired.current = true;
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#10b981", "#059669", "#34d399", "#fbbf24"] });
      }
    },
  });
  const startExamSessionMutation = trpc.training.startExamSession.useMutation({
    onSuccess: (session) => {
      setExamQuestions(session.questions);
      setAnswers([]);
      setCurrentIndex(0);
      setSelectedForCurrent([]);
      setTimeRemaining(getExamSessionRemainingSeconds(session.expiresAt));
      setVerifiedScore(null);
      submittedAttemptRef.current = false;
      confettiFired.current = false;
      setExamState("active");
    },
  });
  const activeSessionQuery = trpc.training.getExamSession.useQuery(
    { certificationId: certId || "" },
    { enabled: Boolean(isAuthenticated && certId) },
  );
  const saveExamSessionMutation = trpc.training.saveExamSession.useMutation();

  useEffect(() => {
    if (activeSessionQuery.isLoading) return;
    const session = activeSessionQuery.data;
    if (session && canRestoreExamSession(session.expiresAt)) {
      const remaining = getExamSessionRemainingSeconds(session.expiresAt);
      setExamQuestions((session.questions as any[]) || []);
      setAnswers((session.answers as Answer[]) || []);
      setCurrentIndex(session.currentIndex || 0);
      setSelectedForCurrent((session.selectedIds as string[]) || []);
      setTimeRemaining(remaining);
      setExamState(remaining > 0 ? "active" : "review");
    }
    setSessionRestored(true);
  }, [activeSessionQuery.data, activeSessionQuery.isLoading, certId]);

  useEffect(() => {
    if (!sessionRestored || examState !== "active" || !certId || examQuestions.length === 0) return;
    saveExamSessionMutation.mutate({
      certificationId: certId,
      answers,
      currentIndex,
      selectedIds: selectedForCurrent,
    });
  }, [sessionRestored, examState, certId, examQuestions, answers, currentIndex, selectedForCurrent]);

  // Timer
  useEffect(() => {
    if (examState !== "active") return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-submit on time out
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examState]);

  const startExam = useCallback(() => {
    if (certId && !startExamSessionMutation.isPending) startExamSessionMutation.mutate({ certificationId: certId });
  }, [certId, startExamSessionMutation]);

  const confirmAnswer = useCallback(() => {
    const currentQ = examQuestions[currentIndex];
    // Save the answer for this question
    setAnswers((prev) => [...prev, { questionId: currentQ.id, selectedIds: [...selectedForCurrent] }]);
    
    // Move to next question or finish
    if (currentIndex >= examQuestions.length - 1) {
      // This was the last question - finish exam
      finishExamWithAnswer(currentQ.id, [...selectedForCurrent]);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedForCurrent([]);
    }
  }, [currentIndex, examQuestions, selectedForCurrent]);

  const finishExam = useCallback(() => {
    setExamState("review");
  }, []);

  const finishExamWithAnswer = useCallback((lastQId: string, lastSelected: string[]) => {
    // Calculate score with all answers including the last one
    const allAnswers = [...answers, { questionId: lastQId, selectedIds: lastSelected }];
    setAnswers(allAnswers);
    setExamState("review");
  }, [answers]);

  const toggleSelection = useCallback((choiceId: string) => {
    setSelectedForCurrent((prev) => {
      if (prev.includes(choiceId)) {
        return prev.filter((id) => id !== choiceId);
      }
      return [...prev, choiceId];
    });
  }, []);

  // La réussite effective et le certificat dépendent exclusivement de cette
  // soumission : le serveur contrôle la session et son horodatage d’expiration.
  useEffect(() => {
    if (examState !== "review" || !certId || submittedAttemptRef.current) return;
    submittedAttemptRef.current = true;
    submitAttemptMutation.mutate({ certificationId: certId, answers });
  }, [examState, certId, answers, submitAttemptMutation]);

  // Le résultat local ne sert qu’à conserver les réponses dans l’interface.
  // Aucun score, succès ou certificat n’est présenté avant la confirmation du serveur.
  const score = verifiedScore;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">{t({ en: "Loading...", fr: "Chargement..." })}</p>
        </div>
      </div>
    );
  }

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/training" className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
            <BrandLogo className="h-8 max-w-[160px]" />
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Mock Exam</span>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <LogIn className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {t({ en: "Authentication Required", fr: "Authentification requise" })}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {t({ en: "You must be logged in to take the mock exam.", fr: "Vous devez être connecté pour passer l'examen blanc." })}
            </p>
            <Button onClick={() => { window.location.href = getLoginUrl(); }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {t({ en: "Log in", fr: "Se connecter" })}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!cert || examDefinitionQuery.isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100"><p className="text-sm text-slate-500">{t({ en: "Loading exam…", fr: "Chargement de l’examen…" })}</p></div>;
  }

  if (!examConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <p className="text-slate-500 mb-4">{t({ en: "Mock exam not available.", fr: "Examen blanc non disponible." })}</p>
          <Link href="/training" className="text-emerald-600 hover:underline">{t({ en: "Back to training", fr: "Retour à la formation" })}</Link>
        </div>
      </div>
    );
  }

  // Certification completion gate (bypass for demo account)
  const isDemoUser = user?.openId === "demo_learner_001";
  if (lessonsLoaded && !certComplete && !isDemoUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href={`/training/${certId}`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
            <BrandLogo className="h-8 max-w-[160px]" />
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Mock Exam</span>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {t({ en: "Exam Locked", fr: "Examen verrouillé" })}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {t({ en: "You must complete all courses in this certification before taking the mock exam.", fr: "Vous devez terminer tous les cours de cette certification avant de passer l'examen blanc." })}
            </p>
            <Button onClick={() => navigate(`/training/${certId}`)} variant="outline">
              {t({ en: "Back to courses", fr: "Retour aux cours" })}
            </Button>
          </div>
        </main>
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
              <BrandLogo className="h-8 max-w-[160px]" />
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Mock Exam</span>
            </div>
            <LanguageSwitcher />
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

            {/* Exam rules */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-2">
                    {t({ en: "Exam Conditions", fr: "Conditions d'examen" })}
                  </p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>{t({ en: "Questions are presented one at a time", fr: "Les questions sont présentées une par une" })}</li>
                    <li>{t({ en: "You cannot go back to previous questions", fr: "Vous ne pouvez pas revenir aux questions précédentes" })}</li>
                    <li>{t({ en: "The timer starts immediately when you begin", fr: "Le chronomètre démarre immédiatement au lancement" })}</li>
                    <li>{t({ en: "The exam auto-submits when time runs out", fr: "L'examen se soumet automatiquement quand le temps est écoulé" })}</li>
                    <li>{t({ en: "Results are shown only at the end", fr: "Les résultats ne sont affichés qu'à la fin" })}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p>
                    {t({
                      en: "This is a practice exam generated from course material. Questions are not from the official Anthropic exam bank.",
                      fr: "Ceci est un examen blanc généré à partir du matériel de cours. Les questions ne proviennent pas de la banque officielle Anthropic.",
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
              disabled={startExamSessionMutation.isPending}
              className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-lg"
            >
              {startExamSessionMutation.isPending ? t({ en: "Preparing exam…", fr: "Préparation de l’examen…" }) : t({ en: "Start Exam", fr: "Commencer l'examen" })}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ACTIVE STATE - Strictly sequential, no going back
  if (examState === "active") {
    const currentQ = examQuestions[currentIndex];
    if (!currentQ) {
      finishExam();
      return null;
    }
    const isLowTime = timeRemaining < 300;
    const hasSelection = selectedForCurrent.length > 0;
    const isLastQuestion = currentIndex === examQuestions.length - 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Exam Header - no navigation, just timer and progress */}
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-800">
                {t({ en: "Mock Exam", fr: "Examen Blanc" })}
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500">{examConfig.examCode}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-bold ${
                isLowTime ? "bg-red-100 text-red-700 animate-pulse" : "bg-slate-100 text-slate-700"
              }`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeRemaining)}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {currentIndex + 1}/{examQuestions.length}
              </span>
            </div>
          </div>
          <Progress value={((currentIndex + 1) / examQuestions.length) * 100} className="h-1 rounded-none" />
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* Question Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {t({ en: "Question", fr: "Question" })} {currentIndex + 1} / {examQuestions.length}
              </span>
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                {typeof currentQ.domain === "object" ? t(currentQ.domain) : currentQ.domain}
              </span>
            </div>

            <p className="text-slate-900 font-medium text-lg mb-8 leading-relaxed">
              {typeof currentQ.question === "object" ? t(currentQ.question) : currentQ.question}
            </p>

            {currentQ.correctChoiceIds.length > 1 && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg mb-4 inline-block">
                {t({ en: `Select ${currentQ.correctChoiceIds.length} answers`, fr: `Sélectionnez ${currentQ.correctChoiceIds.length} réponses` })}
              </p>
            )}

            <div className="space-y-3">
              {currentQ.choices.map((choice: any) => {
                const isSelected = selectedForCurrent.includes(choice.id);
                return (
                  <button
                    key={choice.id}
                    onClick={() => toggleSelection(choice.id)}
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
                        {typeof choice.text === "object" ? t(choice.text) : choice.text}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confirm & Next - no going back */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {t({ en: "You cannot go back to previous questions", fr: "Vous ne pouvez pas revenir aux questions précédentes" })}
            </p>
            <button
              onClick={confirmAnswer}
              disabled={!hasSelection}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                hasSelection
                  ? isLastQuestion
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isLastQuestion
                ? t({ en: "Submit Exam", fr: "Soumettre l'examen" })
                : t({ en: "Confirm & Next", fr: "Confirmer et suivant" })
              }
              <ChevronRight className="w-4 h-4" />
            </button>
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
            <BrandLogo className="h-8 max-w-[160px]" />
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              {t({ en: "Results", fr: "Résultats" })}
            </span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {!score && <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 text-center"><p className="font-semibold text-slate-800">{t({ en: "Verifying your exam submission…", fr: "Vérification de votre soumission…" })}</p><p className="mt-2 text-sm text-slate-500">{t({ en: "The server checks the official time limit before validating the result.", fr: "Le serveur vérifie la durée officielle avant de valider le résultat." })}</p></div>}

        {/* Score Card */}
        {score && (
          <div className={`rounded-2xl border-2 p-8 mb-8 text-center ${
            score.passed ? "border-emerald-300 bg-emerald-50" : "border-red-200 bg-red-50"
          }`}>
            <div className="text-5xl mb-3">
              {score.passed ? "🎉" : "📚"}
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {score.timedOut
                ? t({ en: "Time limit reached", fr: "Durée d’examen dépassée" })
                : score.passed
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
        {score && score.domainResults && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
            <h2 className="font-semibold text-slate-800 mb-4">
              {t({ en: "Performance by Domain", fr: "Performance par domaine" })}
            </h2>
            <div className="space-y-3">
              {Object.entries(score.domainResults as Record<string, { correct: number; total: number }>).map(([domain, result]) => {
                const pct = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
                return (
                  <div key={domain}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">{domain}</span>
                      <span className="font-medium text-slate-800">
                        {result.correct}/{result.total} ({pct}%)
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
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
                      <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                        {typeof q.domain === "object" ? t(q.domain) : q.domain}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 mb-3">
                      {typeof q.question === "object" ? t(q.question) : q.question}
                    </p>
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
                            {typeof choice.text === "object" ? t(choice.text) : choice.text}
                            {isCorrectChoice && <span className="ml-2 text-emerald-600 font-medium">✓</span>}
                            {wasSelected && !isCorrectChoice && <span className="ml-2 text-red-500 font-medium">✗</span>}
                          </div>
                        );
                      })}
                    </div>
                    {!isCorrect && q.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
                        <span className="font-semibold">{t({ en: "Explanation:", fr: "Explication :" })}</span>{" "}
                        {typeof q.explanation === "object" ? t(q.explanation) : q.explanation}
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
            {t({ en: "Back to Courses", fr: "Retour aux cours" })}
          </Link>
        </div>
      </main>
    </div>
  );
}
