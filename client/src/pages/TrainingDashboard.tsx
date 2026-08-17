import { Link } from "wouter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import trainingIndex from "@/data/trainingIndex.json";
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
  PlayCircle,
  LogOut,
  Download,
  Brain,
  Compass,
  Library,
  Route,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { AchievementGallery } from "@/components/AchievementGallery";

/* ─── Animation Variants ─── */
const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: easeOut } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: easeOut } },
};

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

type TabId = "my-path" | "achievements" | "catalog" | "recommended";

export default function TrainingDashboard() {
  const { lang, t } = useLanguage();
  const { getCertProgress, getLastVisitedCourse } = useTrainingProgress();
  const { isAuthenticated, loading: authLoading, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>("my-path");
  const achievementsQuery = trpc.training.getAchievements.useQuery(undefined, { enabled: isAuthenticated });

  // Group configuration for the 4 certification tracks
  const GROUP_CONFIG = {
    anthropic_official: {
      label: { en: "Anthropic Official Certifications", fr: "Certifications Officielles Anthropic" },
      subtitle: { en: "Validated by Anthropic — Claude Associate, Developer, Architect", fr: "Validées par Anthropic — Claude Associate, Developer, Architect" },
      badge: "Official",
      badgeColor: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
      hoverBorder: "hover:border-primary/30",
      hoverText: "group-hover:text-primary",
      progressColor: "bg-primary",
      iconBg: "bg-secondary",
      order: 1,
    },
    business_ai_literacy: {
      label: { en: "Business AI Literacy", fr: "Business AI Literacy" },
      subtitle: { en: "AI fundamentals, strategy, governance and management for business professionals", fr: "Fondamentaux IA, stratégie, gouvernance et management pour les professionnels" },
      badge: "Accessible",
      badgeColor: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
      hoverBorder: "hover:border-emerald-400/30",
      hoverText: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
      progressColor: "bg-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
      order: 2,
    },
    fullstack_ai_engineering: {
      label: { en: "Full-Stack AI Engineering", fr: "Ingénierie IA Full-Stack" },
      subtitle: { en: "Production-grade AI: RAG, LLMOps, Security, Infrastructure, Open-Source LLMs", fr: "IA production : RAG, LLMOps, Sécurité, Infrastructure, LLMs Open-Source" },
      badge: "New",
      badgeColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      hoverBorder: "hover:border-blue-400/30",
      hoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
      progressColor: "bg-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-950/40",
      order: 3,
    },
    bi_data_analytics: {
      label: { en: "BI & Data", fr: "BI & Data" },
      subtitle: { en: "Data profiling, star schema modeling, DAX, Power BI, executive reporting with Codex", fr: "Profiling de données, modélisation en étoile, DAX, Power BI, reporting exécutif avec Codex" },
      badge: "BI",
      badgeColor: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
      hoverBorder: "hover:border-orange-400/30",
      hoverText: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
      progressColor: "bg-orange-500",
      iconBg: "bg-orange-50 dark:bg-orange-950/40",
      order: 4,
    },
    divers: {
      label: { en: "Specialized Tracks", fr: "Parcours Spécialisés" },
      subtitle: { en: "Cross-functional certifications: business process transformation, applied AI", fr: "Certifications transversales : transformation des processus, IA appliquée" },
      badge: "Divers",
      badgeColor: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
      hoverBorder: "hover:border-violet-400/30",
      hoverText: "group-hover:text-violet-600 dark:group-hover:text-violet-400",
      progressColor: "bg-violet-500",
      iconBg: "bg-violet-50 dark:bg-violet-950/40",
      order: 5,
    },
  } as const;
  const categoryOverrides = (trainingIndex as any).categories || [];
  const catalogGroupConfig = Object.fromEntries(Object.entries(GROUP_CONFIG).map(([id, config]) => {
    const override = categoryOverrides.find((category: any) => category.id === id);
    return [id, { ...config, ...(override?.title ? { label: override.title } : {}), ...(override?.subtitle ? { subtitle: override.subtitle } : {}), ...(typeof override?.order === "number" ? { order: override.order } : {}) }];
  }));

  const certCompletionData = useMemo(() => {
    return trainingIndex.certifications.map((cert) => {
      const courses = trainingIndex.courses.filter((c) => c.certId === cert.id);
      const courseIds = courses.map((c) => c.id);
      const totalLessonsMap: Record<string, number> = {};
      courses.forEach((c) => { totalLessonsMap[c.id] = c.lessonCount || 1; });
      const progressPct = getCertProgress(courseIds, totalLessonsMap);
      return { id: cert.id, title: cert.title, icon: cert.icon, description: cert.description, level: cert.level, courseCount: cert.courseCount, totalExercises: cert.totalExercises, totalVideos: cert.totalVideos, totalDownloads: (cert as any).totalDownloads || 0, exerciseLabel: (cert as any).exerciseLabel, breakdown: (cert as any).breakdown, progress: progressPct, completed: progressPct >= 100, group: (cert as any).group };
    });
  }, [getCertProgress]);

  const completedCount = certCompletionData.filter((c) => c.completed).length;
  const totalCount = certCompletionData.length;
  const overallPct = Math.round(certCompletionData.reduce((sum, c) => sum + c.progress, 0) / totalCount);

  // Find the next recommended certification to start
  const nextCertToStart = useMemo(() => {
    for (const cert of trainingIndex.certifications) {
      const data = certCompletionData.find((c) => c.id === cert.id);
      if (data && data.progress < 100) return data;
    }
    return null;
  }, [certCompletionData]);

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
              <LanguageSwitcher />
            </div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-24 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            className="bg-card rounded-2xl border border-border p-10 shadow-sm"
          >
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
          </motion.div>
        </main>
      </div>
    );
  }

  const tabs: { id: TabId; label: { en: string; fr: string }; icon: React.ReactNode }[] = [
    { id: "my-path", label: { en: "My Progress", fr: "Mon Parcours" }, icon: <Compass className="w-4 h-4" /> },
    { id: "achievements", label: { en: "My Achievements", fr: "Mes acquis" }, icon: <Trophy className="w-4 h-4" /> },
    { id: "catalog", label: { en: "Catalog", fr: "Catalogue" }, icon: <Library className="w-4 h-4" /> },
    { id: "recommended", label: { en: "Learning Path", fr: "Parcours recommandé" }, icon: <Route className="w-4 h-4" /> },
  ];

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
            <LanguageSwitcher />
            {user?.role === "admin" && (
              <Link href="/admin" className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 transition-colors hidden sm:block">
                Admin
              </Link>
            )}
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              {t({ en: "Back to site", fr: "Retour au site" })}
            </Link>
            {isAuthenticated && (
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 hover:text-red-700 border border-red-200 dark:border-red-800 hover:border-red-300"
                title="Déconnexion"
              >
                <LogOut size={13} />
                <span className="hidden md:inline">Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome + Tabs */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          {/* Greeting */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              {t({ en: `Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`, fr: `Bienvenue${user?.name ? `, ${user.name.split(' ')[0]}` : ''}` })}
            </h1>
            <p className="text-muted-foreground">
              {t({ en: "Continue your AI certification journey.", fr: "Continuez votre parcours de certification IA." })}
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { value: String(trainingIndex.certifications.length), label: { en: "Certifications", fr: "Certifications" }, icon: <GraduationCap className="w-4 h-4" /> },
              { value: String(trainingIndex.courses.length), label: { en: "Courses", fr: "Cours" }, icon: <BookOpen className="w-4 h-4" /> },
              { value: String(trainingIndex.certifications.reduce((s: number, c: any) => s + c.totalVideos, 0)), label: { en: "Videos", fr: "Vidéos" }, icon: <Play className="w-4 h-4" /> },
              { value: String(trainingIndex.certifications.reduce((s: number, c: any) => s + c.totalExercises, 0)) + "+", label: { en: "Exercises", fr: "Exercices" }, icon: <Dumbbell className="w-4 h-4" /> },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 bg-card rounded-xl border border-border p-3.5 shadow-sm">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground leading-tight">{stat.value}</div>
                  <div className="text-[11px] text-muted-foreground font-medium">{t(stat.label)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-xl w-fit mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{t(tab.label)}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "my-path" && (
            <motion.div
              key="my-path"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: easeOut }}
            >
              <MyPathTab
                overallPct={overallPct}
                completedCount={completedCount}
                totalCount={totalCount}
                certCompletionData={certCompletionData}
                nextCertToStart={nextCertToStart}
                t={t}
                getLastVisitedCourse={getLastVisitedCourse}
              />
            </motion.div>
          )}
          {activeTab === "catalog" && (
            <motion.div
              key="catalog"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: easeOut }}
            >
              <CatalogTab
                certCompletionData={certCompletionData}
                GROUP_CONFIG={catalogGroupConfig}
                t={t}
              />
            </motion.div>
          )}
          {activeTab === "achievements" && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: easeOut }}
            >
              <AchievementGallery
                achievements={achievementsQuery.data || []}
                canDownload
                emptyText="Vos badges et diplômes apparaîtront ici dès la réussite d’un cours ou d’une certification."
              />
            </motion.div>
          )}
          {activeTab === "recommended" && (
            <motion.div
              key="recommended"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: easeOut }}
            >
              <RecommendedTab
                certCompletionData={certCompletionData}
                t={t}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Diagnostic Tools - always visible at bottom */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mt-12 space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {t({ en: "AI Tools", fr: "Outils IA" })}
          </h2>
          <motion.div variants={fadeInUp}>
            <Link href="/diagnostic" className="group block bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground mb-0.5">
                    {t({ en: "AI Automatability Diagnostic", fr: "Diagnostic d'automatisabilité IA" })}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {t({ en: "Evaluate the AI potential of your business processes.", fr: "Évaluez le potentiel IA de vos processus métier." })}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Link href="/diagnostic-avance" className="group block bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 rounded-2xl border border-purple-200 dark:border-purple-800 p-5 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-base font-semibold text-foreground">
                      {t({ en: "Advanced AI Diagnostic (BPMN)", fr: "Diagnostic IA Avancé (BPMN)" })}
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold uppercase">Pro</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {t({ en: "Design BPMN processes, get ultra-detailed AI recommendations.", fr: "Designez vos processus BPMN, obtenez des recommandations IA détaillées." })}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-600 transition-colors flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

