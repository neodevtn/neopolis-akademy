import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { getClaudeScienceV2ActivityStatus, submitClaudeScienceV2Reflection } from "./claudeScienceV2AssessmentService";

describe("Claude Science V2 persisted activities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.recordLearningEvent.mockResolvedValue({ id: 1 });
  });

  it("persists a valid reflection without keeping its body in learning event metadata", async () => {
    await expect(submitClaudeScienceV2Reflection({
      userId: 42,
      courseId: "claude_science_03_travaux_pratiques",
      reflectionId: "claude_science_03_travaux_pratiques__module__lesson__reflection",
      lessonIndex: 0,
      chapterIndex: 4,
      answer: "x".repeat(300),
    })).resolves.toEqual({ completed: true });
    expect(mocks.recordLearningEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: "learning_reflection_submitted",
      exerciseId: "claude_science_03_travaux_pratiques__module__lesson__reflection",
      success: 1,
      metadata: { characterCount: 300, nonClinicalCourse: true },
    }));
  });

  it("restores only successful V2 activity flags", async () => {
    mocks.getLearnerLearningEvents.mockResolvedValue([
      { courseId: "claude_science_03_travaux_pratiques", eventType: "practical_lab_submitted", exerciseId: "lab_01", success: 1 },
      { courseId: "claude_science_03_travaux_pratiques", eventType: "course_final_quiz_submitted", exerciseId: "final", success: 1 },
      { courseId: "claude_science_03_travaux_pratiques", eventType: "learning_reflection_submitted", exerciseId: "reflection", success: 1 },
      { courseId: "claude_science_03_travaux_pratiques", eventType: "practical_lab_submitted", exerciseId: "failed-lab", success: 0 },
    ]);
    await expect(getClaudeScienceV2ActivityStatus({ userId: 42, courseId: "claude_science_03_travaux_pratiques" }))
      .resolves.toEqual({ completedLabs: ["lab_01"], completedFinalQuizzes: ["final"], completedReflections: ["reflection"] });
  });
});
