export const INACTIVITY_PAUSE_MS = 5 * 60 * 1000;

export function shouldRecordLearningTime({
  now,
  lastInteractionAt,
  mediaPlaying,
  isVisible,
}: {
  now: number;
  lastInteractionAt: number;
  mediaPlaying: boolean;
  isVisible: boolean;
}) {
  if (!isVisible) return false;
  if (mediaPlaying) return true;
  return now - lastInteractionAt < INACTIVITY_PAUSE_MS;
}
