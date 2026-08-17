export function requiredCorrectAnswers(totalQuestions: number, configuredThreshold?: number) {
  const total = Math.max(0, Number(totalQuestions) || 0);
  if (total === 0) return 0;
  return Math.min(total, Math.max(1, Number(configuredThreshold) || total));
}

export function isEvaluationGateLocked({ totalQuestions, completedCorrectAnswers, configuredThreshold, required = true, reviewMode = false }: { totalQuestions: number; completedCorrectAnswers: number; configuredThreshold?: number; required?: boolean; reviewMode?: boolean }) {
  if (!required || reviewMode || totalQuestions <= 0) return false;
  return Math.max(0, completedCorrectAnswers) < requiredCorrectAnswers(totalQuestions, configuredThreshold);
}
