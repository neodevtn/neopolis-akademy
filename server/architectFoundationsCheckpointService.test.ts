import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getExerciseResults: vi.fn(),
  saveExerciseResult: vi.fn(),
  recordLearningEvent: vi.fn(),
}));

vi.mock("./db", () => mocks);

import { ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS } from "./architectFoundationsCorrectionRegistry";
import { getArchitectFoundationsCheckpointCorrection, getArchitectFoundationsCheckpointStatus, submitArchitectFoundationsCheckpoint } from "./architectFoundationsCheckpointService";

const courseId = "claude_certified_architect_foundations__01";
const optionedExercise = Object.entries(ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS[courseId]).find(([, value]) => value.correctOptionIds?.length);
const freeTextExercise = Object.entries(ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS[courseId]).find(([, value]) => !value.correctOptionIds?.length);

if (!optionedExercise || !freeTextExercise) throw new Error("Architect Foundations fixture registry is incomplete");

describe("Architect Foundations checkpoint service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getExerciseResults.mockResolvedValue([]);
    mocks.saveExerciseResult.mockResolvedValue({ id: 1, success: true });
    mocks.recordLearningEvent.mockResolvedValue({ id: 1 });
  });

  it("releases a free-text correction only in the submitted server response", async () => {
    const [exerciseId, expected] = freeTextExercise;
    const result = await submitArchitectFoundationsCheckpoint({ userId: 42, courseId, exerciseId, answer: "Réponse personnelle soumise par l’apprenant.", selectedOptionIds: [] });

    expect(result).toMatchObject({ submitted: true, passed: true, attemptNumber: 1, correction: expected.correction, rubric: expected.rubric });
    expect(mocks.saveExerciseResult).toHaveBeenCalledWith("42", courseId, `architect-checkpoint:${exerciseId}`, 1, 1, expect.any(String));
    expect(mocks.recordLearningEvent).toHaveBeenCalledWith(expect.objectContaining({ userId: 42, courseId, exerciseId, success: 1, metadata: { serverValidated: true, correctionReleased: true } }));
  });

  it("evaluates option selections on the server and releases feedback after an unsuccessful attempt", async () => {
    const [exerciseId, expected] = optionedExercise;
    const correctOptionIds = expected.correctOptionIds || [];
    const result = await submitArchitectFoundationsCheckpoint({ userId: 42, courseId, exerciseId, answer: "", selectedOptionIds: ["incorrect-option"] });

    expect(result).toMatchObject({ submitted: true, passed: false, correction: expected.correction, correctOptionIds });
    expect(mocks.saveExerciseResult).toHaveBeenCalledWith("42", courseId, `architect-checkpoint:${exerciseId}`, 0, 1, expect.any(String));
    expect(mocks.recordLearningEvent).toHaveBeenCalledWith(expect.objectContaining({ success: 0 }));
  });

  it("denies correction retrieval before a server-recorded submission", async () => {
    const [exerciseId] = freeTextExercise;
    await expect(getArchitectFoundationsCheckpointCorrection({ userId: 42, courseId, exerciseId })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("reports only persisted Architect checkpoint activity", async () => {
    mocks.getExerciseResults.mockResolvedValue([
      { moduleId: `architect-checkpoint:${freeTextExercise[0]}`, score: 1, totalQuestions: 1, createdAt: new Date("2026-09-18T00:00:00Z") },
      { moduleId: `architect-checkpoint:${optionedExercise[0]}`, score: 0, totalQuestions: 1, createdAt: new Date("2026-09-18T00:01:00Z") },
      { moduleId: "another-module", score: 1, totalQuestions: 1, createdAt: new Date("2026-09-18T00:02:00Z") },
    ]);

    await expect(getArchitectFoundationsCheckpointStatus({ userId: 42, courseId })).resolves.toEqual({
      submittedExerciseIds: [freeTextExercise[0], optionedExercise[0]],
      passedExerciseIds: [freeTextExercise[0]],
    });
  });
});
