import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getExerciseResults: vi.fn(),
  saveExerciseResult: vi.fn(),
  recordLearningEvent: vi.fn(),
}));

vi.mock("./db", () => mocks);

import { ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS } from "./architectFoundationsCorrectionRegistry";
import {
  completionFromSelection,
  getArchitectFoundationsCheckpointCorrection,
  getArchitectFoundationsCheckpointStatus,
  submitArchitectFoundationsCheckpoint,
} from "./architectFoundationsCheckpointService";

const courseId = "claude_certified_architect_foundations__01";
const optionedExercise = Object.entries(ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS[courseId]).find(([, value]) => value.correctOptionIds?.length);
if (!optionedExercise) throw new Error("Architect Foundations fixture registry is missing its machine-evaluable checkpoint");

describe("Architect Foundations checkpoint service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getExerciseResults.mockResolvedValue([]);
    mocks.saveExerciseResult.mockResolvedValue({ id: 1, success: true });
    mocks.recordLearningEvent.mockResolvedValue({ id: 1 });
  });

  it("fails closed if no selectable answer key exists", () => {
    expect(completionFromSelection(undefined, [])).toBe(false);
    expect(completionFromSelection([], ["anything"])).toBe(false);
  });

  it("evaluates option selections on the server and releases feedback after an unsuccessful attempt", async () => {
    const [exerciseId, expected] = optionedExercise;
    const correctOptionIds = expected.correctOptionIds || [];
    const result = await submitArchitectFoundationsCheckpoint({ userId: 42, courseId, exerciseId, answer: "", selectedOptionIds: ["incorrect-option"] });

    expect(result).toMatchObject({ submitted: true, passed: false, correction: expected.correction, correctOptionIds });
    expect(mocks.saveExerciseResult).toHaveBeenCalledWith("42", courseId, `architect-checkpoint:${exerciseId}`, 0, 1, expect.any(String));
    expect(mocks.recordLearningEvent).toHaveBeenCalledWith(expect.objectContaining({ success: 0, metadata: { serverValidated: true, correctionReleased: true } }));
  });

  it("persists success only for an exact machine-evaluable option selection", async () => {
    const [exerciseId, expected] = optionedExercise;
    const result = await submitArchitectFoundationsCheckpoint({ userId: 42, courseId, exerciseId, answer: "", selectedOptionIds: expected.correctOptionIds || [] });

    expect(result).toMatchObject({ submitted: true, passed: true, attemptNumber: 1 });
    expect(mocks.saveExerciseResult).toHaveBeenCalledWith("42", courseId, `architect-checkpoint:${exerciseId}`, 1, 1, expect.any(String));
  });

  it("denies correction retrieval before a server-recorded submission", async () => {
    const [exerciseId] = optionedExercise;
    await expect(getArchitectFoundationsCheckpointCorrection({ userId: 42, courseId, exerciseId })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not allow a historical free-text auto-pass to reopen a progression gate", async () => {
    const [exerciseId] = optionedExercise;
    mocks.getExerciseResults.mockResolvedValue([
      { moduleId: "architect-checkpoint:retired-free-text-id", score: 1, totalQuestions: 1, createdAt: new Date("2026-09-18T00:00:00Z") },
      { moduleId: `architect-checkpoint:${exerciseId}`, score: 1, totalQuestions: 1, createdAt: new Date("2026-09-18T00:01:00Z") },
      { moduleId: "another-module", score: 1, totalQuestions: 1, createdAt: new Date("2026-09-18T00:02:00Z") },
    ]);

    await expect(getArchitectFoundationsCheckpointStatus({ userId: 42, courseId })).resolves.toEqual({
      submittedExerciseIds: ["retired-free-text-id", exerciseId],
      passedExerciseIds: [exerciseId],
    });
  });
});
