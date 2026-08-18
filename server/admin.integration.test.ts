/**
 * Integration tests for admin tRPC endpoints
 * Tests authorization, input validation, and business logic
 */
import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Test Helpers ───

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user-001",
    email: "admin@neopolis.test",
    name: "Admin Test",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user-002",
    email: "user@neopolis.test",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

function createAnonymousContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

// ─── Authorization Tests ───

describe("Admin API - Authorization", () => {
  it("admin.getLearners rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.getLearners()).rejects.toThrow("Admin access required");
  });

  it("admin.getLearners rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    await expect(caller.admin.getLearners()).rejects.toThrow();
  });

  it("admin.getStats rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.getStats()).rejects.toThrow("Admin access required");
  });

  it("admin.blockUser rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.admin.blockUser({ userId: 1, blocked: true })
    ).rejects.toThrow("Admin access required");
  });

  it("admin.updateUserRole rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.admin.updateUserRole({ userId: 1, role: "admin" })
    ).rejects.toThrow("Admin access required");
  });

  it("admin.createInvitation rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.admin.createInvitation({ email: "test@example.com" })
    ).rejects.toThrow("Admin access required");
  });

  it("admin.getInvitations rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.getInvitations()).rejects.toThrow("Admin access required");
  });
});

// ─── Input Validation Tests ───

describe("Admin API - Input Validation", () => {
  it("admin.getLearners validates page number (min 1)", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.admin.getLearners({ page: 0, pageSize: 20 })
    ).rejects.toThrow();
  });

  it("admin.getLearners validates pageSize (max 100)", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.admin.getLearners({ page: 1, pageSize: 200 })
    ).rejects.toThrow();
  });

  it("admin.createInvitation validates email format", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.admin.createInvitation({ email: "not-an-email" })
    ).rejects.toThrow();
  });

  it("admin.updateUserRole validates role enum", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      // @ts-expect-error - testing invalid input
      caller.admin.updateUserRole({ userId: 1, role: "superadmin" })
    ).rejects.toThrow();
  });

  it("admin.blockUser requires userId", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      // @ts-expect-error - testing missing input
      caller.admin.blockUser({ blocked: true })
    ).rejects.toThrow();
  });
});

// ─── Business Logic Tests ───

describe("Admin API - Business Logic", () => {
  it("admin.updateUserRole prevents self-role-change", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.updateUserRole({ userId: ctx.user!.id, role: "user" })
    ).rejects.toThrow("Cannot change your own role");
  });

  it("admin.getLearners returns paginated results with correct structure", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.getLearners({ page: 1, pageSize: 10 });
    
    expect(result).toHaveProperty("users");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("page");
    expect(result).toHaveProperty("pageSize");
    expect(Array.isArray(result.users)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it("admin.getStats returns expected stat fields", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.getStats();
    
    expect(result).toHaveProperty("totalUsers");
    expect(result).toHaveProperty("totalLessonsCompleted");
    expect(result).toHaveProperty("totalExamAttempts");
    expect(result).toHaveProperty("totalExamsPassed");
    expect(typeof result.totalUsers).toBe("number");
  });

  it("admin.getInvitations returns paginated results", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.getInvitations({ page: 1, pageSize: 5 });
    
    expect(result).toHaveProperty("invitations");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.invitations)).toBe(true);
  });
});

// ─── Application Management Tests ───

describe("Admin API - Application Management", () => {
  it("applications.list rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.applications.list()).rejects.toThrow("Admin access required");
  });

  it("applications.list returns applications for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.applications.list();
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("applications.stats returns aggregated stats for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.applications.stats();
    
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("enAttente");
    expect(result).toHaveProperty("selectionne");
    expect(result).toHaveProperty("refuse");
    expect(result).toHaveProperty("avgScore");
    expect(typeof result.total).toBe("number");
    expect(typeof result.avgScore).toBe("number");
  });

  it("applications.updateStatus rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.applications.updateStatus({ id: 1, status: "selectionne" })
    ).rejects.toThrow("Admin access required");
  });

  it("applications.updateStatus validates status enum", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      // @ts-expect-error - testing invalid status
      caller.applications.updateStatus({ id: 1, status: "invalid_status" })
    ).rejects.toThrow();
  });
});

describe("Admin API - Communications ciblées", () => {
  it("prévisualise un segment sans déclencher d’envoi", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.adminTools.communications.getRecipientCount({
      recipientFilter: { audience: "learners_started" },
    });

    expect(result).toHaveProperty("count");
    expect(result).toHaveProperty("sample");
    expect(typeof result.count).toBe("number");
    expect(Array.isArray(result.sample)).toBe(true);
  });

  it("accepte un segment de progression par cours, période et sélection manuelle sans envoi", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.adminTools.communications.getRecipientCount({
      recipientFilter: {
        audience: "learners_started",
        courseId: "claude_certified_associate_foundations__01",
        courseProgressStatus: "started",
        activityWithinDays: 30,
        manualEmails: ["admin@neopolis.test"],
      },
    });

    expect(typeof result.count).toBe("number");
    expect(Array.isArray(result.sample)).toBe(true);
  });

  it("expose les cours et contacts utilisables pour composer un segment manuel", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.adminTools.communications.getSegmentOptions();

    expect(Array.isArray(result.courses)).toBe(true);
    expect(Array.isArray(result.recipients)).toBe(true);
  });

  it("refuse un segment inconnu", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      // @ts-expect-error - validation d’un segment arbitraire
      caller.adminTools.communications.getRecipientCount({ recipientFilter: { audience: "unknown" } }),
    ).rejects.toThrow();
  });
});

// ─── System Router Tests ───

describe("System Router - Error Reporting", () => {
  it("system.reportError accepts valid error data", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    const result = await caller.system.reportError({
      message: "Test error from integration test",
      source: "window",
      stack: "Error: Test\n    at test.ts:1:1",
      url: "https://akademy.neodev.click/test",
      timestamp: Date.now(),
    });
    
    expect(result).toBeDefined();
  });

  it("system.reportError validates required fields", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    await expect(
      // @ts-expect-error - testing missing required fields
      caller.system.reportError({ message: "" })
    ).rejects.toThrow();
  });

  it("system.getClientErrors rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.system.getClientErrors({})).rejects.toThrow();
  });

  it("system.getClientErrors returns errors for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.system.getClientErrors({});
    
    // Returns an array directly
    expect(Array.isArray(result)).toBe(true);
  });
});
