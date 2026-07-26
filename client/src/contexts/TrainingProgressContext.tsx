import { createContext, useContext, useCallback, ReactNode, useMemo, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import trainingIndex from "@/data/trainingIndex.json";

interface LastVisitedInfo {
  courseId: string;
  lessonIndex: number;
  chapterIndex: number;
  totalChapters: number;
  updatedAt: string;
}

interface TrainingProgressContextType {
  // Lesson-level progress
  isLessonComplete: (courseId: string, lessonIndex: number) => boolean;
  markLessonComplete: (certificationId: string, courseId: string, lessonIndex: number) => void;
  getNextUnlockedLesson: (courseId: string, totalLessons: number) => number;
  
  // Course-level progress (derived from lessons)
  isCourseComplete: (courseId: string, totalLessons: number) => boolean;
  getCertProgress: (courseIds: string[], totalLessonsMap: Record<string, number>) => number;
  
  // Certification completion check
  isCertComplete: (certId: string, courseIds: string[], totalLessonsMap: Record<string, number>) => boolean;
  
  // Chapter-level progress
  getChapterProgress: (courseId: string, lessonIndex: number) => { chapterIndex: number; totalChapters: number } | null;
  saveChapterProgress: (courseId: string, lessonIndex: number, chapterIndex: number, totalChapters: number) => void;
  getLastVisitedCourse: () => LastVisitedInfo | null;
  
  // Auth state
  isAuthenticated: boolean;
  isLoading: boolean;
}

const TrainingProgressContext = createContext<TrainingProgressContextType | undefined>(undefined);

export function TrainingProgressProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Track previous progress data to detect transitions
  const prevProgressRef = useRef<any[]>([]);

  const progressQuery = trpc.training.getProgress.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const chapterProgressQuery = trpc.training.getChapterProgress.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const saveChapterMutation = trpc.training.saveChapterProgress.useMutation({
    onSuccess: () => {
      chapterProgressQuery.refetch();
    },
  });

  const markLessonMutation = trpc.training.markLessonComplete.useMutation({
    onSuccess: (_data, variables) => {
      const { certificationId, courseId, lessonIndex } = variables;
      
      // Check if this lesson completion unlocks the next course or completes the certification
      const course = trainingIndex.courses.find((c) => c.id === courseId);
      if (course) {
        const totalLessons = course.lessonCount || 1;
        const currentCompletedCount = (progressQuery.data || []).filter(
          (p) => p.courseId === courseId
        ).length;
        
        // If this was the last lesson in the course
        if (currentCompletedCount + 1 >= totalLessons) {
          // Course completed notification
          toast.success("Cours terminé !", {
            description: `Vous avez terminé "${resolveTitle(course.title)}". Bravo !`,
            duration: 5000,
          });

          // Check if next course is now unlocked
          const certCourses = trainingIndex.courses.filter((c) => c.certId === certificationId);
          const courseIndex = certCourses.findIndex((c) => c.id === courseId);
          if (courseIndex >= 0 && courseIndex < certCourses.length - 1) {
            const nextCourse = certCourses[courseIndex + 1];
            setTimeout(() => {
              toast.info("Nouveau cours débloqué !", {
                description: `"${resolveTitle(nextCourse.title)}" est maintenant accessible.`,
                duration: 5000,
              });
            }, 1500);
          }

          // Check if all courses in the cert are now complete
          const allCertCoursesComplete = certCourses.every((c) => {
            if (c.id === courseId) return true; // current one just completed
            const total = c.lessonCount || 1;
            const completed = (progressQuery.data || []).filter((p) => p.courseId === c.id).length;
            return completed >= total;
          });

          if (allCertCoursesComplete) {
            const cert = trainingIndex.certifications.find((c) => c.id === certificationId);
            setTimeout(() => {
              toast.success("Certification disponible !", {
                description: `Tous les cours de "${resolveTitle(cert?.title)}" sont terminés. L'examen blanc est maintenant débloqué !`,
                duration: 7000,
              });
            }, 3000);
          }
        }
      }

      progressQuery.refetch();
    },
  });

  const progressData = progressQuery.data || [];
  const chapterProgressData = chapterProgressQuery.data || [];

  // Helper: for single-lesson courses (1 lesson with N chapters), chapter progress IS the progression unit
  // Returns how many "units" are completed for a given course considering both lesson-level and chapter-level progress
  const getCompletedUnits = useCallback((courseId: string, totalUnits: number): number => {
    // First check lesson-level completions
    const lessonCompletions = progressData.filter((p) => p.courseId === courseId).length;
    if (lessonCompletions > 0) return lessonCompletions;
    
    // For single-lesson courses, check chapter progress
    const chapterEntry = chapterProgressData.find(
      (cp) => cp.courseId === courseId && cp.lessonIndex === 0
    );
    if (chapterEntry && chapterEntry.totalChapters === totalUnits) {
      // chapterIndex is 0-based current position, chapters 0..chapterIndex-1 are completed
      return chapterEntry.chapterIndex;
    }
    return 0;
  }, [progressData, chapterProgressData]);

  const isLessonComplete = useCallback((courseId: string, lessonIndex: number) => {
    // Check lesson-level completion first
    const lessonDone = progressData.some(
      (p) => p.courseId === courseId && p.lessonIndex === lessonIndex
    );
    if (lessonDone) return lessonDone;
    
    // For single-lesson courses where chapters are the progression unit,
    // check if this "lesson" (actually chapter index) is before the current reading position
    const course = trainingIndex.courses.find((c) => c.id === courseId);
    if (course) {
      const chapterEntry = chapterProgressData.find(
        (cp) => cp.courseId === courseId && cp.lessonIndex === 0
      );
      if (chapterEntry && chapterEntry.totalChapters === (course.lessonCount || 1)) {
        // This is a single-lesson course using chapters as units
        return lessonIndex < chapterEntry.chapterIndex;
      }
    }
    return false;
  }, [progressData, chapterProgressData]);

  const markLessonComplete = useCallback((certificationId: string, courseId: string, lessonIndex: number) => {
    if (!isAuthenticated) return;
    markLessonMutation.mutate({ certificationId, courseId, lessonIndex });
  }, [isAuthenticated, markLessonMutation]);

  const getNextUnlockedLesson = useCallback((courseId: string, totalLessons: number) => {
    // Check lesson-level completions first
    const hasLessonCompletions = progressData.some((p) => p.courseId === courseId);
    if (hasLessonCompletions) {
      for (let i = 0; i < totalLessons; i++) {
        const completed = progressData.some(
          (p) => p.courseId === courseId && p.lessonIndex === i
        );
        if (!completed) return i;
      }
      return totalLessons;
    }
    
    // For single-lesson courses, use chapter progress
    const chapterEntry = chapterProgressData.find(
      (cp) => cp.courseId === courseId && cp.lessonIndex === 0
    );
    if (chapterEntry && chapterEntry.totalChapters === totalLessons) {
      return Math.min(chapterEntry.chapterIndex, totalLessons);
    }
    return 0;
  }, [progressData, chapterProgressData]);

  const isCourseComplete = useCallback((courseId: string, totalLessons: number) => {
    if (totalLessons === 0) return false;
    const completedCount = getCompletedUnits(courseId, totalLessons);
    return completedCount >= totalLessons;
  }, [getCompletedUnits]);

  const getCertProgress = useCallback((courseIds: string[], totalLessonsMap: Record<string, number>) => {
    const totalLessons = Object.values(totalLessonsMap).reduce((a, b) => a + b, 0);
    if (totalLessons === 0) return 0;
    let completedLessons = 0;
    for (const courseId of courseIds) {
      const total = totalLessonsMap[courseId] || 0;
      completedLessons += getCompletedUnits(courseId, total);
    }
    return Math.round((completedLessons / totalLessons) * 100);
  }, [getCompletedUnits]);

  const isCertComplete = useCallback((certId: string, courseIds: string[], totalLessonsMap: Record<string, number>) => {
    for (const courseId of courseIds) {
      const total = totalLessonsMap[courseId] || 0;
      if (total === 0) continue;
      const completed = getCompletedUnits(courseId, total);
      if (completed < total) return false;
    }
    return true;
  }, [getCompletedUnits]);

  const getChapterProgressFn = useCallback((courseId: string, lessonIndex: number) => {
    const entry = chapterProgressData.find(
      (cp) => cp.courseId === courseId && cp.lessonIndex === lessonIndex
    );
    if (!entry) return null;
    return { chapterIndex: entry.chapterIndex, totalChapters: entry.totalChapters };
  }, [chapterProgressData]);

  const getLastVisitedCourse = useCallback((): LastVisitedInfo | null => {
    if (chapterProgressData.length === 0) return null;
    // Find the most recently updated chapter progress entry
    const sorted = [...chapterProgressData].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });
    const latest = sorted[0];
    if (!latest) return null;
    return {
      courseId: latest.courseId,
      lessonIndex: latest.lessonIndex,
      chapterIndex: latest.chapterIndex,
      totalChapters: latest.totalChapters,
      updatedAt: latest.updatedAt ? String(latest.updatedAt) : '',
    };
  }, [chapterProgressData]);

  const saveChapterProgressFn = useCallback((courseId: string, lessonIndex: number, chapterIndex: number, totalChapters: number) => {
    if (!isAuthenticated) return;
    saveChapterMutation.mutate({ courseId, lessonIndex, chapterIndex, totalChapters });
  }, [isAuthenticated, saveChapterMutation]);

  const value = useMemo(() => ({
    isLessonComplete,
    markLessonComplete,
    getNextUnlockedLesson,
    isCourseComplete,
    getCertProgress,
    isCertComplete,
    getChapterProgress: getChapterProgressFn,
    saveChapterProgress: saveChapterProgressFn,
    getLastVisitedCourse,
    isAuthenticated,
    isLoading: authLoading || progressQuery.isLoading,
  }), [isLessonComplete, markLessonComplete, getNextUnlockedLesson, isCourseComplete, getCertProgress, isCertComplete, getChapterProgressFn, saveChapterProgressFn, getLastVisitedCourse, isAuthenticated, authLoading, progressQuery.isLoading]);

  return (
    <TrainingProgressContext.Provider value={value}>
      {children}
    </TrainingProgressContext.Provider>
  );
}

export function useTrainingProgress() {
  const ctx = useContext(TrainingProgressContext);
  if (!ctx) throw new Error("useTrainingProgress must be used within TrainingProgressProvider");
  return ctx;
}

// Helper to resolve i18n title
function resolveTitle(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val.fr || val.en || "";
  return String(val);
}
