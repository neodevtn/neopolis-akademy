import { describe, expect, it } from "vitest";
import { resolveAdminDashboardTab } from "./adminDashboardTabs";

describe("resolveAdminDashboardTab", () => {
  it("conserve les onglets administratifs autorisés", () => {
    expect(resolveAdminDashboardTab("analytics")).toBe("analytics");
    expect(resolveAdminDashboardTab("referrals")).toBe("referrals");
  });

  it("redirige l’ancien Kanban et les valeurs inconnues vers les candidatures", () => {
    expect(resolveAdminDashboardTab("kanban")).toBe("candidatures");
    expect(resolveAdminDashboardTab("inconnu")).toBe("candidatures");
  });
});
