import { getLearnerLearningEvents, recordLearningEvent } from "./db";

const COURSE_ID_PATTERN = /^[a-z0-9_]+$/i;
const ACTION_ID_PATTERN = /^[a-z0-9_-]+$/i;

export async function getGuidedActionStatus(input: { userId: number; courseId: string }) {
  if (!COURSE_ID_PATTERN.test(input.courseId)) return { completedActionIds: [] as string[] };
  const events = await getLearnerLearningEvents(input.userId);
  const completedActions = events
    .filter((event) => event.eventType === "guided_action_completed" && event.courseId === input.courseId && event.success === 1)
    .map((event) => ({
      id: event.exerciseId,
      response: event.metadata && typeof event.metadata === "object" && typeof (event.metadata as Record<string, unknown>).response === "string"
        ? (event.metadata as Record<string, unknown>).response as string
        : "",
    }))
    .filter((action): action is { id: string; response: string } => typeof action.id === "string" && ACTION_ID_PATTERN.test(action.id));
  const unique = new Map<string, string>();
  for (const action of completedActions) if (!unique.has(action.id)) unique.set(action.id, action.response);
  return { completedActionIds: Array.from(unique.keys()), completedActions: Array.from(unique, ([id, response]) => ({ id, response })) };
}

/** Persists a learner's explicit acknowledgement of a required, source-defined guided action. */
export async function completeGuidedAction(input: {
  userId: number;
  courseId: string;
  actionId: string;
  lessonIndex: number;
  chapterIndex: number;
  response: string;
}) {
  if (!COURSE_ID_PATTERN.test(input.courseId) || !ACTION_ID_PATTERN.test(input.actionId)) {
    throw new Error("Invalid guided action identifier");
  }
  await recordLearningEvent({
    userId: input.userId,
    eventType: "guided_action_completed",
    courseId: input.courseId,
    lessonIndex: input.lessonIndex,
    chapterIndex: input.chapterIndex,
    exerciseId: input.actionId,
    success: 1,
    score: 100,
    metadata: { learnerConfirmed: true, response: input.response.trim() },
  });
  return { actionId: input.actionId, completed: true };
}
