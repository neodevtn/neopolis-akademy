import { Link, useParams } from "wouter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { getLoginUrl } from "@/const";
import trainingIndex from "@/data/trainingIndex.json";
import { CheckCircle2, PlayCircle, BookOpen, ArrowLeft, Clock, LogIn, Download, Trophy, History, Moon, Sun, ChevronRight, Layers, Lock, Target, Brain } from "lucide-react";
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

export default function TrainingCertification() {
  const { certId } = useParams<{ certId: string }>();
  const { lang, t } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isCourseComplete, getCertProgress, isCertComplete, isLoading: progressLoading, isLessonComplete, getChapterProgress } = useTrainingProgress();

  const cert = trainingIndex.certifications.find((c) => c.id === certId);
  const courses = cert ? trainingIndex.courses.filter((c) => c.certId === certId) : [];
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

  // Per-course progress calculation
  const courseProgressMap = useMemo(() => {
    const map: Record<string, { completed: number; total: number; pct: number }> = {};
    courses.forEach((c) => {
      const total = c.lessonCount || 0;
      if (total === 1) {
        // Single-lesson course: use chapter progress for fractional completion
        const chapterProg = getChapterProgress(c.id, 0);
        if (chapterProg && chapterProg.totalChapters > 1) {
          const pct = Math.round((chapterProg.chapterIndex / chapterProg.totalChapters) * 100);
          map[c.id] = { completed: chapterProg.chapterIndex, total: chapterProg.totalChapters, pct };
        } else {
          // Use chapterCount from trainingIndex for display (actual number of chapters)
          const actualTotal = (c as any).chapterCount || 1;
          const completed = isLessonComplete(c.id, 0) ? actualTotal : 0;
          map[c.id] = { completed, total: actualTotal, pct: completed > 0 ? 100 : 0 };
        }
      } else {
        let completed = 0;
        for (let i = 0; i < total; i++) {
          if (isLessonComplete(c.id, i)) completed++;
        }
        // Use chapterCount for display if available
        const displayTotal = (c as any).chapterCount || total;
        const completedChapters = total > 0 ? Math.round((completed / total) * displayTotal) : 0;
        const pct = displayTotal > 0 ? Math.round((completedChapters / displayTotal) * 100) : 0;
        map[c.id] = { completed: completedChapters, total: displayTotal, pct };
      }
    });
    return map;
  }, [courses, isLessonComplete, getChapterProgress]);

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

  if (!cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{t({ en: "Certification not found", fr: "Certification introuvable" })}</p>
      </div>
    );
  }

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
            <LanguageSwitcher />
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
              {cert.totalExercises} {(cert as any).exerciseLabel ? t((cert as any).exerciseLabel) : t({ en: "exercises", fr: "exercices" })}
            </span>
            {cert.totalVideos > 0 && (
              <span className="flex items-center gap-1.5">
                <PlayCircle className="w-4 h-4" />
                {cert.totalVideos} {t({ en: "videos", fr: "vid\u00e9os" })}
              </span>
            )}
            {cert.totalDownloads > 0 && (
              <span className="flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                {cert.totalDownloads} {t({ en: "downloads", fr: "t\u00e9l\u00e9chargements" })}
              </span>
            )}
          </div>
          {(cert as any).breakdown && (
            <p className="text-xs text-muted-foreground mt-2">
              {t((cert as any).breakdown)}
            </p>
          )}
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
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-muted-foreground">
                  {t({ en: "Mock Exam Locked", fr: "Examen blanc verrouillé" })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: "Complete all courses to unlock the mock exam", fr: "Terminez tous les cours pour débloquer l'examen blanc" })}
                </p>
              </div>
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
                          {startedAt.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-3 px-2 text-center font-semibold text-foreground">
                          {attempt.score}/1000
                        </td>
                        <td className="py-3 px-2 text-center text-muted-foreground">
                          {durationMin}m {durationSec}s
                        </td>
                        <td className="py-3 px-2 text-center">
                          {passed ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">
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

        {/* Progress Summary Cards */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {(() => {
            const totalChapters = courses.reduce((sum, c) => sum + ((c as any).chapterCount || c.lessonCount || 0), 0);
            const completedChapters = Object.values(courseProgressMap).reduce((sum, p) => sum + p.completed, 0);
            const totalExercises = courses.reduce((sum, c) => sum + (c.exerciseCount || 0), 0);
            const totalVideos = courses.reduce((sum, c) => sum + (c.videos?.length || 0), 0);
            const totalDownloads = courses.reduce((sum, c) => sum + ((c as any).downloadCount || 0), 0);
            const completedCourses = courses.filter(c => (courseProgressMap[c.id]?.pct ?? 0) >= 100).length;
            return (
              <>
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-lg font-bold text-foreground">{completedChapters}/{totalChapters}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{t({ en: "Chapters", fr: "Chapitres" })}</div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-2">
                    <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-lg font-bold text-foreground">{totalExercises}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{(cert as any).exerciseLabel ? t((cert as any).exerciseLabel) : t({ en: "Exercises", fr: "Exercices" })}</div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-lg font-bold text-foreground">{completedCourses}/{courses.length}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{t({ en: "Courses", fr: "Cours" })}</div>
                </div>
                {totalVideos > 0 && (
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
                    <PlayCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-lg font-bold text-foreground">{totalVideos}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{t({ en: "Videos", fr: "Vid\u00e9os" })}</div>
                </div>
                )}
                {totalDownloads > 0 && (
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <div className="w-9 h-9 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mx-auto mb-2">
                    <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="text-lg font-bold text-foreground">{totalDownloads}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{t({ en: "Downloads", fr: "T\u00e9l\u00e9chargements" })}</div>
                </div>
                )}
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-2">
                    <Brain className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="text-lg font-bold text-foreground">{progressPct}%</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{t({ en: "Overall", fr: "Global" })}</div>
                </div>
              </>
            );
          })()}
        </motion.div>

        {/* Course List - Sequential locking: course N+1 locked until course N is completed */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            {t({ en: "Prep Courses", fr: "Cours de préparation" })}
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            {t({ en: "Complete each course in order to unlock the next one. Finish all courses to access the mock exam.", fr: "Terminez chaque cours dans l'ordre pour débloquer le suivant. Terminez tous les cours pour accéder à l'examen blanc." })}
          </p>
        </motion.div>
        <motion.div variants={staggerContainer} className="space-y-3">
          {courses.map((course, idx) => {
            const progress = courseProgressMap[course.id] || { completed: 0, total: 0, pct: 0 };
            const completed = progress.pct >= 100;
            const started = progress.completed > 0;
            // Sequential locking: course is locked if previous course is not completed (except first course)
            const previousCourseCompleted = idx === 0 || (courseProgressMap[courses[idx - 1].id]?.pct ?? 0) >= 100;
            const isLocked = !previousCourseCompleted && !completed && !started;

            return (
              <motion.div key={course.id} variants={fadeInUp}>
                {isLocked ? (
                  <div
                    className="block bg-card/60 rounded-2xl border border-border p-5 opacity-60 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 bg-secondary text-muted-foreground font-semibold text-sm">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-muted-foreground">{t(course.title)}</h3>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {progress.total} {t({ en: "chapters", fr: "chapitres" })}
                          </span>
                          {course.exerciseCount > 0 && (
                            <span className="flex items-center gap-1">
                              {course.exerciseCount} {(course as any).exerciseLabel ? t((course as any).exerciseLabel) : t({ en: "exercises", fr: "exercices" })}
                            </span>
                          )}
                          {((course.videos && course.videos.length > 0) || (course as any).videoCount > 0) && (
                            <span className="flex items-center gap-1">
                              <PlayCircle className="w-3 h-3" />
                              {(course as any).videoCount || course.videos?.length || 0} {t({ en: "videos", fr: "vidéos" })}
                            </span>
                          )}
                          {(course as any).downloadCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {(course as any).downloadCount} {t({ en: "downloads", fr: "téléchargements" })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-xs bg-secondary text-muted-foreground px-2.5 py-1 rounded-full font-medium">
                          {t({ en: "Locked", fr: "Verrouillé" })}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                <Link
                  href={`/training/${certId}/${course.id}`}
                  className={`block bg-card rounded-2xl border p-5 transition-all hover:shadow-md group ${
                    completed ? "border-primary/30" : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${
                      completed ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : started ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"
                    } font-semibold text-sm`}>
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{t(course.title)}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {progress.total} {t({ en: "chapters", fr: "chapitres" })}
                        </span>
                        {course.exerciseCount > 0 && (
                          <span className="flex items-center gap-1">
                            {course.exerciseCount} {(course as any).exerciseLabel ? t((course as any).exerciseLabel) : t({ en: "exercises", fr: "exercices" })}
                          </span>
                        )}
                        {((course.videos && course.videos.length > 0) || (course as any).videoCount > 0) && (
                          <span className="flex items-center gap-1">
                            <PlayCircle className="w-3 h-3" />
                            {(course as any).videoCount || course.videos?.length || 0} {t({ en: "videos", fr: "vid\u00e9os" })}
                          </span>
                        )}
                        {(course as any).downloadCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {(course as any).downloadCount} {t({ en: "downloads", fr: "téléchargements" })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {completed ? (
                        <span className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">
                          {t({ en: "Completed", fr: "Terminé" })}
                        </span>
                      ) : started ? (
                        <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
                          {progress.completed}/{progress.total}
                        </span>
                      ) : (
                        <span className="text-xs bg-secondary text-muted-foreground px-2.5 py-1 rounded-full font-medium">
                          {t({ en: "Not started", fr: "Non commencé" })}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  {/* Per-course segmented progress bar */}
                  {started && !completed && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1 mb-1.5">
                        {Array.from({ length: progress.total }, (_, i) => (
                          <div
                            key={i}
                            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                              i < progress.completed ? 'bg-primary' : 'bg-secondary'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{progress.completed}/{progress.total} {t({ en: "chapters done", fr: "chapitres terminés" })}</span>
                        <span className="font-medium text-primary">{progress.pct}%</span>
                      </div>
                    </div>
                  )}
                  {completed && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1 mb-1.5">
                        {Array.from({ length: progress.total }, (_, i) => (
                          <div key={i} className="flex-1 h-1.5 rounded-full bg-emerald-500" />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-600 dark:text-emerald-400">{progress.total}/{progress.total} {t({ en: "chapters done", fr: "chapitres terminés" })}</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">100%</span>
                      </div>
                    </div>
                  )}
                </Link>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </motion.main>
    </div>
  );
}
