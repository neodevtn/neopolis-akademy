import { describe, expect, it } from "vitest";
import { COMPETENCY_PATHS, getCompetencyRank, getNextCompetencyRank } from "./competencyProgression";

describe("competency progression", () => {
  it("assigns visible ranks on the 0 to 100 competency scale", () => {
    expect(getCompetencyRank(0).id).toBe("starting");
    expect(getCompetencyRank(4.9).id).toBe("starting");
    expect(getCompetencyRank(5).id).toBe("emerging");
    expect(getCompetencyRank(10).id).toBe("bronze");
    expect(getCompetencyRank(50).id).toBe("silver");
    expect(getCompetencyRank(100).id).toBe("gold");
  });

  it("identifies the next achievable rank and uses real training paths", () => {
    expect(getNextCompetencyRank(4)?.id).toBe("emerging");
    expect(getNextCompetencyRank(12)?.id).toBe("silver");
    expect(getNextCompetencyRank(75)).toBeNull();
    expect(COMPETENCY_PATHS.rag_knowledge.certificationId).toBe("ai_data_engineering_rag_practitioner");
    expect(COMPETENCY_PATHS.bi_ai.certificationId).toBe("analyse_donnees_reporting_bi_codex");
  });
});
