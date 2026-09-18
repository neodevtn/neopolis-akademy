import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  events: [] as any[],
  saved: [] as any[],
  competencyEvents: [] as any[],
}));

vi.mock("./db", () => ({
  getLearnerLearningEvents: vi.fn(async () => mocks.events),
  recordLearningEvent: vi.fn(async (event) => { mocks.events.push(event); }),
  saveAiResponseEvaluation: vi.fn(async (input) => { mocks.saved.push(input); return { attemptNumber: mocks.saved.length }; }),
}));
vi.mock("./competencyService", () => ({
  getContentCompetencyTags: vi.fn(() => ["workflow_automation"]),
  applyCompetencyEvent: vi.fn(async (event) => { mocks.competencyEvents.push(event); }),
}));

import { getN8nFoundationsActivityStatus, mayAccessN8nFoundationsCorrection, N8N_FOUNDATIONS_COURSE_ID, submitN8nFoundationsWorkflow } from "./n8nFoundationsAssessmentService";
import { N8N_FOUNDATIONS_WORKFLOW_RESOURCES } from "./n8nFoundationsWorkflowRegistry";

const validCurrencyWorkflow = {
  name: "My edited currency workflow",
  nodes: [
    { name: "Currency Form", type: "n8n-nodes-base.formTrigger", parameters: { formFields: { values: [{ fieldLabel: "Amount" }] } } },
    { name: "Get Exchange Rates", type: "n8n-nodes-base.httpRequest", parameters: { url: "https://api.frankfurter.app/latest" } },
    { name: "Format Exchange Rate", type: "n8n-nodes-base.set", parameters: { assignments: { assignments: [{ name: "rate", value: "={{ $json.rates.EUR }}", type: "string" }] } } },
  ],
  connections: {
    "Currency Form": { main: [[{ node: "Get Exchange Rates", type: "main", index: 0 }]] },
    "Get Exchange Rates": { main: [[{ node: "Format Exchange Rate", type: "main", index: 0 }]] },
  },
};

const validMergeWorkflow = {
  name: "Edited merge workflow",
  nodes: [
    { name: "Prepare customer", type: "n8n-nodes-base.code", parameters: { jsCode: "return [{ json: { userId: 1 } }];" } },
    { name: "Prepare order", type: "n8n-nodes-base.code", parameters: { jsCode: "return [{ json: { userId: 1 } }];" } },
    { name: "Merge by userId", type: "n8n-nodes-base.merge", parameters: { mode: "combine" } },
  ],
  connections: {
    "Prepare customer": { main: [[{ node: "Merge by userId", type: "main", index: 0 }]] },
    "Prepare order": { main: [[{ node: "Merge by userId", type: "main", index: 1 }]] },
  },
};

describe("n8n foundations workflow assessment service", () => {
  beforeEach(() => {
    mocks.events.length = 0;
    mocks.saved.length = 0;
    mocks.competencyEvents.length = 0;
  });

  it("accepts a structurally complete edited workflow and releases only its correction", async () => {
    const result = await submitN8nFoundationsWorkflow({ userId: 91, courseId: N8N_FOUNDATIONS_COURSE_ID, blockId: "ch01_ex02_tp", lessonIndex: 0, chapterIndex: 1, workflowJson: JSON.stringify(validCurrencyWorkflow) });

    expect(result).toMatchObject({ score: 3, maxScore: 3, passed: true, attemptNumber: 1 });
    expect(result.correctionResources).toEqual([expect.objectContaining({ filename: "currency_exchange.json", url: N8N_FOUNDATIONS_WORKFLOW_RESOURCES.ch01_ex02_tp.correction.url })]);
    expect(mocks.saved[0].answer).not.toContain("api.frankfurter");
    expect(mocks.events[0]).toMatchObject({ eventType: "practical_lab_submitted", exerciseId: "ch01_ex02_tp", success: 1 });
    expect(mocks.competencyEvents).toHaveLength(1);
  });

  it("rejects malformed JSON and workflows containing a secret", async () => {
    await expect(submitN8nFoundationsWorkflow({ userId: 91, courseId: N8N_FOUNDATIONS_COURSE_ID, blockId: "ch01_ex02_tp", lessonIndex: 0, chapterIndex: 1, workflowJson: "not-json" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(submitN8nFoundationsWorkflow({ userId: 91, courseId: N8N_FOUNDATIONS_COURSE_ID, blockId: "ch01_ex02_tp", lessonIndex: 0, chapterIndex: 1, workflowJson: JSON.stringify({ ...validCurrencyWorkflow, credentials: { apiKey: "this-must-never-be-uploaded" } }) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("fails an incomplete workflow without emitting a correction resource", async () => {
    const result = await submitN8nFoundationsWorkflow({ userId: 91, courseId: N8N_FOUNDATIONS_COURSE_ID, blockId: "ch02_ex10_tp", lessonIndex: 1, chapterIndex: 9, workflowJson: JSON.stringify({ ...validMergeWorkflow, nodes: validMergeWorkflow.nodes.slice(0, 2) }) });
    expect(result.passed).toBe(false);
    expect(result.correctionResources).toEqual([]);
    expect(mocks.events[0]).toMatchObject({ success: 0 });
  });

  it("restores completion and correction access only after a successful submission", async () => {
    const key = N8N_FOUNDATIONS_WORKFLOW_RESOURCES.ch01_ex02_tp.correction.key;
    mocks.events.push(
      { courseId: N8N_FOUNDATIONS_COURSE_ID, eventType: "practical_lab_submitted", success: 1, exerciseId: "ch01_ex02_tp" },
      { courseId: N8N_FOUNDATIONS_COURSE_ID, eventType: "practical_lab_submitted", success: 0, exerciseId: "ch01_ex04_tp" },
    );
    await expect(getN8nFoundationsActivityStatus({ userId: 91, courseId: N8N_FOUNDATIONS_COURSE_ID })).resolves.toEqual({ completedPracticalIds: ["ch01_ex02_tp"] });
    await expect(mayAccessN8nFoundationsCorrection({ userId: 91, key })).resolves.toBe(true);
    await expect(mayAccessN8nFoundationsCorrection({ userId: 91, key: N8N_FOUNDATIONS_WORKFLOW_RESOURCES.ch01_ex04_tp.correction.key })).resolves.toBe(false);
  });
});
