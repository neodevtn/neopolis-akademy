import { getHistoricalAchievementCandidates } from "./db";
import { awardCertification, awardCourseCompletionBadge } from "./achievementService";

/**
 * Replays only verified historic completion records. Existing credentials are left
 * untouched by issueAchievement's unique key, so the operation is safe to rerun.
 */
export async function backfillHistoricalAchievements() {
  const { progress, passedAttempts, learners } = await getHistoricalAchievementCandidates();
  const learnerById = new Map(learners.map((learner) => [learner.id, learner]));
  const candidateProgress = progress.filter((entry) => learnerById.has(entry.userId));
  const coursePairs = new Map<string, { userId: number; certificationId: string; courseId: string }>();
  for (const entry of candidateProgress) {
    coursePairs.set(`${entry.userId}:${entry.certificationId}:${entry.courseId}`, {
      userId: entry.userId,
      certificationId: entry.certificationId,
      courseId: entry.courseId,
    });
  }

  let issuedBadges = 0;
  let issuedCertificates = 0;
  let skippedCourses = 0;
  for (const pair of Array.from(coursePairs.values())) {
    const learner = learnerById.get(pair.userId);
    if (!learner) continue;
    const achievement = await awardCourseCompletionBadge(learner, pair.certificationId, pair.courseId);
    if (achievement) issuedBadges += 1;
    else skippedCourses += 1;
  }

  // Several passing attempts can exist: the unique achievement key preserves one credential.
  for (const attempt of passedAttempts) {
    const learner = learnerById.get(attempt.userId);
    if (!learner) continue;
    const achievement = await awardCertification(learner, attempt.certificationId, attempt.score, attempt.id);
    if (achievement) issuedCertificates += 1;
  }

  return {
    candidateLearners: learners.length,
    historicalCourseProgressPairs: coursePairs.size,
    historicalPassingAttempts: passedAttempts.filter((attempt) => learnerById.has(attempt.userId)).length,
    issuedBadges,
    issuedCertificates,
    skippedCourses,
  };
}
