import { describe, expect, it } from "vitest";
import { getLearnerDashboardTab, getLearnerOrientationAccess } from "./learnerDashboardNavigation";

describe("learner dashboard navigation", () => {
  it("keeps valid and legacy tabs addressable through the consolidated URL contract", () => {
    expect(getLearnerDashboardTab("?tab=catalog")).toBe("catalog");
    expect(getLearnerDashboardTab("?tab=achievements")).toBe("growth");
    expect(getLearnerDashboardTab("?tab=skills")).toBe("growth");
    expect(getLearnerDashboardTab("?tab=orientation")).toBe("journey");
    expect(getLearnerDashboardTab("?tab=communications")).toBe("communications");
    expect(getLearnerDashboardTab("?tab=messages")).toBe("messages");
    expect(getLearnerDashboardTab("?tab=evolution")).toBe("journey");
    expect(getLearnerDashboardTab("?tab=parrainage")).toBe("parrainage");
    expect(getLearnerDashboardTab("?tab=parainnage")).toBe("parrainage");
    expect(getLearnerDashboardTab("?tab=unknown")).toBe("journey");
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
