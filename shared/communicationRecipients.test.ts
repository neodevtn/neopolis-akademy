import { describe, expect, it } from "vitest";
import { COMMUNICATION_AUDIENCES, COMMUNICATION_AUDIENCE_LABELS, COMMUNICATION_CRITERIA_LOGICS, COMMUNICATION_CRITERIA_LOGIC_LABELS } from "./communicationRecipients";

describe("communication recipient audiences", () => {
  it("keeps each selectable audience documented with a label", () => {
    expect(COMMUNICATION_AUDIENCES).toContain("competency_level");
    expect(COMMUNICATION_AUDIENCES).toContain("manual");
    expect(COMMUNICATION_AUDIENCES.every((audience) => Boolean(COMMUNICATION_AUDIENCE_LABELS[audience]))).toBe(true);
  });

  it("documents the explicit AND/OR operators available to advanced segments", () => {
    expect(COMMUNICATION_CRITERIA_LOGICS).toEqual(["all", "any"]);
    expect(COMMUNICATION_CRITERIA_LOGICS.every((logic) => Boolean(COMMUNICATION_CRITERIA_LOGIC_LABELS[logic]))).toBe(true);
  });
});
