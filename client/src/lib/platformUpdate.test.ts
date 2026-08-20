import { describe, expect, it } from "vitest";
import { extractEntryBundle, isLearnerLearningRoute, shouldShowPlatformUpdate } from "./platformUpdate";

describe("platform update detection", () => {
  it("extracts the active Vite entry from a fresh application document", () => {
    expect(extractEntryBundle('<script type="module" src="/assets/index-new-build.js"></script>')).toBe(
      "/assets/index-new-build.js",
    );
  });

  it("prompts only when the fresh document exposes a different entry bundle", () => {
    expect(shouldShowPlatformUpdate("/assets/index-old.js", "/assets/index-new.js")).toBe(true);
    expect(shouldShowPlatformUpdate("/assets/index-current.js", "/assets/index-current.js")).toBe(false);
    expect(shouldShowPlatformUpdate(null, "/assets/index-new.js")).toBe(false);
  });

  it("limits the notification to learner learning routes", () => {
    expect(isLearnerLearningRoute("/training")).toBe(true);
    expect(isLearnerLearningRoute("/training/ai_pour_les_nuls/ia_pour_les_nuls__01")).toBe(true);
    expect(isLearnerLearningRoute("/mock-exam/claude_certified_developer_foundations")).toBe(true);
    expect(isLearnerLearningRoute("/admin/training")).toBe(false);
    expect(isLearnerLearningRoute("/")).toBe(false);
  });
});
