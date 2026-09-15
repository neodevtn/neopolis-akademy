import { describe, expect, it } from "vitest";
import { buildCourseAssetUrl, getCourseFileCandidates } from "./useCourseData";

describe("course data asset URLs", () => {
  it("uses the current deployment version to bypass stale CDN entries", () => {
    expect(buildCourseAssetUrl("claude_certified_associate_foundations__04", "deploy-60a58048", 123)).toBe(
      "/api/course-data/claude_certified_associate_foundations__04?course-version=deploy-60a58048",
    );
  });

  it("uses a per-request fallback token when the deployment version is unavailable", () => {
    expect(buildCourseAssetUrl("course with space", null, 123)).toBe(
      "/api/course-data/course%20with%20space?course-version=request-123",
    );
  });

  it("keeps legacy file candidates available for fallback", () => {
    expect(getCourseFileCandidates("prompt_engineering_with_the_openai_api__01")).toEqual([
      "prompt_engineering_with_the_openai_api__01",
      "prompt_engineering_with_openai_api__01",
    ]);
  });
});
