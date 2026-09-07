import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDb, recordLearningEvent } = vi.hoisted(() => ({ getDb: vi.fn(), recordLearningEvent: vi.fn() }));
vi.mock("./db", () => ({ getDb, recordLearningEvent }));

import { flagExamHoneypotTrigger } from "./learningIntegrityGate";

describe("contrat honeypot d’examen", () => {
  beforeEach(() => {
    getDb.mockReset();
    recordLearningEvent.mockReset();
  });

  it("ne transmet jamais le libellé ni la valeur du champ leurre aux réponses d’examen", () => {
    const request = { certificationId: "certification", answers: [{ questionId: "q1", selectedIds: ["a"] }], integrityMarker: "" };
    expect(request.integrityMarker.trim()).toBe("");
    expect(Object.keys(request.answers[0]!)).toEqual(["questionId", "selectedIds"]);
  });

  it("crée une suspension temporaire et journalise seulement le type de signal", async () => {
    const onDuplicateKeyUpdate = vi.fn().mockResolvedValue(undefined);
    const values = vi.fn().mockReturnValue({ onDuplicateKeyUpdate });
    getDb.mockResolvedValue({ insert: vi.fn().mockReturnValue({ values }) });
    recordLearningEvent.mockResolvedValue({ id: 1 });

    await flagExamHoneypotTrigger(42);

    expect(values).toHaveBeenCalledWith(expect.objectContaining({
      userId: 42,
      status: "temporary_hold",
      riskScore: 100,
      signals: [expect.objectContaining({ id: "exam_honeypot_triggered" })],
    }));
    expect(recordLearningEvent).toHaveBeenCalledWith({
      userId: 42,
      eventType: "integrity_exam_honeypot_triggered",
      success: 0,
      metadata: { surface: "exam_submission" },
    });
  });
});
