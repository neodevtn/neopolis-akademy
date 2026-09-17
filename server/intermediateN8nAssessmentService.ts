import { TRPCError } from "@trpc/server";
import { getLearnerLearningEvents, recordLearningEvent, saveAiResponseEvaluation } from "./db";
import { VERIFIED_N8N_PRACTICAL_ASSESSMENTS } from "./intermediateN8nAssessmentDefinitions";

export const INTERMEDIATE_N8N_COURSE_ID = "intermediate_workflow_automation_with_n8n__01";

type Assessment = {
  id: string;
  maxScore: number;
  passingScore: number;
  correction: string;
  criteria: Array<{ id: string; label: string; matches: Array<RegExp | string> }>;
};

const foundationalAssessments: Record<string, Assessment> = {
  dc_1_act_02_tp: {
    id: "dc_1_act_02_tp",
    maxScore: 3,
    passingScore: 3,
    correction: "Une preuve correcte décrit un Webhook Trigger en POST qui attend Respond to Webhook, une réponse JSON avec code 200, puis une exécution de test synthétique contenant un e-mail et réussissant sur les deux nœuds.",
    criteria: [
      { id: "trigger", label: "Webhook POST et réponse déléguée", matches: [/webhook/i, /\bpost\b/i, /respond\s+to\s+webhook/i] },
      { id: "response", label: "Réponse JSON avec code 200", matches: [/json/i, /\b200\b/] },
      { id: "proof", label: "Charge synthétique avec e-mail et réussite", matches: [/email/i, /(réussi|success|succeed|succès)/i] },
    ],
  },
  dc_1_act_03_tp: {
    id: "dc_1_act_03_tp",
    maxScore: 3,
    passingScore: 3,
    correction: "Une preuve correcte décrit une condition If sur l’existence de email, une branche succès avec code 200 et une branche erreur avec code 400, puis deux tests synthétiques : l’un avec e-mail et l’autre sans e-mail.",
    criteria: [
      { id: "condition", label: "Condition If sur e-mail", matches: [/\bif\b/i, /email/i] },
      { id: "branches", label: "Branches succès 200 et erreur 400", matches: [/\b200\b/, /\b400\b/] },
      { id: "tests", label: "Deux tests synthétiques, avec et sans e-mail", matches: [/(avec.{0,40}email|email.{0,40}(présent|valid|avec))/i, /(sans.{0,40}email|missing.{0,40}email|absence.{0,40}email)/i] },
    ],
  },
};

const sourceVerifiedAssessments: Record<string, Assessment> = Object.fromEntries(
  Object.entries(VERIFIED_N8N_PRACTICAL_ASSESSMENTS).map(([id, assessment]) => [id, {
    id,
    maxScore: assessment.criteria.length,
    passingScore: assessment.criteria.length,
    correction: assessment.correction,
    criteria: assessment.criteria.map((criterion) => ({
      id: criterion.id,
      label: criterion.label,
      matches: [...criterion.terms],
    })),
  }]),
);

const assessments: Record<string, Assessment> = { ...foundationalAssessments, ...sourceVerifiedAssessments };

function matchesCriterion(criterion: Assessment["criteria"][number], answer: string) {
  const normalizedAnswer = answer.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return criterion.matches.every((pattern) => pattern instanceof RegExp
    ? pattern.test(answer)
    : normalizedAnswer.includes(pattern.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()));
}

function getAssessment(courseId: string, blockId: string) {
  if (courseId !== INTERMEDIATE_N8N_COURSE_ID || !assessments[blockId]) {
    throw new TRPCError({ code: "NOT_FOUND", message: "TP n8n sécurisé introuvable." });
  }
  return assessments[blockId];
}

export async function submitIntermediateN8nPractical(input: {
  userId: number;
  courseId: string;
  blockId: string;
  lessonIndex: number;
  chapterIndex: number;
  answer: string;
}) {
  const assessment = getAssessment(input.courseId, input.blockId);
  const answer = input.answer.trim().slice(0, 12000);
  const met = assessment.criteria.filter((criterion) => matchesCriterion(criterion, answer));
  const missed = assessment.criteria.filter((criterion) => !met.includes(criterion));
  const score = met.length;
  const passed = score >= assessment.passingScore;
  const feedback = passed
    ? "Preuve complète : les réglages et les essais synthétiques attendus sont décrits."
    : `Preuve incomplète : précisez ${missed.map((criterion) => criterion.label.toLowerCase()).join(" ; ")}.`;
  const persistence = await saveAiResponseEvaluation({
    userId: input.userId,
    courseId: input.courseId,
    lessonIndex: input.lessonIndex,
    chapterIndex: input.chapterIndex,
    blockId: assessment.id,
    answer,
    rubric: assessment.criteria.map((criterion) => ({ id: criterion.id, label: criterion.label, description: criterion.label, weight: 1 })),
    score,
    maxScore: assessment.maxScore,
    passingScore: assessment.passingScore,
    passed,
    feedback,
    strengths: met.map((criterion) => criterion.label),
    improvements: missed.map((criterion) => criterion.label),
    model: "deterministic-source-verified-n8n-v1",
  });
  await recordLearningEvent({
    userId: input.userId,
    eventType: "practical_lab_submitted",
    courseId: input.courseId,
    lessonIndex: input.lessonIndex,
    chapterIndex: input.chapterIndex,
    exerciseId: assessment.id,
    score,
    success: passed ? 1 : 0,
    attemptNumber: persistence.attemptNumber,
    metadata: { assessment: "source_screen_verified", deterministic: true },
  });
  return {
    score,
    feedback,
    strengths: met.map((criterion) => criterion.label),
    improvements: missed.map((criterion) => criterion.label),
    passed,
    attemptNumber: persistence.attemptNumber,
    correction: assessment.correction,
  };
}

/** Restores completed source-verified TP gates after a learner refreshes the course. */
export async function getIntermediateN8nActivityStatus(input: { userId: number; courseId: string }) {
  if (input.courseId !== INTERMEDIATE_N8N_COURSE_ID) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Parcours n8n introuvable." });
  }
  const events = await getLearnerLearningEvents(input.userId);
  const completedPracticalIds = events
    .filter((event) => event.courseId === input.courseId && event.eventType === "practical_lab_submitted" && event.success === 1)
    .map((event) => event.exerciseId)
    .filter((id): id is string => typeof id === "string" && Boolean(assessments[id]));
  return { completedPracticalIds: Array.from(new Set(completedPracticalIds)) };
}
