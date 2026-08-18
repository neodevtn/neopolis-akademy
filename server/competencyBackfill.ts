import { eq } from "drizzle-orm";
import { examAttempts, exerciseResults, learnerAchievements, trainingProgress, users } from "../drizzle/schema";
import { getDb } from "./db";
import { applyCompetencyEvent, ensureCompetencyFramework, getContentCompetencyTags } from "./competencyService";

export async function backfillCompetencies() {
  await ensureCompetencyFramework();
  const db = await getDb();
  if (!db) throw new Error("Base de données indisponible");
  const [_progressRows, achievementRows, examRows, exerciseRows] = await Promise.all([
    db.select().from(trainingProgress),
    db.select().from(learnerAchievements),
    db.select().from(examAttempts).where(eq(examAttempts.passed, 1)),
    db.select().from(exerciseResults),
  ]);
  const counts = { exercise: 0, badge: 0, certification: 0 };
  for (const row of exerciseRows) {
    const percentage = row.totalQuestions > 0 ? (row.score / row.totalQuestions) * 100 : 0;
    if (percentage < 70) continue;
    const competencyTags = getContentCompetencyTags({ courseId: row.courseId, moduleId: row.moduleId });
    const added = await applyCompetencyEvent({ userId: Number(row.userId), sourceType: "exercise_passed", sourceKey: row.courseId, eventKey: `exercise:${row.moduleId}`, score: percentage, competencyTags, evidence: { historical: true, score: row.score, totalQuestions: row.totalQuestions, competencyTags } });
    counts.exercise += added.length;
  }
  for (const row of achievementRows) {
    if (row.kind === "skill_badge" && row.courseId) {
      const competencyTags = getContentCompetencyTags({ courseId: row.courseId });
      const badgeAdded = await applyCompetencyEvent({ userId: row.userId, sourceType: "skill_badge", sourceKey: row.courseId, eventKey: `badge:${row.id}`, competencyTags, evidence: { historical: true, achievementId: row.id, competencyTags } });
      counts.badge += badgeAdded.length;
    }
    if (row.kind === "certification" && row.certificationId) {
      const evidence = (row.evidence || {}) as any;
      const competencyTags = getContentCompetencyTags({ certificationId: row.certificationId });
      const added = await applyCompetencyEvent({ userId: row.userId, sourceType: "certification", sourceKey: row.certificationId, eventKey: `certification:${row.id}`, score: typeof evidence.score === "number" ? evidence.score / 10 : undefined, competencyTags, evidence: { historical: true, achievementId: row.id, competencyTags } });
      counts.certification += added.length;
    }
  }
  return { ...counts, progressRows: _progressRows.length, achievements: achievementRows.length, successfulExams: examRows.length, successfulExercises: exerciseRows.length, created: Object.values(counts).reduce((total, value) => total + value, 0) };
}
