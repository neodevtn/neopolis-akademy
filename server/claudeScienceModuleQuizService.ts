import { TRPCError } from "@trpc/server";
import {
  CLAUDE_SCIENCE_MEDICAL_CERTIFICATION_ID,
  CLAUDE_SCIENCE_MEDICAL_COURSE_ID,
  CLAUDE_SCIENCE_MODULE_LABS,
  CLAUDE_SCIENCE_MODULE_QUIZZES,
} from "./claudeScienceCourseAssessments";
import { getExerciseResults, getLearnerLearningEvents, recordLearningEvent, saveExerciseResult } from "./db";
import { applyCompetencyEvent, getContentCompetencyTags } from "./competencyService";

type ModuleQuiz = (typeof CLAUDE_SCIENCE_MODULE_QUIZZES)[keyof typeof CLAUDE_SCIENCE_MODULE_QUIZZES];

type ModuleQuizQuestion = ModuleQuiz["questions"][number];

type SubmittedAnswer = { questionId: string; selectedId: string };

function getQuiz(moduleId: string): ModuleQuiz {
  const quiz = CLAUDE_SCIENCE_MODULE_QUIZZES[moduleId as keyof typeof CLAUDE_SCIENCE_MODULE_QUIZZES];
  if (!quiz) throw new TRPCError({ code: "NOT_FOUND", message: "Quiz de module introuvable." });
  return quiz;
}

function fixedCourse(courseId: string) {
  if (courseId !== CLAUDE_SCIENCE_MEDICAL_COURSE_ID) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Ce quiz de module n’est pas disponible pour ce cours." });
  }
}

function toLearnerQuestion(question: ModuleQuizQuestion) {
  return {
    id: question.id,
    prompt: { fr: question.prompt, en: question.prompt },
    options: question.options.map((option) => ({ id: option.id, text: { fr: option.text, en: option.text } })),
    sourceRefs: question.sourceRefs,
  };
}

async function requirePrerequisites(userId: number, moduleId: string, courseId: string) {
  fixedCourse(courseId);
  const quiz = getQuiz(moduleId);
  const events = await getLearnerLearningEvents(userId);
  const successfulCheckpoints = new Set(events
    .filter((event) => event.courseId === courseId && event.eventType === "checkpoint_passed" && event.success === 1)
    .map((event) => event.exerciseId));
  const allCheckpointsPassed = quiz.checkpoints.every((checkpointId) => successfulCheckpoints.has(checkpointId));
  const labActivityId = CLAUDE_SCIENCE_MODULE_LABS[moduleId as keyof typeof CLAUDE_SCIENCE_MODULE_LABS];
  const labComplete = events.some((event) => event.courseId === courseId && event.eventType === "activity_completed" && event.exerciseId === labActivityId && event.success === 1);
  if (!allCheckpointsPassed || !labComplete) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Terminez les quatre checkpoints et le TP de ce module avant d’ouvrir le quiz." });
  }
  return quiz;
}

export async function getClaudeScienceModuleQuizForLearner(input: { userId: number; courseId: string; moduleId: string }) {
  const quiz = await requirePrerequisites(input.userId, input.moduleId, input.courseId);
  const attempts = await getExerciseResults(String(input.userId), input.courseId);
  const moduleAttempts = attempts.filter((attempt) => attempt.moduleId === quiz.id);
  return {
    id: quiz.id,
    moduleId: input.moduleId,
    title: { fr: quiz.title, en: quiz.title },
    passingScore: quiz.passingScore,
    maxAttempts: quiz.maxAttempts,
    attemptsUsed: moduleAttempts.length,
    remainingAttempts: Math.max(0, quiz.maxAttempts - moduleAttempts.length),
    questions: quiz.questions.map(toLearnerQuestion),
  };
}

