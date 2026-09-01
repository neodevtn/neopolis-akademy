import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Link, useLocation, useParams, useSearch } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { getLoginUrl } from "@/const";
import trainingIndex from "@/data/trainingIndex.json";
import {
  ArrowLeft, CheckCircle2, PlayCircle, ChevronRight, ChevronLeft,
  BookOpen, Lock, LogIn, LogOut, ArrowRight, Moon, Sun, Menu, X, Check, Filter, Video, Eye,
  FileText, ChevronDown, Brain, Target, Trophy, Download, ArrowUp, Timer, RefreshCw, MessageSquareText, Loader2, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

// ─── Decomposed sub-components ───
import { resolveI18n } from "./training/contentDetectors";
import { getDisplayedChapterProgress, normalizeChapterProgress } from "./training/chapterProgress";
import { shouldRecordLearningTime } from "./training/learningTimeActivity";
import LessonViewer from "./training/LessonViewer";
import LessonSidebar from "./training/LessonSidebar";
import { useCourseData, prefetchCourse } from "@/hooks/useCourseData";
import { buildNavigationUrl } from "@shared/navigationUrls";
import { isSequentialCourseRouteLocked } from "@shared/learningAccess";
import { BrandLogo } from "@/components/BrandLogo";
import { CourseFeedbackPanel } from "@/components/CourseFeedbackPanel";
import { ReferralShareCard } from "@/components/ReferralShareCard";
import { getStandaloneTpCertificationId } from "@/lib/iaAppliedMetiersCatalog";
import { formatExamSummary, getTrainingExamInfo } from "@/lib/trainingExamMetadata";

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

export default function TrainingCourse() {
  const { certId, courseId } = useParams<{ certId: string; courseId: string }>();
  const [, navigate] = useLocation();
  const urlSearch = useSearch();
  const { lang, t } = useLanguage();
  const { isAuthenticated, loading: authLoading, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isLessonComplete, markLessonComplete, getNextUnlockedLesson, isCourseComplete, getChapterProgress: getPersistedChapterProgress, saveChapterProgress: persistChapterProgress } = useTrainingProgress();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number | null>(null);
  const [chapterProgress, setChapterProgress] = useState<{ current: number; total: number } | null>(null);
  const [chapterProgressLessonIndex, setChapterProgressLessonIndex] = useState<number | null>(null);
  const lastInteractionAtRef = useRef(Date.now());
  const mediaPlayingRef = useRef(false);
  const learningPositionRef = useRef<{ lessonIndex: number | null; chapterIndex?: number }>({ lessonIndex: null });

  useEffect(() => {
    const routeClass = "training-course-page";
    document.documentElement.classList.add(routeClass);
    document.body.classList.add(routeClass);
    return () => {
      document.documentElement.classList.remove(routeClass);
      document.body.classList.remove(routeClass);
    };
  }, []);

  const navigateCoursePosition = useCallback((lesson: number, chapter = 0) => {
    navigate(buildNavigationUrl(`/training/${certId}/${courseId}`, { lesson: Math.max(0, lesson), chapter: Math.max(0, chapter) }));
  }, [certId, courseId, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(urlSearch);
    const lesson = Number(params.get("lesson"));
    const chapter = Number(params.get("chapter"));
    if (Number.isInteger(lesson) && lesson >= 0) setActiveLessonIndex(lesson);
    if (Number.isInteger(chapter) && chapter >= 0) setChapterProgress((current) => ({ current: chapter, total: current?.total || 1 }));
  }, [urlSearch]);

  // Initialize persisted chapter progress. For multi-lesson courses it remains isolated
  // until an explicit LessonViewer callback associates it with the displayed lesson.
  const persistedChapterInit = getPersistedChapterProgress(courseId || "", 0);
  const hasInitializedChapter = useRef(false);
  useEffect(() => {
    const urlPinsChapter = new URLSearchParams(urlSearch).has("chapter");
    if (persistedChapterInit && !urlPinsChapter && !hasInitializedChapter.current && !chapterProgress) {
      setChapterProgress({ current: persistedChapterInit.chapterIndex, total: persistedChapterInit.totalChapters });
      hasInitializedChapter.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistedChapterInit, urlSearch]); // chapterProgress excluded to run only on init

  // Stable callback for chapter changes (prevents infinite re-render in LessonViewer)
  // MUST be declared before any conditional returns (Rules of Hooks)
  const handleChapterChange = useCallback((current: number, total: number) => {
    const safeProgress = normalizeChapterProgress({ current, total });
    setChapterProgress(safeProgress);
    navigateCoursePosition(0, safeProgress.current);
    // Persist chapter progress to database - uses refs/closures to avoid stale values
    if (courseId) {
      persistChapterProgress(courseId, 0, safeProgress.current, safeProgress.total);
    }
  }, [courseId, navigateCoursePosition, persistChapterProgress]);

  const handleMediaPlaybackChange = useCallback((isPlaying: boolean) => {
    mediaPlayingRef.current = isPlaying;
    if (isPlaying) lastInteractionAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    const recordInteraction = () => {
      lastInteractionAtRef.current = Date.now();
    };
    const activityEvents: Array<keyof WindowEventMap> = ["pointerdown", "mousemove", "keydown", "touchstart", "scroll", "focus"];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, recordInteraction, eventName === "scroll" || eventName === "touchstart" ? { passive: true } : undefined);
    });
    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, recordInteraction));
    };
  }, []);

  useEffect(() => {
    // A lesson change must not inherit the playing state of a previous media block.
    mediaPlayingRef.current = false;
    lastInteractionAtRef.current = Date.now();
  }, [courseId, activeLessonIndex]);

  useEffect(() => {
    learningPositionRef.current = {
      lessonIndex: activeLessonIndex,
      chapterIndex: chapterProgress?.current,
    };
  }, [activeLessonIndex, chapterProgress?.current]);

  // Server-synced video progress
  const videoProgressQuery = trpc.videoProgress.get.useQuery(
    { courseId: courseId || "" },
    { enabled: isAuthenticated && !!courseId }
  );
  const toggleVideoMutation = trpc.videoProgress.toggle.useMutation({
    onSuccess: () => { videoProgressQuery.refetch(); },
  });
  const learningTimeMutation = trpc.training.recordLearningTime.useMutation();
  const recordLearningTimeRef = useRef(learningTimeMutation.mutate);
  useEffect(() => {
    recordLearningTimeRef.current = learningTimeMutation.mutate;
  }, [learningTimeMutation.mutate]);

  useEffect(() => {
    if (!isAuthenticated || !courseId) return;
    const heartbeat = window.setInterval(() => {
      const position = learningPositionRef.current;
      if (position.lessonIndex === null || !shouldRecordLearningTime({
        now: Date.now(),
        lastInteractionAt: lastInteractionAtRef.current,
        mediaPlaying: mediaPlayingRef.current,
        isVisible: document.visibilityState === "visible",
      })) return;
      recordLearningTimeRef.current({
        certificationId: certId,
        courseId,
        lessonIndex: position.lessonIndex,
        chapterIndex: position.chapterIndex,
        durationSeconds: 60,
      });
    }, 60_000);
    return () => window.clearInterval(heartbeat);
  }, [isAuthenticated, certId, courseId]);

  // Derive completed set from server data (fallback to localStorage for non-auth)
  const completedVideos = useMemo(() => {
    if (videoProgressQuery.data) {
      return new Set(videoProgressQuery.data.map((vp: any) => vp.youtubeId));
    }
    // Fallback to localStorage if not authenticated
    try {
      const stored = localStorage.getItem(`video_progress_${courseId}`);
      return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
    } catch { return new Set<string>(); }
  }, [videoProgressQuery.data, courseId]);

  const course = trainingIndex.courses.find((c: any) => c.id === courseId);
  const cert = trainingIndex.certifications.find((c: any) => c.id === certId);
  const standaloneTpCertificationId = getStandaloneTpCertificationId(course, certId);
  const courseAccessQuery = trpc.trainingAccess.canOpen.useQuery(
    { courseId: courseId || "" },
    { enabled: isAuthenticated && !!courseId && user?.role !== "admin" },
  );

  // Course data with caching and prefetching
  const { courseLessons, courseExercises, courseSections, loading: lessonsLoading, error: courseLoadError, retry: retryCourseLoad } = useCourseData(courseId);

  // Prefetch next course in certification path for instant navigation
  const certCourses = trainingIndex.courses.filter((c: any) => c.certId === certId);
  const currentCourseIdx = certCourses.findIndex((c: any) => c.id === courseId);
  const dynamicExamQuery = trpc.training.getExamDefinition.useQuery({ certificationId: certId || "" }, { enabled: Boolean(certId) });
  const examInfo = dynamicExamQuery.isSuccess ? dynamicExamQuery.data : getTrainingExamInfo(trainingIndex as any, certId);
  useEffect(() => {
    if (currentCourseIdx >= 0 && currentCourseIdx < certCourses.length - 1) {
      const nextCourse = certCourses[currentCourseIdx + 1];
      prefetchCourse(nextCourse.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (!standaloneTpCertificationId || !courseId) return;
    navigate(`/training/${standaloneTpCertificationId}/${courseId}${urlSearch ? `?${urlSearch}` : ""}`, { replace: true });
  }, [courseId, navigate, standaloneTpCertificationId, urlSearch]);

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
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link href="/training" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <BrandLogo className="h-8 max-w-[160px]" />
              <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase">Training</span>
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
              {t({ en: "You must be logged in to access courses.", fr: "Vous devez être connecté pour accéder aux cours." })}
            </p>
            <Button onClick={() => { window.location.href = getLoginUrl(); }} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl">
              {t({ en: "Log in", fr: "Se connecter" })}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (user?.role !== "admin" && courseAccessQuery.isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (user?.role !== "admin" && courseAccessQuery.data && !courseAccessQuery.data.allowed) {
    const inactive = courseAccessQuery.data.reason === "course_inactive";
    return <div className="min-h-screen bg-background"><main className="mx-auto max-w-lg px-5 py-28 text-center"><div className="rounded-2xl border border-border bg-card p-9"><Lock className="mx-auto mb-5 h-10 w-10 text-amber-600" /><h1 className="text-xl font-bold text-foreground">{inactive ? "Formation temporairement indisponible" : "Formation visible, accès non attribué"}</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{inactive ? (courseAccessQuery.data.lifecycle?.reason || "Cette formation a été désactivée ou archivée par l’administration. Elle reste visible au catalogue mais ne peut pas être ouverte actuellement.") : "Cette formation est disponible au catalogue, mais n’est pas encore affectée à l’un de vos groupes d’apprenants. Contactez votre administrateur."}</p><Button className="mt-6" variant="outline" onClick={() => navigate("/training")}>Retour au catalogue</Button></div></main></div>;
  }

  if (standaloneTpCertificationId) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

    if (!course || !cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{t({ en: "Course not found", fr: "Cours introuvable" })}</p>
      </div>
    );
  }
  // Sequential lock guard: prevent direct URL access to locked courses
  const courseIdx = certCourses.findIndex((c: any) => c.id === courseId);
  if (courseIdx > 0) {
    const prevCourse = certCourses[courseIdx - 1];
    const prevTotal = prevCourse.lessonCount || 1;
    const prevComplete = isCourseComplete(prevCourse.id, prevTotal);
    if (isSequentialCourseRouteLocked({ previousCourseCompleted: prevComplete, role: user?.role })) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="max-w-md text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">
              {t({ en: "Course Locked", fr: "Cours verrouill\u00e9" })}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t({ en: `You must complete "${typeof prevCourse.title === 'object' ? (prevCourse.title as any)[lang] || (prevCourse.title as any).en : prevCourse.title}" first.`, fr: `Vous devez d'abord terminer "${typeof prevCourse.title === 'object' ? (prevCourse.title as any)[lang] || (prevCourse.title as any).fr : prevCourse.title}".` })}
            </p>
            <Link href={`/training/${certId}`}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {t({ en: "Back to certification", fr: "Retour \u00e0 la certification" })}
              </Button>
            </Link>
          </div>
        </div>
      );
    }
  }
  // Wait for lessons to load before rendering the course content
  if (lessonsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{t({ en: "Loading course...", fr: "Chargement du cours..." })}</p>
        </div>
      </div>
    );
  }

  // For single-lesson courses with multiple chapters, treat chapters as progression units
  const isSingleLessonCourse = courseLessons.length === 1 && (courseLessons[0]?.chapters?.length || 0) > 1;
  const totalProgressUnits = isSingleLessonCourse
    ? (courseLessons[0]?.chapters?.length || 1)
    : courseLessons.length;
  const totalLessons = totalProgressUnits;
  const isNovasavoCourse = course.id === "automatisation_comptable_ia__01";
  const novasavoUnitsTotal = isNovasavoCourse
    ? Math.max(1, courseLessons.filter((lesson) => lesson.id !== "novasavo_final_exam").length)
    : totalLessons;
  const completed = isCourseComplete(course.id, totalLessons);
  const isLastCourseInCertification = currentCourseIdx >= 0 && currentCourseIdx === certCourses.length - 1;
  const shouldPromptCertificationExam = completed && Boolean(examInfo) && isLastCourseInCertification;
  const nextUnlocked = isSingleLessonCourse
    ? (() => {
        const persisted = getPersistedChapterProgress(course.id, 0);
        // chapterIndex is the current reading position (0-based)
        // Chapters 0..chapterIndex-1 are completed, chapterIndex is the "next unlocked" (current)
        return persisted ? Math.min(persisted.chapterIndex, totalLessons) : 0;
      })()
    : getNextUnlockedLesson(course.id, totalLessons);
  const activeMultiLessonIndex = activeLessonIndex ?? nextUnlocked;
  const visibleUnitCurrent = isNovasavoCourse
    ? Math.min(activeMultiLessonIndex + 1, novasavoUnitsTotal)
    : Math.min(nextUnlocked, totalLessons);
  const activeMultiLessonChapterTotal = Math.max(1, courseLessons[activeMultiLessonIndex]?.chapters?.length || 1);
  const videos = course.videos || [];


  const toggleVideoComplete = (videoId: string) => {
    if (isAuthenticated && courseId) {
      toggleVideoMutation.mutate({ courseId, youtubeId: videoId });
    } else {
      // Fallback to localStorage for non-authenticated users
      try {
        const stored = localStorage.getItem(`video_progress_${courseId}`);
        const set = stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
        if (set.has(videoId)) set.delete(videoId);
        else set.add(videoId);
        localStorage.setItem(`video_progress_${courseId}`, JSON.stringify(Array.from(set)));
      } catch { /* ignore localStorage errors */ }
    }
  };


  const handleMarkLessonComplete = (lessonIndex: number) => {
    if (certId && courseId) {
      markLessonComplete(certId, courseId, lessonIndex);
    }
  };

  return (
    <div className="training-course-shell min-h-screen max-w-full overflow-x-hidden bg-background">
      {/* Header */}
      <header className="training-course-header sticky top-0 z-30 max-w-full bg-card/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto flex w-full min-w-0 max-w-7xl items-center justify-between px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href={`/training/${certId}`} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
              <BrandLogo className="h-7 max-w-[112px] shrink-0 object-contain sm:h-8 sm:max-w-[160px]" />
              <span className="hidden rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary sm:inline">Training</span>
            </div>
          </div>
          <div className="training-header-actions flex shrink-0 items-center gap-0.5 sm:gap-3">
            {certId && courseId ? <Button variant="ghost" size="sm" onClick={() => setShareOpen(true)} className="shrink-0 gap-1.5 px-2 text-muted-foreground hover:text-foreground sm:px-3" title="Partager cette formation">
              <Share2 className="h-4 w-4" />
              <span className="hidden lg:inline">Partager</span>
            </Button> : null}
            {certId && courseId ? <Button variant="ghost" size="sm" onClick={() => setFeedbackOpen(true)} className="shrink-0 gap-1.5 px-2 text-muted-foreground hover:text-foreground sm:px-3" title="Donner un avis ou une suggestion">
              <MessageSquareText className="h-4 w-4" />
              <span className="hidden lg:inline">Avis</span>
            </Button> : null}
            <button
              onClick={toggleTheme}
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary sm:p-2"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="training-header-language shrink-0"><LanguageSwitcher /></div>
            <button
              onClick={() => logout()}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 px-2 py-1.5 text-xs font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30 sm:px-3"
              title="Déconnexion"
            >
              <LogOut size={13} />
              <span className="hidden lg:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {certId && courseId ? <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Votre avis et vos suggestions</DialogTitle>
            <DialogDescription>Votre retour est privé et aide l’équipe pédagogique à améliorer cette formation.</DialogDescription>
          </DialogHeader>
          <CourseFeedbackPanel certificationId={certId} courseId={courseId} />
        </DialogContent>
      </Dialog> : null}
      {certId && courseId ? <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Partager cette formation</DialogTitle>
            <DialogDescription>Votre lien unique permet d’attribuer les candidatures provenant de votre partage.</DialogDescription>
          </DialogHeader>
          <ReferralShareCard compact content="course" courseId={courseId} certificationId={certId} title={resolveI18n(course?.title, lang) || "Partagez cette formation"} />
        </DialogContent>
      </Dialog> : null}

      <div className="flex w-full min-w-0 max-w-full overflow-x-hidden">
        {/* Sidebar */}
        {!lessonsLoading && courseLessons.length > 0 && (
          <LessonSidebar
            lessons={isSingleLessonCourse
              ? (courseLessons[0]?.chapters || []).map((ch: any, i: number) => ({
                  id: ch.id || `chapter_${i}`,
                  title: ch.title || { en: `Chapter ${i + 1}`, fr: `Chapitre ${i + 1}` },
                  chapterType: ch.type || 'teaching',
                  hasVideo: ch.blocks?.some((b: any) => b.type === 'video') || false,
                  hasBucketSort: ch.blocks?.some((b: any) => b.type === 'bucket_sort') || false,
                }))
              : courseLessons
            }
            lang={lang}
            t={t}
            nextUnlocked={nextUnlocked}
            isLessonComplete={isSingleLessonCourse
              ? (cId: string, idx: number) => {
                  // For single-lesson courses, use persisted chapter progress for completion
                  // A chapter is complete if it's before the current reading position
                  const persisted = getPersistedChapterProgress(cId, 0);
                  if (persisted && idx < persisted.chapterIndex) return true;
                  if (chapterProgress && idx < chapterProgress.current) return true;
                  return false;
                }
              : isLessonComplete
            }
            courseId={course.id}
            sidebarOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            videos={videos}
            activeLessonIndex={isSingleLessonCourse
              ? (chapterProgress?.current ?? 0)
              : activeLessonIndex
            }
            onLessonClick={(idx) => {
              if (isSingleLessonCourse) {
                // Navigate to the chapter within the single lesson
                setActiveLessonIndex(0);
                setChapterProgress({ current: idx, total: courseLessons[0]?.chapters?.length || 1 });
                navigateCoursePosition(0, idx);
              } else {
                setActiveLessonIndex(idx);
                setChapterProgress({ current: 0, total: Math.max(1, courseLessons[idx]?.chapters?.length || 1) });
                setChapterProgressLessonIndex(idx);
                navigateCoursePosition(idx, 0);
              }
            }}
            chapterProgress={isSingleLessonCourse
              ? null
              : getDisplayedChapterProgress(
                  chapterProgress,
                  chapterProgressLessonIndex,
                  activeMultiLessonIndex,
                  activeMultiLessonChapterTotal,
                )}
            displayedLessonIndex={isSingleLessonCourse
              ? (chapterProgress?.current ?? 0)
              : (activeLessonIndex ?? nextUnlocked)
            }
            chaptersData={isSingleLessonCourse ? (courseLessons[0]?.chapters || []) : undefined}
            activeScreenIndex={undefined}
            onScreenClick={isSingleLessonCourse ? undefined : undefined}
            sections={isSingleLessonCourse ? undefined : courseSections}
          />
        )}

        {/* Main content */}
        <motion.main
          className="mx-auto w-full min-w-0 max-w-4xl flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Course Header */}
          <motion.div variants={fadeInUp} className="mb-6 w-full min-w-0 max-w-full rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <div className="flex items-center gap-2 text-sm mb-2 text-muted-foreground">
              <Link href="/training" className="hover:text-primary transition-colors">
                {t({ en: "Training", fr: "Formation" })}
              </Link>
              <span>/</span>
              <Link href={`/training/${certId}`} className="hover:text-primary transition-colors">
                {t(cert.title)}
              </Link>
            </div>
            <h1 className="mb-2 break-words text-2xl font-bold text-foreground">{t(course.title)}</h1>
            {/* Global progress summary */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">{visibleUnitCurrent}</span>
                <span>/ {isNovasavoCourse ? novasavoUnitsTotal : totalLessons} {isNovasavoCourse ? t({ en: "units", fr: "unités" }) : isSingleLessonCourse ? t({ en: "chapters", fr: "chapitres" }) : t({ en: "lessons", fr: "leçons" })}</span>
                {isNovasavoCourse && activeMultiLessonIndex >= novasavoUnitsTotal && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{t({ en: "Final exam", fr: "Examen final" })}</span>}
              </div>
              {videos.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-red-400" />
                  <span className="font-medium text-foreground">{completedVideos.size}</span>
                  <span>/ {videos.length} {t({ en: "videos", fr: "vidéos" })}</span>
                </div>
              )}
            </div>
            {/* Combined progress bar */}
            {totalLessons > 0 && (
              <div className="mt-4 space-y-2">
                {/* Lessons progress */}
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-14">{isNovasavoCourse ? t({ en: "Units", fr: "Unités" }) : isSingleLessonCourse ? t({ en: "Chapters", fr: "Chapitres" }) : t({ en: "Lessons", fr: "Leçons" })}</span>
                  <div className="flex-1 rounded-full h-2 bg-secondary">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((isNovasavoCourse ? visibleUnitCurrent : nextUnlocked) / (isNovasavoCourse ? novasavoUnitsTotal : totalLessons)) * 100)}%` }}
                      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap text-muted-foreground">
                    {isNovasavoCourse ? `${visibleUnitCurrent}/${novasavoUnitsTotal}` : `${Math.min(nextUnlocked, totalLessons)}/${totalLessons}`}
                  </span>
                </div>
                {/* Videos progress */}
                {videos.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-14">{t({ en: "Videos", fr: "Vidéos" })}</span>
                    <div className="flex-1 rounded-full h-2 bg-secondary">
                      <motion.div
                        className="bg-red-400 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${videos.length > 0 ? (completedVideos.size / videos.length) * 100 : 0}%` }}
                        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                      />
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap text-muted-foreground">
                      {completedVideos.size}/{videos.length}
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Active Lesson Viewer */}
          {lessonsLoading ? (
            <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-sm" role="status" aria-live="polite">
              <div className="w-6 h-6 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">{t({ en: "Preparing your course…", fr: "Préparation de votre cours…" })}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t({ en: "Videos, slides, and interactive activities are loading.", fr: "Vidéos, slides et activités interactives sont en cours de chargement." })}</p>
              {courseLoadError === "slow" && <p className="mt-3 text-xs text-amber-700">{t({ en: "This is taking longer than expected. You can keep this page open or retry now.", fr: "Le chargement prend plus de temps que prévu. Vous pouvez patienter ou relancer maintenant." })}</p>}
              {courseLoadError === "slow" && <Button className="mt-3" size="sm" variant="outline" onClick={retryCourseLoad}><RefreshCw className="mr-1.5 h-3.5 w-3.5" />{t({ en: "Retry", fr: "Réessayer" })}</Button>}
            </div>
          ) : courseLoadError === "failed" ? (
            <div className="bg-card rounded-2xl border border-amber-200 p-8 text-center shadow-sm">
              <p className="font-medium text-foreground">{t({ en: "The course could not be loaded.", fr: "Le cours n’a pas pu être chargé." })}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t({ en: "Check your connection and retry. Your progress is preserved.", fr: "Vérifiez votre connexion puis réessayez. Votre progression est conservée." })}</p>
              <Button className="mt-4" size="sm" onClick={retryCourseLoad}><RefreshCw className="mr-1.5 h-3.5 w-3.5" />{t({ en: "Retry loading", fr: "Relancer le chargement" })}</Button>
            </div>
          ) : courseLessons.length > 0 && (() => {
            // Determine which lesson to display: review mode or current
            // For single-lesson courses, always display the single lesson (index 0)
            // and use chapter-based navigation within it
            const displayedIndex = isSingleLessonCourse ? 0 : (activeLessonIndex ?? nextUnlocked);
            const displayedLesson = courseLessons[displayedIndex];
            const isReviewMode = isSingleLessonCourse
              ? (chapterProgress !== null && chapterProgress.current < nextUnlocked)
              : (activeLessonIndex !== null && (isLessonComplete(course.id, activeLessonIndex) || user?.role === "admin"));
            const isCurrentLesson = isSingleLessonCourse
              ? !completed
              : (user?.role === "admin" || (displayedIndex === nextUnlocked && !isLessonComplete(course.id, nextUnlocked)));

            // If no active review and current lesson is completed, show nothing (course complete state handles it)
            if (!displayedLesson) return null;
            if (!isSingleLessonCourse && !isReviewMode && !isCurrentLesson) {
              const resumeLesson = courseLessons[nextUnlocked];
              return (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 text-center dark:border-amber-900/60 dark:bg-amber-950/20">
                  <Lock className="mx-auto mb-3 h-8 w-8 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-lg font-semibold text-foreground">Unité verrouillée</h2>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                    Terminez l’unité actuellement disponible avant de poursuivre ce parcours séquentiel.
                  </p>
                  <Button
                    className="mt-5"
                    onClick={() => {
                      const resumeTotal = Math.max(1, courseLessons[nextUnlocked]?.chapters?.length || 1);
                      setActiveLessonIndex(nextUnlocked);
                      setChapterProgress({ current: 0, total: resumeTotal });
                      setChapterProgressLessonIndex(nextUnlocked);
                      navigateCoursePosition(nextUnlocked, 0);
                    }}
                  >
                    Reprendre {resumeLesson ? `l’unité ${nextUnlocked + 1}` : "le parcours"}
                  </Button>
                </div>
              );
            }

            // Match videos to this lesson by title
            const lessonTitle = (resolveI18n(displayedLesson.title, "en") || "").toLowerCase().trim();
            const lessonVideos = videos.filter((v: any) => {
              const vTitle = (resolveI18n(v.title, "en") || "").toLowerCase().trim();
              return vTitle === lessonTitle;
            });

            return (
              <div
                className={`border-2 rounded-2xl overflow-hidden shadow-sm ${
                  isReviewMode ? "border-amber-500/50" : "border-primary"
                }`}
              >
                <div className={`p-4 border-b ${
                  isReviewMode ? "border-amber-500/30 bg-amber-500/5" : "border-primary/30 bg-primary/5"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isReviewMode ? "bg-amber-500" : "bg-primary"
                    }`}>
                      <span className="text-white text-xs font-bold">{displayedIndex + 1}</span>
                    </div>
                    <span className="font-semibold text-sm text-foreground">
                      {resolveI18n(displayedLesson.title, lang)}
                    </span>
                    {lessonVideos.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <PlayCircle className="w-3 h-3" />
                        {lessonVideos.length} {lessonVideos.length > 1 ? "vidéos" : "vidéo"}
                      </span>
                    )}
                    {isReviewMode ? (
                      <span className="ml-auto inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Eye className="w-3 h-3" />
                        {t({ en: "Review Mode", fr: "Mode Révision" })}
                      </span>
                    ) : (
                      <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium bg-primary/10 text-primary">
                        {t({ en: "In Progress", fr: "En cours" })}
                      </span>
                    )}
                  </div>
                  {isReviewMode && (
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (isSingleLessonCourse) {
                            // Return to the current chapter (nextUnlocked position)
                            setChapterProgress({ current: nextUnlocked, total: totalLessons });
                          } else {
                            setActiveLessonIndex(null);
                          }
                        }}
                        className="text-xs gap-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        {t({ en: "Back to current lesson", fr: "Retour au cours actuel" })}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="min-w-0 max-w-full p-4 sm:p-8">
                  <LessonViewer
                    key={displayedLesson.id || String(displayedIndex)}
                    lesson={displayedLesson}
                    lessonIndex={displayedIndex}
                    lang={lang}
                    t={t}
                    certId={certId || ""}
                    courseId={courseId || ""}
                    courseTheme={(course as any)?.learningTheme || (courseId === "automatisation_comptable_ia__01" ? "finance-ledger" : "neopolis")}
                    onComplete={() => {
                      if (isSingleLessonCourse) {
                        // For single-lesson courses, advance chapter progress to the end
                        const totalChaps = courseLessons[0]?.chapters?.length || 1;
                        setChapterProgress({ current: totalChaps, total: totalChaps });
                        // Persist chapter progress to DB (marks all chapters as done)
                        if (course?.id) {
                          persistChapterProgress(course.id, 0, totalChaps, totalChaps);
                        }
                        // Also mark lesson 0 as complete in training_progress table
                        handleMarkLessonComplete(0);
                      } else {
                       handleMarkLessonComplete(displayedIndex);
                        // Auto-advance to next lesson after completing current one
                        const nextLessonIdx = displayedIndex + 1;
                        if (nextLessonIdx < courseLessons.length) {
                          setTimeout(() => {
                            setActiveLessonIndex(nextLessonIdx);
                            setChapterProgress({ current: 0, total: Math.max(1, courseLessons[nextLessonIdx]?.chapters?.length || 1) });
                            setChapterProgressLessonIndex(nextLessonIdx);
                            navigateCoursePosition(nextLessonIdx, 0);
                          }, 300);
                        }
                      }
                    }}
                    matchedVideos={lessonVideos}
                    completedVideos={completedVideos}
                    toggleVideoComplete={toggleVideoComplete}
                    isReviewMode={isReviewMode}
                    courseExercises={courseExercises}
                    onMediaPlaybackChange={handleMediaPlaybackChange}
                    onChapterChange={(current, total) => {
                      if (isSingleLessonCourse) {
                        handleChapterChange(current, total);
                        return;
                      }
                      setChapterProgress(normalizeChapterProgress({ current, total }));
                      setChapterProgressLessonIndex(displayedIndex);
                      navigateCoursePosition(displayedIndex, current);
                    }}
                    initialChapter={Math.min(chapterProgress?.current ?? 0, (displayedLesson?.chapters?.length || 1) - 1)}
                  />
                </div>
              </div>
            );
          })()}



          {/* Course Completion */}
          {completed && (
            <motion.div variants={fadeInUp} className="flex items-center gap-4 border border-primary/30 rounded-2xl p-6 bg-primary/5">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">
                  {t({ en: "Course completed!", fr: "Cours terminé !" })}
                </h3>
	                <p className="text-sm text-muted-foreground">
	                  {shouldPromptCertificationExam
	                    ? t({ en: "Great job! You have completed the final course required for the certification mock exam.", fr: "Bravo ! Vous avez terminé le dernier cours requis pour l’examen blanc de certification." })
	                    : t({ en: "Great job! You can move on to the next course.", fr: "Bravo ! Vous pouvez passer au cours suivant." })}
	                </p>
	                {shouldPromptCertificationExam && <p className="mt-2 text-sm font-medium text-primary">{formatExamSummary(examInfo, lang)}</p>}
	                <div className="mt-3 flex flex-wrap gap-2">
	                  {shouldPromptCertificationExam && <Link href={`/mock-exam/${certId}`}>
	                    <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 gap-1.5">
	                      {t({ en: "Take the mock exam", fr: "Passer l’examen blanc" })}
	                      <Trophy className="w-4 h-4" />
	                    </Button>
	                  </Link>}
	                  <Link href={`/training/${certId}`}>
	                    <Button size="sm" variant={shouldPromptCertificationExam ? "outline" : "default"} className={shouldPromptCertificationExam ? "gap-1.5" : "bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"}>
	                      {t({ en: "Back to certification", fr: "Retour à la certification" })}
	                      <ArrowRight className="w-4 h-4" />
	                    </Button>
	                  </Link>
	                </div>
	                {certId && courseId ? <CourseFeedbackPanel certificationId={certId} courseId={courseId} /> : null}
              </div>
            </motion.div>
          )}
        </motion.main>
      </div>
    </div>
  );
}
