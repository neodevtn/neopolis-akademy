import { describe, expect, it } from "vitest";
import { certificationTitle, credentialCode, isCourseCompleted } from "./achievementRules";

describe("achievement rules", () => {
  it("requires every distinct lesson index before issuing a skill badge", () => {
    expect(isCourseCompleted([0, 1, 1], 3)).toBe(false);
    expect(isCourseCompleted([2, 1, 0], 3)).toBe(true);
  });

  it("creates deterministic credential codes without unsafe characters", () => {
    expect(credentialCode("skill_badge", 42, "course completion: ai/101")).toBe("NEO-SKILL-42-COURSE-COMPLETION-AI-101");
  });

  it("maps known official certification titles", () => {
    expect(certificationTitle("claude_certified_associate_foundations")).toContain("Associate");
  });
});
