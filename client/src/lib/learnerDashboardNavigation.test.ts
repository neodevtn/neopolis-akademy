import { describe, expect, it } from "vitest";
import { getLearnerDashboardTab, getLearnerOrientationAccess } from "./learnerDashboardNavigation";

describe("learner dashboard navigation", () => {
  it("keeps valid tabs addressable through the shared URL contract", () => {
    expect(getLearnerDashboardTab("?tab=catalog")).toBe("catalog");
    expect(getLearnerDashboardTab("?tab=achievements")).toBe("achievements");
    expect(getLearnerDashboardTab("?tab=communications")).toBe("communications");
    expect(getLearnerDashboardTab("?tab=unknown")).toBe("my-path");
  });

  it("never blocks tabs when the orientation is incomplete", () => {
    expect(getLearnerOrientationAccess(true)).toEqual({
      showReminder: true,
      canUseAllTabs: true,
    });
  });

  it("does not show the orientation reminder once the diagnostic is complete", () => {
    expect(getLearnerOrientationAccess(false)).toEqual({
      showReminder: false,
      canUseAllTabs: true,
    });
  });
});
