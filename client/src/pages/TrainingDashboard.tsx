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
  Bell,
  MailOpen,
  Mail,
  Inbox,
  Search,
  ChevronLeft,
  SlidersHorizontal,
  X,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { AchievementGallery } from "@/components/AchievementGallery";
import { CompetencyProfile } from "@/components/CompetencyProfile";
import { WeeklyGoalCard } from "@/components/WeeklyGoalCard";
import { OrientationPanel } from "@/components/OrientationPanel";
import { buildNavigationUrl } from "@shared/navigationUrls";
import { getCertificationCatalogMetrics } from "@/lib/catalogMetrics";
import { getLearnerDashboardTab, getLearnerOrientationAccess, type LearnerDashboardTab } from "@/lib/learnerDashboardNavigation";
import { buildRecommendedLearningPath } from "@/lib/recommendedLearningPath";
import { BrandLogo } from "@/components/BrandLogo";
import { TrainingSearchPanel } from "@/components/TrainingSearchPanel";
import { ReferralShareCard } from "@/components/ReferralShareCard";
import { ReferralProgramTab } from "@/components/ReferralProgramTab";
import { extractTargetJobRoles, getTrainingFormatDefinitions, resolveTrainingFormat } from "@/lib/trainingCatalogTaxonomy";
import { formatExamSummary, getTrainingExamInfo } from "@/lib/trainingExamMetadata";
import { isAdministrativeRole } from "@shared/roles";

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

