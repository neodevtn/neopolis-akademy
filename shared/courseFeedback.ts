export function normalizeCourseRating(value: number): 1 | 2 | 3 | 4 | 5 {
  return Math.max(1, Math.min(5, Math.round(value))) as 1 | 2 | 3 | 4 | 5;
}

export function normalizeCourseFeedbackComment(value?: string): string | null {
  const normalized = value?.trim() || "";
  return normalized.length ? normalized : null;
}
