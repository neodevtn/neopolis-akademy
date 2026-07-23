import { Link, useParams } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { getLoginUrl } from "@/const";
import trainingIndex from "@/data/trainingIndex.json";
import { CheckCircle2, Lock, PlayCircle, BookOpen, ArrowLeft, Clock, LogIn, Download, Trophy, History, Moon, Sun, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";

/* ─── Animation Variants ─── */
const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: easeOut } },
};

export default function TrainingCertification() {
  const { certId } = useParams<{ certId: string }>();
  const { lang, toggleLang, t } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isCourseComplete, getCertProgress, isCertComplete, isLoading: progressLoading } = useTrainingProgress();

  const cert = trainingIndex.certifications.find((c) => c.id === certId);
  if (!cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{t({ en: "Certification not found", fr: "Certification introuvable" })}</p>
      </div>
    );
  }

  const courses = trainingIndex.courses.filter((c) => c.certId === certId);
  const courseIds = courses.map((c) => c.id);

  const totalLessonsMap = useMemo(() => {
    const map: Record<string, number> = {};
    courses.forEach((c) => { map[c.id] = c.lessonCount || 1; });
    return map;
  }, [courses]);

  const progressPct = useMemo(() => {
    return getCertProgress(courseIds, totalLessonsMap);
  }, [courseIds, totalLessonsMap, getCertProgress]);

  const certComplete = useMemo(() => {
    return isCertComplete(certId || "", courseIds, totalLessonsMap);
  }, [certId, courseIds, totalLessonsMap, isCertComplete]);

  // Fetch exam history
  const { data: examHistory } = trpc.training.getExamHistory.useQuery(
    { certificationId: certId },
    { enabled: isAuthenticated && !!certId }
  );

  const bestPassingScore = useMemo(() => {
    if (!examHistory || examHistory.length === 0) return null;
    const passing = examHistory.filter((a: any) => a.score >= 720);
    if (passing.length === 0) return null;
    return passing.reduce((best: any, curr: any) => curr.score > best.score ? curr : best);
  }, [examHistory]);

  // Sequential locking
  const isCourseUnlocked = (idx: number) => {
    if (idx === 0) return true;
    if (!isAuthenticated) return false;
    const prevCourse = courses[idx - 1];
    const prevTotal = totalLessonsMap[prevCourse.id] || 0;
    return isCourseComplete(prevCourse.id, prevTotal);
  };

  const isLoading = authLoading || progressLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{t({ en: "Loading...", fr: "Chargement..." })}</p>
        </div>
      </div>
    );
  }

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/training" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold text-foreground">Neopolis</span>
                <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase">Training</span>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="bg-card rounded-2xl border border-border p-10 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {t({ en: "Authentication Required", fr: "Authentification requise" })}
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t({ en: "You must be logged in to access the training courses and track your progress.", fr: "Vous devez être connecté pour accéder aux cours et suivre votre progression." })}
            </p>
            <Button
              onClick={() => { window.location.href = getLoginUrl(); }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl"
            >
              {t({ en: "Log in to continue", fr: "Se connecter pour continuer" })}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/training" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold text-foreground">Neopolis</span>
              <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase">Training</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors"
            >
              <span>{lang === "en" ? "🇬🇧" : "🇫🇷"}</span>
              {lang === "en" ? "EN" : "FR"}
            </button>
          </div>
        </div>
      </header>

      <motion.main
        className="max-w-4xl mx-auto px-6 py-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Cert Header Card */}
        <motion.div variants={fadeInUp} className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-6 shadow-sm">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-3xl flex-shrink-0">
              {cert.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground mb-1">{t(cert.title)}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(cert.description)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${certComplete ? "bg-emerald-500" : "bg-primary"}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${certComplete ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
              {progressPct}%
            </span>
          </div>
          <div className="flex items-center gap-5 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              {cert.courseCount} {t({ en: "courses", fr: "cours" })}
            </span>
            <span className="flex items-center gap-1.5">
              {cert.totalExercises} {t({ en: "exercises", fr: "exercices" })}
            </span>
            {cert.totalVideos > 0 && (
              <span className="flex items-center gap-1.5">
                <PlayCircle className="w-4 h-4" />
                {cert.totalVideos} {t({ en: "videos", fr: "vidéos" })}
              </span>
            )}
          </div>
        </motion.div>

        {/* Certificate Download */}
        {bestPassingScore && (
          <motion.div variants={fadeInUp} className="bg-card rounded-2xl border border-primary/30 p-5 mb-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {t({ en: "Certification Passed!", fr: "Certification réussie !" })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: `Best score: ${bestPassingScore.score}/1000`, fr: `Meilleur score : ${bestPassingScore.score}/1000` })}
                </p>
              </div>
              <Button
                onClick={() => { window.open(`/api/certificate/${certId}`, "_blank"); }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Download className="w-4 h-4" />
                {t({ en: "Download Certificate", fr: "Télécharger le certificat" })}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Mock Exam CTA */}
        <motion.div variants={fadeInUp}>
          {certComplete ? (
            <Link
              href={`/mock-exam/${certId}`}
              className="flex items-center gap-4 bg-card rounded-2xl border border-border p-5 mb-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {t({ en: "Take Mock Exam", fr: "Passer l'examen blanc" })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: "Timed practice exam simulating real certification conditions", fr: "Examen blanc chronométré simulant les conditions réelles de certification" })}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ) : (
            <div className="flex items-center gap-4 bg-card rounded-2xl border border-border p-5 mb-6 opacity-60">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary text-muted-foreground shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-muted-foreground">
                  {t({ en: "Mock Exam Locked", fr: "Examen blanc verrouillé" })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: "Complete all courses to unlock the mock exam", fr: "Terminez tous les cours pour débloquer l'examen blanc" })}
                </p>
              </div>
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </motion.div>

        {/* Exam History */}
        {examHistory && examHistory.length > 0 && (
          <motion.div variants={fadeInUp} className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              {t({ en: "Exam History", fr: "Historique des examens" })}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                      {t({ en: "Date", fr: "Date" })}
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                      {t({ en: "Score", fr: "Score" })}
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                      {t({ en: "Duration", fr: "Durée" })}
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                      {t({ en: "Result", fr: "Résultat" })}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {examHistory.map((attempt: any, idx: number) => {
                    const startedAt = new Date(attempt.startedAt);
                    const finishedAt = new Date(attempt.finishedAt);
                    const durationMs = finishedAt.getTime() - startedAt.getTime();
                    const durationMin = Math.floor(durationMs / 60000);
                    const durationSec = Math.floor((durationMs % 60000) / 1000);
                    const passed = attempt.score >= 720;

                    return (
                      <tr key={attempt.id || idx} className="border-b border-border/50 last:border-0">
                        <td className="py-3 px-2 text-foreground">
                          {startedAt.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                          <span className="text-xs text-muted-foreground ml-2">
                            {startedAt.toLocaleTimeString(lang === "fr" ? "fr-FR" : "en-US", {
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`font-semibold ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                            {attempt.score}/1000
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center text-muted-foreground">
                          {durationMin}m {durationSec}s
                        </td>
                        <td className="py-3 px-2 text-center">
                          {passed ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              {t({ en: "Passed", fr: "Réussi" })}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full font-medium">
                              {t({ en: "Failed", fr: "Échoué" })}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Course List */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {t({ en: "Course List", fr: "Liste des cours" })}
          </h2>
        </motion.div>
        <motion.div variants={staggerContainer} className="space-y-3">
          {courses.map((course, idx) => {
            const totalLessons = totalLessonsMap[course.id] || 0;
            const completed = isCourseComplete(course.id, totalLessons);
            const unlocked = isCourseUnlocked(idx);

            if (!unlocked) {
              return (
                <motion.div
                  key={course.id}
                  variants={fadeInUp}
                  className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4 opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary text-muted-foreground shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-muted-foreground truncate">{t(course.title)}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t({ en: "Complete the previous course to unlock", fr: "Terminez le cours précédent pour débloquer" })}
                    </p>
                  </div>
                  <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                </motion.div>
              );
            }

            return (
              <motion.div key={course.id} variants={fadeInUp}>
                <Link
                  href={`/training/${certId}/${course.id}`}
                  className={`flex items-center gap-4 bg-card rounded-2xl border p-4 transition-all hover:shadow-md group ${
                    completed ? "border-primary/30" : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${
                    completed ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"
                  } font-semibold text-sm`}>
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">{t(course.title)}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {course.exerciseCount > 0 && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {course.exerciseCount} {t({ en: "exercises", fr: "exercices" })}
                        </span>
                      )}
                      {course.videos && course.videos.length > 0 && (
                        <span className="flex items-center gap-1">
                          <PlayCircle className="w-3 h-3" />
                          {course.videos.length} {t({ en: "videos", fr: "vidéos" })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {completed ? (
                      <span className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">
                        {t({ en: "Completed", fr: "Terminé" })}
                      </span>
                    ) : (
                      <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
                        {t({ en: "In progress", fr: "En cours" })}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.main>
    </div>
  );
}
