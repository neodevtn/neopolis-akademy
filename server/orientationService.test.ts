import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDb, ensureCompetencyFramework, getUserCompetencies } = vi.hoisted(() => ({
  getDb: vi.fn(),
  ensureCompetencyFramework: vi.fn(),
  getUserCompetencies: vi.fn(),
}));

vi.mock("./db", () => ({ getDb }));
vi.mock("./competencyService", () => ({ ensureCompetencyFramework, getUserCompetencies }));

import {
  competencyDefinitions,
  learnerCompetencyContributions,
  learnerOrientationProfiles,
  learnerOrientationProposals,
  users,
} from "../drizzle/schema";
import { getAdminOrientationOverview } from "./orientationService";

describe("getAdminOrientationOverview", () => {
  beforeEach(() => {
    getDb.mockReset();
    ensureCompetencyFramework.mockReset().mockResolvedValue(undefined);
    getUserCompetencies.mockReset();
  });

  it("charge les données communes une seule fois et restitue objectifs, contributions et proposition en attente", async () => {
    const now = new Date(Date.UTC(2026, 0, 1));
    const profiles = [11, 12].map((id) => ({
      profile: {
        id,
        userId: id,
        status: "completed" as const,
        goals: [{ competencyId: "prompt_engineering", targetLevel: id === 11 ? "silver" : "bronze" }],
        wantsOfficialCertification: id === 11 ? 1 : 0,
        officialCertificationIds: id === 11 ? ["cert-prompt"] : [],
        certificationTargetDates: id === 11 ? { "cert-prompt": "2026-12-31" } : {},
        assessment: { answers: [], diagnosticPoints: { prompt_engineering: 5 }, completedAt: now.toISOString() },
        recommendations: null,
        startedAt: now,
        completedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      user: { id, name: `Learner ${id}`, email: null, role: "user" as const },
    }));
    const definitions = [
      { id: "prompt_engineering", title: { fr: "Prompt", en: "Prompt" }, description: null, category: "AI", icon: "sparkles", color: "blue", maxPoints: "100.00", sortOrder: 10, active: 1, createdAt: now, updatedAt: now },
      { id: "ai_solution_design", title: { fr: "Design", en: "Design" }, description: null, category: "AI", icon: "sparkles", color: "violet", maxPoints: "100.00", sortOrder: 20, active: 1, createdAt: now, updatedAt: now },
    ];
    const contributions = [
      { id: 1, userId: 11, competencyId: "prompt_engineering", ruleId: 1, sourceType: "quiz_passed", sourceKey: "course", eventKey: "one", points: "12.50", score: null, evidence: null, awardedAt: now },
      { id: 2, userId: 11, competencyId: "prompt_engineering", ruleId: 1, sourceType: "quiz_passed", sourceKey: "course", eventKey: "two", points: "27.50", score: null, evidence: null, awardedAt: now },
      { id: 3, userId: 11, competencyId: "ai_solution_design", ruleId: 1, sourceType: "quiz_passed", sourceKey: "course", eventKey: "three", points: "2.00", score: null, evidence: null, awardedAt: now },
      { id: 4, userId: 12, competencyId: "prompt_engineering", ruleId: 1, sourceType: "quiz_passed", sourceKey: "course", eventKey: "four", points: "4.00", score: null, evidence: null, awardedAt: now },
    ];
    const pendingProposals = [
      { id: 77, userId: 11, proposedBy: 1, goals: [{ competencyId: "prompt_engineering", targetLevel: "gold" }], wantsOfficialCertification: 1, officialCertificationIds: ["cert-prompt"], certificationTargetDates: { "cert-prompt": "2027-01-15" }, justification: "Objectif avancé pertinent", status: "pending" as const, respondedAt: null, createdAt: now },
    ];
    const select = vi.fn().mockImplementation(() => ({
      from: (table: unknown) => {
        if (table === learnerOrientationProfiles) {
          return {
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue(profiles) }),
              }),
            }),
          };
        }
        if (table === competencyDefinitions) return { where: vi.fn().mockReturnValue({ orderBy: vi.fn().mockResolvedValue(definitions) }) };
        if (table === learnerCompetencyContributions) return { where: vi.fn().mockResolvedValue(contributions) };
        if (table === learnerOrientationProposals) return { where: vi.fn().mockReturnValue({ orderBy: vi.fn().mockResolvedValue(pendingProposals) }) };
        throw new Error("Unexpected table");
      },
    }));
    getDb.mockResolvedValue({ select });

    const overview = await getAdminOrientationOverview({ limit: 100 });

    expect(select).toHaveBeenCalledTimes(4);
    expect(getUserCompetencies).not.toHaveBeenCalled();
    expect(overview).toHaveLength(2);
    const first = overview[0].orientation;
    expect(first.competencies.find((competency) => competency.id === "prompt_engineering")).toMatchObject({ rawPoints: 40, level: 40, targetPoints: 35 });
    expect(first.competencies.find((competency) => competency.id === "ai_solution_design")).toMatchObject({ rawPoints: 2, level: 2, targetPoints: null });
    expect(first.profile).toMatchObject({ wantsOfficialCertification: true, officialCertificationIds: ["cert-prompt"] });
    expect(first.pendingProposal).toMatchObject({ id: 77, goals: [{ competencyId: "prompt_engineering", targetLevel: "gold" }] });
    expect(first.trajectory).toBeDefined();
  });
});
