import { createContext, useContext, useCallback, ReactNode, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

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
  
  // Auth state
  isAuthenticated: boolean;
  isLoading: boolean;
}

const TrainingProgressContext = createContext<TrainingProgressContextType | undefined>(undefined);

export function TrainingProgressProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const progressQuery = trpc.training.getProgress.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const markLessonMutation = trpc.training.markLessonComplete.useMutation({
    onSuccess: () => {
      progressQuery.refetch();
    },
  });

  const progressData = progressQuery.data || [];

  const isLessonComplete = useCallback((courseId: string, lessonIndex: number) => {
    return progressData.some(
      (p) => p.courseId === courseId && p.lessonIndex === lessonIndex
    );
  }, [progressData]);

  const markLessonComplete = useCallback((certificationId: string, courseId: string, lessonIndex: number) => {
    if (!isAuthenticated) return;
    markLessonMutation.mutate({ certificationId, courseId, lessonIndex });
  }, [isAuthenticated, markLessonMutation]);

  const getNextUnlockedLesson = useCallback((courseId: string, totalLessons: number) => {
    // Find the first lesson that is not complete
    for (let i = 0; i < totalLessons; i++) {
      const completed = progressData.some(
        (p) => p.courseId === courseId && p.lessonIndex === i
      );
      if (!completed) return i;
    }
    return totalLessons; // All complete
  }, [progressData]);

  const isCourseComplete = useCallback((courseId: string, totalLessons: number) => {
    if (totalLessons === 0) return false;
    const completedCount = progressData.filter((p) => p.courseId === courseId).length;
    return completedCount >= totalLessons;
  }, [progressData]);

  const getCertProgress = useCallback((courseIds: string[], totalLessonsMap: Record<string, number>) => {
    const totalLessons = Object.values(totalLessonsMap).reduce((a, b) => a + b, 0);
    if (totalLessons === 0) return 0;
    const completedLessons = progressData.filter((p) => courseIds.includes(p.courseId)).length;
    return Math.round((completedLessons / totalLessons) * 100);
  }, [progressData]);

  const isCertComplete = useCallback((certId: string, courseIds: string[], totalLessonsMap: Record<string, number>) => {
    for (const courseId of courseIds) {
      const total = totalLessonsMap[courseId] || 0;
      if (total === 0) continue;
      const completed = progressData.filter((p) => p.courseId === courseId).length;
      if (completed < total) return false;
    }
    return true;
  }, [progressData]);

  const value = useMemo(() => ({
    isLessonComplete,
    markLessonComplete,
    getNextUnlockedLesson,
    isCourseComplete,
    getCertProgress,
    isCertComplete,
    isAuthenticated,
    isLoading: authLoading || progressQuery.isLoading,
  }), [isLessonComplete, markLessonComplete, getNextUnlockedLesson, isCourseComplete, getCertProgress, isCertComplete, isAuthenticated, authLoading, progressQuery.isLoading]);

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
