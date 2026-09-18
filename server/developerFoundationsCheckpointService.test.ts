import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getExerciseResults: vi.fn(), saveExerciseResult: vi.fn(), recordLearningEvent: vi.fn() }));
vi.mock("./db", () => mocks);

import { DEVELOPER_FOUNDATIONS_SECURE_CORRECTIONS } from "./developerFoundationsCorrectionRegistry";
import { getDeveloperFoundationsCheckpointCorrection, getDeveloperFoundationsCheckpointStatus, submitDeveloperFoundationsCheckpoint } from "./developerFoundationsCheckpointService";

const courseId = "claude_certified_developer_foundations__01";
const exercise = Object.entries(DEVELOPER_FOUNDATIONS_SECURE_CORRECTIONS[courseId])[0];
if (!exercise) throw new Error("Developer Foundations correction fixture is missing");

describe("Developer Foundations checkpoint service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getExerciseResults.mockResolvedValue([]);
    mocks.saveExerciseResult.mockResolvedValue({ id: 1 });
    mocks.recordLearningEvent.mockResolvedValue({ id: 1 });
  });

  it("releases correction only after a server-recorded submission", async () => {
    const [exerciseId, expected] = exercise;
    await expect(getDeveloperFoundationsCheckpointCorrection({ userId: 8, courseId, exerciseId })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const result = await submitDeveloperFoundationsCheckpoint({ userId: 8, courseId, exerciseId, answer: "Réponse soumise.", selectedOptionIds: [expected.correctOptionIds[0]] });
    expect(result).toMatchObject({ submitted: true, passed: true, correction: expected.correction, correctOptionIds: expected.correctOptionIds });
    expect(mocks.saveExerciseResult).toHaveBeenCalledWith("8", courseId, `developer-checkpoint:${exerciseId}`, 1, 1, expect.any(String));
  });

  it("persists and reports only Developer checkpoint activity", async () => {
    const [exerciseId] = exercise;
    mocks.getExerciseResults.mockResolvedValue([
      { moduleId: `developer-checkpoint:${exerciseId}`, score: 1, totalQuestions: 1 },
      { moduleId: "another-module", score: 1, totalQuestions: 1 },
    ]);
    await expect(getDeveloperFoundationsCheckpointStatus({ userId: 8, courseId })).resolves.toEqual({ submittedExerciseIds: [exerciseId], passedExerciseIds: [exerciseId] });
  });
});
