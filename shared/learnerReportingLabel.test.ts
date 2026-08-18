import { describe, expect, it } from "vitest";
import { learnerReportingLabel } from "./learnerReportingLabel";

describe("learnerReportingLabel", () => {
  it("prioritizes the account e-mail over the optional profile name", () => {
    expect(learnerReportingLabel({ name: "Mohamed Rayen Khalil", email: "mhdrayenkhelil@gmail.com" })).toBe("mhdrayenkhelil@gmail.com");
  });

  it("never exposes a technical identifier when profile data is incomplete", () => {
    expect(learnerReportingLabel({ name: "  ", email: null })).toBe("Apprenant sans e-mail");
  });
});
