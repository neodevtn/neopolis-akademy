import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("videoRecommendations.getCatalog", () => {
  it("exposes the managed recommendation catalog to learner pages", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });
    const catalog = await caller.videoRecommendations.getCatalog();
    expect(catalog.videos.length).toBeGreaterThan(30);
    expect(catalog.videos.find((video) => video.videoId === "4cQWJViybAQ")).toMatchObject({ channel: "n8n", type: "tutorial" });
    expect(catalog.topicAliases.n8n).toContain("workflow");
  });
});
