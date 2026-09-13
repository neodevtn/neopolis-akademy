import { describe, expect, it } from "vitest";
import { resolveAdminDashboardTab } from "./adminDashboardTabs";

describe("resolveAdminDashboardTab", () => {
  it("conserve les onglets administratifs autorisés", () => {
    expect(resolveAdminDashboardTab("analytics")).toBe("analytics");
    expect(resolveAdminDashboardTab("referrals")).toBe("referrals");
    expect(resolveAdminDashboardTab("ai_usage")).toBe("ai_usage");
  });

  it("redirige l’ancien Kanban et les valeurs inconnues vers les candidatures", () => {
    expect(resolveAdminDashboardTab("kanban")).toBe("candidatures");
    expect(resolveAdminDashboardTab("inconnu")).toBe("candidatures");
  });
});
