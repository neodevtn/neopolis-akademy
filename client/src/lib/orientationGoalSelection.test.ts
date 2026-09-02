import { describe, expect, it } from "vitest";
import { MAX_ORIENTATION_GOALS, canAddOrientationGoal, toggleOrientationGoal } from "./orientationGoalSelection";

const fiveGoals = Array.from({ length: MAX_ORIENTATION_GOALS }, (_, index) => ({
  competencyId: `competency_${index + 1}`,
  targetLevel: "bronze" as const,
}));

describe("orientation goal selection", () => {
  it("prevents adding a sixth goal while allowing an existing goal to be removed", () => {
    expect(canAddOrientationGoal(fiveGoals, "competency_6")).toBe(false);
    expect(toggleOrientationGoal(fiveGoals, "competency_6")).toEqual(fiveGoals);
    expect(toggleOrientationGoal(fiveGoals, "competency_1")).toHaveLength(MAX_ORIENTATION_GOALS - 1);
  });

  it("adds a goal while capacity remains", () => {
    expect(toggleOrientationGoal(fiveGoals.slice(0, 4), "competency_5")).toHaveLength(MAX_ORIENTATION_GOALS);
  });
});
