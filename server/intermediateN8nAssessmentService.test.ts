import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  events: [] as any[],
  saved: [] as any[],
}));

vi.mock("./db", () => ({
  getLearnerLearningEvents: vi.fn(async () => mocks.events),
  recordLearningEvent: vi.fn(async (event) => { mocks.events.push(event); }),
  saveAiResponseEvaluation: vi.fn(async (input) => { mocks.saved.push(input); return { attemptNumber: mocks.saved.length }; }),
}));

import { getIntermediateN8nActivityStatus, INTERMEDIATE_N8N_COURSE_ID, submitIntermediateN8nPractical } from "./intermediateN8nAssessmentService";

describe("intermediate n8n source-verified practical service", () => {
  beforeEach(() => {
    mocks.events.length = 0;
    mocks.saved.length = 0;
  });

  it("scores the verified webhook practice on the server and reveals correction only after submission", async () => {
    const result = await submitIntermediateN8nPractical({
      userId: 44,
      courseId: INTERMEDIATE_N8N_COURSE_ID,
      blockId: "dc_1_act_02_tp",
      lessonIndex: 0,
      chapterIndex: 1,
      answer: "J’ai créé un Webhook Trigger en POST qui attend Respond to Webhook. La réponse JSON renvoie 200. J’ai épinglé une charge synthétique avec email puis vérifié que les deux nœuds ont réussi.",
    });

    expect(result).toMatchObject({ score: 3, passed: true, attemptNumber: 1, correction: expect.stringContaining("Webhook Trigger") });
    expect(mocks.saved[0].rubric).toHaveLength(3);
    expect(mocks.events[0]).toMatchObject({ eventType: "practical_lab_submitted", exerciseId: "dc_1_act_02_tp", success: 1 });
  });

  it("does not accept a partial n8n validation proof", async () => {
    const result = await submitIntermediateN8nPractical({
      userId: 44,
      courseId: INTERMEDIATE_N8N_COURSE_ID,
      blockId: "dc_1_act_03_tp",
      lessonIndex: 0,
      chapterIndex: 2,
      answer: "J’ai ajouté une condition If sur email et une branche 200. Il faut encore documenter le reste du test.",
    });

    expect(result.passed).toBe(false);
    expect(result.score).toBeLessThan(3);
    expect(result.improvements).toContain("Branches succès 200 et erreur 400");
  });

  it("grades the source-verified reliability checkpoint on the server", async () => {
    const result = await submitIntermediateN8nPractical({
      userId: 44,
      courseId: INTERMEDIATE_N8N_COURSE_ID,
      blockId: "dc_4_act_02_tp",
      lessonIndex: 3,
      chapterIndex: 1,
      answer: "J’ai mis un nœud If sur order_id pour arrêter les commandes sans identifiant. Un second If teste amount afin que les montants nuls ne passent jamais vers Process Order. Les deux cas sont envoyés vers Stop and Error avec un message explicite.",
    });

    expect(result).toMatchObject({ score: 2, passed: true, attemptNumber: 1 });
    expect(result.correction).toContain("order_id");
    expect(mocks.events[0]).toMatchObject({ exerciseId: "dc_4_act_02_tp", success: 1 });
  });

  it("restores only successful n8n practical gates", async () => {
    mocks.events.push(
      { courseId: INTERMEDIATE_N8N_COURSE_ID, eventType: "practical_lab_submitted", success: 1, exerciseId: "dc_1_act_02_tp" },
      { courseId: INTERMEDIATE_N8N_COURSE_ID, eventType: "practical_lab_submitted", success: 0, exerciseId: "dc_1_act_03_tp" },
      { courseId: "other_course", eventType: "practical_lab_submitted", success: 1, exerciseId: "dc_1_act_03_tp" },
    );

    await expect(getIntermediateN8nActivityStatus({ userId: 44, courseId: INTERMEDIATE_N8N_COURSE_ID })).resolves.toEqual({ completedPracticalIds: ["dc_1_act_02_tp"] });
  });
});
