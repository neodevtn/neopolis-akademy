import { eq } from "drizzle-orm";
import { examAttempts, exerciseResults, learnerAchievements, trainingProgress, users } from "../drizzle/schema";
import { getDb } from "./db";
import { applyCompetencyEvent, ensureCompetencyFramework } from "./competencyService";

export async function backfillCompetencies() {
  await ensureCompetencyFramework();
  const db = await getDb();
  if (!db) throw new Error("Base de données indisponible");
  const [progressRows, achievementRows, examRows, exerciseRows] = await Promise.all([
    db.select().from(trainingProgress),
    db.select().from(learnerAchievements),
    db.select().from(examAttempts).where(eq(examAttempts.passed, 1)),
    db.select().from(exerciseResults),
  ]);
  const counts = { lesson: 0, exercise: 0, course: 0, badge: 0, certification: 0 };
  for (const row of progressRows) {
    const added = await applyCompetencyEvent({ userId: row.userId, sourceType: "lesson_completed", sourceKey: row.courseId, eventKey: `lesson:${row.courseId}:${row.lessonIndex}`, evidence: { certificationId: row.certificationId, lessonIndex: row.lessonIndex, historical: true } });
    counts.lesson += added.length;
  }
  for (const row of exerciseRows) {
    const percentage = row.totalQuestions > 0 ? (row.score / row.totalQuestions) * 100 : 0;
    if (percentage < 70) continue;
    const added = await applyCompetencyEvent({ userId: Number(row.userId), sourceType: "exercise_passed", sourceKey: row.courseId, eventKey: `exercise:${row.moduleId}`, score: percentage, evidence: { historical: true, score: row.score, totalQuestions: row.totalQuestions } });
    counts.exercise += added.length;
  }
  for (const row of achievementRows) {
    if (row.kind === "skill_badge" && row.courseId) {
      const courseAdded = await applyCompetencyEvent({ userId: row.userId, sourceType: "course_completed", sourceKey: row.courseId, eventKey: `course-completion:${row.courseId}`, evidence: { historical: true, achievementId: row.id } });
      const badgeAdded = await applyCompetencyEvent({ userId: row.userId, sourceType: "skill_badge", sourceKey: row.courseId, eventKey: `badge:${row.id}`, evidence: { historical: true, achievementId: row.id } });
      counts.course += courseAdded.length;
      counts.badge += badgeAdded.length;
    }
    if (row.kind === "certification" && row.certificationId) {
      const evidence = (row.evidence || {}) as any;
      const added = await applyCompetencyEvent({ userId: row.userId, sourceType: "certification", sourceKey: row.certificationId, eventKey: `certification:${row.id}`, score: typeof evidence.score === "number" ? evidence.score / 10 : undefined, evidence: { historical: true, achievementId: row.id } });
      counts.certification += added.length;
    }
  }
  return { ...counts, progressRows: progressRows.length, achievements: achievementRows.length, successfulExams: examRows.length, successfulExercises: exerciseRows.length, created: Object.values(counts).reduce((total, value) => total + value, 0) };
}
