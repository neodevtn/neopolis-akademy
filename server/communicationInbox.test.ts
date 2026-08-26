import { describe, expect, it } from "vitest";
import { isManuallyTargetedCommunication, isUniversalCommunication } from "./adminDb";

describe("durable all-audience communications", () => {
  it("keeps an unqualified all-audience communication visible to new learner accounts", () => {
    expect(isUniversalCommunication({ audience: "all" })).toBe(true);
    expect(isUniversalCommunication(JSON.stringify({ audience: "all", criteriaLogic: "all" }))).toBe(true);
  });

  it("does not treat a targeted audience as a durable global broadcast", () => {
    expect(isUniversalCommunication({ audience: "all", courseId: "course_01" })).toBe(false);
    expect(isUniversalCommunication({ audience: "all", manualEmails: ["learner@example.test"] })).toBe(false);
    expect(isUniversalCommunication({ audience: "learners_started" })).toBe(false);
  });

  it("keeps a manually addressed communication visible regardless of the account role", () => {
    const filter = { audience: "all", manualEmails: ["Admin@Neopolis.dev", "learner@example.test"] };
    expect(isManuallyTargetedCommunication(filter, "admin@neopolis.dev")).toBe(true);
    expect(isManuallyTargetedCommunication(filter, "learner@example.test")).toBe(true);
    expect(isManuallyTargetedCommunication(filter, "other@example.test")).toBe(false);
  });
});
