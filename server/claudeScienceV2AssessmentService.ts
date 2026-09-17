import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { applyCompetencyEvent, getContentCompetencyTags } from "./competencyService";
import { getExerciseResults, getLearnerLearningEvents, recordLearningEvent, saveAiResponseEvaluation, saveExerciseResult } from "./db";
import {
  CLAUDE_SCIENCE_V2_CERTIFICATION_ID,
  CLAUDE_SCIENCE_V2_CHECKPOINT_KEYS,
  CLAUDE_SCIENCE_V2_FINAL_QUIZZES,
  CLAUDE_SCIENCE_V2_LABS,
} from "./claudeScienceV2Assessments";

type SubmittedAnswer = { questionId: string; selectedId: string };

type Evaluation = {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
};

const courseIds = new Set(Object.keys(CLAUDE_SCIENCE_V2_FINAL_QUIZZES));

function asText(value: unknown, maxLength = 1800) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function asItems(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 4)
    : [];
}

function assertCourse(courseId: string) {
  if (!courseIds.has(courseId) && !Object.values(CLAUDE_SCIENCE_V2_LABS).some((lab) => lab.courseId === courseId)) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Évaluation Claude Science V2 introuvable." });
  }
}

function learnerQuestion(question: any) {
  return {
    id: question.id,
    prompt: { fr: question.prompt, en: question.prompt },
    options: question.options.map((option: any) => ({ id: option.id, text: { fr: option.text, en: option.text } })),
    sourceRefs: question.sourceRefs,
  };
}

async function requireCheckpointsForFinalQuiz(userId: number, courseId: string) {
  const required = Object.keys(CLAUDE_SCIENCE_V2_CHECKPOINT_KEYS).filter((key) => key.startsWith(`${courseId}__`));
  const events = await getLearnerLearningEvents(userId);
  const passed = new Set(events
    .filter((event) => event.courseId === courseId && event.eventType === "checkpoint_passed" && event.success === 1)
    .map((event) => event.exerciseId));
  if (!required.every((id) => passed.has(id))) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Réussissez tous les checkpoints du cours avant l’évaluation finale." });
  }
}

export async function getClaudeScienceV2FinalQuiz(input: { userId: number; courseId: string }) {
  assertCourse(input.courseId);
  const quiz = CLAUDE_SCIENCE_V2_FINAL_QUIZZES[input.courseId as keyof typeof CLAUDE_SCIENCE_V2_FINAL_QUIZZES];
  if (!quiz) throw new TRPCError({ code: "NOT_FOUND", message: "Aucune évaluation finale pour ce cours." });
  await requireCheckpointsForFinalQuiz(input.userId, input.courseId);
  const attempts = (await getExerciseResults(String(input.userId), input.courseId)).filter((attempt) => attempt.moduleId === quiz.id);
  return {
    id: quiz.id,
    title: { fr: quiz.title, en: quiz.title },
    passingScore: quiz.passingScore,
    maxAttempts: quiz.maxAttempts,
    attemptsUsed: attempts.length,
    remainingAttempts: Math.max(0, quiz.maxAttempts - attempts.length),
    questions: quiz.questions.map(learnerQuestion),
  };
}

