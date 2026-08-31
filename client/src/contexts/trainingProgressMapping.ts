/**
 * A chapter progress entry can represent lessons only when its total matches
 * the current course lesson count. Older imports may instead store activity
 * screens (for example, 9 n8n activities) and must never complete lessons.
 */
export function canMapChapterProgressToLessons(totalChapters: number, lessonCount: number): boolean {
  return Number.isInteger(totalChapters)
    && Number.isInteger(lessonCount)
    && lessonCount > 1
    && totalChapters === lessonCount;
}

/**
 * Some courses are stored as one LMS lesson containing several short screens.
 * When a caller evaluates completion against those screens, the single
 * lesson-level completion must not hide the more precise chapter sentinel.
 */
export function shouldPreferChapterProgressForSingleLessonCourse({
  lessonCompletions,
  totalUnits,
  chapterTotal,
}: {
  lessonCompletions: number;
  totalUnits: number;
  chapterTotal?: number | null;
}): boolean {
  return lessonCompletions === 1
    && Number.isInteger(totalUnits)
    && totalUnits > 1
    && Number.isInteger(chapterTotal)
    && chapterTotal === totalUnits;
}
