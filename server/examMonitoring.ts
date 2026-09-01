export type ExamMonitoringStatus = "passed" | "failed" | "timed_out";

export interface ExamMonitoringAttempt {
  id: number;
  userId: number;
  certificationId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: number;
  timedOut: number;
  startedAt: Date;
  finishedAt: Date;
  timeLimitMinutes: number | null;
}

export function examDurationSeconds(attempt: Pick<ExamMonitoringAttempt, "startedAt" | "finishedAt">): number {
  return Math.max(0, Math.round((new Date(attempt.finishedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000));
}

export function examAttemptStatus(attempt: Pick<ExamMonitoringAttempt, "passed" | "timedOut">): ExamMonitoringStatus {
  if (attempt.timedOut === 1) return "timed_out";
  return attempt.passed === 1 ? "passed" : "failed";
}

export function examScorePercent(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score / 10)));
}

export function buildExamMonitoringSummary(attempts: ExamMonitoringAttempt[]) {
  const count = attempts.length;
  const passedCount = attempts.filter((attempt) => attempt.passed === 1).length;
  const timedOutCount = attempts.filter((attempt) => attempt.timedOut === 1).length;
  const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const totalDurationSeconds = attempts.reduce((sum, attempt) => sum + examDurationSeconds(attempt), 0);
  return {
    attemptCount: count,
    uniqueLearners: new Set(attempts.map((attempt) => attempt.userId)).size,
    passedCount,
    failedCount: count - passedCount,
    timedOutCount,
    passRate: count ? Math.round((passedCount / count) * 1000) / 10 : 0,
    averageScore: count ? Math.round(totalScore / count) : 0,
    averagePercent: count ? Math.round(totalScore / count / 10) : 0,
    averageDurationSeconds: count ? Math.round(totalDurationSeconds / count) : 0,
  };
}
