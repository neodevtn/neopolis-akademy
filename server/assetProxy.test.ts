import type { Express } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./_core/env", () => ({
  ENV: { forgeApiUrl: "https://forge.example/", forgeApiKey: "test-key" },
}));

import {
  getAssetCacheControl,
  registerAssetProxy,
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

describe("registerAssetProxy", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("relays a Range request without issuing an upstream HEAD", async () => {
    let handler: ((req: any, res: any) => Promise<void>) | undefined;
    const app = {
      get: (_path: string, callback: (req: any, res: any) => Promise<void>) => {
        handler = callback;
      },
    } as unknown as Express;
    registerAssetProxy(app);

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: "https://storage.example/video.mp4" }), { status: 200 }))
      .mockResolvedValueOnce(new Response("data", {
        status: 206,
        headers: {
          "content-type": "video/mp4",
          "content-length": "4",
          "content-range": "bytes 0-3/4",
        },
      }));
    vi.stubGlobal("fetch", fetchMock);

    const res = { status: vi.fn(), set: vi.fn(), send: vi.fn() };
    await handler!({ params: { 0: "video.mp4" }, headers: { range: "bytes=0-3" } }, res);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ headers: { Range: "bytes=0-3" } });
    expect(res.status).toHaveBeenCalledWith(206);
    expect(res.set).toHaveBeenCalledWith("Content-Range", "bytes 0-3/4");
    expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
  });
});
