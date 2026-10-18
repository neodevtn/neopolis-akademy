import { describe, expect, it } from "vitest";
import { resolveTrainingCompanionCourses } from "./trainingCompanionCourses";

const courses = [
  { id: "canonical_a", certId: "path_a", title: { en: "A", fr: "A" } },
  { id: "canonical_b", certId: "path_b", title: { en: "B", fr: "B" } },
];

describe("resolveTrainingCompanionCourses", () => {
  it("preserves configured order, removes duplicate references, and ignores missing courses", () => {
    expect(resolveTrainingCompanionCourses({ companionCourses: ["canonical_b", "missing", "canonical_a", "canonical_b"] }, courses).map((course) => course.id))
      .toEqual(["canonical_b", "canonical_a"]);
  });

  it("returns no courses when the training has no valid companion list", () => {
    expect(resolveTrainingCompanionCourses({}, courses)).toEqual([]);
    expect(resolveTrainingCompanionCourses({ companionCourses: "canonical_a" }, courses)).toEqual([]);
  });
});