export async function submitClaudeScienceV2FinalQuiz(input: { userId: number; courseId: string; answers: SubmittedAnswer[] }) {
  assertCourse(input.courseId);
  const quiz = CLAUDE_SCIENCE_V2_FINAL_QUIZZES[input.courseId as keyof typeof CLAUDE_SCIENCE_V2_FINAL_QUIZZES];
  if (!quiz) throw new TRPCError({ code: "NOT_FOUND", message: "Aucune évaluation finale pour ce cours." });
  await requireCheckpointsForFinalQuiz(input.userId, input.courseId);
  const priorAttempts = (await getExerciseResults(String(input.userId), input.courseId)).filter((attempt) => attempt.moduleId === quiz.id);
  if (priorAttempts.length >= quiz.maxAttempts) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Le nombre maximal de tentatives est atteint." });

  const answersById = new Map(input.answers.map((answer) => [answer.questionId, answer.selectedId]));
  if (answersById.size !== quiz.questions.length || !quiz.questions.every((question: any) => answersById.has(question.id))) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Répondez à toutes les questions avant de soumettre." });
  }
  const results = quiz.questions.map((question: any) => {
    const selectedId = answersById.get(question.id)!;
    if (!question.options.some((option: any) => option.id === selectedId)) throw new TRPCError({ code: "BAD_REQUEST", message: "Une réponse est invalide." });
    const correct = selectedId === question.correctAnswer;
    return { questionId: question.id, selectedId, correct, correctChoiceId: question.correctAnswer, explanation: { fr: question.explanation, en: question.explanation }, sourceRefs: question.sourceRefs };
  });
  const correctCount = results.filter((result: any) => result.correct).length;
  const scorePercent = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = scorePercent >= quiz.passingScore;
  const attemptNumber = priorAttempts.length + 1;
  await saveExerciseResult(String(input.userId), input.courseId, quiz.id, correctCount, quiz.questions.length, JSON.stringify(results.map(({ questionId, selectedId, correct }: any) => ({ questionId, selectedId, isCorrect: correct }))));
  await recordLearningEvent({ userId: input.userId, eventType: "course_final_quiz_submitted", certificationId: CLAUDE_SCIENCE_V2_CERTIFICATION_ID, courseId: input.courseId, exerciseId: quiz.id, score: scorePercent, success: passed ? 1 : 0, attemptNumber, metadata: { totalQuestions: quiz.questions.length } });
  if (passed) {
    await applyCompetencyEvent({ userId: input.userId, sourceType: "quiz_passed", sourceKey: input.courseId, eventKey: `claude-science-v2-final:${input.courseId}`, score: scorePercent, competencyTags: getContentCompetencyTags({ courseId: input.courseId }), evidence: { quizId: quiz.id, correctCount, totalQuestions: quiz.questions.length } });
  }
  return { attemptNumber, correctCount, totalQuestions: quiz.questions.length, scorePercent, passed, passingScore: quiz.passingScore, results };
}

function getLab(courseId: string, labId: string) {
  assertCourse(courseId);
  const lab = CLAUDE_SCIENCE_V2_LABS[labId as keyof typeof CLAUDE_SCIENCE_V2_LABS];
  if (!lab || lab.courseId !== courseId) throw new TRPCError({ code: "NOT_FOUND", message: "Travail pratique introuvable." });
  return lab;
}

function normalizeEvaluation(raw: unknown, maxScore: number): Evaluation {
  const source = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  return {
    score: Math.round(Math.min(maxScore, Math.max(0, Number(source.score) || 0))),
    feedback: asText(source.feedback) || "L’évaluation n’a pas produit de retour exploitable. Décrivez plus précisément les contrôles réalisés.",
    strengths: asItems(source.strengths),
    improvements: asItems(source.improvements),
  };
}

async function evaluateClaudeScienceLab(input: { lab: any; answer: string }): Promise<Evaluation> {
  const outputSchema = {
    type: "json_schema" as const,
    json_schema: {
      name: "claude_science_lab_evaluation",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          score: { type: "number" },
          feedback: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          improvements: { type: "array", items: { type: "string" } },
        },
        required: ["score", "feedback", "strengths", "improvements"],
      },
    },
  };
  const response = await invokeLLM({
    model: "claude-sonnet-4-6",
    maxTokens: 2200,
    thinking: { type: "enabled", budget_tokens: 800 },
    responseFormat: outputSchema,
    messages: [
      {
        role: "system",
        content: `Vous évaluez un travail pratique de recherche médicale, en français, uniquement selon la rubrique fournie. Les données de formation sont synthétiques. N'acceptez jamais une conclusion clinique, l'usage de données patient, de données de santé protégées ou de secrets. Le chercheur doit démontrer une méthode reproductible, des contrôles indépendants et une validation humaine. Ne donnez aucun conseil médical. Retournez exclusivement le JSON imposé.`,
      },
      {
        role: "user",
        content: `TP : ${input.lab.title}\nSeuil : ${input.lab.passingScore}/${input.lab.maxScore}\nRubrique : ${JSON.stringify(input.lab.rubric)}\n\nPreuve de l'apprenant :\n${input.answer}`,
      },
    ],
  });
  const content = response.choices?.[0]?.message?.content;
  const rawText = Array.isArray(content) ? content.map((part: any) => part?.text || "").join("") : content;
  try {
    return normalizeEvaluation(JSON.parse(String(rawText || "{}")), input.lab.maxScore);
  } catch {
    throw new Error("Claude Sonnet returned invalid lab evaluation JSON.");
  }
}

