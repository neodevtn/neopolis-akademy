import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "reporting-admin-test",
      email: "reporting-admin-test@neopolis.dev",
      name: "Reporting Admin",
      loginMethod: "email",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin.getLearningReports", () => {
  it("returns a complete, period-filtered reporting contract based on persisted telemetry", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const report = await caller.admin.getLearningReports({ days: 7 });

    expect(report.periodDays).toBe(7);
    expect(report.daily).toHaveLength(7);
    expect(report.engagementBuckets).toHaveLength(4);
    expect(report.overview).toMatchObject({
      enrolledLearners: expect.any(Number),
      engagedLearners: expect.any(Number),
      activeMinutes: expect.any(Number),
      completedLessons: expect.any(Number),
    });
    expect(report.coursePerformance).toEqual(expect.any(Array));
    expect(report.topLearners).toEqual(expect.any(Array));
  }, 15_000);
});
