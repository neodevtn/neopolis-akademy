import { describe, expect, it } from "vitest";
import { adminProcedure, router } from "./_core/trpc";
import type { TrpcContext } from "./_core/context";

const permissionProbeRouter = router({
  permissionProbe: adminProcedure.query(() => ({ allowed: true })),
});

function contextFor(role: "user" | "admin" | "admin_learner"): TrpcContext {
  return {
    user: {
      id: 991,
      openId: `admin-learner-${role}`,
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

describe("admin-apprenant permissions", () => {
  it("conserve l’accès aux procédures administratives", async () => {
    const caller = permissionProbeRouter.createCaller(contextFor("admin_learner"));
    await expect(caller.permissionProbe()).resolves.toEqual({ allowed: true });
  });

  it("ne transforme pas un apprenant standard en administrateur", async () => {
    const caller = permissionProbeRouter.createCaller(contextFor("user"));
    await expect(caller.permissionProbe()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