export async function submitClaudeScienceV2Lab(input: { userId: number; courseId: string; labId: string; lessonIndex: number; chapterIndex: number; answer: string }) {
  const lab = getLab(input.courseId, input.labId);
  const evaluation = await evaluateClaudeScienceLab({ lab, answer: input.answer });
  const passed = evaluation.score >= lab.passingScore;
  const persistence = await saveAiResponseEvaluation({
    userId: input.userId,
    certificationId: CLAUDE_SCIENCE_V2_CERTIFICATION_ID,
    courseId: input.courseId,
    lessonIndex: input.lessonIndex,
    chapterIndex: input.chapterIndex,
    blockId: lab.id,
    answer: input.answer,
    rubric: lab.rubric,
    score: evaluation.score,
    maxScore: lab.maxScore,
    passingScore: lab.passingScore,
    passed,
    feedback: evaluation.feedback,
    strengths: evaluation.strengths,
    improvements: evaluation.improvements,
    model: "claude-sonnet-4-6",
  });
  await recordLearningEvent({ userId: input.userId, eventType: "practical_lab_submitted", certificationId: CLAUDE_SCIENCE_V2_CERTIFICATION_ID, courseId: input.courseId, lessonIndex: input.lessonIndex, chapterIndex: input.chapterIndex, exerciseId: lab.id, score: evaluation.score, success: passed ? 1 : 0, attemptNumber: persistence.attemptNumber, metadata: { model: "claude-sonnet-4-6", syntheticOnly: true } });
  if (passed) {
    await applyCompetencyEvent({ userId: input.userId, sourceType: "exercise_passed", sourceKey: input.courseId, eventKey: `claude-science-v2-lab:${lab.id}`, score: evaluation.score, competencyTags: getContentCompetencyTags({ courseId: input.courseId }), evidence: { labId: lab.id, attemptNumber: persistence.attemptNumber } });
  }
  return { ...evaluation, passed, attemptNumber: persistence.attemptNumber, correction: lab.correction, correctionSha256: lab.correctionSha256, model: "claude-sonnet-4-6" };
}

export async function submitClaudeScienceV2Reflection(input: { userId: number; courseId: string; reflectionId: string; lessonIndex: number; chapterIndex: number; answer: string }) {
  assertCourse(input.courseId);
  if (!input.reflectionId.startsWith(`${input.courseId}__`)) throw new TRPCError({ code: "BAD_REQUEST", message: "Réflexion invalide pour ce cours." });
  await recordLearningEvent({
    userId: input.userId,
    eventType: "learning_reflection_submitted",
    certificationId: CLAUDE_SCIENCE_V2_CERTIFICATION_ID,
    courseId: input.courseId,
    lessonIndex: input.lessonIndex,
    chapterIndex: input.chapterIndex,
    exerciseId: input.reflectionId,
    success: 1,
    metadata: { characterCount: input.answer.length, nonClinicalCourse: true },
  });
  return { completed: true };
}

/** Provides only completion flags so a refresh cannot erase a validated TP or final quiz gate. */
export async function getClaudeScienceV2ActivityStatus(input: { userId: number; courseId: string }) {
  assertCourse(input.courseId);
  const events = await getLearnerLearningEvents(input.userId);
  const courseEvents = events.filter((event) => event.courseId === input.courseId && event.success === 1);
  const completedLabs = new Set(courseEvents.filter((event) => event.eventType === "practical_lab_submitted").map((event) => event.exerciseId).filter(Boolean));
  const completedFinalQuizzes = new Set(courseEvents.filter((event) => event.eventType === "course_final_quiz_submitted").map((event) => event.exerciseId).filter(Boolean));
  const completedReflections = new Set(courseEvents.filter((event) => event.eventType === "learning_reflection_submitted").map((event) => event.exerciseId).filter(Boolean));
  return { completedLabs: Array.from(completedLabs), completedFinalQuizzes: Array.from(completedFinalQuizzes), completedReflections: Array.from(completedReflections) };
}

export function isClaudeScienceV2Course(courseId: string) {
  return courseIds.has(courseId) || Object.values(CLAUDE_SCIENCE_V2_LABS).some((lab) => lab.courseId === courseId);
}
