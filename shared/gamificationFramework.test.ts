import { describe, expect, it } from "vitest";
import { DEFAULT_GAMIFICATION_RANKS, getNextRank, getRankForLevel } from "./gamificationFramework";

describe("gamification framework", () => {
  it("introduces the emerging rank at 5 points", () => {
    expect(getRankForLevel(4.9).id).toBe("starting");
    expect(getRankForLevel(5).id).toBe("emerging");
    expect(getRankForLevel(10).id).toBe("bronze");
  });

  it("identifies the next attainable rank from configured thresholds", () => {
    expect(getNextRank(4, DEFAULT_GAMIFICATION_RANKS)?.id).toBe("emerging");
    expect(getNextRank(5, DEFAULT_GAMIFICATION_RANKS)?.id).toBe("bronze");
    expect(getNextRank(100, DEFAULT_GAMIFICATION_RANKS)).toBeNull();
  });
});
