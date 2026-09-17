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

type GatedBlock = { id?: string; exerciseId?: string; type?: string };

/**
 * Applies the same activity gate to compact navigation controls as to the
 * main course footer. It deliberately leaves a completed lesson in review
 * mode navigable while preventing a learner from bypassing a required block.
 */
export function isSequentialActivityNavigationLocked({
  blocks = [],
  reviewMode = false,
  completedExercises,
  completedCloudExercises,
  completedMatching,
  completedInlineInteractions,
}: {
  blocks?: GatedBlock[];
  reviewMode?: boolean;
  completedExercises: Set<string>;
  completedCloudExercises: Set<string>;
  completedMatching: Set<string>;
  completedInlineInteractions: Set<string>;
}): boolean {
  if (reviewMode) return false;
  const completionKey = (block: GatedBlock, index: number) => block.exerciseId || block.id || (
    block.type === "checkpoint" ? `checkpoint_${index}`
      : block.type === "resource_review" ? `resource_review_${index}`
        : block.type === "cloud_exercise" ? `cloud_exercise_${index}`
          : block.type === "bucket_sort" ? `bucket_${index}`
            : block.type === "knowledge_check" || block.type?.startsWith("inline_") ? `novasavo_${index}`
              : `quiz_${index}`
  );
  return blocks.some((block, index) => {
    const key = completionKey(block, index);
    if (["single_choice_exercise", "multi_choice_exercise", "resource_review", "checkpoint"].includes(block.type || "")) return !completedExercises.has(key);
    if (block.type === "cloud_exercise") return !completedCloudExercises.has(key);
    if (block.type === "bucket_sort") return !completedMatching.has(key);
    if (["knowledge_check", "inline_myth_reality", "inline_multiple_choice_feedback", "inline_scenario_question_feedback"].includes(block.type || "")) return !completedInlineInteractions.has(key);
    return false;
  });
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