export async function submitClaudeScienceModuleQuiz(input: { userId: number; courseId: string; moduleId: string; answers: SubmittedAnswer[] }) {
  const quiz = await requirePrerequisites(input.userId, input.moduleId, input.courseId);
  const priorAttempts = (await getExerciseResults(String(input.userId), input.courseId)).filter((attempt) => attempt.moduleId === quiz.id);
  if (priorAttempts.length >= quiz.maxAttempts) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Le nombre maximal de tentatives pour ce quiz est atteint." });
  }

  const answersByQuestion = new Map(input.answers.map((answer) => [answer.questionId, answer.selectedId]));
  if (answersByQuestion.size !== quiz.questions.length || !quiz.questions.every((question) => answersByQuestion.has(question.id))) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Répondez à toutes les questions du quiz avant de soumettre." });
  }

  const results = quiz.questions.map((question) => {
    const selectedId = answersByQuestion.get(question.id)!;
    const optionExists = question.options.some((option) => option.id === selectedId);
    if (!optionExists) throw new TRPCError({ code: "BAD_REQUEST", message: "Une réponse de quiz est invalide." });
    const correct = selectedId === question.correctAnswer;
    return {
      questionId: question.id,
      selectedId,
      correct,
      correctChoiceId: question.correctAnswer,
      explanation: { fr: question.explanation, en: question.explanation },
      sourceRefs: question.sourceRefs,
    };
  });
  const correctCount = results.filter((result) => result.correct).length;
  const scorePercent = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = scorePercent >= quiz.passingScore;
  const attemptNumber = priorAttempts.length + 1;

  await saveExerciseResult(
    String(input.userId),
    input.courseId,
    quiz.id,
    correctCount,
    quiz.questions.length,
    JSON.stringify(results.map(({ questionId, selectedId, correct }) => ({ questionId, selectedId, isCorrect: correct }))),
  );
  await recordLearningEvent({
    userId: input.userId,
    eventType: "module_quiz_submitted",
    certificationId: CLAUDE_SCIENCE_MEDICAL_CERTIFICATION_ID,
    courseId: input.courseId,
    exerciseId: quiz.id,
    score: scorePercent,
    success: passed ? 1 : 0,
    attemptNumber,
    metadata: { moduleId: input.moduleId, totalQuestions: quiz.questions.length },
  });
  if (passed) {
    const competencyTags = getContentCompetencyTags({ courseId: input.courseId, moduleId: input.moduleId });
    await applyCompetencyEvent({
      userId: input.userId,
      sourceType: "quiz_passed",
      sourceKey: input.courseId,
      eventKey: `module-quiz:${input.courseId}:${input.moduleId}`,
      score: scorePercent,
      competencyTags,
      evidence: { moduleId: input.moduleId, quizId: quiz.id, correctCount, totalQuestions: quiz.questions.length },
    });
  }

  return { attemptNumber, correctCount, totalQuestions: quiz.questions.length, scorePercent, passed, passingScore: quiz.passingScore, results };
}

export async function recordClaudeScienceLabCompletion(input: { userId: number; courseId: string; moduleId: string; activityId: string; lessonIndex: number; chapterIndex: number }) {
  fixedCourse(input.courseId);
  const expectedActivityId = CLAUDE_SCIENCE_MODULE_LABS[input.moduleId as keyof typeof CLAUDE_SCIENCE_MODULE_LABS];
  if (!expectedActivityId || expectedActivityId !== input.activityId) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Activité de module invalide." });
  }
  const events = await getLearnerLearningEvents(input.userId);
  const alreadyCompleted = events.some((event) => event.courseId === input.courseId && event.eventType === "activity_completed" && event.exerciseId === input.activityId && event.success === 1);
  if (!alreadyCompleted) {
    await recordLearningEvent({
      userId: input.userId,
      eventType: "activity_completed",
      certificationId: CLAUDE_SCIENCE_MEDICAL_CERTIFICATION_ID,
      courseId: input.courseId,
      lessonIndex: input.lessonIndex,
      chapterIndex: input.chapterIndex,
      exerciseId: input.activityId,
      success: 1,
      metadata: { moduleId: input.moduleId, dataPolicy: "synthetic_only" },
    });
  }
  return { success: true };
}

export function isClaudeScienceMedicalCourse(courseId: string) {
  return courseId === CLAUDE_SCIENCE_MEDICAL_COURSE_ID;
}
