import { describe, expect, it } from "vitest";
import { learnerReportingLabel } from "./learnerReportingLabel";

describe("learnerReportingLabel", () => {
  it("prioritizes the profile name and uses e-mail only as a fallback", () => {
    expect(learnerReportingLabel({ name: "Mohamed Rayen Khalil", email: "mhdrayenkhelil@gmail.com" })).toBe("Mohamed Rayen Khalil");
    expect(learnerReportingLabel({ name: "  ", email: "mhdrayenkhelil@gmail.com" })).toBe("mhdrayenkhelil@gmail.com");
  });

  it("never exposes a technical identifier when profile data is incomplete", () => {
    expect(learnerReportingLabel({ name: "  ", email: null })).toBe("Profil apprenant incomplet");
  });
});
