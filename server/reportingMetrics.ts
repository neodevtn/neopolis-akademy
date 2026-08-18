export function firstAttemptRate(successes: number, attempts: number): number | null {
  if (attempts <= 0) return null;
  return Math.round((successes / attempts) * 100);
}

export function engagementBucket(totalSeconds: number, hasCompletedLesson: boolean): "short" | "regular" | "deep" | "none" {
  if (totalSeconds > 120 * 60) return "deep";
  if (totalSeconds > 30 * 60) return "regular";
  if (totalSeconds > 0 || hasCompletedLesson) return "short";
  return "none";
}

/** Only these learning-path events contribute to learner reporting and rankings. */
export const PEDAGOGICAL_REPORTING_EVENT_TYPES = new Set([
  "learning_time",
  "lesson_completed",
  "chapter_progress",
  "exercise_submitted",
  "quiz_passed",
  "checkpoint_passed",
]);

export function isPedagogicalReportingEvent(eventType: string) {
  return PEDAGOGICAL_REPORTING_EVENT_TYPES.has(eventType);
}
