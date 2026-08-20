/**
 * Gives every rendered course screen a stable identity across both a lesson
 * switch and a chapter switch. This avoids reconciling unrelated screen DOM.
 */
export function getChapterTransitionKey(lessonId: string | number | undefined, chapterIndex: number): string {
  const safeLessonId = String(lessonId || "unknown-lesson");
  const safeChapterIndex = Number.isFinite(chapterIndex) ? Math.max(0, chapterIndex) : 0;
  return `chapter-${safeLessonId}-${safeChapterIndex}`;
}
