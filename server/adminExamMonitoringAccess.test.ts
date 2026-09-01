import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "user" | "admin"): TrpcContext {
  return {
    user: {
      id: 991,
      openId: `exam-monitoring-${role}`,
      name: "Compte de test",
      email: "qa@example.invalid",
      loginMethod: "password",
      role,
      blocked: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin.getExamMonitoring", () => {
  it("refuses a learner before any access to the monitoring data", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.admin.getExamMonitoring({ page: 1, pageSize: 15, status: "all", sortBy: "finishedAt", sortDirection: "desc" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
