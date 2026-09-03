import { describe, expect, it } from "vitest";
import { canBypassLearningSequence, isAdministrativeRole, isLearnerStatisticsRole, userRoleLabel } from "./roles";

describe("admin-learner role contract", () => {
  it("retains administrative access without becoming a sequence-bypass role", () => {
    expect(isAdministrativeRole("admin_learner")).toBe(true);
    expect(canBypassLearningSequence("admin_learner")).toBe(false);
  });

  it("counts admin-learners in personal learning statistics", () => {
    expect(isLearnerStatisticsRole("admin_learner")).toBe(true);
    expect(userRoleLabel("admin_learner")).toBe("Admin-apprenant");
  });
});
