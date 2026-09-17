import { TRPCError } from "@trpc/server";
import { AI_MARKETING_PRACTICAL_ASSESSMENTS } from "./aiMarketingAssessmentDefinitions";
import { invokeLLM } from "./_core/llm";
import { applyCompetencyEvent, getContentCompetencyTags } from "./competencyService";
import { getLearnerLearningEvents, recordLearningEvent, saveAiResponseEvaluation } from "./db";

export const AI_MARKETING_COURSE_ID = "ai_for_marketing__01";

type Evaluation = { score: number; feedback: string; strengths: string[]; improvements: string[] };

function text(value: unknown, max = 1600) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function items(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 4) : [];
}

function assessmentFor(blockId: string) {
  const assessment = AI_MARKETING_PRACTICAL_ASSESSMENTS[blockId as keyof typeof AI_MARKETING_PRACTICAL_ASSESSMENTS];
  if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "TP marketing introuvable." });
  return assessment;
}

async function evaluate(answer: string, assessment: ReturnType<typeof assessmentFor>): Promise<Evaluation> {
  const response = await invokeLLM({
    model: "claude-sonnet-4-6",
    maxTokens: 1400,
    thinking: { type: "enabled", budget_tokens: 500 },
    responseFormat: {
      type: "json_schema",
      json_schema: {
        name: "ai_marketing_practical_evaluation",
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
    },
    messages: [
      {
        role: "system",
        content: "Vous évaluez une preuve de TP de marketing en français uniquement selon la rubrique fournie. Tous les scénarios et fichiers sont synthétiques. Ne supposez aucune action non décrite, ne demandez aucune donnée réelle, aucun secret ou clé API, et ne donnez aucun conseil commercial spécifique. Une déclaration vague du type ‘c’est fait’ ne satisfait pas un critère. Attribuez un point pour chaque élément réellement démontré, au plus le score maximal. Retournez uniquement le JSON demandé.",
      },
      {
        role: "user",
        content: `Objectif : ${assessment.title}\nRubrique : ${JSON.stringify(assessment.rubric)}\nScore maximal : ${assessment.maxScore}\n\nPreuve de l’apprenant :\n${answer}`,
      },
    ],
  });
  const content = response.choices?.[0]?.message?.content;
  const raw = Array.isArray(content) ? content.map((part: any) => part?.text || "").join("") : content;
  try {
    const parsed = JSON.parse(String(raw || "{}")) as Record<string, unknown>;
    return {
      score: Math.max(0, Math.min(assessment.maxScore, Math.round(Number(parsed.score) || 0))),
      feedback: text(parsed.feedback) || "Décrivez plus précisément les éléments réalisés pour permettre l’évaluation.",
      strengths: items(parsed.strengths),
      improvements: items(parsed.improvements),
    };
  } catch {
    throw new Error("Claude Sonnet returned invalid AI marketing assessment JSON.");
  }
}

export async function submitAiMarketingPractical(input: { userId: number; courseId: string; blockId: string; lessonIndex: number; chapterIndex: number; answer: string }) {
  if (input.courseId !== AI_MARKETING_COURSE_ID) throw new TRPCError({ code: "NOT_FOUND", message: "Cours marketing introuvable." });
  const assessment = assessmentFor(input.blockId);
  const result = await evaluate(input.answer, assessment);
  const passed = result.score >= assessment.passingScore;
  const saved = await saveAiResponseEvaluation({
    userId: input.userId,
    courseId: input.courseId,
    lessonIndex: input.lessonIndex,
    chapterIndex: input.chapterIndex,
    blockId: input.blockId,
    answer: input.answer,
    rubric: assessment.rubric,
    score: result.score,
    maxScore: assessment.maxScore,
    passingScore: assessment.passingScore,
    passed,
    feedback: result.feedback,
    strengths: result.strengths,
    improvements: result.improvements,
    model: "claude-sonnet-4-6",
  });
  await recordLearningEvent({
    userId: input.userId,
    eventType: "practical_lab_submitted",
    courseId: input.courseId,
    lessonIndex: input.lessonIndex,
    chapterIndex: input.chapterIndex,
    exerciseId: input.blockId,
    score: result.score,
    success: passed ? 1 : 0,
    attemptNumber: saved.attemptNumber,
    metadata: { model: "claude-sonnet-4-6", syntheticOnly: true, sourceAdapted: true },
  });
  if (passed) {
    await applyCompetencyEvent({
      userId: input.userId,
      sourceType: "exercise_passed",
      sourceKey: input.courseId,
      eventKey: `ai-marketing-practical:${input.blockId}`,
      score: Math.round((result.score / assessment.maxScore) * 100),
      competencyTags: getContentCompetencyTags({ courseId: input.courseId }),
      evidence: { blockId: input.blockId, attemptNumber: saved.attemptNumber, sourceAdapted: true },
    });
  }
  return { ...result, passed, attemptNumber: saved.attemptNumber, correction: assessment.correction, model: "claude-sonnet-4-6" };
}

/** Returns completion keys only, so a refresh preserves validated learner progress without exposing rubrics or corrections. */
export async function getAiMarketingActivityStatus(input: { userId: number; courseId: string }) {
  if (input.courseId !== AI_MARKETING_COURSE_ID) throw new TRPCError({ code: "NOT_FOUND", message: "Cours marketing introuvable." });
  const events = await getLearnerLearningEvents(input.userId);
  return {
    completedPracticalIds: events
      .filter((event) => event.courseId === AI_MARKETING_COURSE_ID && event.eventType === "practical_lab_submitted" && event.success === 1)
      .map((event) => event.exerciseId)
      .filter((id): id is string => typeof id === "string"),
  };
}
