import { describe, expect, it } from "vitest";
import { resolveLearningIntegrityGate } from "./learningIntegrityGate";

describe("Learning Integrity Gate", () => {
  const now = new Date("2026-09-07T12:00:00Z");

  it("autorise une activité ordinaire et une vérification de présence encore valide", () => {
    expect(resolveLearningIntegrityGate({ riskScore: 0, signalIds: [], now }).status).toBe("allow");
    expect(resolveLearningIntegrityGate({ riskScore: 35, signalIds: ["rapid_success_chain"], presenceVerifiedAt: new Date(now.getTime() - 5 * 60_000), now }).status).toBe("allow");
  });

  it("demande une vérification avant une validation au risque intermédiaire", () => {
    const decision = resolveLearningIntegrityGate({ riskScore: 35, signalIds: ["rapid_success_chain"], now });
    expect(decision.status).toBe("challenge_required");
    expect(decision.message).toContain("vérification de présence");
  });

  it("suspend temporairement les validations au risque élevé ou après une décision humaine", () => {
    expect(resolveLearningIntegrityGate({ riskScore: 60, signalIds: ["rapid_success_chain", "recorded_time_mismatch"], now }).status).toBe("temporarily_suspended");
    expect(resolveLearningIntegrityGate({ riskScore: 0, signalIds: [], reviewStatus: "temporary_hold", now }).status).toBe("temporarily_suspended");
  });
});
