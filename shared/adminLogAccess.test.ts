import { describe, expect, it } from "vitest";
import { canAccessAdminLogs } from "./adminLogAccess";

describe("canAccessAdminLogs", () => {
  it("autorise uniquement le Super Admin historique et le Manager", () => {
    expect(canAccessAdminLogs("admin")).toBe(true);
    expect(canAccessAdminLogs("manager")).toBe(true);
    expect(canAccessAdminLogs("user")).toBe(false);
    expect(canAccessAdminLogs(undefined)).toBe(false);
  });
});
