import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ events: [] as any[], attempts: [] as any[], competencyEvents: [] as any[] }));

vi.mock("./db", () => ({
  getExerciseResults: vi.fn(async () => state.attempts),
  getLearnerLearningEvents: vi.fn(async () => state.events),
  saveExerciseResult: vi.fn(async (_userId: string, _courseId: string, moduleId: string, score: number, totalQuestions: number, answers: string) => {
    state.attempts.push({ moduleId, score, totalQuestions, answers });
    return { id: state.attempts.length };
  }),
  recordLearningEvent: vi.fn(async (event: any) => { state.events.push({ ...event, createdAt: new Date() }); return { id: state.events.length }; }),
}));
vi.mock("./competencyService", () => ({
  applyCompetencyEvent: vi.fn(async (event: any) => { state.competencyEvents.push(event); return []; }),
  getContentCompetencyTags: vi.fn(() => ["research-methods"]),
}));

import { getClaudeScienceModuleQuizForLearner, recordClaudeScienceLabCompletion, submitClaudeScienceModuleQuiz } from "./claudeScienceModuleQuizService";
import { CLAUDE_SCIENCE_MODULE_QUIZZES } from "./claudeScienceCourseAssessments";

const courseId = "claude_science_recherche_medicale__01";
const moduleId = "01_cadre_recherche_medicale";
const quiz = CLAUDE_SCIENCE_MODULE_QUIZZES[moduleId];

function satisfyCheckpoints() {
  state.events.push(...quiz.checkpoints.map((exerciseId) => ({ courseId, eventType: "checkpoint_passed", exerciseId, success: 1 })));
}

describe("Claude Science secure module quiz service", () => {
  beforeEach(() => {
    state.events.length = 0;
    state.attempts.length = 0;
    state.competencyEvents.length = 0;
  });

  it("does not disclose quiz questions before all four checkpoints and the TP are complete", async () => {
    await expect(getClaudeScienceModuleQuizForLearner({ userId: 71, courseId, moduleId })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    satisfyCheckpoints();
    await expect(getClaudeScienceModuleQuizForLearner({ userId: 71, courseId, moduleId })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  it("returns eight learner-safe questions only after the complete prerequisite chain", async () => {
    satisfyCheckpoints();
    await recordClaudeScienceLabCompletion({ userId: 71, courseId, moduleId, activityId: quiz.labActivityId, lessonIndex: 3, chapterIndex: 7 });
    const learnerQuiz = await getClaudeScienceModuleQuizForLearner({ userId: 71, courseId, moduleId });
    expect(learnerQuiz.questions).toHaveLength(8);
    expect(JSON.stringify(learnerQuiz)).not.toContain("correctAnswer");
    expect(JSON.stringify(learnerQuiz)).not.toContain("explanation");
    expect(learnerQuiz.remainingAttempts).toBe(quiz.maxAttempts);
  });

  it("grades on the server, records one attempt, and reveals corrections only after submission", async () => {
    satisfyCheckpoints();
    await recordClaudeScienceLabCompletion({ userId: 71, courseId, moduleId, activityId: quiz.labActivityId, lessonIndex: 3, chapterIndex: 7 });
    const answers = quiz.questions.map((question) => ({ questionId: question.id, selectedId: question.correctAnswer }));
    const result = await submitClaudeScienceModuleQuiz({ userId: 71, courseId, moduleId, answers });
    expect(result).toMatchObject({ passed: true, correctCount: 8, totalQuestions: 8, scorePercent: 100, attemptNumber: 1 });
    expect(result.results.every((entry) => entry.correct && entry.explanation.fr)).toBe(true);
    expect(state.attempts).toHaveLength(1);
    expect(state.competencyEvents).toHaveLength(1);
  });
});
