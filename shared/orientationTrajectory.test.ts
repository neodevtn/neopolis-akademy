import { describe, expect, it } from "vitest";
import { buildOrientationTrajectory } from "./orientationTrajectory";

describe("orientation trajectory", () => {
  it("construit une comparaison linéaire entre avancement prévu et réel", () => {
    const result = buildOrientationTrajectory({
      startedAt: "2026-08-01T00:00:00.000Z",
      targetDate: "2026-08-11",
      targetPoints: 40,
      contributions: [{ awardedAt: "2026-08-04T00:00:00.000Z", points: 20 }],
      now: new Date("2026-08-06T12:00:00.000Z"),
    });
    expect(result.available).toBe(true);
    expect(result.points).toHaveLength(7);
    expect(result.points.at(-1)?.actual).toBeNull();
    expect(result.points.some((point) => point.actual === 50)).toBe(true);
  });

  it("demande une échéance avant de tracer la trajectoire prévue", () => {
    expect(buildOrientationTrajectory({ startedAt: new Date(), targetDate: null, targetPoints: 10, contributions: [] }).available).toBe(false);
  });
});
