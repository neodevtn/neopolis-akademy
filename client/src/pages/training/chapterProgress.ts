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

type ChapterBlockLike = {
  type?: string;
  title?: string | { en?: string; fr?: string };
};

/**
 * Neopolis-selected supplementary videos remain available to learners but do
 * not turn an otherwise completed official lesson into an artificial gate.
 * Official video blocks keep their explicit "mark as watched" requirement.
 */
export function hasOptionalSupplementaryVideos(chapter?: { blocks?: ChapterBlockLike[] } | null): boolean {
  const blocks = chapter?.blocks ?? [];
  const hasVideo = blocks.some((block) => block.type === "video");
  const hasSupplementLabel = blocks.some((block) => {
    // Content normalization can put the callout title either directly on the
    // block or in a nested field. Inspect only callouts, but tolerate both
    // source shapes so a supplemental video is never promoted to a gate.
    if (block.type !== "callout") return false;
    const serialized = JSON.stringify(block)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return /complement\s+neopolis|neopolis\s+supplement/i.test(serialized);
  });

  return hasVideo && hasSupplementLabel;
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
