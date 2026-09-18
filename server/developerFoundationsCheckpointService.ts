import { TRPCError } from "@trpc/server";
import { getExerciseResults, recordLearningEvent, saveExerciseResult } from "./db";
import { DEVELOPER_FOUNDATIONS_SECURE_CORRECTIONS } from "./developerFoundationsCorrectionRegistry";

const MODULE_PREFIX = "developer-checkpoint:";

function correctionFor(courseId: string, exerciseId: string) {
  const correction = (DEVELOPER_FOUNDATIONS_SECURE_CORRECTIONS as Record<string, Record<string, any>>)[courseId]?.[exerciseId];
  if (!correction) throw new TRPCError({ code: "NOT_FOUND", message: "Point de validation introuvable pour ce cours." });
  return correction;
}

function selectionPasses(expectedIds: string[] | undefined, selectedIds: string[]) {
  // Source-defined free-text checkpoints have no choice key. Their real server
  // submission is recorded and releases the instructor feedback without
  // pretending to infer semantic correctness locally.
  if (!expectedIds?.length) return true;
  const expected = new Set(expectedIds);
  const selected = new Set(selectedIds);
  return selected.size === expected.size && Array.from(expected).every((id) => selected.has(id));
}

export async function submitDeveloperFoundationsCheckpoint(input: { userId: number; courseId: string; exerciseId: string; answer: string; selectedOptionIds: string[] }) {
  const correction = correctionFor(input.courseId, input.exerciseId);
  const passed = selectionPasses(correction.correctOptionIds, input.selectedOptionIds);
  const moduleId = `${MODULE_PREFIX}${input.exerciseId}`;
  const priorAttempts = await getExerciseResults(String(input.userId), input.courseId);
  const attemptNumber = priorAttempts.filter((attempt) => attempt.moduleId === moduleId).length + 1;
  await saveExerciseResult(String(input.userId), input.courseId, moduleId, passed ? 1 : 0, 1, JSON.stringify({ answer: input.answer, selectedOptionIds: input.selectedOptionIds }));
  await recordLearningEvent({ userId: input.userId, eventType: "checkpoint_submitted", courseId: input.courseId, exerciseId: input.exerciseId, score: passed ? 100 : 0, success: passed ? 1 : 0, attemptNumber, metadata: { serverValidated: true, correctionReleased: true } });
  return { submitted: true, passed, attemptNumber, correction: correction.correction, rubric: correction.rubric, sampleAnswer: correction.sampleAnswer, correctOptionIds: correction.correctOptionIds || [] };
}

export async function getDeveloperFoundationsCheckpointStatus(input: { userId: number; courseId: string }) {
  if (!(DEVELOPER_FOUNDATIONS_SECURE_CORRECTIONS as Record<string, unknown>)[input.courseId]) throw new TRPCError({ code: "NOT_FOUND", message: "Cours Developer Foundations introuvable." });
  const results = await getExerciseResults(String(input.userId), input.courseId);
  const attempts = results.filter((result) => result.moduleId.startsWith(MODULE_PREFIX)).map((result) => ({ exerciseId: result.moduleId.slice(MODULE_PREFIX.length), passed: Number(result.score) >= Number(result.totalQuestions) }));
  return { submittedExerciseIds: Array.from(new Set(attempts.map((attempt) => attempt.exerciseId))), passedExerciseIds: Array.from(new Set(attempts.filter((attempt) => attempt.passed).map((attempt) => attempt.exerciseId))) };
}

export async function getDeveloperFoundationsCheckpointCorrection(input: { userId: number; courseId: string; exerciseId: string }) {
  const correction = correctionFor(input.courseId, input.exerciseId);
  const results = await getExerciseResults(String(input.userId), input.courseId);
  if (!results.some((result) => result.moduleId === `${MODULE_PREFIX}${input.exerciseId}`)) throw new TRPCError({ code: "FORBIDDEN", message: "Soumettez d’abord votre réponse pour accéder à la correction." });
  return { correction: correction.correction, rubric: correction.rubric, sampleAnswer: correction.sampleAnswer, correctOptionIds: correction.correctOptionIds || [] };
}
