import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";

// Mock admin context
const adminCtx = {
  user: { id: 1, openId: "admin-open-id", role: "admin" as const, name: "Admin", email: "admin@test.com", blocked: 0, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), loginMethod: "oauth", passwordHash: null, invitedAt: null, invitedBy: null },
  req: { headers: {}, ip: "127.0.0.1" } as any,
  res: { clearCookie: vi.fn(), cookie: vi.fn() } as any,
};

// Mock user context (non-admin)
const userCtx = {
  user: { id: 2, openId: "user-open-id", role: "user" as const, name: "User", email: "user@test.com", blocked: 0, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), loginMethod: "oauth", passwordHash: null, invitedAt: null, invitedBy: null },
  req: { headers: {}, ip: "127.0.0.1" } as any,
  res: { clearCookie: vi.fn(), cookie: vi.fn() } as any,
};

describe("Selected Candidates Endpoints", () => {
  const adminCaller = appRouter.createCaller(adminCtx);
  const userCaller = appRouter.createCaller(userCtx);

  describe("admin.getSelectedCandidates", () => {
    it("should return a paginated result for admin", async () => {
      const result = await adminCaller.admin.getSelectedCandidates();
      expect(Array.isArray(result.candidates)).toBe(true);
      expect(typeof result.total).toBe("number");
      expect(result.page).toBe(1);
      expect(result.pageSize).toBeGreaterThan(0);
    });

    it("should reject non-admin access", async () => {
      await expect(userCaller.admin.getSelectedCandidates()).rejects.toThrow("Admin access required");
    });
  });

  describe("admin.updateCandidateEmail", () => {
    it("should reject non-admin access", async () => {
      await expect(
        userCaller.admin.updateCandidateEmail({ applicationId: 1, newEmail: "new@test.com" })
      ).rejects.toThrow("Admin access required");
    });

    it("should reject invalid email format", async () => {
      await expect(
        adminCaller.admin.updateCandidateEmail({ applicationId: 1, newEmail: "not-an-email" })
      ).rejects.toThrow();
    });
  });

  describe("admin.resendCandidateInvitation", () => {
    it("should reject non-admin access", async () => {
      await expect(
        userCaller.admin.resendCandidateInvitation({ applicationId: 1, email: "test@test.com" })
      ).rejects.toThrow("Admin access required");
    });

    it("should reject invalid email format", async () => {
      await expect(
        adminCaller.admin.resendCandidateInvitation({ applicationId: 1, email: "not-an-email" })
      ).rejects.toThrow();
    });
  });

  describe("admin.getEmailDeliveryStats", () => {
    it("should return stats for admin", async () => {
      const result = await adminCaller.admin.getEmailDeliveryStats();
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("delivered");
      expect(result).toHaveProperty("bounced");
      expect(result).toHaveProperty("suppressed");
      expect(result).toHaveProperty("pending");
      expect(typeof result.total).toBe("number");
    });

    it("should reject non-admin access", async () => {
      await expect(userCaller.admin.getEmailDeliveryStats()).rejects.toThrow("Admin access required");
    });
  });
});
