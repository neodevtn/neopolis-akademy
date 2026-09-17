import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ events: [] as any[], saved: [] as any[], competency: [] as any[] }));
vi.mock("./db", () => ({ getLearnerLearningEvents: vi.fn(async () => mocks.events), recordLearningEvent: vi.fn(async (event) => { mocks.events.push(event); }), saveAiResponseEvaluation: vi.fn(async (input) => { mocks.saved.push(input); return { attemptNumber: mocks.saved.length }; }) }));
vi.mock("./competencyService", () => ({ applyCompetencyEvent: vi.fn(async (event) => { mocks.competency.push(event); }), getContentCompetencyTags: vi.fn(() => ["finance-ai"]) }));
vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn(async () => ({ choices: [{ message: { content: JSON.stringify({ score: 2, feedback: "Preuve complète.", strengths: ["Cas d’usage décrits"], improvements: [] }) } }] })) }));
import { AI_FINANCE_COURSE_ID, getAiFinanceActivityStatus, submitAiFinancePractical } from "./aiFinanceAssessmentService";

describe("AI finance source-adapted practical service", () => {
  beforeEach(() => { mocks.events.length = 0; mocks.saved.length = 0; mocks.competency.length = 0; });
  it("uses only Claude Sonnet server evaluation and returns correction after submission", async () => {
    const result = await submitAiFinancePractical({ userId: 44, courseId: AI_FINANCE_COURSE_ID, blockId: "dc_1_act_02_tp", lessonIndex: 0, chapterIndex: 1, answer: "J’ai demandé des cas d’usage de l’IA générative en finance. La réponse relie l’analyse financière, la gestion des risques et l’efficacité opérationnelle à des situations fictives ; je l’ai structurée pour une présentation interne sans utiliser de données réelles." });
    expect(result).toMatchObject({ score: 2, passed: true, attemptNumber: 1, model: "claude-sonnet-4-6" });
    expect(result.correction).toContain("cas d’usage");
    expect(mocks.saved[0]).toMatchObject({ model: "claude-sonnet-4-6", blockId: "dc_1_act_02_tp" });
    expect(mocks.events[0]).toMatchObject({ eventType: "practical_lab_submitted", success: 1, exerciseId: "dc_1_act_02_tp" });
    expect(mocks.competency).toHaveLength(1);
  });
  it("restores only successfully completed finance practical gates", async () => {
    mocks.events.push({ courseId: AI_FINANCE_COURSE_ID, eventType: "practical_lab_submitted", success: 1, exerciseId: "dc_1_act_02_tp" }, { courseId: AI_FINANCE_COURSE_ID, eventType: "practical_lab_submitted", success: 0, exerciseId: "dc_1_act_06_tp" });
    await expect(getAiFinanceActivityStatus({ userId: 44, courseId: AI_FINANCE_COURSE_ID })).resolves.toEqual({ completedPracticalIds: ["dc_1_act_02_tp"] });
  });
});
