import { describe, expect, it } from "vitest";
import { isAdministrativePath } from "./communicationOverlay";

describe("isAdministrativePath", () => {
  it("identifies the administration root and nested routes", () => {
    expect(isAdministrativePath("/admin")).toBe(true);
    expect(isAdministrativePath("/admin?tab=communications")).toBe(true);
    expect(isAdministrativePath("/admin/content?mode=catalog")).toBe(true);
  });

  it("does not suppress the learner overlay on unrelated routes", () => {
    expect(isAdministrativePath("/training")).toBe(false);
    expect(isAdministrativePath("/administer")).toBe(false);
    expect(isAdministrativePath("/")).toBe(false);
  });
});
