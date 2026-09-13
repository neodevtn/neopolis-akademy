import { describe, expect, it } from "vitest";
import { inspectTurnstilePresenceResult, isValidTurnstilePresenceResult, resolveLearningIntegrityGate, resolveTurnstileExpectedHostname } from "./learningIntegrityGate";

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

  it("valide uniquement un résultat Turnstile réussi pour le bon hôte et la bonne action", () => {
    expect(isValidTurnstilePresenceResult({
      responseOk: true,
      result: { success: true, hostname: "akademy.neodev.click", action: "learning_integrity" },
      expectedHostname: "AKADEMY.NEODEV.CLICK.",
    })).toBe(true);
    expect(isValidTurnstilePresenceResult({
      responseOk: true,
      result: { success: true, hostname: "other.example", action: "learning_integrity" },
      expectedHostname: "akademy.neodev.click",
    })).toBe(false);
    expect(isValidTurnstilePresenceResult({
      responseOk: true,
      result: { success: true, hostname: "akademy.neodev.click", action: "other_action" },
      expectedHostname: "akademy.neodev.click",
    })).toBe(false);
  });

  it("utilise le domaine public transmis par le proxy plutôt que localhost", () => {
    expect(resolveTurnstileExpectedHostname({
      host: "localhost:3000",
      "x-forwarded-host": "akademy.neodev.click",
    })).toBe("akademy.neodev.click");
    expect(resolveTurnstileExpectedHostname({
      host: "localhost:3000",
      "x-forwarded-host": "attacker.example",
    })).toBe("akademy.neodev.click");
  });

  it("qualifie sans secret les causes de refus Turnstile", () => {
    expect(inspectTurnstilePresenceResult({
      responseOk: true,
      result: { success: true, hostname: "akademy.neodev.click", action: "other_action" },
      expectedHostname: "akademy.neodev.click",
    })).toEqual({ valid: false, reason: "action_mismatch" });
    expect(inspectTurnstilePresenceResult({
      responseOk: true,
      result: { success: false },
      expectedHostname: "akademy.neodev.click",
    })).toEqual({ valid: false, reason: "provider_rejected" });
  });
});
