export function normalizeCourseRating(value: number): 1 | 2 | 3 | 4 | 5 {
  return Math.max(1, Math.min(5, Math.round(value))) as 1 | 2 | 3 | 4 | 5;
}

export function normalizeCourseFeedbackComment(value?: string): string | null {
  const normalized = value?.trim() || "";
  return normalized.length ? normalized : null;
}

export interface CourseFeedbackCriticalityInput {
  rating: number;
  contentRating?: number | null;
  experienceRating?: number | null;
  difficultyRating?: number | null;
  recommendScore?: number | null;
}

/** A feedback is critical when an overall or quality dimension is rated 1–2/5, or recommendation is 0–3/10. */
export function isCriticalCourseFeedback(input: CourseFeedbackCriticalityInput): boolean {
  const ratings = [input.rating, input.contentRating, input.experienceRating, input.difficultyRating]
    .filter((value): value is number => value !== undefined && value !== null)
    .map(normalizeCourseRating);
  return ratings.some((rating) => rating <= 2)
    || (input.recommendScore !== undefined && input.recommendScore !== null && Math.round(input.recommendScore) <= 3);
}
