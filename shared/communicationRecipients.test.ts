import { describe, expect, it } from "vitest";
import { COMMUNICATION_AUDIENCES, COMMUNICATION_AUDIENCE_LABELS } from "./communicationRecipients";

describe("communication recipient audiences", () => {
  it("keeps each selectable audience documented with a label", () => {
    expect(COMMUNICATION_AUDIENCES).toContain("competency_level");
    expect(COMMUNICATION_AUDIENCES.every((audience) => Boolean(COMMUNICATION_AUDIENCE_LABELS[audience]))).toBe(true);
  });
});
