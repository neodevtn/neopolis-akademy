export type LearningRole = "admin" | "user" | null | undefined;

export function isSequentialCourseCardLocked(input: {
  previousCourseCompleted: boolean;
  courseCompleted: boolean;
  courseStarted: boolean;
  role: LearningRole;
}): boolean {
  if (input.role === "admin") return false;
  return !input.previousCourseCompleted && !input.courseCompleted && !input.courseStarted;
}

export function isSequentialCourseRouteLocked(input: {
  previousCourseCompleted: boolean;
  role: LearningRole;
}): boolean {
  return input.role !== "admin" && !input.previousCourseCompleted;
}
