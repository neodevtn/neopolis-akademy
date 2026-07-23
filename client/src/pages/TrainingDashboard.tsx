import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import trainingIndex from "@/data/trainingIndex.json";
import { Progress } from "@/components/ui/progress";
import {
  LogIn,
  Trophy,
  BookOpen,
  Play,
  Dumbbell,
  ChevronRight,
  GraduationCap,
  Moon,
  Sun,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const levelConfig = {
  beginner: {
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    label: { en: "Beginner", fr: "Débutant" },
    dot: "bg-emerald-500",
  },
  intermediate: {
    color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    label: { en: "Intermediate", fr: "Intermédiaire" },
    dot: "bg-blue-500",
  },
  advanced: {
    color: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    label: { en: "Advanced", fr: "Avancé" },
    dot: "bg-purple-500",
  },
};

export default function TrainingDashboard() {
  const { lang, toggleLang, t } = useLanguage();
  const { getCertProgress } = useTrainingProgress();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const certCompletionData = useMemo(() => {
    return trainingIndex.certifications.map((cert) => {
      const courses = trainingIndex.courses.filter((c) => c.certId === cert.id);
      const courseIds = courses.map((c) => c.id);
      const totalLessonsMap: Record<string, number> = {};
      courses.forEach((c) => { totalLessonsMap[c.id] = c.lessonCount || 1; });
      const progressPct = getCertProgress(courseIds, totalLessonsMap);
      return { id: cert.id, title: cert.title, icon: cert.icon, description: cert.description, level: cert.level, courseCount: cert.courseCount, totalExercises: cert.totalExercises, totalVideos: cert.totalVideos, progress: progressPct, completed: progressPct >= 100 };
    });
  }, [getCertProgress]);

  const completedCount = certCompletionData.filter((c) => c.completed).length;
  const totalCount = certCompletionData.length;
  const overallPct = Math.round(certCompletionData.reduce((sum, c) => sum + c.progress, 0) / totalCount);

  // Loading state
  if (authLoading) {
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
            <Link href="/" className="flex items-center gap-2.5">
              <span className="text-xl font-bold text-foreground">Neopolis</span>
              <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase">Training</span>
            </Link>
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
        <main className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="bg-card rounded-2xl border border-border p-10 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {t({ en: "Authentication Required", fr: "Authentification requise" })}
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t({ en: "Log in to access the training platform and track your progress.", fr: "Connectez-vous pour accéder à la plateforme de formation et suivre votre progression." })}
            </p>
            <Button
              onClick={() => { window.location.href = getLoginUrl(); }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl"
            >
              {t({ en: "Log in to continue", fr: "Se connecter" })}
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
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
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
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              {t({ en: "Back to site", fr: "Retour au site" })}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {t({ en: "Claude Certification Training", fr: "Formation Certification Claude" })}
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground ml-[52px]">
            {t({
              en: "Prepare for your Claude certifications with structured courses, exercises, and mock exams.",
              fr: "Préparez vos certifications Claude avec des cours structurés, exercices et examens blancs.",
            })}
          </p>
        </div>

        {/* Progress Overview Card */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Progress circle + text */}
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-secondary" />
                  <circle
                    cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6"
                    className="text-primary"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - overallPct / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">{overallPct}%</span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {t({ en: "Overall Progress", fr: "Progression globale" })}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {completedCount}/{totalCount} {t({ en: "certifications completed", fr: "certifications complétées" })}
                </p>
                {completedCount === totalCount && completedCount > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 text-amber-600 dark:text-amber-400">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-semibold">{t({ en: "All Complete!", fr: "Tout terminé !" })}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Right: Mini progress per cert */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {certCompletionData.map((cert) => (
                <div key={cert.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-secondary/50">
                  <span className="text-xl flex-shrink-0">{cert.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{t(cert.title)}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${cert.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground">{cert.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 md:gap-4 mb-10">
          {[
            { value: "4", label: { en: "Certifications", fr: "Certifications" }, icon: <GraduationCap className="w-4 h-4" /> },
            { value: "25", label: { en: "Courses", fr: "Cours" }, icon: <BookOpen className="w-4 h-4" /> },
            { value: "26", label: { en: "Videos", fr: "Vidéos" }, icon: <Play className="w-4 h-4" /> },
            { value: "480+", label: { en: "Exercises", fr: "Exercices" }, icon: <Dumbbell className="w-4 h-4" /> },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 text-center shadow-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary mx-auto mb-2">
                {stat.icon}
              </div>
              <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[11px] md:text-xs text-muted-foreground font-medium">{t(stat.label)}</div>
            </div>
          ))}
        </div>

        {/* Certification Paths */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {t({ en: "Certification Paths", fr: "Parcours de certification" })}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-10">
          {certCompletionData.map((cert) => {
            const level = ((cert.level as any).en as string).toLowerCase() as keyof typeof levelConfig;
            const config = levelConfig[level] || levelConfig.beginner;
            return (
              <Link
                key={cert.id}
                href={`/training/${cert.id}`}
                className="group block bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
              >
                {/* Top row: icon + level badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                    {cert.icon}
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${config.color}`}>
                    {t(config.label)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-2 leading-tight">
                  {t(cert.title)}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                  {t(cert.description)}
                </p>

                {/* Meta row */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {cert.courseCount} {t({ en: "courses", fr: "cours" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5" />
                    {cert.totalExercises} {t({ en: "exercises", fr: "exercices" })}
                  </span>
                  {cert.totalVideos > 0 && (
                    <span className="flex items-center gap-1">
                      <Play className="w-3.5 h-3.5" />
                      {cert.totalVideos} {t({ en: "videos", fr: "vidéos" })}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cert.completed ? "bg-emerald-500" : "bg-primary"}`}
                      style={{ width: `${cert.progress}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold ${cert.completed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                    {cert.progress}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recommended Study Order */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm overflow-hidden">
          <h2 className="text-base font-semibold text-foreground mb-5">
            {t({ en: "Recommended Study Order", fr: "Ordre d'étude recommandé" })}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {trainingIndex.certifications.map((cert, i) => (
              <div key={cert.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/40">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-sm font-medium text-foreground leading-tight">{t(cert.title)}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
