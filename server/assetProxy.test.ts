import { describe, expect, it } from "vitest";
import {
  getAssetCacheControl,
  VERSIONED_PUBLIC_ASSET_CACHE_CONTROL,
} from "./assetProxy";

describe("getAssetCacheControl", () => {
  it("uses a long immutable cache policy for content-addressed public assets", () => {
    expect(getAssetCacheControl("neopolis-home-ambassador-768_c840b19b.webp"))
      .toBe(VERSIONED_PUBLIC_ASSET_CACHE_CONTROL);
  });

  it("keeps a conservative policy for keys without a version suffix", () => {
    expect(getAssetCacheControl("course-cover.webp")).toContain("max-age=3600");
    expect(getAssetCacheControl("course-cover.webp")).not.toContain("immutable");
  });
});
