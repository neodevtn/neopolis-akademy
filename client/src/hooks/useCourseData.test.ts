import { describe, expect, it } from "vitest";
import { afterEach, vi } from "vitest";
import { buildCourseAssetUrl, getCourseDataCacheStats, getCourseFileCandidates, prefetchCourse } from "./useCourseData";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("course data asset URLs", () => {
  it("uses the current deployment version to bypass stale CDN entries", () => {
    expect(buildCourseAssetUrl("claude_certified_associate_foundations__04", "deploy-60a58048", 123)).toBe(
      "/api/trpc/course-data/claude_certified_associate_foundations__04?course-version=deploy-60a58048",
    );
  });

  it("uses a per-request fallback token when the deployment version is unavailable", () => {
    expect(buildCourseAssetUrl("course with space", null, 123)).toBe(
      "/api/trpc/course-data/course%20with%20space?course-version=request-123",
    );
  });

  it("keeps legacy file candidates available for fallback", () => {
    expect(getCourseFileCandidates("prompt_engineering_with_the_openai_api__01")).toEqual([
      "prompt_engineering_with_the_openai_api__01",
      "prompt_engineering_with_openai_api__01",
    ]);
  });

  it("keeps a successfully loaded course in memory across subsequent prefetches", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ version: "cache-proof" }) })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json; charset=utf-8" }),
        json: async () => ({ lessons: [], exercises: [], sections: [] }),
      });
    vi.stubGlobal("fetch", fetchMock);

    prefetchCourse("course_cache_proof");
    await vi.waitFor(() => expect(getCourseDataCacheStats().cachedIds).toContain("course_cache_proof"));
    prefetchCourse("course_cache_proof");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getCourseDataCacheStats().cachedIds).toContain("course_cache_proof");
  });
});
