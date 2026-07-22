import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ProgressData {
  completedCourses: string[];
  completedExercises: string[];
  examScores: Record<string, { score: number; total: number; date: string }>;
}

interface TrainingProgressContextType {
  progress: ProgressData;
  markCourseComplete: (courseId: string) => void;
  markExerciseComplete: (exerciseId: string) => void;
  saveExamScore: (certId: string, score: number, total: number) => void;
  isCourseComplete: (courseId: string) => boolean;
  getCertProgress: (courseIds: string[]) => number;
  resetProgress: () => void;
}

const STORAGE_KEY = "neopolis_training_progress";

const defaultProgress: ProgressData = {
  completedCourses: [],
  completedExercises: [],
  examScores: {},
};

function loadProgress(): ProgressData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultProgress;
}

function saveProgress(data: ProgressData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const TrainingProgressContext = createContext<TrainingProgressContextType | undefined>(undefined);

export function TrainingProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressData>(loadProgress);

  const markCourseComplete = useCallback((courseId: string) => {
    setProgress((prev) => {
      if (prev.completedCourses.includes(courseId)) return prev;
      const next = { ...prev, completedCourses: [...prev.completedCourses, courseId] };
      saveProgress(next);
      return next;
    });
  }, []);

  const markExerciseComplete = useCallback((exerciseId: string) => {
    setProgress((prev) => {
      if (prev.completedExercises.includes(exerciseId)) return prev;
      const next = { ...prev, completedExercises: [...prev.completedExercises, exerciseId] };
      saveProgress(next);
      return next;
    });
  }, []);

  const saveExamScore = useCallback((certId: string, score: number, total: number) => {
    setProgress((prev) => {
      const next = {
        ...prev,
        examScores: {
          ...prev.examScores,
          [certId]: { score, total, date: new Date().toISOString() },
        },
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const isCourseComplete = useCallback((courseId: string) => {
    return progress.completedCourses.includes(courseId);
  }, [progress.completedCourses]);

  const getCertProgress = useCallback((courseIds: string[]) => {
    if (courseIds.length === 0) return 0;
    const completed = courseIds.filter((id) => progress.completedCourses.includes(id)).length;
    return Math.round((completed / courseIds.length) * 100);
  }, [progress.completedCourses]);

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress);
    saveProgress(defaultProgress);
  }, []);

  return (
    <TrainingProgressContext.Provider
      value={{ progress, markCourseComplete, markExerciseComplete, saveExamScore, isCourseComplete, getCertProgress, resetProgress }}
    >
      {children}
    </TrainingProgressContext.Provider>
  );
}

export function useTrainingProgress() {
  const ctx = useContext(TrainingProgressContext);
  if (!ctx) throw new Error("useTrainingProgress must be used within TrainingProgressProvider");
  return ctx;
}
