import { describe, expect, it } from "vitest";
import { engagementBucket, firstAttemptRate, isPedagogicalReportingEvent } from "./reportingMetrics";

describe("reportingMetrics", () => {
  it("calculates the first-attempt success rate without inventing a rate when there is no attempt", () => {
    expect(firstAttemptRate(3, 4)).toBe(75);
    expect(firstAttemptRate(0, 0)).toBeNull();
  });

  it("classifies engagement with documented inclusive thresholds", () => {
    expect(engagementBucket(0, false)).toBe("none");
    expect(engagementBucket(0, true)).toBe("short");
    expect(engagementBucket(30 * 60, false)).toBe("short");
    expect(engagementBucket(30 * 60 + 1, false)).toBe("regular");
    expect(engagementBucket(120 * 60, false)).toBe("regular");
    expect(engagementBucket(120 * 60 + 1, false)).toBe("deep");
  });

  it("keeps administration events out of learner reporting", () => {
    expect(isPedagogicalReportingEvent("learning_time")).toBe(true);
    expect(isPedagogicalReportingEvent("exercise_submitted")).toBe(true);
    expect(isPedagogicalReportingEvent("admin_page_view")).toBe(false);
    expect(isPedagogicalReportingEvent("communication_sent")).toBe(false);
  });
});