export default function TrainingDashboard() {
  const { lang, t } = useLanguage();
  const { getCertProgress, getLastVisitedCourse } = useTrainingProgress();
  const { isAuthenticated, loading: authLoading, user, logout } = useAuth();
  const isAdmin = isAdministrativeRole(user?.role);
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const urlSearch = useSearch();
  const [activeTab, setActiveTab] = useState<LearnerDashboardTab>(() => getLearnerDashboardTab(urlSearch));
  useEffect(() => { setActiveTab(getLearnerDashboardTab(urlSearch)); }, [urlSearch]);
  const navigateTrainingDashboard = (tab: LearnerDashboardTab) => navigate(buildNavigationUrl("/training", { tab: tab === "my-path" ? null : tab }));
  const achievementsQuery = trpc.training.getAchievements.useQuery(undefined, { enabled: isAuthenticated });
  const competenciesQuery = trpc.competencies.getMine.useQuery(undefined, { enabled: isAuthenticated });
  const gamificationQuery = trpc.competencies.getGamification.useQuery(undefined, { enabled: isAuthenticated });
  const [communicationInboxFilters, setCommunicationInboxFilters] = useState({ page: 1, pageSize: 20, search: "", readState: "all" as "all" | "unread" | "read", importance: "all" as "all" | "important" });
  const learnerCommunicationsQuery = trpc.training.getCommunications.useQuery(communicationInboxFilters, { enabled: isAuthenticated });
  const markCommunicationReadMutation = trpc.training.markCommunicationRead.useMutation();
  const orientationQuery = trpc.orientation.getMine.useQuery(undefined, { enabled: isAuthenticated });
  const saveOrientationGoalsMutation = trpc.orientation.saveGoals.useMutation({ onSuccess: () => orientationQuery.refetch() });
  const completeOrientationMutation = trpc.orientation.completeDiagnostic.useMutation({ onSuccess: () => orientationQuery.refetch() });
  const respondToOrientationProposalMutation = trpc.orientation.respondToProposal.useMutation({ onSuccess: () => orientationQuery.refetch() });
  const orientationIsRequired = Boolean(orientationQuery.data?.needsOrientation);
  const orientationAccess = getLearnerOrientationAccess(orientationIsRequired);

  // Group configuration for the 4 certification tracks
  const GROUP_CONFIG = {
    anthropic_certification_preparation: {
      label: { en: "Anthropic Official Certification Preparation", fr: "Préparations aux certifications officielles Anthropic" },
      subtitle: { en: "Preparation courses for Claude Associate, Developer, and Architect examinations. The official certification is awarded separately by Anthropic.", fr: "Cours de préparation aux examens Claude Associate, Developer et Architect. La certification officielle est délivrée séparément par Anthropic." },
      badge: "Preparation",
      badgeColor: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
      hoverBorder: "hover:border-primary/30",
      hoverText: "group-hover:text-primary",
      progressColor: "bg-primary",
      iconBg: "bg-secondary",
      order: 1,
    },
    business_ai_literacy: {
      label: { en: "AI Foundations, Strategy & Governance", fr: "Fondamentaux, stratégie & gouvernance IA" },
      subtitle: { en: "Core AI literacy, strategy, governance and management for business professionals", fr: "Culture IA, stratégie, gouvernance et management pour les professionnels" },
      badge: "Accessible",
      badgeColor: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
      hoverBorder: "hover:border-emerald-400/30",
      hoverText: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
      progressColor: "bg-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
      order: 2,
    },
    fullstack_ai_engineering: {
      label: { en: "AI Engineering, RAG & MLOps", fr: "Ingénierie IA, RAG & MLOps" },
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
      label: { en: "Data, BI & AI Analytics", fr: "Data, BI & analytics IA" },
      subtitle: { en: "Data profiling, star schema modeling, DAX, Power BI, executive reporting with Codex", fr: "Profiling de données, modélisation en étoile, DAX, Power BI, reporting exécutif avec Codex" },
      badge: "BI",
      badgeColor: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
      hoverBorder: "hover:border-orange-400/30",
      hoverText: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
      progressColor: "bg-orange-500",
      iconBg: "bg-orange-50 dark:bg-orange-950/40",
      order: 4,
    },
    ia_appliquee_metiers_tp: {
      label: { en: "Applied AI for Business Roles – Labs", fr: "IA appliquée aux métiers - TP" },
      subtitle: { en: "Guided practical AI work by business role, with safe environment preparation and human validation", fr: "Travaux pratiques IA guidés par métier, avec préparation d’environnement sûre et validation humaine" },
      badge: "TP",
      badgeColor: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
      hoverBorder: "hover:border-violet-400/30",
      hoverText: "group-hover:text-violet-600 dark:group-hover:text-violet-400",
      progressColor: "bg-violet-500",
      iconBg: "bg-violet-50 dark:bg-violet-950/40",
      order: 5,
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
  const catalogGroupConfig = Object.fromEntries(categoryOverrides.map((category: any) => {
    const config = (GROUP_CONFIG as Record<string, any>)[category.id] || GROUP_CONFIG.divers;
    return [category.id, {
      ...config,
      ...(category.title ? { label: category.title } : {}),
      ...(category.subtitle ? { subtitle: category.subtitle } : {}),
      ...(typeof category.order === "number" ? { order: category.order } : {}),
    }];
  }));

  const certCompletionData = useMemo(() => {
    return trainingIndex.certifications.map((cert) => {
      const courses = trainingIndex.courses.filter((c) => c.certId === cert.id);
      const courseIds = courses.map((c) => c.id);
      const totalLessonsMap: Record<string, number> = {};
      courses.forEach((c) => { totalLessonsMap[c.id] = c.lessonCount || 1; });
      const progressPct = getCertProgress(courseIds, totalLessonsMap);
      const metrics = getCertificationCatalogMetrics(cert.id, trainingIndex.courses);
      const examInfo = getTrainingExamInfo(trainingIndex as any, cert.id);
      return { id: cert.id, title: cert.title, icon: cert.icon, description: cert.description, level: cert.level, ...metrics, catalogTag: (cert as any).catalogTag, progress: progressPct, completed: progressPct >= 100, group: (cert as any).group, trainingFormat: resolveTrainingFormat(cert as any), examInfo, hasExam: Boolean(examInfo) };
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
              <BrandLogo className="h-8 max-w-[160px]" />
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

  const tabs: { id: LearnerDashboardTab; label: { en: string; fr: string }; icon: React.ReactNode }[] = [
    { id: "orientation", label: { en: "My Orientation", fr: "Mon orientation" }, icon: <Compass className="w-4 h-4" /> },
    { id: "my-path", label: { en: "My Progress", fr: "Mon Parcours" }, icon: <Compass className="w-4 h-4" /> },
    { id: "achievements", label: { en: "My Achievements", fr: "Mes acquis" }, icon: <Trophy className="w-4 h-4" /> },
    { id: "skills", label: { en: "My Skills", fr: "Mes compétences" }, icon: <Sparkles className="w-4 h-4" /> },
    { id: "catalog", label: { en: "Catalog", fr: "Catalogue" }, icon: <Library className="w-4 h-4" /> },
    { id: "parrainage", label: { en: "Referrals", fr: "Parrainage" }, icon: <Gift className="w-4 h-4" /> },
    { id: "recommended", label: { en: "Learning Path", fr: "Parcours recommandé" }, icon: <Route className="w-4 h-4" /> },
    { id: "communications", label: { en: "Notifications", fr: "Communiqués" }, icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto flex max-w-7xl min-w-0 items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
              <BrandLogo className="h-7 max-w-[82px] sm:h-8 sm:max-w-[160px]" />
              <span className="hidden rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary sm:inline-flex">Training</span>
            </div>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary sm:p-2"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <LanguageSwitcher />
            {isAdmin && (
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
                className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 p-1 text-xs font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5"
                title="Déconnexion"
              >
                <LogOut size={13} />
                <span className="hidden md:inline">Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
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

          <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>{t({ en: "Integrity reminder: complete activities yourself and use learning support responsibly. Unusual activity patterns may be reviewed by the academic team; no account is blocked automatically.", fr: "Rappel d’intégrité : réalisez les activités vous-même et utilisez les outils d’aide de manière responsable. Des comportements inhabituels peuvent être revus par l’équipe pédagogique ; aucun compte n’est bloqué automatiquement." })}</p>
          </div>

          {orientationAccess.showReminder && (
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/20 md:flex-row md:items-center md:justify-between" role="status" aria-live="polite">
              <div><p className="font-bold text-foreground">Votre orientation personnalisée est à finaliser</p><p className="mt-1 text-muted-foreground">Définissez vos objectifs et terminez le diagnostic rapide pour obtenir un parcours recommandé. Tous les onglets — parcours, acquis, compétences, catalogue et communiqués — restent disponibles pendant cette étape.</p></div>
              <Button className="shrink-0" onClick={() => navigateTrainingDashboard("orientation")}>Finaliser mon orientation</Button>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { value: String(trainingIndex.certifications.length), label: { en: "Certifications", fr: "Certifications" }, icon: <GraduationCap className="w-4 h-4" /> },
              { value: String(trainingIndex.courses.length), label: { en: "Courses", fr: "Cours" }, icon: <BookOpen className="w-4 h-4" /> },
              { value: String(certCompletionData.reduce((s: number, c: any) => s + c.videoCount, 0)), label: { en: "Videos", fr: "Vidéos" }, icon: <Play className="w-4 h-4" /> },
              { value: String(certCompletionData.reduce((s: number, c: any) => s + c.exerciseCount, 0)), label: { en: "Interactive exercises", fr: "Exercices interactifs" }, icon: <Dumbbell className="w-4 h-4" /> },
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
          <div className="mb-8 max-w-full overflow-x-auto rounded-xl bg-secondary/50 p-1">
            <div className="flex w-max min-w-full items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigateTrainingDashboard(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{t(tab.label)}</span>
                {tab.id === "communications" && (learnerCommunicationsQuery.data?.unreadCount || 0) > 0 && <span className="min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{learnerCommunicationsQuery.data?.unreadCount}</span>}
              </button>
            ))}
            </div>
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
              <div className="mt-6"><ReferralShareCard title="Partagez Neopolis Akademy avec votre réseau" /></div>
            </motion.div>
          )}
          {activeTab === "orientation" && (
            <motion.div
              key="orientation"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: easeOut }}
            >
              <OrientationPanel
                orientation={orientationQuery.data}
                certifications={trainingIndex.certifications as any[]}
                savingGoals={saveOrientationGoalsMutation.isPending}
                respondingToProposal={respondToOrientationProposalMutation.isPending}
                completing={completeOrientationMutation.isPending}
                onSaveGoals={(input) => saveOrientationGoalsMutation.mutate(input)}
                onCompleteDiagnostic={(answers) => completeOrientationMutation.mutate({ answers })}
                onRespondToProposal={(input) => respondToOrientationProposalMutation.mutate(input)}
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
                lang={lang}
                t={t}
              />
            </motion.div>
          )}
          {activeTab === "parrainage" && (
            <motion.div
              key="parrainage"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: easeOut }}
            >
              <ReferralProgramTab t={t} />
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
              <div className="mt-6"><ReferralShareCard content="achievement" achievementId={achievementsQuery.data?.[0]?.id} title="Partagez vos réussites et invitez votre réseau" /></div>
            </motion.div>
          )}
          {activeTab === "skills" && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: easeOut }}
            >
              <div className="space-y-5"><WeeklyGoalCard gamification={gamificationQuery.data} /><CompetencyProfile competencies={competenciesQuery.data || []} ranks={gamificationQuery.data?.ranks} /></div>
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
                orientation={orientationQuery.data}
                t={t}
              />
            </motion.div>
          )}
          {activeTab === "communications" && (
            <motion.div key="communications" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease: easeOut }}>
              <CommunicationsTab
                items={learnerCommunicationsQuery.data?.items || []}
                isLoading={learnerCommunicationsQuery.isLoading}
                page={learnerCommunicationsQuery.data?.page || communicationInboxFilters.page}
                total={learnerCommunicationsQuery.data?.total || 0}
                totalPages={learnerCommunicationsQuery.data?.totalPages || 1}
                filters={communicationInboxFilters}
                onFiltersChange={setCommunicationInboxFilters}
                onRead={async (communicationId) => {
                  await markCommunicationReadMutation.mutateAsync({ communicationId });
                  await learnerCommunicationsQuery.refetch();
                }}
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

/* ─── Tab: Learner communications ─── */
type CommunicationItem = { id: number; subject: string; body: string; type: string; isImportant: number; sentAt: Date | string | null; createdAt: Date | string; isRead: boolean; isAcknowledged: boolean };
type CommunicationFilters = { page: number; pageSize: number; search: string; readState: "all" | "unread" | "read"; importance: "all" | "important" };

function communicationsPreview(body: string) {
  return body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function CommunicationsTab({ items, isLoading, page, total, totalPages, filters, onFiltersChange, onRead }: { items: CommunicationItem[]; isLoading: boolean; page: number; total: number; totalPages: number; filters: CommunicationFilters; onFiltersChange: (filters: CommunicationFilters) => void; onRead: (communicationId: number) => Promise<void> }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState(filters.search);
  const [optimisticReadIds, setOptimisticReadIds] = useState<Set<number>>(() => new Set());
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!items.length) { setSelectedId(null); return; }
    if (!items.some((item) => item.id === selectedId)) setSelectedId(items.find((item) => !item.isRead)?.id || items[0].id);
  }, [items, selectedId]);
  useEffect(() => { setSearchInput(filters.search); }, [filters.search]);
  useEffect(() => () => { if (searchTimer.current) clearTimeout(searchTimer.current); }, []);

  const selected = items.find((item) => item.id === selectedId) || null;
  const isRead = (item: CommunicationItem) => item.isRead || optimisticReadIds.has(item.id);
  const openMessage = async (item: CommunicationItem) => {
    setSelectedId(item.id);
    if (isRead(item)) return;
    setOptimisticReadIds((current) => new Set(current).add(item.id));
    try {
      await onRead(item.id);
    } catch {
      setOptimisticReadIds((current) => {
        const next = new Set(current);
        next.delete(item.id);
        return next;
      });
    }
  };
  const updateFilters = (update: Partial<CommunicationFilters>) => onFiltersChange({ ...filters, ...update, page: update.page ?? (Object.keys(update).some((key) => key !== "page") ? 1 : filters.page) });
  const updateSearch = (value: string) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => updateFilters({ search: value }), 300);
  };

  if (isLoading) return <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">Chargement des communiqués…</div>;
  return <section className="w-full max-w-full overflow-hidden rounded-2xl border border-border bg-card" aria-label="Boîte de réception des communiqués">
    <header className="border-b border-border bg-muted/25 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Inbox className="h-5 w-5 text-primary" /><div><h2 className="font-semibold text-foreground">Boîte de réception</h2><p className="text-xs text-muted-foreground">{total} communiqué{total > 1 ? "s" : ""}</p></div></div><div className="flex items-center gap-1 rounded-lg bg-background p-1" aria-label="Filtre de lecture"><button onClick={() => updateFilters({ readState: "all" })} className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${filters.readState === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Tous</button><button onClick={() => updateFilters({ readState: "unread" })} className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${filters.readState === "unread" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Non lus</button></div></div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row"><label className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={searchInput} onChange={(event) => updateSearch(event.target.value)} placeholder="Rechercher un communiqué" className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" /></label><select value={filters.importance} onChange={(event) => updateFilters({ importance: event.target.value as CommunicationFilters["importance"] })} className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground"><option value="all">Toutes priorités</option><option value="important">Importants</option></select></div>
    </header>
    {!items.length ? <div className="p-10 text-center"><MailOpen className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-medium">Aucun communiqué dans cette vue.</p><p className="mt-1 text-sm text-muted-foreground">Modifiez votre recherche ou vos filtres pour retrouver un message.</p></div> : <div className="grid min-h-[480px] w-full max-w-full grid-cols-1 lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.6fr)]">
      <div className="min-w-0 max-w-full border-b border-border lg:border-b-0 lg:border-r" role="listbox" aria-label="Liste des communiqués">{items.map((item) => { const itemIsRead = isRead(item); return <button key={item.id} type="button" role="option" aria-selected={selected?.id === item.id} onClick={() => { void openMessage(item); }} className={`block w-full min-w-0 border-b border-border px-4 py-4 text-left last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${selected?.id === item.id ? "bg-primary/8" : "hover:bg-muted/45"}`}><div className="flex min-w-0 items-start gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${itemIsRead ? "bg-transparent" : "bg-primary"}`} aria-label={itemIsRead ? "Lu" : "Non lu"} /><div className="min-w-0 flex-1"><div className="flex min-w-0 items-start justify-between gap-3"><span className={`min-w-0 truncate text-sm ${itemIsRead ? "font-medium" : "font-semibold"} text-foreground`}>{item.subject}</span><time className="shrink-0 text-[11px] text-muted-foreground">{new Date(item.sentAt || item.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</time></div><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{communicationsPreview(item.body)}</p><div className="mt-2 flex items-center gap-2">{item.isImportant === 1 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/35 dark:text-amber-300">Important</span>}{!itemIsRead && <span className="text-[10px] font-medium text-primary">Nouveau</span>}</div></div></div></button>; })}</div>
      <article className="min-w-0 max-w-full bg-background px-5 py-5 sm:px-7 sm:py-6" aria-live="polite">{selected && <><header className="border-b border-border pb-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2">{selected.isImportant === 1 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/35 dark:text-amber-300">Important</span>}<span className="text-xs text-muted-foreground">Communication Neopolis Akademy</span></div><h3 className="break-words text-lg font-semibold text-foreground sm:text-xl">{selected.subject}</h3></div><time className="text-xs text-muted-foreground">{new Date(selected.sentAt || selected.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</time></div></header><div className="prose prose-sm mt-6 max-w-none break-words text-foreground dark:prose-invert" dangerouslySetInnerHTML={{ __html: selected.body }} />{selected.isImportant === 1 && <footer className="mt-8 border-t border-border pt-4 text-sm">{selected.isAcknowledged ? <span className="inline-flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300"><MailOpen className="h-4 w-4" />Réception confirmée</span> : <span className="inline-flex items-center gap-2 font-medium text-amber-700 dark:text-amber-300"><Mail className="h-4 w-4" />Accusé de réception requis dans la fenêtre importante.</span>}</footer>}</>}</article>
    </div>}
    {totalPages > 1 && <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-3 text-sm"><span className="text-muted-foreground">Page {page} sur {totalPages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updateFilters({ page: page - 1 })}><ChevronLeft className="mr-1 h-4 w-4" />Précédent</Button><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => updateFilters({ page: page + 1 })}>Suivant<ChevronRight className="ml-1 h-4 w-4" /></Button></div></footer>}
  </section>;
}

/* ─── Tab: Catalog ─── */
function CatalogTab({
  certCompletionData,
  GROUP_CONFIG,
  lang,
  t,
}: {
  certCompletionData: any[];
  GROUP_CONFIG: any;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
}) {
  const [, navigate] = useLocation();
  const urlSearch = useSearch();

  type GroupKey = keyof typeof GROUP_CONFIG;
  const groups = Object.entries(GROUP_CONFIG) as [GroupKey, any][];
  const requestedGroup = new URLSearchParams(urlSearch).get("group") || "all";
  const selectedGroup = requestedGroup === "all" || groups.some(([key]) => key === requestedGroup) ? requestedGroup : "all";
  const requestedQuery = new URLSearchParams(urlSearch).get("search") || "";
  const navigateCatalog = (group: string, search: string) => navigate(buildNavigationUrl("/training", { tab: "catalog", group: group === "all" ? null : group, search: search || null }));
  const selectGroup = (group: string) => navigateCatalog(group, requestedQuery);
  const [levelFilter, setLevelFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [technologyFilter, setTechnologyFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [trainingFormatFilter, setTrainingFormatFilter] = useState("all");
  const [examFilter, setExamFilter] = useState<"all" | "with_exam" | "without_exam">("all");
  const trainingFormats = useMemo(() => getTrainingFormatDefinitions((trainingIndex as any).trainingFormats), []);
  const coursesByCertification = useMemo(() => {
    const values = new Map<string, any[]>();
    for (const course of (trainingIndex as any).courses || []) {
      values.set(course.certId, [...(values.get(course.certId) || []), course]);
    }
    return values;
  }, []);

  const catalogMetadata = useMemo(() => certCompletionData.map((cert) => {
    const source = JSON.stringify({ title: cert.title, description: cert.description, group: cert.group }).toLowerCase();
    const targetJobRoles = extractTargetJobRoles(coursesByCertification.get(cert.id) || []);
    const includes = (...terms: string[]) => terms.some((term) => source.includes(term));
    const skills = [
      includes("rag", "retrieval", "vector", "weaviate", "haystack", "llamaindex", "graph") && "rag",
      includes("agent", "langgraph", "crewai", "smolagent", "orchestrat") && "agents",
      includes("prompt", "copilot", "claude", "gemini") && "prompting",
      includes("python", "api", "fastapi", "pytorch", "databricks", "develop") && "development",
      includes("data", "bi", "analytics", "snowflake", "reporting") && "data_bi",
      includes("work", "word", "powerpoint", "sales", "marketing", "finance", "human resources") && "productivity",
    ].filter(Boolean) as string[];
    const technologies = [
      includes("claude") && "claude", includes("openai") && "openai", includes("langchain") && "langchain",
      includes("langgraph") && "langgraph", includes("hugging face") && "hugging_face", includes("pytorch") && "pytorch",
      includes("snowflake") && "snowflake", includes("databricks") && "databricks", includes("mongodb") && "mongodb",
      includes("weaviate") && "weaviate", includes("haystack") && "haystack", includes("crewai") && "crewai",
      includes("llamaindex") && "llamaindex", includes("google cloud") && "google_cloud", includes("copilot") && "microsoft_copilot",
      includes("windsurf") && "windsurf",
    ].filter(Boolean) as string[];
    const roles = [
      (skills.includes("development") || skills.includes("rag") || skills.includes("agents")) && "engineer",
      skills.includes("data_bi") && "analyst",
      (skills.includes("prompting") || skills.includes("productivity")) && "business",
      includes("strategy", "governance", "management", "consulting") && "manager",
      ...targetJobRoles,
    ].filter(Boolean) as string[];
    const activityCount = Number(cert.totalActivities || 0);
    const duration = activityCount <= 15 ? "short" : activityCount <= 30 ? "medium" : "long";
    const level = String((cert.level as any)?.en || "beginner").toLowerCase();
    return { id: cert.id, level, skills, roles: Array.from(new Set(roles)), technologies, duration, trainingFormat: cert.trainingFormat, hasExam: cert.hasExam };
  }), [certCompletionData, coursesByCertification]);
  const metadataByCertification = new Map(catalogMetadata.map((metadata) => [metadata.id, metadata]));
  const filterLabels = {
    skills: { rag: "RAG", agents: "Agents IA", prompting: "Prompt engineering", development: "Développement IA", data_bi: "Data & BI", productivity: "IA au travail" },
    roles: { engineer: "Ingénieur·e IA", analyst: "Data analyst / BI", business: "Métier & productivité", manager: "Manager / consultant" },
    technologies: { claude: "Claude", openai: "OpenAI", langchain: "LangChain", langgraph: "LangGraph", hugging_face: "Hugging Face", pytorch: "PyTorch", snowflake: "Snowflake", databricks: "Databricks", mongodb: "MongoDB", weaviate: "Weaviate", haystack: "Haystack", crewai: "CrewAI", llamaindex: "LlamaIndex", google_cloud: "Google Cloud", microsoft_copilot: "Microsoft Copilot", windsurf: "Windsurf" },
    durations: { short: "Courte — jusqu’à 15 activités", medium: "Moyenne — 16 à 30 activités", long: "Approfondie — plus de 30 activités" },
  } as const;
  const available = (key: "skills" | "roles" | "technologies") => Array.from(new Set(catalogMetadata.flatMap((metadata) => metadata[key]))).sort((a, b) => a.localeCompare(b, "fr"));
  const availableTrainingFormats = Array.from(new Set(catalogMetadata.map((metadata) => metadata.trainingFormat))).sort();
  const trainingFormatLabels = Object.fromEntries(trainingFormats.map((format) => [format.id, t(format.title)]));
  const filteredCerts = certCompletionData.filter((cert) => {
    const metadata = metadataByCertification.get(cert.id);
    return (selectedGroup === "all" || cert.group === selectedGroup)
      && (levelFilter === "all" || metadata?.level === levelFilter)
      && (skillFilter === "all" || metadata?.skills.includes(skillFilter))
      && (roleFilter === "all" || metadata?.roles.includes(roleFilter))
      && (technologyFilter === "all" || metadata?.technologies.includes(technologyFilter))
      && (durationFilter === "all" || metadata?.duration === durationFilter)
      && (trainingFormatFilter === "all" || metadata?.trainingFormat === trainingFormatFilter)
      && (examFilter === "all" || (examFilter === "with_exam" ? Boolean(metadata?.hasExam) : !metadata?.hasExam));
  });
  const clearAdvancedFilters = () => { setLevelFilter("all"); setSkillFilter("all"); setRoleFilter("all"); setTechnologyFilter("all"); setDurationFilter("all"); setTrainingFormatFilter("all"); setExamFilter("all"); };
  const hasAdvancedFilters = [levelFilter, skillFilter, roleFilter, technologyFilter, durationFilter, trainingFormatFilter, examFilter].some((filter) => filter !== "all");
  const certificationTitles = Object.fromEntries(certCompletionData.map((cert) => [cert.id, t(cert.title)]));

  return (
    <div className="space-y-6">
      <TrainingSearchPanel groups={groups as Array<[string, { label: { en: string; fr: string }; order: number }]>} certificationTitles={certificationTitles} initialQuery={requestedQuery} onQueryChange={(value) => navigateCatalog(selectedGroup, value)} />
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><SlidersHorizontal className="h-4 w-4 text-primary" />{t({ en: "Filter by learner profile", fr: "Filtrer selon votre profil" })}</div>
          {hasAdvancedFilters && <button onClick={clearAdvancedFilters} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"><X className="h-3.5 w-3.5" />{t({ en: "Reset filters", fr: "Réinitialiser" })}</button>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <label className="text-xs font-medium text-muted-foreground">{t({ en: "Level", fr: "Niveau" })}<select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"><option value="all">{t({ en: "All levels", fr: "Tous les niveaux" })}</option><option value="beginner">{t({ en: "Beginner", fr: "Débutant" })}</option><option value="intermediate">{t({ en: "Intermediate", fr: "Intermédiaire" })}</option><option value="advanced">{t({ en: "Advanced", fr: "Avancé" })}</option></select></label>
          <label className="text-xs font-medium text-muted-foreground">{t({ en: "Skill", fr: "Compétence" })}<select value={skillFilter} onChange={(event) => setSkillFilter(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"><option value="all">{t({ en: "All skills", fr: "Toutes les compétences" })}</option>{available("skills").map((value) => <option key={value} value={value}>{filterLabels.skills[value as keyof typeof filterLabels.skills]}</option>)}</select></label>
          <label className="text-xs font-medium text-muted-foreground">{t({ en: "Role", fr: "Métier" })}<select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"><option value="all">{t({ en: "All roles", fr: "Tous les métiers" })}</option>{available("roles").map((value) => <option key={value} value={value}>{filterLabels.roles[value as keyof typeof filterLabels.roles] || value}</option>)}</select></label>
          <label className="text-xs font-medium text-muted-foreground">{t({ en: "Technology", fr: "Technologie" })}<select value={technologyFilter} onChange={(event) => setTechnologyFilter(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"><option value="all">{t({ en: "All technologies", fr: "Toutes les technologies" })}</option>{available("technologies").map((value) => <option key={value} value={value}>{filterLabels.technologies[value as keyof typeof filterLabels.technologies]}</option>)}</select></label>
          <label className="text-xs font-medium text-muted-foreground">{t({ en: "Estimated duration", fr: "Durée estimée" })}<select value={durationFilter} onChange={(event) => setDurationFilter(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"><option value="all">{t({ en: "All durations", fr: "Toutes les durées" })}</option>{Object.entries(filterLabels.durations).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="text-xs font-medium text-muted-foreground">{t({ en: "Training type", fr: "Sous-catégorie de formation" })}<select value={trainingFormatFilter} onChange={(event) => setTrainingFormatFilter(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"><option value="all">{t({ en: "All training types", fr: "Toutes les sous-catégories" })}</option>{availableTrainingFormats.map((value) => <option key={value} value={value}>{trainingFormatLabels[value] || value}</option>)}</select></label>
          <label className="text-xs font-medium text-muted-foreground">{t({ en: "Certification exam", fr: "Examen de certification" })}<select value={examFilter} onChange={(event) => setExamFilter(event.target.value as "all" | "with_exam" | "without_exam")} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"><option value="all">{t({ en: "All trainings", fr: "Toutes les formations" })}</option><option value="with_exam">{t({ en: "With mock exam", fr: "Avec examen blanc" })}</option><option value="without_exam">{t({ en: "Without mock exam", fr: "Sans examen blanc" })}</option></select></label>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t({ en: "Duration is estimated from the published number of learning activities.", fr: "La durée est estimée à partir du nombre d’activités pédagogiques publiées." })}</p>
      </div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => selectGroup("all")}
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
                  onClick={() => selectGroup(keyStr)}
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
                  <div className="flex flex-wrap justify-end gap-1.5">
	                    {cert.catalogTag && <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{t(cert.catalogTag)}</span>}
	                    {cert.trainingFormat && <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">{trainingFormatLabels[cert.trainingFormat] || cert.trainingFormat}</span>}
	                    {cert.examInfo && <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{t({ en: "Mock exam", fr: "Examen blanc" })}</span>}
	                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${config.color}`}>{t(config.label)}</span>
	                  </div>
                </div>
                <h3 className={`text-base font-semibold text-foreground ${groupCfg.hoverText} transition-colors mb-2 leading-tight`}>{t(cert.title)}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{t(cert.description)}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap">
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{cert.courseCount} {t({ en: "courses", fr: "cours" })}</span>
                  <span className="flex items-center gap-1"><Library className="w-3.5 h-3.5" />{cert.totalActivities} {t({ en: "activities", fr: "activités" })}</span>
                  <span className="flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5" />{cert.exerciseCount} {t({ en: "interactive exercises", fr: "exercices interactifs" })}</span>
	                  {cert.videoCount > 0 && <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5" />{cert.videoCount} {t({ en: "videos", fr: "vidéos" })}</span>}
	                  {cert.downloadCount > 0 && <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" />{cert.downloadCount} {t({ en: "downloads", fr: "téléchargements" })}</span>}
	                </div>
	                {cert.examInfo && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"><p className="font-semibold">{t({ en: "Certification mock exam available", fr: "Examen blanc de certification disponible" })}</p><p className="mt-1">{formatExamSummary(cert.examInfo, lang)}</p></div>}
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
      {filteredCerts.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">{t({ en: "No course matches all selected criteria.", fr: "Aucune formation ne correspond à tous les critères sélectionnés." })}</div>}
    </div>
  );
}

/* ─── Tab: Recommended Path ─── */
function RecommendedTab({
  certCompletionData,
  orientation,
  t,
}: {
  certCompletionData: any[];
  orientation: any;
  t: (obj: { en: string; fr: string }) => string;
}) {
  const recommendedPath = buildRecommendedLearningPath({
    certifications: trainingIndex.certifications,
    orientationStatus: orientation?.profile?.status,
    orientationRecommendations: orientation?.recommendations,
  });

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Route className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            {t({ en: "Recommended Learning Path", fr: "Parcours d'apprentissage recommandé" })}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4 ml-8">
          {recommendedPath.personalized
            ? t({ en: "This order is based on your declared goals, diagnostic answers, and current skill levels.", fr: "Cet ordre est calculé à partir de vos objectifs, de vos réponses au diagnostic et de vos niveaux actuels." })
            : t({ en: "Complete Orientation to receive a path tailored to your goals and current level. Until then, the standard learning order remains visible.", fr: "Terminez Orientation et objectifs pour recevoir un parcours adapté à vos objectifs et à votre niveau. En attendant, l’ordre de formation standard reste affiché." })}
        </p>
        {!recommendedPath.personalized && (
          <div className="mb-6 ml-8 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/20 md:flex-row md:items-center md:justify-between">
            <span className="text-muted-foreground">{t({ en: "Your personalized recommendation will appear here after the diagnostic is completed.", fr: "Votre recommandation personnalisée apparaîtra ici dès la fin du diagnostic." })}</span>
            <Link href="/training?tab=orientation"><Button size="sm">{t({ en: "Complete orientation", fr: "Finaliser mon orientation" })}</Button></Link>
          </div>
        )}

        <div className="space-y-3">
          {recommendedPath.items.map(({ certification: cert, order, recommendation }) => {
            const data = certCompletionData.find((c) => c.id === cert.id);
            const isCompleted = data?.completed;
            const isInProgress = data && data.progress > 0 && !isCompleted;

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
                    <span className="text-sm font-bold text-primary">{order}</span>
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">{order}</span>
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
                  {recommendation && (
                    <p className="mt-1.5 text-xs text-muted-foreground">{recommendation.reason}</p>
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
