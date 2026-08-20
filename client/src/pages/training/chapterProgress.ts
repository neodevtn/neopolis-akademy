export type ChapterProgress = { current: number; total: number };

/**
 * Produces a safe, zero-based chapter position for UI display.
 * The UI must never receive an index outside [0, total - 1].
 */
export function normalizeChapterProgress(progress?: Partial<ChapterProgress> | null): ChapterProgress {
  const total = Math.max(1, Number.isFinite(progress?.total) ? Number(progress?.total) : 1);
  const current = Math.min(
    Math.max(0, Number.isFinite(progress?.current) ? Number(progress?.current) : 0),
    total - 1,
  );

  return { current, total };
}

/**
 * Produces the persisted sentinel used when a learner completes the last
 * chapter. Unlike the UI position, persistence deliberately accepts
 * `current === total` to express that every chapter is complete.
 */
export function getPersistedCompletionProgress(total: number): ChapterProgress {
  const safeTotal = Math.max(1, Number.isFinite(total) ? Math.floor(total) : 1);
  return { current: safeTotal, total: safeTotal };
}

/**
 * Chapter progress belongs to a specific lesson. When the learner enters a
 * different lesson, start its visual chapter counter at chapter 1, not at the
 * last chapter visited in the preceding lesson.
 */
export function getDisplayedChapterProgress(
  progress: ChapterProgress | null,
  progressLessonIndex: number | null,
  displayedLessonIndex: number,
  fallbackTotal: number,
): ChapterProgress {
  if (progress && progressLessonIndex === displayedLessonIndex) {
    return normalizeChapterProgress(progress);
  }

  return normalizeChapterProgress({ current: 0, total: fallbackTotal });
}
