export type LearnerRankingRow = {
  id: number;
  lessonsCompleted: number;
  examStats: { passed: number; bestScore: number };
  lastActivityAt: Date | string | null;
};

function timestamp(value: Date | string | null) {
  if (!value) return 0;
  const result = new Date(value).getTime();
  return Number.isFinite(result) ? result : 0;
}

/**
 * A transparent, deterministic ranking: completed lessons first, then passed
 * exams, best score, most recent pedagogical activity, and finally user ID.
 */
export function compareLearnerRanking(a: LearnerRankingRow, b: LearnerRankingRow) {
  return b.lessonsCompleted - a.lessonsCompleted
    || b.examStats.passed - a.examStats.passed
    || b.examStats.bestScore - a.examStats.bestScore
    || timestamp(b.lastActivityAt) - timestamp(a.lastActivityAt)
    || a.id - b.id;
}
