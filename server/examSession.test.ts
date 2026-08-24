import { describe, expect, it } from "vitest";
import { canRestoreExamSession, getExamSessionRemainingSeconds } from "../shared/examSession";

describe("sessions d’examen persistantes", () => {
  it("restaure une session active avec le temps réellement restant", () => {
    const now = Date.UTC(2026, 7, 24, 21, 50, 0);
    const expiry = new Date(now + 93_000);
    expect(canRestoreExamSession(expiry, now)).toBe(true);
    expect(getExamSessionRemainingSeconds(expiry, now)).toBe(93);
  });

  it("refuse de restaurer une session expirée", () => {
    const now = Date.UTC(2026, 7, 24, 21, 50, 0);
    expect(canRestoreExamSession(new Date(now - 1), now)).toBe(false);
    expect(getExamSessionRemainingSeconds(new Date(now - 1), now)).toBe(0);
  });
});
