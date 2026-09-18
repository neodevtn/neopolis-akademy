import { TRPCError } from "@trpc/server";
import { getExerciseResults, recordLearningEvent, saveExerciseResult } from "./db";
import { ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS } from "./architectFoundationsCorrectionRegistry";

const MODULE_PREFIX = "architect-checkpoint:";

function correctionFor(courseId: string, exerciseId: string) {
  const correction = ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS[courseId]?.[exerciseId];
  if (!correction) throw new TRPCError({ code: "NOT_FOUND", message: "Point de validation introuvable pour ce cours." });
  return correction;
}

function completionFromSelection(correctOptionIds: string[] | undefined, selectedOptionIds: string[]) {
  if (!correctOptionIds?.length) return true;
  const expected = new Set(correctOptionIds);
  const selected = new Set(selectedOptionIds);
  return selected.size === expected.size && Array.from(expected).every((optionId) => selected.has(optionId));
}

export async function submitArchitectFoundationsCheckpoint(input: {
  userId: number;
  courseId: string;
  exerciseId: string;
  answer: string;
  selectedOptionIds: string[];
}) {
  const correction = correctionFor(input.courseId, input.exerciseId);
  const passed = completionFromSelection(correction.correctOptionIds, input.selectedOptionIds);
  const moduleId = `${MODULE_PREFIX}${input.exerciseId}`;
  const priorAttempts = await getExerciseResults(String(input.userId), input.courseId);
  const attemptNumber = priorAttempts.filter((attempt) => attempt.moduleId === moduleId).length + 1;
  await saveExerciseResult(
    String(input.userId),
    input.courseId,
    moduleId,
    passed ? 1 : 0,
    1,
    JSON.stringify({ answer: input.answer, selectedOptionIds: input.selectedOptionIds }),
  );
  await recordLearningEvent({
    userId: input.userId,
    eventType: "checkpoint_submitted",
    courseId: input.courseId,
    exerciseId: input.exerciseId,
    score: passed ? 100 : 0,
    success: passed ? 1 : 0,
    attemptNumber,
    metadata: { serverValidated: true, correctionReleased: true },
  });

  return {
    submitted: true,
    passed,
    attemptNumber,
    correction: correction.correction,
    rubric: correction.rubric,
    sampleAnswer: correction.sampleAnswer,
    correctOptionIds: correction.correctOptionIds || [],
  };
}

export async function getArchitectFoundationsCheckpointStatus(input: { userId: number; courseId: string }) {
  if (!ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS[input.courseId]) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Cours Architect Foundations introuvable." });
  }
  const results = await getExerciseResults(String(input.userId), input.courseId);
  const attempts = results
    .filter((result) => result.moduleId.startsWith(MODULE_PREFIX))
    .map((result) => ({
      exerciseId: result.moduleId.slice(MODULE_PREFIX.length),
      passed: Number(result.score) >= Number(result.totalQuestions),
      submittedAt: result.createdAt,
    }));
  return {
    submittedExerciseIds: Array.from(new Set(attempts.map((attempt) => attempt.exerciseId))),
    passedExerciseIds: Array.from(new Set(attempts.filter((attempt) => attempt.passed).map((attempt) => attempt.exerciseId))),
  };
}

export async function getArchitectFoundationsCheckpointCorrection(input: { userId: number; courseId: string; exerciseId: string }) {
  const correction = correctionFor(input.courseId, input.exerciseId);
  const moduleId = `${MODULE_PREFIX}${input.exerciseId}`;
  const results = await getExerciseResults(String(input.userId), input.courseId);
  if (!results.some((result) => result.moduleId === moduleId)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Soumettez d’abord votre réponse pour accéder à la correction." });
  }
  return {
    correction: correction.correction,
    rubric: correction.rubric,
    sampleAnswer: correction.sampleAnswer,
    correctOptionIds: correction.correctOptionIds || [],
  };
}
