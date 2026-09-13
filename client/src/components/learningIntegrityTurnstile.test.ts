import { describe, expect, it } from "vitest";
import {
  initialPresenceChallengeState,
  reducePresenceChallenge,
  TURNSTILE_VERIFICATION_TIMEOUT_MS,
  TURNSTILE_WIDGET_TIMEOUT_MS,
} from "./learningIntegrityTurnstile";

describe("cycle Turnstile de vérification de présence", () => {
  it("sort du chargement indéfini lorsque le widget échoue puis permet une relance propre", () => {
    const failed = reducePresenceChallenge(initialPresenceChallengeState, {
      type: "failed",
      message: "Le contrôle ne répond pas.",
    });
    expect(failed).toEqual({ phase: "error", error: "Le contrôle ne répond pas." });
    expect(reducePresenceChallenge(failed, { type: "retry" })).toEqual(initialPresenceChallengeState);
  });

  it("distingue le chargement du widget, la validation serveur et le succès", () => {
    const ready = reducePresenceChallenge(initialPresenceChallengeState, { type: "widget_ready" });
    const verifying = reducePresenceChallenge(ready, { type: "verification_started" });
    const verified = reducePresenceChallenge(verifying, { type: "verification_succeeded" });
    expect(ready.phase).toBe("awaiting_challenge");
    expect(verifying.phase).toBe("verifying");
    expect(verified.phase).toBe("verified");
  });

  it("borne les deux attentes à des délais finis", () => {
    expect(TURNSTILE_WIDGET_TIMEOUT_MS).toBeGreaterThan(0);
    expect(TURNSTILE_VERIFICATION_TIMEOUT_MS).toBeGreaterThan(0);
    expect(TURNSTILE_WIDGET_TIMEOUT_MS).toBeLessThanOrEqual(30_000);
    expect(TURNSTILE_VERIFICATION_TIMEOUT_MS).toBeLessThanOrEqual(20_000);
  });
});

