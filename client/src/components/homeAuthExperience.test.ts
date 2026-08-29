import { describe, expect, it } from "vitest";
import { firstNameForHome } from "./homeAuthExperience";

describe("firstNameForHome", () => {
  it("uses only the first meaningful part of an authenticated learner name", () => {
    expect(firstNameForHome("  Aïcha Ben Salah  ")).toBe("Aïcha");
  });

  it("does not invent a greeting name when the profile name is empty", () => {
    expect(firstNameForHome("   ")).toBeNull();
    expect(firstNameForHome(null)).toBeNull();
  });
});
