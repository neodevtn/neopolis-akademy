import { describe, expect, it } from "vitest";
import { buildNavigationUrl, readAllowedNavigationValue, readNavigationIndex } from "./navigationUrls";

describe("navigation URLs", () => {
  it("builds stable shareable paths and omits empty parameters", () => {
    expect(buildNavigationUrl("/admin/content", { mode: "edit-course", courseId: "course_01", lesson: 2, chapter: 0, unused: null })).toBe("/admin/content?mode=edit-course&courseId=course_01&lesson=2&chapter=0");
  });

  it("accepts only known navigation values and safe indices", () => {
    expect(readAllowedNavigationValue("?tab=invitations", "tab", ["learners", "invitations"] as const, "learners")).toBe("invitations");
    expect(readAllowedNavigationValue("?tab=unknown", "tab", ["learners", "invitations"] as const, "learners")).toBe("learners");
    expect(readNavigationIndex("?chapter=3", "chapter")).toBe(3);
    expect(readNavigationIndex("?chapter=-2", "chapter", 1)).toBe(1);
  });
});
