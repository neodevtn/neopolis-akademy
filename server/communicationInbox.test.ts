import { describe, expect, it } from "vitest";
import { isUniversalCommunication } from "./adminDb";

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
});