/* ─── Tab: My Path ─── */
function MyPathTab({
  overallPct,
  completedCount,
  totalCount,
  certCompletionData,
  nextCertToStart,
  t,
  getLastVisitedCourse,
}: {
  overallPct: number;
  completedCount: number;
  totalCount: number;
  certCompletionData: any[];
  nextCertToStart: any;
  t: (obj: { en: string; fr: string }) => string;
  getLastVisitedCourse: () => any;
}) {
  const lastVisited = getLastVisitedCourse();
  const course = lastVisited ? trainingIndex.courses.find((c) => c.id === lastVisited.courseId) : null;
  const cert = course ? trainingIndex.certifications.find((c) => c.id === course.certId) : null;
  const isNewUser = overallPct === 0;

  return (
    <div className="space-y-6">
      {/* Progress Overview - compact */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
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
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {t({ en: "Overall Progress", fr: "Progression globale" })}
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              {completedCount}/{totalCount} {t({ en: "certifications completed", fr: "certifications complétées" })}
            </p>
            {/* Compact progress bar */}
            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            {completedCount === totalCount && completedCount > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-amber-600 dark:text-amber-400">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-semibold">{t({ en: "All Complete!", fr: "Tout terminé !" })}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume Learning OR Start Here (for new users) */}
      {isNewUser ? (
        <div className="bg-gradient-to-br from-primary/5 to-emerald-500/5 dark:from-primary/10 dark:to-emerald-500/10 rounded-2xl border border-primary/20 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {t({ en: "Start your journey here!", fr: "Commencez votre parcours ici !" })}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4 ml-[52px]">
            {t({ en: "We recommend starting with the first certification. Follow the learning path for the best experience.", fr: "Nous recommandons de commencer par la première certification. Suivez le parcours recommandé pour une expérience optimale." })}
          </p>
          {nextCertToStart && (
            <Link
              href={`/training/${nextCertToStart.id}`}
              className="group ml-[52px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-200 active:scale-[0.97]"
            >
              {t({ en: "Start first course", fr: "Commencer le premier cours" })}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      ) : lastVisited && course ? (
        <Link
          href={`/training/${course.certId}/${course.id}`}
          className="group block bg-gradient-to-r from-primary/5 to-emerald-500/5 dark:from-primary/10 dark:to-emerald-500/10 rounded-2xl border border-primary/20 dark:border-primary/30 p-5 hover:shadow-md hover:border-primary/40 transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <PlayCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {t({ en: "Continue reading", fr: "Reprendre la lecture" })}
                </span>
                {cert && <span className="text-xs text-muted-foreground">{cert.icon}</span>}
              </div>
              <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {t(course.title)}
              </h3>
              <div className="flex items-center gap-3 mt-1.5">
               <div className="flex-1 max-w-[200px] h-1.5 rounded-full bg-secondary overflow-hidden">
                 <div
                   className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round(((lastVisited.chapterIndex + 1) / lastVisited.totalChapters) * 100))}%` }}
                 />
               </div>
               <span className="text-xs text-muted-foreground font-medium">
                  {(() => {
                    const total = lastVisited.totalChapters;
                    const current = Math.min(lastVisited.chapterIndex + 1, total);
                    const isDone = current >= total;
                    return isDone
                      ? <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ {total}/{total}</span>
                      : t({ en: `Chapter ${current}/${total}`, fr: `Chapitre ${current}/${total}` });
                  })()}
               </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </Link>
      ) : null}

      {/* Next step suggestion */}
      {!isNewUser && nextCertToStart && nextCertToStart.progress > 0 && nextCertToStart.progress < 100 && (
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              {t({ en: "Next recommended step", fr: "Prochaine étape recommandée" })}
            </h3>
          </div>
          <Link
            href={`/training/${nextCertToStart.id}`}
            className="group flex items-center gap-4 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors"
          >
            <span className="text-2xl">{nextCertToStart.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {t(nextCertToStart.title)}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 max-w-[150px] h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${nextCertToStart.progress}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{nextCertToStart.progress}%</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      )}


    </div>
  );
}

/* ─── Tab: Catalog ─── */
function CatalogTab({
  certCompletionData,
  GROUP_CONFIG,
  t,
}: {
  certCompletionData: any[];
  GROUP_CONFIG: any;
  t: (obj: { en: string; fr: string }) => string;
}) {
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  type GroupKey = keyof typeof GROUP_CONFIG;
  const groups = Object.entries(GROUP_CONFIG) as [GroupKey, any][];

  const filteredCerts = selectedGroup === "all"
    ? certCompletionData
    : certCompletionData.filter((cert) => cert.group === selectedGroup);

  return (
    <div className="space-y-6">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGroup("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedGroup === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          {t({ en: "All", fr: "Tout" })} ({certCompletionData.length})
        </button>
        {groups.sort((a, b) => a[1].order - b[1].order).map(([key, cfg]) => {
          const keyStr = key as string;
          const count = certCompletionData.filter((c) => c.group === keyStr).length;
          if (count === 0) return null;
          return (
            <button
              key={keyStr}
              onClick={() => setSelectedGroup(keyStr)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedGroup === keyStr
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {t(cfg.label).split(' ').slice(0, 3).join(' ')} ({count})
            </button>
          );
        })}
      </div>

      {/* Certification cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid md:grid-cols-2 gap-5"
      >
        {filteredCerts.map((cert) => {
          const groupCfg = GROUP_CONFIG[cert.group as GroupKey] || GROUP_CONFIG.divers;
          const level = (((cert.level as any)?.en || "beginner") as string).toLowerCase() as keyof typeof levelConfig;
          const config = levelConfig[level] || levelConfig.beginner;
          return (
            <motion.div key={cert.id} variants={fadeInUp}>
              <Link
                href={`/training/${cert.id}`}
                className={`group block bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md ${groupCfg.hoverBorder} transition-all duration-200`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${groupCfg.iconBg} flex items-center justify-center text-2xl`}>{cert.icon}</div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${config.color}`}>{t(config.label)}</span>
                </div>
                <h3 className={`text-base font-semibold text-foreground ${groupCfg.hoverText} transition-colors mb-2 leading-tight`}>{t(cert.title)}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{t(cert.description)}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap">
                  {(cert as any).breakdown ? (
                    <>
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{(cert as any).breakdown.chapters || cert.courseCount} {t({ en: "chapters", fr: "chapitres" })}</span>
                      <span className="flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5" />{cert.totalExercises} {(cert as any).exerciseLabel ? t((cert as any).exerciseLabel) : t({ en: "exercises", fr: "exercices" })}</span>
                      {cert.totalVideos > 0 && <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5" />{cert.totalVideos} {t({ en: "videos", fr: "vidéos" })}</span>}
                      {(cert as any).totalDownloads > 0 && <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" />{(cert as any).totalDownloads} {t({ en: "downloads", fr: "téléchargements" })}</span>}
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{cert.courseCount} {t({ en: "courses", fr: "cours" })}</span>
                      <span className="flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5" />{cert.totalExercises} {(cert as any).exerciseLabel ? t((cert as any).exerciseLabel) : t({ en: "exercises", fr: "exercices" })}</span>
                      {cert.totalVideos > 0 && <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5" />{cert.totalVideos} {t({ en: "videos", fr: "vidéos" })}</span>}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${cert.completed ? "bg-emerald-500" : groupCfg.progressColor}`} style={{ width: `${cert.progress}%` }} />
                  </div>
                  <span className={`text-xs font-semibold ${cert.completed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>{cert.progress}%</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground transition-colors" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ─── Tab: Recommended Path ─── */
function RecommendedTab({
  certCompletionData,
  t,
}: {
  certCompletionData: any[];
  t: (obj: { en: string; fr: string }) => string;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Route className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            {t({ en: "Recommended Learning Path", fr: "Parcours d'apprentissage recommandé" })}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6 ml-8">
          {t({ en: "Follow this order for the best learning experience. Each certification builds on the previous one.", fr: "Suivez cet ordre pour une expérience d'apprentissage optimale. Chaque certification s'appuie sur la précédente." })}
        </p>

        <div className="space-y-3">
          {trainingIndex.certifications.map((cert, i) => {
            const data = certCompletionData.find((c) => c.id === cert.id);
            const isCompleted = data?.completed;
            const isInProgress = data && data.progress > 0 && !isCompleted;
            const isLocked = i > 0 && !certCompletionData.find((c) => c.id === trainingIndex.certifications[i - 1].id)?.completed;

            return (
              <Link
                key={cert.id}
                href={`/training/${cert.id}`}
                className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                  isCompleted
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                    : isInProgress
                    ? "bg-primary/5 border-primary/20 hover:border-primary/40 hover:shadow-sm"
                    : "bg-card border-border hover:border-border hover:shadow-sm"
                }`}
              >
                {/* Step number / status */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted
                    ? "bg-emerald-100 dark:bg-emerald-900/50"
                    : isInProgress
                    ? "bg-primary/10"
                    : "bg-secondary"
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : isInProgress ? (
                    <span className="text-sm font-bold text-primary">{i + 1}</span>
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cert.icon}</span>
                    <h3 className={`text-sm font-semibold truncate ${
                      isCompleted ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"
                    }`}>
                      {t(cert.title)}
                    </h3>
                  </div>
                  {isInProgress && data && (
                    <div className="flex items-center gap-2 mt-1.5 ml-7">
                      <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${data.progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{data.progress}%</span>
                    </div>
                  )}
                </div>

                {/* Action */}
                {isCompleted ? (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                    {t({ en: "Done", fr: "Terminé" })}
                  </span>
                ) : isInProgress ? (
                  <span className="text-xs font-medium text-primary px-2 py-1 rounded-full bg-primary/10">
                    {t({ en: "In progress", fr: "En cours" })}
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
