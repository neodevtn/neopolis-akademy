import { describe, expect, it } from "vitest";
import { selectRecommendedVideos } from "./VideoRecommendations";

describe("selectRecommendedVideos", () => {
  const catalog = [
    { videoId: "ragVideo01", title: "RAG Tutorial", channel: "Channel", type: "tutorial" as const, topics: ["rag", "retrieval"] },
    { videoId: "agentVideo", title: "Agent Tutorial", channel: "Channel", type: "deep_dive" as const, topics: ["agent", "workflow"] },
  ];

  it("prioritizes catalog videos matching the module topics", () => {
    const selected = selectRecommendedVideos("Build a RAG retrieval workflow with documents", catalog, { rag: ["rag", "retrieval", "document"] });
    expect(selected[0]?.videoId).toBe("ragVideo01");
  });

  it("returns an empty selection when no video reaches the relevance threshold", () => {
    expect(selectRecommendedVideos("Unrelated topic", catalog, { rag: ["rag"] })).toEqual([]);
  });
});
