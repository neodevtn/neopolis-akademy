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
