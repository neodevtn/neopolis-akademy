import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDb } = vi.hoisted(() => ({ getDb: vi.fn() }));

vi.mock("./db", () => ({ getDb }));

import {
  competencyContributionRules,
  competencyDefinitions,
  learnerCompetencyContributions,
} from "../drizzle/schema";
import { applyCompetencyEvent } from "./competencyService";

describe("applyCompetencyEvent", () => {
  beforeEach(() => {
    getDb.mockReset();
  });

  it("groups duplicate lookup and contribution insertion for all eligible rules", async () => {
    const rules = [
      { id: 11, competencyId: "prompt_engineering", points: "1.00", minScore: null },
      { id: 12, competencyId: "ai_solution_design", points: "0.50", minScore: null },
      { id: 13, competencyId: "other", points: "2.00", minScore: null },
    ];
    const values = vi.fn().mockReturnValue({ onDuplicateKeyUpdate: vi.fn().mockResolvedValue(undefined) });
    const insert = vi.fn().mockReturnValue({ values });
    const select = vi.fn().mockImplementation(() => ({
      from: (table: unknown) => {
        if (table === competencyDefinitions) return { limit: vi.fn().mockResolvedValue([{ id: "existing" }]) };
        if (table === competencyContributionRules) return { where: vi.fn().mockResolvedValue(rules) };
        if (table === learnerCompetencyContributions) return { where: vi.fn().mockResolvedValue([{ ruleId: 11 }]) };
        throw new Error("Unexpected table");
      },
    }));
    getDb.mockResolvedValue({ select, insert });

    await expect(applyCompetencyEvent({
      userId: 42,
      sourceType: "quiz",
      sourceKey: "course:lesson:quiz",
      eventKey: "event-1",
      competencyTags: ["prompt_engineering", "ai_solution_design"],
    })).resolves.toEqual([{ competencyId: "ai_solution_design", points: 0.5 }]);

    expect(select).toHaveBeenCalledTimes(3);
    expect(insert).toHaveBeenCalledOnce();
    expect(values).toHaveBeenCalledWith([expect.objectContaining({ ruleId: 12, competencyId: "ai_solution_design" })]);
  });
});
