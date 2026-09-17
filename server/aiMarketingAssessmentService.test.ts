import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ events: [] as any[], saved: [] as any[], competency: [] as any[] }));

vi.mock("./db", () => ({
  getLearnerLearningEvents: vi.fn(async () => mocks.events),
  recordLearningEvent: vi.fn(async (event) => { mocks.events.push(event); }),
  saveAiResponseEvaluation: vi.fn(async (input) => { mocks.saved.push(input); return { attemptNumber: mocks.saved.length }; }),
}));
vi.mock("./competencyService", () => ({
  applyCompetencyEvent: vi.fn(async (event) => { mocks.competency.push(event); }),
  getContentCompetencyTags: vi.fn(() => ["marketing-ai"]),
}));
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(async () => ({ choices: [{ message: { content: JSON.stringify({ score: 3, feedback: "Preuve complète.", strengths: ["Contraintes décrites"], improvements: [] }) } }] })),
}));

import { AI_MARKETING_COURSE_ID, getAiMarketingActivityStatus, submitAiMarketingPractical } from "./aiMarketingAssessmentService";

describe("AI marketing source-adapted practical service", () => {
  beforeEach(() => { mocks.events.length = 0; mocks.saved.length = 0; mocks.competency.length = 0; });

  it("uses only Claude Sonnet server evaluation and returns correction after submission", async () => {
    const result = await submitAiMarketingPractical({
      userId: 44,
      courseId: AI_MARKETING_COURSE_ID,
      blockId: "dc_1_act_02_tp",
      lessonIndex: 0,
      chapterIndex: 1,
      answer: "J’ai produit une liste numérotée de dix cas d’usage marketing, chacun associé à une activité opérationnelle et à un résultat attendu. J’ai relu la liste afin d’écarter les doublons et de conserver les propositions pertinentes pour une équipe marketing fictive.",
    });

    expect(result).toMatchObject({ score: 3, passed: true, attemptNumber: 1, model: "claude-sonnet-4-6" });
    expect(result.correction).toContain("10 cas d’usage");
    expect(mocks.saved[0]).toMatchObject({ model: "claude-sonnet-4-6", blockId: "dc_1_act_02_tp" });
    expect(mocks.events[0]).toMatchObject({ eventType: "practical_lab_submitted", success: 1, exerciseId: "dc_1_act_02_tp" });
    expect(mocks.competency).toHaveLength(1);
  });

  it("restores only successfully completed marketing practical gates", async () => {
    mocks.events.push(
      { courseId: AI_MARKETING_COURSE_ID, eventType: "practical_lab_submitted", success: 1, exerciseId: "dc_1_act_02_tp" },
      { courseId: AI_MARKETING_COURSE_ID, eventType: "practical_lab_submitted", success: 0, exerciseId: "dc_1_act_03_tp" },
      { courseId: "another_course", eventType: "practical_lab_submitted", success: 1, exerciseId: "dc_1_act_05_tp" },
    );
    await expect(getAiMarketingActivityStatus({ userId: 44, courseId: AI_MARKETING_COURSE_ID })).resolves.toEqual({ completedPracticalIds: ["dc_1_act_02_tp"] });
  });
});
