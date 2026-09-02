import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "user" | "admin"): TrpcContext {
  return {
    user: {
      id: 992,
      openId: `learner-360-${role}`,
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

describe("admin.getLearnerActivityPage", () => {
  it("refuses a learner before any activity history is queried", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.admin.getLearnerActivityPage({ userId: 1, page: 1, pageSize: 20 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
