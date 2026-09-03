import { canBypassLearningSequence, type UserRole } from "./roles";

export type LearningRole = UserRole | null | undefined;

export function isSequentialCourseCardLocked(input: {
  previousCourseCompleted: boolean;
  courseCompleted: boolean;
  courseStarted: boolean;
  role: LearningRole;
}): boolean {
  if (canBypassLearningSequence(input.role)) return false;
  return !input.previousCourseCompleted && !input.courseCompleted && !input.courseStarted;
}

export function isSequentialCourseRouteLocked(input: {
  previousCourseCompleted: boolean;
  role: LearningRole;
}): boolean {
  return !canBypassLearningSequence(input.role) && !input.previousCourseCompleted;
}

export function isSequentialLessonLocked(input: {
  lessonIndex: number;
  nextUnlocked: number;
  role: LearningRole;
}): boolean {
  return !canBypassLearningSequence(input.role) && input.lessonIndex > input.nextUnlocked;
}
