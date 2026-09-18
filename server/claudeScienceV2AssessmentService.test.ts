import { beforeEach, describe, expect, it, vi } from "vitest";
import { CLAUDE_SCIENCE_V2_LABS } from "./claudeScienceV2Assessments";

const mocks = vi.hoisted(() => ({
  getLearnerLearningEvents: vi.fn(),
  recordLearningEvent: vi.fn(),
  saveExerciseResult: vi.fn(),
  getExerciseResults: vi.fn(),
  saveAiResponseEvaluation: vi.fn(),
}));

vi.mock("./db", () => ({
  getLearnerLearningEvents: mocks.getLearnerLearningEvents,
  recordLearningEvent: mocks.recordLearningEvent,
  saveExerciseResult: mocks.saveExerciseResult,
  getExerciseResults: mocks.getExerciseResults,
  saveAiResponseEvaluation: mocks.saveAiResponseEvaluation,
}));
vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn() }));
vi.mock("./competencyService", () => ({ applyCompetencyEvent: vi.fn(), getContentCompetencyTags: vi.fn(() => []) }));

import { getClaudeScienceV2ActivityStatus, mayAccessClaudeScienceCorrectionAsset, submitClaudeScienceV2Reflection } from "./claudeScienceV2AssessmentService";

describe("Claude Science V2 persisted activities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.recordLearningEvent.mockResolvedValue({ id: 1 });
  });

  it("persists a valid reflection without keeping its body in learning event metadata", async () => {
    await expect(submitClaudeScienceV2Reflection({
      userId: 42,
      courseId: "claude_science_03_tp",
      reflectionId: "claude_science_03_tp__module__lesson__reflection",
      lessonIndex: 0,
      chapterIndex: 4,
      answer: "x".repeat(300),
    })).resolves.toEqual({ completed: true });
    expect(mocks.recordLearningEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: "learning_reflection_submitted",
      exerciseId: "claude_science_03_tp__module__lesson__reflection",
      success: 1,
      metadata: { characterCount: 300, nonClinicalCourse: true },
    }));
  });

  it("restores only successful V2 activity flags", async () => {
    mocks.getLearnerLearningEvents.mockResolvedValue([
      { courseId: "claude_science_03_tp", eventType: "practical_lab_submitted", exerciseId: "lab_01", success: 1 },
      { courseId: "claude_science_03_tp", eventType: "course_final_quiz_submitted", exerciseId: "final", success: 1 },
      { courseId: "claude_science_03_tp", eventType: "learning_reflection_submitted", exerciseId: "reflection", success: 1 },
      { courseId: "claude_science_03_tp", eventType: "practical_lab_submitted", exerciseId: "failed-lab", success: 0 },
    ]);
    await expect(getClaudeScienceV2ActivityStatus({ userId: 42, courseId: "claude_science_03_tp" }))
      .resolves.toEqual({ completedLabs: ["lab_01"], completedFinalQuizzes: ["final"], completedReflections: ["reflection"] });
  });

  it("allows a declared correction file only after the matching practical has been submitted", async () => {
    const key = String((CLAUDE_SCIENCE_V2_LABS as any).lab_02.correctionResources[0].url).replace("/api/assets/", "");
    mocks.getLearnerLearningEvents.mockResolvedValue([]);
    await expect(mayAccessClaudeScienceCorrectionAsset({ userId: 42, key })).resolves.toBe(false);

    mocks.getLearnerLearningEvents.mockResolvedValue([
      { courseId: "claude_science_03_tp", eventType: "practical_lab_submitted", exerciseId: "lab_01", success: 0 },
    ]);
    await expect(mayAccessClaudeScienceCorrectionAsset({ userId: 42, key })).resolves.toBe(false);

    mocks.getLearnerLearningEvents.mockResolvedValue([
      { courseId: "claude_science_03_tp", eventType: "practical_lab_submitted", exerciseId: "lab_02", success: 0 },
    ]);
    await expect(mayAccessClaudeScienceCorrectionAsset({ userId: 42, key })).resolves.toBe(true);
  });
});
