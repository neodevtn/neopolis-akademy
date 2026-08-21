export function normalizeCourseRating(value: number): 1 | 2 | 3 {
  return Math.max(1, Math.min(3, Math.round(value))) as 1 | 2 | 3;
}

export function normalizeCourseFeedbackComment(value?: string): string | null {
  const normalized = value?.trim() || "";
  return normalized.length ? normalized : null;
}
